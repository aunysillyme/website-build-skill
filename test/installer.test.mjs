import { test } from 'node:test';
import assert from 'node:assert/strict';
import { install } from '../src/install.mjs';
import { generateAgents } from '../src/agents.mjs';
import { main } from '../src/cli.mjs';
import { owned } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

test('Unavailable installer and worker generator fail closed', () => {
  assert.throws(() => install({}), /UNAVAILABLE/);
  assert.throws(() => generateAgents({}), /UNAVAILABLE/);
  assert.equal(main().code, 2);
});

test('Local bundle path resolver rejects traversal', () => {
  assert.throws(() => owned(root, '../escape'));
  assert.throws(() => owned(root, '/escape'));
  assert.throws(() => owned(root, 'C:\\escape'));
});

test.todo('Planned installer: destination symlinks, conflicts, interruption, dry-run, existing routers and shared uninstall');
