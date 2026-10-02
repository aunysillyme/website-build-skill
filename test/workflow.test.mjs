import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const agreement = 'I agree to the Contributor License Agreement in CLA.md';
const cla = () => JSON.parse(readFileSync('.github/workflows/cla.yml', 'utf8'));
const runCla = (body, association = 'NONE', type = 'User') => spawnSync('sh', ['-c', cla().jobs.cla.steps[0].run], {
  env: { ...process.env, PR_BODY: body, AUTHOR_ASSOCIATION: association, AUTHOR_TYPE: type }, encoding: 'utf8',
});

test('CLA template and workflow keep the exact agreement and safe pull request trigger', () => {
  const template = readFileSync('.github/pull_request_template.md', 'utf8');
  assert.ok(template.split('\n').includes(`- [ ] ${agreement}`), 'template agreement must stay exact');
  const workflow = cla();
  assert.equal(workflow.name, 'cla');
  assert.deepEqual(workflow.on, { pull_request: { types: ['opened', 'edited', 'reopened', 'synchronize'] } });
  assert.ok(!readFileSync('.github/workflows/cla.yml', 'utf8').includes('pull_request_target'));
  assert.deepEqual(workflow.permissions, {});
  assert.deepEqual(Object.keys(workflow.jobs), ['cla']);
  const job = workflow.jobs.cla;
  assert.equal(job['runs-on'], 'ubuntu-latest');
  assert.equal(job.if, undefined, 'exempt authors receive a passing job');
  assert.equal(job.steps.length, 1);
  const [step] = job.steps;
  assert.equal(step.env.PR_BODY, '${{ github.event.pull_request.body }}');
  assert.equal(step.env.AUTHOR_ASSOCIATION, '${{ github.event.pull_request.author_association }}');
  assert.equal(step.env.AUTHOR_TYPE, '${{ github.event.pull_request.user.type }}');
  assert.equal(step.uses, undefined, 'event-only workflow uses no actions or checkout');
  assert.ok(!step.run.includes('${{'), 'event data only reaches the script through env');
  assert.ok(step.run.includes(agreement.replace('.', '\\.')), 'workflow agreement must stay exact');
  assert.equal(step['continue-on-error'], undefined);
  assert.equal(job['continue-on-error'], undefined);
});

for (const [label, body] of [
  ['unticked template box', `- [ ] ${agreement}`],
  ['empty body', ''],
  ['agreement without a checked box', agreement],
  ['checked box with wrong text', '- [x] I agree to the Contributor License Agreement'],
  ['tick hidden in an HTML comment', `<!--\n- [x] ${agreement}\n-->`],
  ['tick hidden in an unclosed HTML comment', `<!--\n- [x] ${agreement}`],
]) test(`CLA RED: outside author fails for ${label}`, () => {
  const result = runCla(body);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /::error::Tick the Contributor License Agreement box in the PR description/);
  assert.ok(result.stderr.includes('[CLA.md](CLA.md)'));
  console.log(`CLA RED ${label}: exit ${result.status}`);
});

for (const bullet of ['- [x]', '- [X]', '* [x]']) test(`CLA passes for ${bullet}`, () => {
  assert.equal(runCla(`${bullet} ${agreement}`).status, 0);
});

test('CLA checked line can appear within a longer CRLF description', () => {
  assert.equal(runCla(`Description\r\n- [x] ${agreement}\r\nEvidence`).status, 0);
  assert.equal(runCla(`- [x] ${agreement} extra`).status, 1);
  assert.equal(runCla(`- [x] ${agreement.toLowerCase()}`).status, 1, 'only x is case insensitive');
});

test('CLA passes for owner, member, collaborator and bot with an empty body', () => {
  for (const association of ['OWNER', 'MEMBER', 'COLLABORATOR']) assert.equal(runCla('', association).status, 0, association);
  assert.equal(runCla('', 'NONE', 'Bot').status, 0);
  for (const association of ['CONTRIBUTOR', 'FIRST_TIMER', 'FIRST_TIME_CONTRIBUTOR', 'NONE']) {
    assert.equal(runCla('', association).status, 1, association);
  }
});

test('CLA treats shell substitution in the PR body as data', () => {
  const directory = mkdtempSync(join(tmpdir(), 'cla-data-'));
  const marker = join(directory, 'pwned');
  const existing = existsSync('/tmp/pwned');
  try {
    assert.equal(runCla(`$(touch /tmp/pwned)\n$(touch "${marker}")\n- [x] ${agreement}`).status, 0);
    assert.equal(existsSync(marker), false);
    assert.equal(existsSync('/tmp/pwned'), existing);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('Stable required check rejects failed, cancelled and skipped matrix runs', () => {
  const workflow = JSON.parse(readFileSync('.github/workflows/check.yml', 'utf8'));
  const job = workflow.jobs['required-check'];
  assert.equal(job.name, 'Repository checks');
  assert.deepEqual(job.needs, ['checks']);
  assert.equal(job.if, '${{ always() }}');
  assert.equal(job.strategy, undefined, 'required status must not acquire a matrix suffix');
  assert.equal(job['continue-on-error'], undefined);
  const [step] = job.steps;
  assert.equal(step.env.CHECKS_RESULT, '${{ needs.checks.result }}');
  assert.equal(step['continue-on-error'], undefined);
  for (const status of ['success', 'failure', 'cancelled', 'skipped', '']) {
    const run = spawnSync('sh', ['-c', step.run], {
      env: { ...process.env, CHECKS_RESULT: status }, encoding: 'utf8',
    });
    assert.equal(run.status === 0, status === 'success', status || 'missing result');
  }
});

test('CLA passes for an indented checked line with trailing spaces after a closed comment', () => {
  assert.equal(runCla(`<!-- note -->\n  - [x] ${agreement}  `).status, 0);
});
