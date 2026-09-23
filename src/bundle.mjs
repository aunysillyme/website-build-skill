import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve, relative, dirname, sep, posix } from 'node:path';
import { createHash } from 'node:crypto';

export const CORE = 'skills/website-build-skill';
export const ARCHIVE = 'archive/graphics-design-original.md';
export const ARCHIVE_SHA = 'd985b6fcaf5c0de9c6d60f2511bb9fa5728ad0d2d543a64a673962647ea5388a';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');

// Resolve only existing, regular, repository-owned inputs. Never follow a symlink.
export function owned(root, name, mustExist = true) {
  if (typeof name !== 'string' || !name || name.includes('\\') || name.startsWith('/') || /^[A-Za-z]:/.test(name)) throw Error('invalid owned path');
  const base = resolve(root), full = resolve(base, name);
  if (full !== base && !full.startsWith(base + sep)) throw Error('path escapes repository');
  let part = base;
  if (lstatSync(base).isSymbolicLink()) throw Error('symlink root');
  for (const segment of relative(base, full).split(sep).filter(Boolean)) {
    part = resolve(part, segment);
    // existsSync follows the link, so it is FALSE for a dangling symlink and the symlink
    // check below was skipped. An ordinary write then follows that link outside the
    // repository. lstat never follows, so it sees the link whether or not the target exists.
    let entry = null;
    try { entry = lstatSync(part); } catch { entry = null; }
    if (entry) {
      if (entry.isSymbolicLink()) throw Error('symlink path');
    } else if (mustExist) throw Error(`missing path: ${name}`);
  }
  return full;
}

