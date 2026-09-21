import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { CORE, ARCHIVE, ARCHIVE_SHA, read, digest, generated, manifest } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

test('Published package ships the real entry point and no lifecycle hook', () => {
  const p = JSON.parse(read(root, 'package.json'));
  assert.equal(p.private, undefined);
  assert.equal(p.bin['website-build-skill'], 'bin/website-build-skill.mjs');
  assert.doesNotMatch(read(root, p.bin['website-build-skill']), /UNAVAILABLE/);
  // Four of these run on a stranger's machine before they have read anything; the other two
  // run at publish time and could change the bytes after the trial that approved them.
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare', 'prepublishOnly', 'prepack']) assert.equal(p.scripts[hook], undefined, hook);
  // The tarball has to carry everything the entry point reads at run time, and no entry may
  // negate another: npm applies a negation even when the path it empties is still listed.
  const published = p.files.map(entry => entry.replace(/\/+$/, ''));
  assert.ok(!published.some(entry => entry.startsWith('!')), 'no negated files entry');
  for (const needed of ['bin', 'src', 'skills', 'docs', 'README.md', 'LICENSE']) assert.ok(published.includes(needed), needed);
  // The engine floor is a claim about runtimes, so it is one continuous integration runs.
  const floor = p.engines.node.match(/(\d+)/)[1];
  const matrix = JSON.parse(read(root, '.github/workflows/check.yml')).jobs.checks.strategy.matrix.node;
  assert.ok(matrix.some(version => String(version).split('.')[0] === floor), `node ${floor} is not in the check matrix`);
});

test('Installer entry point rejects EOF without writing', () => {
  const parent = resolve(root, '.test-work');
  mkdirSync(parent, { recursive: true });
  const dir = mkdtempSync(resolve(parent, 'entrypoint-'));
  try {
    const result = spawnSync(process.execPath, ['bin/website-build-skill.mjs', '--dir', dir], { cwd: root, input: '', encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /EOF/);
    assert.deepEqual(readdirSync(dir), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Archive stays byte-identical and generated roles appear exactly once', () => {
  assert.equal(digest(read(root, `${CORE}/${ARCHIVE}`)), ARCHIVE_SHA);
  const first = generated(root), second = generated(root);
  assert.deepEqual(first, second);
  for (const role of manifest(root).roleOrder) {
    const marker = `<!-- BEGIN SOURCE: roles/${role}.md -->`;
    assert.equal(first['docs/bundles/team.md'].split(marker).length, 2);
  }
  assert.ok(!first['docs/bundles/prompts.md'].includes(`BEGIN SOURCE: ${ARCHIVE}`));
});

test.todo('Planned distribution: fresh npm tarball and ZIP installation on each claimed operating system and host');
