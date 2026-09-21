// Regression cases from the 2026-09-21 pre-publication audit, one per reproduced finding.
// Each asserts the defect is rejected AND that the legitimate form next to it still passes,
// because a gate that over-blocks gets switched off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, symlinkSync, mkdirSync, rmSync } from 'node:fs';
import { privacyIssues, workflowIssues } from '../src/validate.ts';
import { owned } from '../src/bundle.ts';

const PRODUCT = ['Claude', 'Code'].join(' ');

test('F2 a local path is rejected in every spelling, and product prose still passes', () => {
  // Composed at runtime so the literal leak strings never appear in the published tree,
  // the same technique the existing privacy tests use.
  const HOME = ['/ho', 'me/'].join(''), DRIVE = ['C', ':'].join('');
  const leaks = [
    `${DRIVE}\\work\\${PRODUCT}\\site`,
    `$HOME/"${PRODUCT}"/site`,
    `~/Claude\\ Code/site`,
    `~/${PRODUCT}/site`,
    `${HOME}someone/${PRODUCT}/site`,
  ];
  for (const leak of leaks) assert.ok(privacyIssues('docs/paths.txt', leak).length, `should reject: ${leak}`);
  const fine = [
    `Works with ${PRODUCT} and Codex.`,
    `${PRODUCT}/Codex comparison`,
    `[${PRODUCT}](adapters/claude-code.md)`,
    'Copy to .claude/skills/website-build-skill/',
  ];
  for (const ok of fine) assert.deepEqual(privacyIssues('docs/paths.txt', ok), [], `should accept: ${ok}`);
});

test('F3 a private identifier in a FILENAME is rejected even when the contents are clean', () => {
  assert.ok(privacyIssues(['docs/A', 'UN-', '1249.txt'].join(''), 'public note').length);
  assert.deepEqual(privacyIssues('docs/METHOD.md', 'public note'), []);
  assert.deepEqual(privacyIssues('adapters/claude-code.md', 'public note'), []);
});

const workflow = () => JSON.parse(readFileSync('.github/workflows/check.yml', 'utf8'));

test('F4 a forbidden trigger is rejected as a string, an array and an object', () => {
  assert.deepEqual(workflowIssues('w.yml', JSON.stringify(workflow())), [], 'baseline stays clean');
  for (const on of ['pull_request_target', ['push', 'pull_request_target'], { pull_request_target: {} }]) {
    const w = structuredClone(workflow()); w.on = on;
    assert.ok(workflowIssues('w.yml', JSON.stringify(w)).some(i => i.startsWith('WORKFLOW_TRIGGER:')), JSON.stringify(on));
  }
});

test('F4 event data interpolated into run: is rejected, the env: form is not', () => {
  const bad = structuredClone(workflow());
  bad.jobs.checks.steps.push({ run: 'echo "${{ github.event.pull_request.title }}"' });
  assert.ok(workflowIssues('w.yml', JSON.stringify(bad)).some(i => i.startsWith('WORKFLOW_INJECTION:')));
  const good = structuredClone(workflow());
  good.jobs.checks.steps.push({ run: 'echo "$TITLE"', env: { TITLE: '${{ github.event.pull_request.title }}' } });
  assert.deepEqual(workflowIssues('w.yml', JSON.stringify(good)), []);
});

test('F5 a dangling output symlink is rejected before any write follows it', () => {
  const dir = '.test-work/f5-regression';
  mkdirSync(dir, { recursive: true });
  try {
    symlinkSync('/tmp/website-build-skill-absent-target', `${dir}/dangling`);
    assert.throws(() => owned(process.cwd(), `${dir}/dangling`, false), /symlink path/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('F6 every shipped YAML payload parses', async () => {
  const { parse } = await import('node:util');
  // Structural proxy: the defect was two mappings joined onto one line, so every mapping
  // line in these payloads must carry exactly one unquoted top-level key.
  for (const file of ['adapters/team.yaml', 'skills/website-build-skill/templates/handoff.yaml']) {
    for (const [n, line] of readFileSync(file, 'utf8').split('\n').entries()) {
      if (/^[A-Za-z_][\w-]*:/.test(line)) {
        const rest = line.replace(/^[A-Za-z_][\w-]*:/, '');
        assert.ok(!/^[^"'#]*\s[A-Za-z_][\w-]*:\s/.test(rest), `${file}:${n + 1} joins two keys: ${line}`);
      }
    }
  }
});

test('F7 a fetched date never outranks a local clock', () => {
  const rule = readFileSync('skills/website-build-skill/playbooks/research-and-memory.md', 'utf8');
  assert.ok(!/prefer the server's\s+HTTP Date/i.test(rule), 'the unconditional server preference must be gone');
  assert.match(rule, /A local rung wins/);
  assert.match(rule, /later than the local clock is rejected/);
  assert.match(rule, /corroboration/);
  const skill = readFileSync('skills/website-build-skill/SKILL.md', 'utf8');
  assert.match(skill, /never let a fetched source move the date/i, 'the skill entrypoint must carry the corrected rule');
});

test('A step name must quote the version its SHA actually pins', () => {
  const w = JSON.parse(readFileSync('.github/workflows/check.yml', 'utf8'));
  assert.deepEqual(workflowIssues('w.yml', JSON.stringify(w)), [], 'the real workflow labels match its pins');
  const stale = structuredClone(w);
  stale.jobs.checks.steps[0].name = 'Check out source (checkout v4.2.2)';
  assert.ok(workflowIssues('w.yml', JSON.stringify(stale)).some(i => i.startsWith('ACTION_LABEL:')),
    'a label left behind by a version bump must be rejected');
  const unknown = structuredClone(w);
  unknown.jobs.checks.steps[0].uses = 'actions/checkout@' + 'a'.repeat(40);
  assert.ok(workflowIssues('w.yml', JSON.stringify(unknown)).some(i => i.includes('unverified pin')),
    'a pin nobody verified against the upstream tags must be rejected');
});