export function files(root, directory = '') {
  const out = [];
  for (const item of readdirSync(owned(root, directory || '.'), { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
    if (['.git', 'node_modules', '.test-work', '.build-local'].includes(item.name)) continue;
    // Local, gitignored working files are not part of the published tree. Reviewing them
    // would fail the gate on notes that never ship.
    if (/^AUDIT_BRIEF.*\.md$/.test(item.name) || /\.(plan|brief)\.md$/.test(item.name) || item.name === 'notes-local') continue;
    const name = directory ? `${directory}/${item.name}` : item.name;
    if (item.isSymbolicLink()) throw Error(`symlink in public tree: ${name}`);
    if (item.isDirectory()) out.push(...files(root, name));
    else if (item.isFile()) out.push(name);
  }
  return out;
}

export const read = (root, name) => readFileSync(owned(root, name), 'utf8');
export const manifest = root => JSON.parse(read(root, `${CORE}/manifest.json`));

// Rebase rendered links; bare canonical filenames retain an explicit source-base label.
export function rebase(text, source, target) {
  const rewrite = url => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return url;
    const [file, fragment] = url.split('#');
    const destination = file ? posix.normalize(posix.join(posix.dirname(source), file)) : source;
    return posix.relative(posix.dirname(target), destination) + (fragment === undefined ? '' : '#' + fragment);
  };
  let fenced = false;
  return text.split('\n').map(line => {
    if (/^\s*(`{3,}|~{3,})/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    return line.replace(/(!?\[[^\]\n]*\]\()([^\s)]+)([^)]*\))/g, (_, a, b, c) => a + rewrite(b) + c)
      .replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/, (_, a, b) => a + rewrite(b))
      .replace(/((?:href|src)=["'])([^"']+)(["'])/g, (_, a, b, c) => a + rewrite(b) + c);
  }).join('\n');
}

// A short phrase naming what an asset teaches, for the llms.txt catalog. Prefers a real
// JSON description field, then the file's own first descriptive heading or line, and
// only falls back to the bare asset kind when nothing readable is found. Never hand-write
// this text in llms.txt itself: it is derived here so the catalog stays truthful as files change.
export function describe(root, asset) {
  const truncate = s => s.length > 90 ? s.slice(0, 87).trimEnd() + '...' : s;
  const plain = s => s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim();
  // Several role/prompt files open with the same shared ASK DATE preamble, so it names the
  // convention every file follows rather than what that specific file teaches. Skip it when
  // looking for the first descriptive content line.
  const boilerplate = /^(?:ASK DATE prerequisite:|Researcher establishes it before intake|Never ask the user for the date|same source, two-date, freshness)/i;
  if (asset.path.endsWith('.json')) {
    try {
      const data = JSON.parse(read(root, `${CORE}/${asset.path}`));
      if (typeof data.description === 'string' && data.description.trim()) return truncate(plain(data.description));
    } catch { /* not readable JSON; fall through to kind */ }
    return asset.kind;
  }
  let body;
  try { body = read(root, `${CORE}/${asset.path}`); } catch { return asset.kind; }
  const lines = body.split('\n').slice(0, 60);
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (!heading) continue;
    const text = plain(heading[1]);
    // A short all-caps section label (IDENTITY, YOUR TOOLS) names a slot, not what the file
    // teaches, so it is skipped in favour of the first descriptive line below.
    if (text.length > 3 && text !== text.toUpperCase()) return truncate(text);
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || /^#{1,6}\s/.test(line) || /^(?:`{3,}|~{3,})/.test(line) || boilerplate.test(line)) continue;
    const text = plain(line);
    if (text.length > 3) return truncate(text);
  }
  return asset.kind;
}

export function generated(root) {
  const m = manifest(root), output = {};
  const byPath = new Map(m.assets.map(a => [a.path, a]));
  for (const [name, members] of Object.entries(m.bundles)) {
    if (!/^(method|prompts|playbooks|checklists|team)$/.test(name)) throw Error('unknown bundle');
    const target = `docs/bundles/${name}.md`;
    let text = `# Website build: ${name}\n\nGenerated from the canonical manifest. Do not edit this file.\n\n`;
    text += 'Bare skill paths in the included instructions resolve from the canonical skill directory.\n';
    text += 'For uploads, locate the named source section in these bundles; request an attachment when absent.\n';
    text += 'Project paths resolve only in the authorized website workspace. See [host setup and evidence](../COMPATIBILITY.md).\n\n## Contents\n\n';
    for (const member of members) {
      const asset = byPath.get(member);
      if (!asset?.active || member === ARCHIVE) throw Error('inactive asset requested in active bundle');
      text += `- [${member}](../../${CORE}/${member})\n`;
    }
    for (const member of members) {
      const source = `${CORE}/${member}`;
      text += `\n<!-- BEGIN SOURCE: ${member} -->\n\n## Source: ${member}\n\n`;
      const body = read(root, source);
      text += member.endsWith('.md') ? rebase(body, source, target) : `\n\`\`\`text\n${body.trimEnd()}\n\`\`\`\n`;
      text += `\n<!-- END SOURCE: ${member} -->\n`;
    }
    if (name === 'team') {
      const source = 'adapters/grok.md';
      const manual = read(root, source).split('## Manual fallback\n')[1];
      if (!manual) throw Error('missing manual fallback');
      text += '\n' + rebase('## Manual fallback\n' + manual, source, target);
      text += '\n## Artifact ownership roster\n\n```yaml\n' + read(root, 'adapters/team.yaml').trimEnd() + '\n```\n';
    }
    output[target] = text.trimEnd() + '\n';
  }
  let index = '# website-build-skill\n\n> A skill pack that turns your AI into an expert website builder. It teaches your LLM or agent current, researched practice in design, brand, accessibility, performance, search, security, stacks and code, so the sites it builds look and work like a professional made them.\n\n';
  index += 'Generated from skills/website-build-skill/manifest.json. Repository: https://github.com/aunysillyme/website-build-skill.\n\n';
  index += '## Start here\n\n';
  index += '- [Quick start](README.md#quick-start): run `npx website-build-skill` or paste the starter into your AI\n';
  index += '- [Installer](docs/INSTALLER.md): headless setup, destinations, receipts, exit codes and uninstall\n';
  index += '- [Compatibility](docs/COMPATIBILITY.md): host setup routes and the evidence for each\n';
  index += '- [Documentation](docs/README.md): method, tips, provenance and evaluation\n\n';
  index += '## Active sources\n\n';
  for (const asset of m.assets.filter(a => a.active)) index += `- [${asset.path}](${CORE}/${asset.path}): ${describe(root, asset)}\n`;
  index += '\n## Bundles\n\n';
  for (const name of Object.keys(m.bundles)) index += `- [${name}](docs/bundles/${name}.md): generated upload packet\n`;
  index += `\n## Inactive provenance\n\n- [Graphics original](${CORE}/${ARCHIVE}): archive only; never execute\n`;
  output['llms.txt'] = index;
  return output;
}
