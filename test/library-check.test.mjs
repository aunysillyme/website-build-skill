import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkLibrary } from '../src/library-check.mjs';

const run = dir => spawnSync(process.execPath, ['bin/website-build-skill.mjs', 'check-library', dir], { encoding: 'utf8' });

test('RED fabricated ledger rejects both unreceipted claims and blanket verification', () => {
  const result = run('test/fixtures/library-red');
  assert.notEqual(result.status, 0);
  const output = result.stdout + result.stderr;
  for (const id of ['CLAIM-DESIGN-01', 'CLAIM-UIUX-02']) assert.match(output, new RegExp(`${id}:.*unreceipted`));
  assert.match(output, /verification claim over unreceipted rows/);
});

const green = 'test/fixtures/library-green';
const ledger = 'research/library/sources.md';
const receipt = 'research/library/receipts/CLAIM-EXAMPLE-01.md';
const read = (dir, file) => readFileSync(`${dir}/${file}`, 'utf8');
const edit = (dir, file, transform) => writeFileSync(`${dir}/${file}`, transform(read(dir, file)));
function fixture(t) {
  mkdirSync('.test-work', { recursive: true });
  const dir = mkdtempSync('.test-work/library-check-');
  cpSync(green, dir, { recursive: true });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function fails(dir, pattern) {
  const result = checkLibrary(dir);
  assert.equal(result.code, 2);
  assert.match(result.message, pattern);
  return result;
}

test('GREEN receipts satisfy every checker rule and CLI prints summary', () => {
  const result = run(green);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS library: 2 OPENED, 1 UNVERIFIED, 3 claims/);
  assert.match(result.stdout, /UNVERIFIED CLAIM-EXAMPLE-03/);
});

test('Audit round 1: an acted-on UNVERIFIED claim fails, an unused one passes', async t => {
  for (const dependents of ['Designer', 'Designer, Brand System', 'BM02 color decision']) {
    await t.test(dependents, t => {
      const dir = fixture(t);
      edit(dir, ledger, text => text.replace('| UNVERIFIED | none |', `| UNVERIFIED | ${dependents} |`));
      fails(dir, /CLAIM-EXAMPLE-03: UNVERIFIED claim is acted on/);
    });
  }
  for (const unused of ['none', 'None', 'n/a', '-']) {
    await t.test(`unused: ${unused}`, t => {
      const dir = fixture(t);
      edit(dir, ledger, text => text.replace('| UNVERIFIED | none |', `| UNVERIFIED | ${unused} |`));
      assert.equal(checkLibrary(dir).code, 0);
    });
  }
});

test('Rule 1 OPENED and Verified claims require receipts regardless of case', async t => {
  for (const status of ['OPENED', 'opened', 'OpEnEd', 'Verified', 'VERIFIED', 'vErIfIeD']) {
    await t.test(status, t => {
      const dir = fixture(t);
      edit(dir, ledger, text => text.replace('| OPENED |', `| ${status} |`));
      rmSync(`${dir}/${receipt}`);
      fails(dir, /CLAIM-EXAMPLE-01: unreceipted claim/);
    });
  }
});

test('Rule 2 missing required receipt fields fail', async t => {
  for (const field of ['url', 'fetched_at', 'tool', 'result', 'published', 'excerpt']) {
    await t.test(field, t => {
      const dir = fixture(t);
      edit(dir, receipt, text => text.replace(new RegExp(`^${field}:.*\\n`, 'm'), ''));
      fails(dir, new RegExp(`CLAIM-EXAMPLE-01: receipt missing ${field}`));
    });
  }
});

test('Rule 2 excerpt must contain at least 80 characters', t => {
  const dir = fixture(t);
  edit(dir, receipt, text => text.replace(/excerpt:[\s\S]*/, `excerpt: |\n  ${'a'.repeat(79)}\n`));
  fails(dir, /CLAIM-EXAMPLE-01: excerpt is under 80 characters/);
  edit(dir, receipt, text => text.replace('published: 2026-09-20', 'published: unknown').replace('a'.repeat(79), 'a'.repeat(80)));
  edit(dir, ledger, text => text.replace('| 2026-09-20 |', '| unknown |'));
  assert.equal(checkLibrary(dir).code, 0);
});

test('Rule 3 receipt URL must equal the claim row URL', t => {
  const dir = fixture(t);
  edit(dir, receipt, text => text.replace('https://example.com/research', 'https://example.com/other'));
  fails(dir, /CLAIM-EXAMPLE-01: receipt url differs from row URL/);
});

test('Rule 4 row publication date must match the receipt published field', t => {
  const dir = fixture(t);
  edit(dir, ledger, text => text.replace('| 2026-09-20 |', '| 2026-09-21 |'));
  fails(dir, /CLAIM-EXAMPLE-01: row publication date differs from receipt published field/);
});

test('Rule 4 published date must appear in the excerpt text', t => {
  const dir = fixture(t);
  edit(dir, receipt, text => text.replace('Published 2026-09-20.', 'Published recently.'));
  fails(dir, /CLAIM-EXAMPLE-01: published date is not present in excerpt text/);
});

test('Rule 5 header verification claim fails over any unreceipted row', t => {
  const dir = fixture(t);
  edit(dir, ledger, text => `Every claim was VERIFIED against OPENED authoritative sources.\n\n${text}`);
  fails(dir, /verification claim over unreceipted rows: CLAIM-EXAMPLE-03/);
});

