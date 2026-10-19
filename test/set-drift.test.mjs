import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = resolve(root, 'scripts/check-set.mjs');
const run = args => spawnSync(process.execPath, [script, ...args], { cwd: tmpdir(), encoding: 'utf8' });
const inputs = ['README.md', 'llms.txt', 'package.json', '.repo-build/config.json',
  '.repo-build/render-set.mjs', '.repo-build/set.json', '.repo-build/set.lock.json'];

function fixture(check) {
  const dir = mkdtempSync(resolve(tmpdir(), 'website-set-'));
  try {
    for (const name of inputs) {
      mkdirSync(dirname(resolve(dir, name)), { recursive: true });
      copyFileSync(resolve(root, name), resolve(dir, name));
    }
    check(dir);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('Set check exits 0 on the clean checkout and an explicit temp root', () => {
  const result = run([]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Set blocks and pinned hashes match.\n');
  assert.equal(result.stderr, '');
  fixture(dir => {
    const copied = run(['--root', dir]);
    assert.equal(copied.status, 0, copied.stderr);
    assert.equal(copied.stdout, result.stdout);
  });
});

for (const [name, file, transform] of [
  ['README set row', 'README.md', text => text.replace('| [repo-build-skill]', '| [changed-set-row]')],
  ['renderer bytes', '.repo-build/render-set.mjs', text => text + '\n// changed renderer bytes\n'],
  ['set.json bytes', '.repo-build/set.json', text => text + '\n'],
]) {
  test(`Set check exits 1 with SET_DRIFT for changed ${name}`, () => fixture(dir => {
    const path = resolve(dir, file), before = readFileSync(path, 'utf8');
    const after = transform(before);
    assert.notEqual(after, before, 'fixture must change bytes');
    writeFileSync(path, after);
    const result = run(['--root', dir]);
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, '');
    assert.ok(result.stderr.split('\n').includes(`SET_DRIFT: ${file}: maintainer-run npx repo-build-skill@0.1.1 set sync outside CI, then commit the result.`));
    assert.equal(readFileSync(path, 'utf8'), after, 'check never repairs drift');
  }));
}

test('Set check names every drifted file in one run', () => fixture(dir => {
  for (const file of ['README.md', 'llms.txt']) {
    const path = resolve(dir, file);
    writeFileSync(path, readFileSync(path, 'utf8').replace('## Part of a set', '## Changed set'));
  }
  for (const file of ['.repo-build/render-set.mjs', '.repo-build/set.json']) {
    const path = resolve(dir, file);
    writeFileSync(path, readFileSync(path, 'utf8') + '\n');
  }
  const result = run(['--root', dir]);
  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(result.stderr.trim().split('\n').map(line => line.split(': ')[1]),
    ['README.md', 'llms.txt', '.repo-build/render-set.mjs', '.repo-build/set.json']);
}));

test('Set check exits 2 for missing or unreadable inputs', () => {
  for (const file of inputs.filter(name => name !== '.repo-build/config.json')) {
    fixture(dir => {
      unlinkSync(resolve(dir, file));
      const result = run(['--root', dir]);
      assert.equal(result.status, 2, result.stderr);
      assert.match(result.stderr, /^SET_ERROR: /);
      assert.ok(result.stderr.includes(file));
    });
  }
  fixture(dir => {
    unlinkSync(resolve(dir, 'README.md'));
    mkdirSync(resolve(dir, 'README.md'));
    assert.equal(run(['--root', dir]).status, 2);
  });
});

test('Set check exits 2 for bad usage', () => {
  for (const args of [['--wat'], ['--root'], ['--root', '--wat'], ['--root', root, '--root', root]]) {
    const result = run(args);
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /^SET_ERROR: Usage:/);
  }
});
