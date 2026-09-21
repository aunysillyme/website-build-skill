import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { CORE, ARCHIVE, ARCHIVE_SHA, read, digest, generated, manifest } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

test('Maintainer package is private with no bin or lifecycle hook', () => {
  const p = JSON.parse(read(root, 'package.json'));
  assert.equal(p.private, true); assert.equal(p.bin, undefined);
  assert.equal(p.scripts.install, undefined); assert.equal(p.scripts.postinstall, undefined);
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
