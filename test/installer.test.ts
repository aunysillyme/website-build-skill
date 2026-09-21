import { test } from 'node:test';
import assert from 'node:assert/strict';
import { install } from '../src/install.ts';
import { generateAgents } from '../src/agents.ts';
import { main } from '../src/cli.ts';
import { owned } from '../src/bundle.ts';
import { root } from './helpers.ts';

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
