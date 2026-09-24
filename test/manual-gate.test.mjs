import { test } from 'node:test';
import assert from 'node:assert/strict';
import { files, read } from '../src/bundle.mjs';
import { fixture, change, root } from './helpers.mjs';

function pendingTests(target) {
  const marker = ['test', 'todo'].join('.');
  return files(target, 'test').filter(name => read(target, name).includes(marker));
}

test('Test sources use explicit manual-gate skips instead of pending declarations', () => {
  assert.deepEqual(pendingTests(root), []);
  for (const name of ['test/package.test.mjs', 'test/research-date.test.mjs']) {
    assert.match(read(root, name), /skip: 'needs a live host: manual gate in docs\/evaluation\/host-gate\.md'/);
  }
});

test('RED: reintroducing a pending declaration fails the no-pending check', () => fixture(target => {
  change(target, 'test/package.test.mjs', source => source + `\n${['test', 'todo'].join('.')}('x');\n`);
  assert.deepEqual(pendingTests(target), ['test/package.test.mjs']);
}));

function packedMatrix(workflow) {
  const job = workflow.jobs.checks;
  assert.equal(job['runs-on'], '${{ matrix.os }}');
  const matrix = job.strategy.matrix;
  const systems = new Set([...matrix.os, ...(matrix.include || []).map(entry => entry.os)]);
  for (const os of ['ubuntu-latest', 'macos-latest', 'windows-latest']) assert.ok(systems.has(os), os);
  assert.ok(job.steps.some(step => step.run === 'node --test test/packed-artifact.test.mjs'
    && step.if === "${{ runner.os != 'Linux' }}"));
  assert.ok(job.steps.some(step => step.run === 'node --test test/*.test.mjs'
    && step.if === "${{ always() && runner.os == 'Linux' }}"));
  assert.ok(workflow.jobs['required-check'].needs.includes('checks'));
}

test('Packed installs run on Linux, macOS and Windows behind the required check', () => {
  const workflow = JSON.parse(read(root, '.github/workflows/check.yml'));
  packedMatrix(workflow);
  workflow.jobs.checks.strategy.matrix.include = [];
  assert.throws(() => packedMatrix(workflow), /macos-latest/);
});
