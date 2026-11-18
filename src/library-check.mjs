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
      while (i + 1 < lines.length) {
        if (lines[i + 1].startsWith('  ') && lines[i + 1].trim() !== '') {
          passage.push(lines[++i].slice(2));
          continue;
        }
        if (lines[i + 1].trim() === '') {
          let next = i + 2;
          while (next < lines.length && lines[next].trim() === '') next++;
          if (next < lines.length && lines[next].startsWith('  ')) {
            while (i + 1 < next) { i++; passage.push(''); }
            continue;
          }
        }
        break;
      }
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

function validAccessed(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return validUTC(`${value}T00:00:00Z`);
  return validUTC(value);
}

function validHttpUrl(value) {
  if (typeof value !== 'string' || !value || /\s/.test(value)) return false;
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch { return false; }
}

export function checkLibrary(siteWorkDir) {
  const root = resolve(siteWorkDir), problems = [], unverified = [], rows = [];
  const fail = (id, message) => problems.push(`${id}: ${message}`);
  let ledger;
  try { ledger = readFileSync(owned(root, `${library}/sources.md`), 'utf8'); }
  catch { return { code: 2, message: 'FAIL sources.md: missing or unreadable research/library/sources.md', problems: ['sources.md: missing or unreadable'], unverified: [] }; }
  let header = null, tableKind = null;
  for (const [index, line] of ledger.split(/\r?\n/).entries()) {
    if (!line.trim().startsWith('|')) { header = null; tableKind = null; continue; }
    const location = `sources.md:${index + 1}`;
    if (!line.trim().endsWith('|')) { if (tableKind !== 'other') fail(location, 'malformed ledger row'); continue; }
    const row = cells(line);
    if (row.every(cell => /^:?-+:?$/.test(cell))) continue;
    if (tableKind === 'other') continue;
    const normalized = row.map(key);
    if (tableKind === null) {
      if (normalized[0] === 'claimid' || normalized.includes('claimid')) {
        if (normalized.length !== columns.length || columns.some(name => !normalized.includes(name))) {
          fail(location, 'expected Claim ID, Domain, Statement, URL, Published, Accessed, Status, Dependents columns');
          tableKind = 'invalid';
        } else {
          header = normalized;
          tableKind = 'claims';
        }
        continue;
      }
      if (/^CLAIM-/i.test(row[0] || '')) {
        fail(location, 'missing header or inconsistent column count');
        tableKind = 'claims';
        header = null;
        continue;
      }
      tableKind = 'other';
      continue;
    }
    if (tableKind === 'invalid') continue;
    if (key(row[0]) === 'claimid') {
      if (normalized.length !== columns.length || columns.some(name => !normalized.includes(name))) {
        fail(location, 'expected Claim ID, Domain, Statement, URL, Published, Accessed, Status, Dependents columns');
        tableKind = 'invalid';
      } else header = normalized;
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
    if (!(row.domain || '').trim()) fail(id, 'missing domain');
    if (!(row.statement || '').trim()) fail(id, 'missing statement');
    if (!validAccessed((row.accessed || '').trim())) fail(id, 'accessed date must be YYYY-MM-DD or a valid UTC timestamp');
    const status = (row.status || '').toUpperCase();
    if (!['OPENED', 'VERIFIED', 'UNVERIFIED'].includes(status)) fail(id, 'status must be OPENED or UNVERIFIED');
    if (status === 'UNVERIFIED') {
      unverified.push(id);
      // AD07: an UNVERIFIED claim may stay in the ledger as a lead, never as support.
      // A non-empty Dependents cell is the ledger's own record that something relies on it.
      if (!['', 'none', 'n/a', '-'].includes((row.dependents || '').trim().toLowerCase())) fail(id, 'UNVERIFIED claim is acted on; open the source and write its receipt, or clear Dependents');
    } else if (['OPENED', 'VERIFIED'].includes(status)) {
      opened++;
      if (!validHttpUrl((row.url || '').trim())) fail(id, 'url must be a valid http or https URL');
    }
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
    for (const match of ledger.matchAll(/\b(?:verified\s+against\s+opened|all\s+claims?\s+verified)\b/gi)) {
      const line = ledger.slice(0, match.index).split(/\r?\n/).length;
      fail(`sources.md:${line}`, `verification claim over unreceipted rows: ${unreceipted.join(', ')}`);
    }
  }
  const output = problems.map(problem => `FAIL ${problem}`);
  output.push(...unverified.map(id => `UNVERIFIED ${id}: cannot support an acted-on claim`));
  if (!problems.length) output.push(`PASS library: ${opened} OPENED, ${unverified.length} UNVERIFIED, ${rows.length} claims; receipt consistency only`);
  return { code: problems.length ? 2 : 0, message: output.join('\n'), problems, unverified };
}