test('Rule 5 row verification claim fails over any unreceipted row', t => {
  const dir = fixture(t);
  edit(dir, ledger, text => text.replace('A synthetic research claim.', 'This was verified against opened sources.'));
  fails(dir, /verification claim over unreceipted rows: CLAIM-EXAMPLE-03/);
});

test('Rule 5 detects wrapped verification without matching the word unverified', t => {
  const dir = fixture(t);
  edit(dir, ledger, text => `Every claim was verified against\nopened sources.\n\n${text}`);
  fails(dir, /verification claim over unreceipted rows/);
  edit(dir, ledger, text => text.replace('was verified', 'was unverified'));
  assert.equal(checkLibrary(dir).code, 0);
});

test('UNVERIFIED rows without receipts pass but are listed as unusable acted-on evidence', t => {
  const dir = fixture(t);
  // Unused leads only: an UNVERIFIED row with dependents fails (audit round 1 test above).
  edit(dir, ledger, text => text.replaceAll('| OPENED |', '| UNVERIFIED |').replace('| Designer |', '| none |').replace('| Builder |', '| none |'));
  rmSync(`${dir}/research/library/receipts`, { recursive: true });
  const result = checkLibrary(dir);
  assert.equal(result.code, 0);
  for (const id of ['CLAIM-EXAMPLE-01', 'CLAIM-EXAMPLE-02', 'CLAIM-EXAMPLE-03']) {
    assert.match(result.message, new RegExp(`UNVERIFIED ${id}: cannot support an acted-on claim`));
  }
});

test('Malformed ledger, duplicate claims and unknown statuses fail instead of disappearing', async t => {
  const cases = [
    ['missing columns', text => text.replace('| Dependents |', '| Consumers |'), /expected Claim ID/],
    ['short row', text => text.replace('| Designer |', '|'), /inconsistent column count/],
    ['unterminated row', text => text.replace('| Designer |', '| Designer'), /malformed ledger row/],
    ['duplicate claim', text => text.replaceAll('CLAIM-EXAMPLE-02', 'CLAIM-EXAMPLE-01'), /duplicate claim ID/],
    ['invalid status', text => text.replace('| OPENED |', '| APPROVED |'), /status must be OPENED or UNVERIFIED/],
    ['empty ledger', () => '# Empty\n', /no claim rows/],
  ];
  for (const [name, transform, pattern] of cases) await t.test(name, t => {
    const dir = fixture(t);
    edit(dir, ledger, transform);
    fails(dir, pattern);
  });
});

test('Receipt metadata rejects invalid UTC timestamps and duplicate fields', async t => {
  for (const value of ['2026-02-30T12:00:00Z', '2026-09-23', '2026-09-23T12:00:00+00:00']) {
    await t.test(value, t => {
      const dir = fixture(t);
      edit(dir, receipt, text => text.replace('2026-09-23T12:00:00Z', value));
      fails(dir, /fetched_at must be a valid UTC timestamp/);
    });
  }
  await t.test('duplicate fields', t => {
    const dir = fixture(t);
    edit(dir, receipt, text => `tool: fixture-reader\n${text}`);
    fails(dir, /duplicate tool/);
  });
});

test('Indented excerpt metadata stays verbatim text rather than replacing receipt fields', t => {
  const dir = fixture(t);
  edit(dir, receipt, text => `${text}  url: https://example.com/unrelated\n`);
  assert.equal(checkLibrary(dir).code, 0);
});

test('Environment UTC timestamps may include three-digit milliseconds', t => {
  const dir = fixture(t);
  edit(dir, receipt, text => text.replace('2026-09-23T12:00:00Z', '2026-09-23T12:00:00.123Z'));
  assert.equal(checkLibrary(dir).code, 0);
});

test('Claim IDs cannot traverse to another receipt path', t => {
  const dir = fixture(t);
  edit(dir, ledger, text => text.replace('CLAIM-EXAMPLE-01', 'CLAIM-../../escape'));
  fails(dir, /invalid claim ID/);
});

test('Receipt symlinks cannot substitute evidence from another directory', t => {
  const dir = fixture(t);
  const target = resolve(dir, 'original-receipt.md');
  writeFileSync(target, read(dir, receipt));
  rmSync(`${dir}/${receipt}`);
  symlinkSync(target, `${dir}/${receipt}`);
  fails(dir, /CLAIM-EXAMPLE-01: unreceipted claim/);
});

test('CLI check-library requires exactly one directory and reports missing ledgers', () => {
  for (const args of [[], ['--help'], [green, 'extra']]) {
    const result = spawnSync(process.execPath, ['bin/website-build-skill.mjs', 'check-library', ...args], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stdout + result.stderr, /Usage: website-build-skill check-library/);
  }
  const result = run('test/fixtures');
  assert.equal(result.status, 2);
  assert.match(result.stdout + result.stderr, /missing or unreadable research\/library\/sources.md/);
});

test('AD04 AD07 and AD09 name the receipt artifact and checker', () => {
  const text = readFileSync('skills/website-build-skill/checklists/research.md', 'utf8');
  for (const id of ['AD04', 'AD07', 'AD09']) {
    const row = text.split('\n').find(line => line.startsWith(`| ${id}:`));
    assert.ok(row, `${id} row exists`);
    assert.ok(row.includes('research/library/receipts/<CLAIM-ID>.md'), `${id} names the receipt path`);
    assert.match(row, /check-library/, `${id} names the checker`);
  }
});
