import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { check as strictCheck, privacyIssues, linkIssues, workflowIssues } from '../src/validate.mjs';
import { read, CORE, ARCHIVE } from '../src/bundle.mjs';
import { fixture, change, root, candidateCheck as check } from './helpers.mjs';

test('GREEN: candidate public-identifier policy passes without edits', () => assert.deepEqual(check(root), []));

test('Resolved policy: the two required public identifiers are exempt, nothing else is', () => {
  assert.deepEqual(strictCheck(root), []);
  // The exemptions are narrow. The owning account is clean only on the exact CODEOWNERS
  // line or inside a repository URL, and the product name is clean only as a product name.
  const owner = ['au', 'ny', 'sillyme'].join('');
  assert.deepEqual(privacyIssues('.github/CODEOWNERS', `* @${owner}`), []);
  assert.ok(privacyIssues('README.md', `* @${owner}`).length, 'owner handle outside its two homes must fail');
  assert.ok(privacyIssues('.github/CODEOWNERS', `* @${owner}-personal`).length, 'a different handle must fail');
  assert.deepEqual(privacyIssues('README.md', 'Works with ' + ['Claude', 'Code'].join(' ') + '.'), []);
  assert.ok(privacyIssues('README.md', ['~/', 'Claude', ' Code', '/repo'].join('')).length, 'the local path form must still fail');
});

const ROUTE = 'Research, Learn, Ingest, Scope, Match, Mock, Choose, Build, Prove, Protect, Challenge and Ship';
const cases = [
  ['RED03 a shell-piped installer this package does not ship', 'INSTALL_CLAIM:', r => change(r, 'README.md', s => s + '\ncurl https://example.test/install.sh | sh\n')],
  ['RED03b a caveat left on a command that now works', 'STALE_CLAIM:', r => change(r, 'README.md', s => s + '\nPlanned, unavailable: `npx website-build-skill --solo --target codex --dir . --yes`.\n')],
  ['RED04 missing relative link', 'LINK:', r => change(r, 'docs/TIPS.md', s => s + '\n[Missing](absent-document.md)\n')],
  ['RED05 generated bundle byte drift', 'BUNDLE_DRIFT:', r => change(r, 'docs/bundles/method.md', s => s + '\nchanged bytes\n')],
  ['RED06 floating action tag', 'ACTION_PIN:', r => change(r, '.github/workflows/check.yml', s => s.replace(/actions\/checkout@[a-f0-9]{40}/, 'actions/checkout@v4'))],
  ['RED07 read-only job grants write', 'WORKFLOW_PERMISSIONS:', r => change(r, '.github/workflows/check.yml', s => { const w = JSON.parse(s); w.jobs.checks.permissions = { contents: 'write' }; return JSON.stringify(w); })],
  ['RED08 inactive archive in active prompt bundle', 'ARCHIVE_EXCLUSION:', r => change(r, 'docs/bundles/prompts.md', s => s + read(r, `${CORE}/${ARCHIVE}`))],
  ['RED09 unsupported factual claim', 'CLAIM_EVIDENCE:', r => change(r, 'README.md', s => s + '\nThis package was tested on every host and published successfully.\n')],
  ['RED10 starter drops a mandatory stage', 'STARTER_ROUTE:', r => change(r, 'adapters/zero-install.md', s => s.replaceAll('Protect', ''))],
  ['RED11 a card that says the team is ready when nothing starts a worker', 'CHOICE_HONESTY:', r => change(r, `${CORE}/templates/install-choice.txt`, s => s.replace(/One command installs their files; you open each session yourself\./, 'One command and they are ready.'))],
  ['RED14 a second starter block makes the payload ambiguous', 'STARTER_ROUTE:', r => change(r, 'adapters/zero-install.md', s => s.replace('```text\n', '```text\nUse option 1: Teach my AI. Historical example, do not copy.\n```\n\n```text\n'))],
  ['RED15 a starter that names the stages only to skip them', 'STARTER_ROUTE:', r => change(r, 'adapters/zero-install.md', s => s.replace(ROUTE, 'Skip Scope, Choose, Protect and Challenge'))],
  ['RED16 the stage route moved outside the fenced starter', 'STARTER_ROUTE:', r => change(r, 'adapters/zero-install.md', s => s.replace(ROUTE, 'Build and ship immediately').replace('```\n\n## Full method', `\`\`\`\n\n${ROUTE}\n\n## Full method`))],
  ['RED17 that same promise wrapped across two lines', 'CHOICE_HONESTY:', r => change(r, `${CORE}/templates/install-choice.txt`, s => s.replace('One command installs their files; you open each session yourself.', 'One command and\n                          they are ready.'))],
];
for (const [name, gate, mutate] of cases) test(name, () => fixture(r => {
  mutate(r);
  assert.ok(check(r).some(i => i.startsWith(gate)), `expected ${gate}`);
}));

test('RED09 also rejects new documents and altered measurements', () => fixture(r => {
  writeFileSync(resolve(r, 'docs/new.md'), '# Results\nMeasured perfect scores on all pages.\n');
  change(r, 'CHANGELOG.md', s => s + '\nSupported on every runtime.\n');
  const issues = check(r);
  assert.ok(issues.some(s => s.startsWith('CLAIM_EVIDENCE:docs/new.md:')));
  assert.ok(issues.some(s => s.startsWith('CLAIM_EVIDENCE:CHANGELOG.md:')));
}));

test('LINK rejects missing reference, image, HTML target and anchor', () => {
  for (const text of ['[label][unknown]', '![image](gone.png)', '<a href="gone.md">open</a>', '[heading](README.md#missing-heading)']) assert.ok(linkIssues(root, 'README.md', text).length);
  assert.deepEqual(linkIssues(root, 'README.md', '[doc][guide]\n\n[guide]: docs/METHOD.md\n'), []);
});

test('MANIFEST fails a missing asset and invalid fixture', () => fixture(r => {
  unlinkSync(resolve(r, `${CORE}/prompts/00-start.md`));
  assert.ok(check(r).some(s => s.startsWith('MANIFEST:')));
  change(r, `${CORE}/manifest.json`, () => read(r, 'test/fixtures/invalid-manifest.json'));
  assert.ok(check(r).some(s => s.startsWith('MANIFEST:')));
}));

test('WORKFLOW rejects top-level writes, all-write and reusable floating actions', () => {
  const baseline = JSON.parse(read(root, '.github/workflows/check.yml'));
  for (const permissions of ['write-all', { 'id-token': 'write' }, { actions: 'write' }]) {
    assert.ok(workflowIssues('check.yml', JSON.stringify({ ...baseline, permissions })).some(s => s.startsWith('WORKFLOW_PERMISSIONS:')));
  }
  baseline.jobs.external = { uses: 'example/workflow/.github/workflows/run.yml@main', 'timeout-minutes': 5 };
  assert.ok(workflowIssues('check.yml', JSON.stringify(baseline)).some(s => s.startsWith('ACTION_PIN:')));
});
