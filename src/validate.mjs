import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { CORE, ARCHIVE, ARCHIVE_SHA, digest, files, read, manifest, generated, owned } from './bundle.mjs';

const roles = ['researcher', 'coordinator', 'designer', 'graphics', 'builder', 'optimizer', 'reviewer'];
const headings = ['IDENTITY', 'WHAT YOU OWN', 'WHAT YOU MUST NOT DO', 'WHAT YOU NEED TO KNOW BEFORE YOU START', 'WHAT YOU MUST LEARN', 'WHAT YOU MUST RESEARCH', 'YOUR TOOLS', 'YOUR INPUTS', 'YOUR OUTPUTS', 'YOUR GATE', 'YOUR HANDOFF', 'HOW YOU FAIL'];
const owner = ['au', 'ny', 'sillyme'].join('');
const personal = ['au', 'ny'].join('');
const product = ['Claude', 'Code'].join(' ');
const forbidden = [personal, product, ['Vau','lts'].join(''), ['A','UN-'].join(''), ['linear','.app'].join(''), ['/','Users','/'].join(''), ['@','gmail'].join(''), ['site','builder','skill'].join('-')];
export const privacyPattern = new RegExp(forbidden.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

export function privacyIssues(name, text, options = {}) {
  const issues = [];
  // A private identifier can reach the public tree as a FILENAME while every line of the
  // file is clean, so the path is scanned before its contents.
  if (privacyPattern.test(name)) issues.push(`PRIVACY_NAME:${name}`);
  for (const [i, original] of text.split('\n').entries()) {
    let line = original;
    if (name === 'LICENSE' && line === `Copyright (c) 2026 ${personal[0].toUpperCase()}${personal.slice(1)}`) continue;
    // Resolved policy. Two public identifiers are required by the repository and are exempt:
    // the owning account on the exact CODEOWNERS line, and the supported host's product name.
    // Everything else the pattern names stays forbidden, including the same account string
    // anywhere other than that line or a repository URL.
    if (name === '.github/CODEOWNERS' && line === `* @${owner}`) continue;
    // The product name is exempt as a name, never as a path segment. Exempting it outright
    // would let a local working directory through, so path-shaped uses are caught first.
    // Normalise the spellings a path can take before testing: an escaped space, surrounding
    // quotes, and a Windows separator all hide the same path from a naive pattern.
    const normalised = line.replace(/\\ /g, ' ').replace(/["']/g, '');
    const productPath = new RegExp(`(?:~|\\$HOME|%USERPROFILE%|[A-Za-z]:)?[\\\\/]${product}(?=[\\\\/ ]|$)`, 'i');
    if (productPath.test(normalised)) { issues.push(`PRIVACY:${name}:${i + 1}`); continue; }
    line = line.replaceAll(product, 'PUBLIC_PRODUCT');
    // Only exact repository URL namespaces, never the whole line around a URL.
    line = line.replace(new RegExp(`https://(?:github\\.com|raw\\.githubusercontent\\.com)/${owner}/website-build-skill(?=[/\\s)"'.\\x60]|$)`, 'g'), 'REPOSITORY');
    if (privacyPattern.test(line) || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line)) issues.push(`PRIVACY:${name}:${i + 1}`);
    if (line.includes(String.fromCharCode(0x2014))) issues.push(`VOICE:${name}:${i + 1}`);
  }
  return issues;
}

function visibleMarkdown(text) {
  let fence = null;
  return text.split('\n').map(line => {
    const m = line.match(/^\s*(`{3,}|~{3,})/);
    if (m) {
      if (!fence) fence = m[1];
      else if (m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
      return '';
    }
    return fence ? '' : line.replace(/`[^`]*`/g, '');
  }).join('\n');
}

// Fenced blocks, closed the way a Markdown reader closes them: same marker, at least as
// long, indented up to three spaces. Returns each block's body.
export function fenced(text) {
  const blocks = [];
  let marker = null, body = [];
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (!marker) { if (open) { marker = open[1]; body = []; } continue; }
    if (open && open[1][0] === marker[0] && open[1].length >= marker.length && !line.slice(line.indexOf(open[1]) + open[1].length).trim()) { blocks.push(body.join('\n')); marker = null; continue; }
    body.push(line);
  }
  return blocks;
}

function anchors(text) {
  const result = new Set(), counts = new Map();
  for (const match of visibleMarkdown(text).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = match[1].toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/ /g, '-');
    const count = counts.get(base) || 0;
    result.add(count ? `${base}-${count}` : base); counts.set(base, count + 1);
  }
  for (const m of text.matchAll(/\b(?:id|name)=["']([^"']+)["']/g)) result.add(m[1]);
  return result;
}

export function linkIssues(root, name, text) {
  const body = visibleMarkdown(text), urls = [], issues = [], refs = new Map();
  for (const m of body.matchAll(/^\s*\[([^\]]+)\]:\s*(<[^>]+>|\S+)/gm)) refs.set(m[1].toLowerCase(), m[2].replace(/^<|>$/g, ''));
  for (const m of body.matchAll(/!?\[[^\]\n]*\]\(\s*(<[^>]+>|[^\s)]+)(?:\s+["'][^\n]*?["'])?\s*\)/g)) urls.push(m[1].replace(/^<|>$/g, ''));
  for (const m of body.matchAll(/!?\[([^\]\n]+)\]\[([^\]\n]*)\]/g)) {
    const key = (m[2] || m[1]).toLowerCase();
    if (!refs.has(key)) issues.push(`LINK:${name}:undefined reference ${key}`);
    else urls.push(refs.get(key));
  }
  for (const m of body.matchAll(/(?:href|src)=["']([^"']+)["']/g)) urls.push(m[1]);
  urls.push(...refs.values());
  for (const url of urls) {
    if (/^(?:https?:|mailto:|data:|\/\/)/i.test(url)) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) { issues.push(`LINK:${name}:unsupported URI`); continue; }
    try {
      const [pathQuery, fragment] = url.split('#'), path = decodeURIComponent(pathQuery.split('?')[0]);
      const target = path ? (path.startsWith('/') ? path.slice(1) : posix.normalize(posix.join(posix.dirname(name), path))) : name;
      owned(root, target);
      if (fragment && target.endsWith('.md') && !anchors(read(root, target)).has(decodeURIComponent(fragment))) throw Error('missing heading');
    } catch { issues.push(`LINK:${name}:unresolved ${url}`); }
  }
  return issues;
}

export function installClaimIssues(name, text) {
  const issues = [];
  for (const [i, line] of text.split('\n').entries()) {
    if (/\b(?:npx|npm\s+(?:exec|install|i)|pnpm\s+(?:dlx|add)|yarn\s+(?:dlx|add)|bunx)\s+.*website-build-skill/.test(line) && !/planned|unavailable/i.test(line)) issues.push(`INSTALL_CLAIM:${name}:${i+1}`);
    if (/\b(?:curl|wget)\b.*\|\s*(?:sh|bash)/.test(line) && !/planned|unavailable/i.test(line)) issues.push(`INSTALL_CLAIM:${name}:${i+1}`);
  }
  return issues;
}

// Every pinned action SHA, mapped to the upstream tag it actually is. Verified against the
// action repository's own tag list on the date it was added. A pin absent here is unverified.
const PINNED_VERSIONS = {
  'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1': 'v7.0.1',
  'actions/setup-node@820762786026740c76f36085b0efc47a31fe5020': 'v7.0.0',
};

export function workflowIssues(name, text) {
  const issues = [];
  let workflow;
  try { workflow = JSON.parse(text); }
  catch { return [`WORKFLOW_FORMAT:${name}:use the JSON subset of YAML for structural validation`]; }
  const checkPermissions = (permissions, location) => {
    if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) issues.push(`WORKFLOW_PERMISSIONS:${location}`);
    else for (const [key, value] of Object.entries(permissions)) if (!(key === 'contents' && value === 'read') && value !== 'none') issues.push(`WORKFLOW_PERMISSIONS:${location}:${key}`);
  };
  checkPermissions(workflow.permissions, name);
  if (!workflow.concurrency || workflow.concurrency['cancel-in-progress'] !== true) issues.push(`WORKFLOW_CONCURRENCY:${name}`);
  // A trigger can be written as an object, a bare string or an array. Checking only the
  // object form let `on: pull_request_target` through as a string.
  const triggers = workflow.on === undefined ? []
    : typeof workflow.on === 'string' ? [workflow.on]
    : Array.isArray(workflow.on) ? workflow.on.filter(t => typeof t === 'string')
    : Object.keys(workflow.on);
  const forbiddenTriggers = ['pull_request_target', 'workflow_run', 'issue_comment'];
  for (const trigger of triggers) if (forbiddenTriggers.includes(trigger)) issues.push(`WORKFLOW_TRIGGER:${name}:${trigger}`);
  // Attacker-controlled event data interpolated straight into a shell is command injection.
  // The safe form passes the value through `env:` and reads it as a variable.
  const injectable = /\$\{\{\s*(?:github\.event\b|github\.head_ref\b|inputs\.|github\.actor\b)[^}]*\}\}/;
  const visitRun = obj => {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'run' && typeof value === 'string' && injectable.test(value)) issues.push(`WORKFLOW_INJECTION:${name}`);
      visitRun(value);
    }
  };
  visitRun(workflow);
  const visitUses = obj => {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'uses' && (typeof value !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_./-]+@[a-f0-9]{40}$/.test(value))) issues.push(`ACTION_PIN:${name}`);
      if (key === 'uses' && typeof value === 'string' && value.startsWith('actions/checkout@') && obj.with?.['persist-credentials'] !== false) issues.push(`WORKFLOW_CREDENTIALS:${name}`);
      // A step name that quotes a version must quote the version actually pinned. Dependabot
      // moves the SHA and leaves the label, so without this the workflow lies after every bump.
      if (key === 'uses' && typeof value === 'string' && typeof obj.name === 'string') {
        const labelled = obj.name.match(/\bv\d+(?:\.\d+)*\b/);
        const action = value.split('@')[0].split('/').pop();
        if (labelled && !obj.name.includes(`${action} ${labelled[0]}`)) issues.push(`ACTION_LABEL:${name}:${obj.name}`);
        if (labelled && !PINNED_VERSIONS[value]) issues.push(`ACTION_LABEL:${name}:unverified pin ${value}`);
        else if (labelled && PINNED_VERSIONS[value] !== labelled[0]) issues.push(`ACTION_LABEL:${name}:${obj.name} pins ${PINNED_VERSIONS[value]}`);
      }
      visitUses(value);
    }
  };
  visitUses(workflow);
  for (const [jobName, job] of Object.entries(workflow.jobs || {})) {
    if (job.permissions !== undefined) checkPermissions(job.permissions, `${name}:${jobName}`);
    if (!job['timeout-minutes']) issues.push(`WORKFLOW_TIMEOUT:${name}:${jobName}`);
  }
  return issues;
}

