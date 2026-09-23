import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

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
