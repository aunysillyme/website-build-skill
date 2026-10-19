import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  appendFileSync, copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync, unlinkSync,
} from 'node:fs';
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
    assert.ok(result.stderr.split('\n').includes(`SET_DRIFT: ${file}: run npx repo-build-skill@0.1.1 set sync (maintainer-run, outside CI)`));
    assert.equal(readFileSync(path, 'utf8'), after, 'check never repairs drift');
  }));
}

test('Set check names every drifted set block in one run', () => fixture(dir => {
  for (const file of ['README.md', 'llms.txt']) {
    const path = resolve(dir, file);
    writeFileSync(path, readFileSync(path, 'utf8').replace('## Part of a set', '## Changed set'));
  }
  const result = run(['--root', dir]);
  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(result.stderr.trim().split('\n').map(line => line.split(': ')[1]), ['README.md', 'llms.txt']);
}));

test('Set check names both changed pins without loading the altered renderer', () => fixture(dir => {
  writeFileSync(resolve(dir, '.repo-build/render-set.mjs'), 'invalid JavaScript');
  writeFileSync(resolve(dir, '.repo-build/set.json'), 'invalid JSON');
  const result = run(['--root', dir]);
  assert.equal(result.status, 1, result.stderr);
  assert.deepEqual(result.stderr.trim().split('\n').map(line => line.split(': ')[1]),
    ['.repo-build/render-set.mjs', '.repo-build/set.json']);
}));

test('Set check exits 2 for missing or unreadable inputs', () => {
  for (const file of inputs.filter(name => name !== '.repo-build/config.json')) {
    fixture(dir => {
      unlinkSync(resolve(dir, file));
      const result = run(['--root', dir]);
      assert.equal(result.status, 2, result.stderr);
      assert.match(result.stderr, /^SET_CHECK: /);
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
    assert.match(result.stderr, /^SET_CHECK: Usage:/);
  }
});

// A fixture that carries its own copy of the script, so a default-root run uses that copy's neighbours.
function withScript(check, renderer) {
  fixture(dir => {
    mkdirSync(resolve(dir, 'scripts'));
    copyFileSync(script, resolve(dir, 'scripts/check-set.mjs'));
    if (renderer) writeFileSync(resolve(dir, '.repo-build/render-set.mjs'), renderer);
    check(dir, args => spawnSync(process.execPath, [resolve(dir, 'scripts/check-set.mjs'), ...args],
      { cwd: tmpdir(), encoding: 'utf8' }));
  });
}

test('Set check never executes a renderer that fails its pin', () => withScript((dir, runCopy) => {
  const marker = resolve(dir, 'ran.marker');
  appendFileSync(resolve(dir, '.repo-build/render-set.mjs'),
    `\nimport { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(marker)}, 'ran');\nprocess.exit(0);\n`);
  for (const args of [[], ['--root', dir]]) {
    const result = runCopy(args);
    assert.equal(result.status, 1, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr,
      'SET_DRIFT: .repo-build/render-set.mjs: run npx repo-build-skill@0.1.1 set sync (maintainer-run, outside CI)\n');
    assert.equal(existsSync(marker), false, 'unpinned renderer code ran');
  }
}));

for (const file of ['.repo-build/set.lock.json', 'package.json', '.repo-build/render-set.mjs', '.repo-build']) {
  test(`Set check exits 2 when ${file} is a symlink to identical bytes`, t => fixture(dir => {
    const real = mkdtempSync(resolve(tmpdir(), 'website-set-real-'));
    try {
      const link = resolve(dir, file), copy = resolve(real, 'copy');
      if (file === '.repo-build') {
        mkdirSync(copy);
        for (const name of ['config.json', 'render-set.mjs', 'set.json', 'set.lock.json']) copyFileSync(resolve(link, name), resolve(copy, name));
        rmSync(link, { recursive: true });
      } else {
        copyFileSync(link, copy);
        rmSync(link);
      }
      try { symlinkSync(copy, link); } catch (error) { return t.skip(`symlinks unavailable: ${error.code}`); }
      const result = run(['--root', dir]);
      assert.equal(result.status, 2, result.stdout + result.stderr);
      assert.match(result.stderr, /^SET_CHECK: .*symlink/);
    } finally { rmSync(real, { recursive: true, force: true }); }
  }));
}

test('Set check with --root runs only the renderer it hashed under that root', () => fixture(clean => {
  const own = mkdtempSync(resolve(tmpdir(), 'website-set-own-'));
  try {
    mkdirSync(resolve(own, '.repo-build'));
    mkdirSync(resolve(own, 'scripts'));
    copyFileSync(script, resolve(own, 'scripts/check-set.mjs'));
    const marker = resolve(own, 'ran.marker');
    writeFileSync(resolve(own, '.repo-build/render-set.mjs'),
      `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(marker)}, 'ran');\nexport const renderSet = () => ({ changed: [] });\n`);
    const result = spawnSync(process.execPath, [resolve(own, 'scripts/check-set.mjs'), '--root', clean],
      { cwd: tmpdir(), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'Set blocks and pinned hashes match.\n');
    assert.equal(existsSync(marker), false, 'the script-relative renderer ran instead of the hashed one');
  } finally { rmSync(own, { recursive: true, force: true }); }
}));