// A conservative editorial gate: every changed/new public Markdown document waits
// for review. A checksum is review scope, not evidence that a factual claim is true.
export function claimIssues(root, names) {
  const issues = [], ledger = JSON.parse(read(root, 'docs/evidence/content-review.json'));
  for (const name of names.filter(n => n.endsWith('.md') && !n.startsWith(`${CORE}/`) && !n.startsWith('docs/bundles/') && !n.startsWith('test/fixtures/'))) {
    const entry = ledger.files[name];
    if (!entry || entry.sha256 !== digest(readFileSync(owned(root, name)))) issues.push(`CLAIM_EVIDENCE:${name}:unreviewed prose change`);
    else if (entry.disposition !== 'instructions-and-qualified-status-only') {
      if (!Array.isArray(entry.claims) || !entry.claims.length) issues.push(`CLAIM_EVIDENCE:${name}:missing claims`);
      for (const claim of entry.claims || []) {
        try {
          if (!claim.text || !read(root, name).includes(claim.text) || !claim.evidence?.startsWith('docs/evidence/')) throw Error('claim not bound');
          const receipt = JSON.parse(read(root, claim.evidence));
          if (!receipt.command || !receipt.environment || !receipt.date || receipt.exitCode !== 0 || !receipt.artifactSha256 || !receipt.observed) throw Error('incomplete receipt');
        } catch { issues.push(`CLAIM_EVIDENCE:${name}:missing evidence receipt`); }
      }
    }
  }
  return issues;
}

