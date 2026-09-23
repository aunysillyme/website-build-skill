import { lstatSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { owned } from './bundle.mjs';

const library = 'research/library';
const columns = ['claimid', 'domain', 'statement', 'url', 'published', 'accessed', 'status', 'dependents'];
const key = value => value.toLowerCase().replace(/[ _-]/g, '');
const cells = line => line.trim().slice(1, -1).split(/(?<!\\)\|/).map(value => value.trim().replaceAll('\\|', '|'));

// Deliberately a small text contract, not a YAML parser. Excerpts use an indented
// literal block so page text cannot introduce receipt metadata fields.
function receiptFields(text) {
  const fields = {}, problems = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(url|fetched_at|tool|result|published|excerpt):\s*(.*)$/);
    if (!match) continue;
    const [, name, value] = match;
    if (Object.hasOwn(fields, name)) problems.push(`duplicate ${name}`);
    if (name === 'excerpt' && value === '|') {
      const passage = [];
      while (i + 1 < lines.length && lines[i + 1].startsWith('  ')) passage.push(lines[++i].slice(2));
      fields[name] = passage.join('\n');
    } else fields[name] = value;
  }
  return { fields, problems };
}

function validUTC(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value || '')) return false;
  const time = new Date(value);
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  return !Number.isNaN(time.valueOf()) && time.toISOString() === normalized;
}

export function checkLibrary(siteWorkDir) {
  const root = resolve(siteWorkDir), problems = [], unverified = [], rows = [];
  const fail = (id, message) => problems.push(`${id}: ${message}`);
  let ledger;
  try { ledger = readFileSync(owned(root, `${library}/sources.md`), 'utf8'); }
  catch { return { code: 2, message: 'FAIL sources.md: missing or unreadable research/library/sources.md', problems: ['sources.md: missing or unreadable'], unverified: [] }; }
  let header = null;
  for (const [index, line] of ledger.split(/\r?\n/).entries()) {
    if (!line.trim().startsWith('|')) continue;
    const location = `sources.md:${index + 1}`;
    if (!line.trim().endsWith('|')) { fail(location, 'malformed ledger row'); continue; }
    const row = cells(line);
    if (row.every(cell => /^:?-+:?$/.test(cell))) continue;
    if (key(row[0]) === 'claimid') {
      header = row.map(key);
      if (header.length !== columns.length || columns.some(name => !header.includes(name))) fail(location, 'expected Claim ID, Domain, Statement, URL, Published, Accessed, Status, Dependents columns');
      continue;
    }
    if (!header || row.length !== header.length) { fail(location, 'missing header or inconsistent column count'); continue; }
    rows.push({ ...Object.fromEntries(header.map((name, i) => [name, row[i]])), location });
  }
  if (!rows.length) fail('sources.md', 'no claim rows');
  const ids = new Set(), unreceipted = [];
  let opened = 0;
  for (const row of rows) {
    const id = row.claimid;
    if (!/^CLAIM-[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id || '')) { fail(row.location, 'invalid claim ID'); continue; }
    if (ids.has(id)) fail(id, 'duplicate claim ID');
    ids.add(id);
    const status = (row.status || '').toUpperCase();
    if (!['OPENED', 'VERIFIED', 'UNVERIFIED'].includes(status)) fail(id, 'status must be OPENED or UNVERIFIED');
    if (status === 'UNVERIFIED') {
      unverified.push(id);
      // AD07: an UNVERIFIED claim may stay in the ledger as a lead, never as support.
      // A non-empty Dependents cell is the ledger's own record that something relies on it.
      if (!['', 'none', 'n/a', '-'].includes((row.dependents || '').trim().toLowerCase())) fail(id, 'UNVERIFIED claim is acted on; open the source and write its receipt, or clear Dependents');
    }
    else if (['OPENED', 'VERIFIED'].includes(status)) opened++;
    const name = `${library}/receipts/${id}.md`;
    let receipt;
    try {
      const path = owned(root, name);
      if (!lstatSync(path).isFile()) throw Error('not a regular file');
      receipt = readFileSync(path, 'utf8');
    } catch {
      unreceipted.push(id);
      if (status !== 'UNVERIFIED') fail(id, `unreceipted claim; missing or unreadable ${name}`);
      continue;
    }
    const { fields, problems: fieldProblems } = receiptFields(receipt);
    for (const problem of fieldProblems) fail(id, problem);
    for (const field of ['url', 'fetched_at', 'tool', 'result', 'published', 'excerpt']) {
      if (!fields[field]?.trim()) fail(id, `receipt missing ${field}`);
    }
    if (fields.fetched_at && !validUTC(fields.fetched_at)) fail(id, 'fetched_at must be a valid UTC timestamp ending in Z');
    if (fields.excerpt && [...fields.excerpt.trim()].length < 80) fail(id, 'excerpt is under 80 characters');
    if (fields.url !== row.url) fail(id, 'receipt url differs from row URL');
    if (row.published !== fields.published) fail(id, 'row publication date differs from receipt published field');
    if (fields.published && fields.published !== 'unknown' && !fields.excerpt?.includes(fields.published)) fail(id, 'published date is not present in excerpt text');
  }
  if (unreceipted.length) {
    for (const match of ledger.matchAll(/\bverified\s+against\s+opened\b/gi)) {
      const line = ledger.slice(0, match.index).split('\n').length;
      fail(`sources.md:${line}`, `verification claim over unreceipted rows: ${unreceipted.join(', ')}`);
    }
  }
  const output = problems.map(problem => `FAIL ${problem}`);
  output.push(...unverified.map(id => `UNVERIFIED ${id}: cannot support an acted-on claim`));
  if (!problems.length) output.push(`PASS library: ${opened} OPENED, ${unverified.length} UNVERIFIED, ${rows.length} claims; receipt consistency only`);
  return { code: problems.length ? 2 : 0, message: output.join('\n'), problems, unverified };
}
