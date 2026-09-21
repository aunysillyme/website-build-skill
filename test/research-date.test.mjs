import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CORE, manifest, read, generated } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

test('Canonical date rule and downstream checks remain routed', () => {
  const rule = read(root, `${CORE}/playbooks/research-and-memory.md`);
  for (const rung of ['host-environment', 'system-clock', 'http-date', 'filesystem-mtime', 'derived-floor', 'unavailable']) assert.ok(rule.includes(rung));
  for (const id of ['AD01','AD02','AD03','AD04','AD05','AD06','AD07','AD08','AD09']) assert.ok(read(root, `${CORE}/checklists/research.md`).includes(id));
  assert.equal(manifest(root).entryRole, 'researcher');
  for (const name of ['method', 'team']) assert.ok(generated(root)[`docs/bundles/${name}.md`].includes('## ASK DATE rule'));
});

test('Inactive date fixtures never enter active bundles', () => {
  const fixtures = read(root, 'test/fixtures/ask-date-cases.md');
  assert.match(fixtures, /AD01/); assert.match(fixtures, /AD09/);
  for (const members of Object.values(manifest(root).bundles)) assert.ok(members.every(p => !p.includes('fixtures/')));
});

test.todo('Live AD01-AD09 behavior: ladder evidence, clock override, no-search blockage, stale claims, derived floors and multi-day expiry');