export function check(root, options = {}) {
  const issues = [], names = files(root);
  const protect = (name, fn) => { try { fn(); } catch (e) { issues.push(`${name}:${e.message}`); } };
  for (const name of names) {
    const text = read(root, name);
    issues.push(...privacyIssues(name, text, options));
    if (name.endsWith('.md') || name === 'llms.txt') issues.push(...linkIssues(root, name, text));
    if (name.endsWith('.md')) issues.push(...installClaimIssues(name, text));
    if (/^\.github\/workflows\/.*\.ya?ml$/.test(name)) issues.push(...workflowIssues(name, text));
  }
  protect('FLOOR', () => {
    for (const entry of JSON.parse(read(root, 'docs/evidence/floor.json')).files) if (!names.includes(entry.path) || !read(root, entry.path).trim()) issues.push(`FLOOR:${entry.path}:missing or empty`);
  });
  protect('MANIFEST', () => {
    const m = manifest(root);
    if (m.schemaVersion !== 1 || m.skillName !== 'website-build-skill' || JSON.stringify(m.roleOrder) !== JSON.stringify(roles)) issues.push('MANIFEST:identity or role order');
    const assetNames = m.assets.map(a => a.path);
    if (new Set(assetNames).size !== assetNames.length) issues.push('MANIFEST:duplicate asset');
    for (const name of files(root, CORE)) if (!assetNames.includes(name.slice(CORE.length + 1))) issues.push(`MANIFEST:unlisted asset ${name}`);
    for (const a of m.assets) {
      if (!/^[a-zA-Z0-9_./-]+$/.test(a.path) || a.path.split('/').includes('..') || a.path.startsWith('/')) throw Error('invalid canonical asset path');
      const bytes = readFileSync(owned(root, `${CORE}/${a.path}`));
      if (a.path !== 'manifest.json' && digest(bytes) !== a.sha256) issues.push(`SOURCE_HASH:${a.path}`);
    }
    const archive = m.assets.find(a => a.path === ARCHIVE);
    if (archive?.active !== false || archive?.bundles.length || digest(readFileSync(owned(root, `${CORE}/${ARCHIVE}`))) !== ARCHIVE_SHA) issues.push('ARCHIVE_BYTES:changed archive');
    for (const [name, members] of Object.entries(m.bundles)) {
      if (new Set(members).size !== members.length) issues.push(`BUNDLE_MEMBERSHIP:${name}:duplicate`);
      for (const member of members) if (!m.assets.find(a => a.path === member)?.active || member === ARCHIVE) issues.push(`ARCHIVE_EXCLUSION:${name}`);
    }
    for (const route of m.stageRoutes) for (const member of route.assets) if (!m.assets.find(a => a.path === member)?.active) issues.push(`ARCHIVE_EXCLUSION:route ${route.id}`);
    for (const role of roles) {
      const body = read(root, `${CORE}/roles/${role}.md`);
      for (const title of headings) {
        const part = body.split(`## ${title}\n`)[1]?.split('\n## ')[0].trim();
        if (!part) issues.push(`ROLE_SECTIONS:${role}:${title}`);
      }
    }
    const question = read(root, `${CORE}/templates/install-choice.txt`).trimEnd();
    if (!read(root, 'README.md').includes(question) || !read(root, `${CORE}/SKILL.md`).includes(question)) issues.push('CHOICE_DRIFT:verbatim question');
    const prompts = read(root, 'docs/bundles/prompts.md');
    if (prompts.includes(`BEGIN SOURCE: ${ARCHIVE}`) || prompts.includes(read(root, `${CORE}/${ARCHIVE}`).split('\n').slice(8).join('\n').trim())) issues.push('ARCHIVE_EXCLUSION:active prompt bundle');
  });
  // The starter is the whole payload for a chat-only user. It names the route they will
  // follow, so it cannot quietly drop the gates that stand between a candidate and release.
  // A substring gate cannot read intent: an author who writes "skip Protect" defeats it. It
  // catches the failure that actually happened, a route that silently lost four stages.
  protect('STARTER', () => {
    // The route is read from SKILL.md, so the starter cannot drift from the canonical method.
    const route = read(root, `${CORE}/SKILL.md`).split('\nFollow Research')[1]?.split('.')[0];
    const stages = route === undefined ? [] : ['Research', ...route.split(/,|\band\b/)].map(stage => stage.trim()).filter(Boolean);
    if (stages.length < 8) { issues.push(`STARTER_ROUTE:${CORE}/SKILL.md:canonical route unreadable`); return; }
    const starters = new Map();
    for (const name of ['README.md', 'adapters/zero-install.md']) {
      // Fences are parsed rather than split on, because an indented or longer closing fence
      // ended the block for a reader while a naive split kept counting the prose after it.
      const blocks = fenced(read(root, name)).filter(block => block.startsWith('Use option 1'));
      if (blocks.length !== 1) { issues.push(`STARTER_ROUTE:${name}:${blocks.length ? 'ambiguous starter' : 'missing starter'}`); continue; }
      const [starter] = blocks;
      starters.set(name, starter);
      // In order, not merely present: a sentence that names four stages while dropping the
      // rest satisfies a membership test and still describes a different route.
      let cursor = 0;
      for (const stage of stages) {
        const at = starter.indexOf(stage, cursor);
        if (at < 0) { issues.push(`STARTER_ROUTE:${name}:${stage}`); break; }
        cursor = at + stage.length;
      }
    }
    if (starters.size === 2 && new Set(starters.values()).size !== 1) issues.push('STARTER_DRIFT:README and zero-install starters differ');
  });
  protect('BUNDLE_DRIFT', () => {
    for (const [name, body] of Object.entries(generated(root))) if (read(root, name) !== body) issues.push(`BUNDLE_DRIFT:${name}`);
  });
  protect('CLAIM_EVIDENCE', () => issues.push(...claimIssues(root, names)));
  protect('PACKAGE', () => {
    const p = JSON.parse(read(root, 'package.json'));
    if (!p.private || p.bin || p.scripts?.install || p.scripts?.postinstall || p.engines) issues.push('PACKAGE_HONESTY:unavailable consumer functionality');
    // `engines` is refused above because it advertises consumer functionality this package
    // does not publish, so the maintainer runtime is stated by a guard that runs first and
    // by the README instead. Node 20 otherwise fails the flag with `bad option` and no cause.
    // The install question is the pitch. Promising a one-command team while no installer
    // ships is the one claim in it that a first-run user can act on and be wrong. The card
    // is wrapped text, so a claim can straddle a line break; whitespace is collapsed first.
    const choice = read(root, `${CORE}/templates/install-choice.txt`).replace(/\s+/g, ' ');
    if (!p.bin) {
      if (/one command and they are ready/i.test(choice)) issues.push('CHOICE_HONESTY:one-command claim without an installer');
      if (!/one-command install is planned/i.test(choice)) issues.push('CHOICE_HONESTY:manual-setup statement missing');
    }
    const settings = read(root, 'REPO_SETTINGS.md');
    const topics = settings.split('## Topics')[1].split('## Creation')[0].split('\n').filter(s => /^- [a-z0-9-]+$/.test(s)).map(s => s.slice(2));
    if (JSON.stringify(topics) !== JSON.stringify(p.keywords) || topics.length > 20 || topics.some(t => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) || t.length >= 50)) issues.push('TOPICS:invalid or mismatched keywords');
    if (p.description.length >= 350) issues.push('DESCRIPTION:too long');
    const plugin = JSON.parse(read(root, '.claude-plugin/plugin.json'));
    if (plugin.version !== p.version || p.version !== manifest(root).packageVersion) issues.push('VERSION:metadata drift');
  });
  return [...new Set(issues)];
}
