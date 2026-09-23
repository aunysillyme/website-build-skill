import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CORE, manifest, read, digest } from '../src/bundle.mjs';
import { root } from './helpers.mjs';

test('Research covers 14 numbered areas and 14 freshness rows', () => {
  const research = read(root, `${CORE}/prompts/01-website-deep-research.md`);
  const heading = research.match(/^RESEARCH THESE .* AREAS$/m)?.[0];
  assert.equal(heading, 'RESEARCH THESE 14 AREAS');
  const domains = research.split(`${heading}\n`)[1].split('\nSAVE THE RESULTS')[0];
  const numbers = [...domains.matchAll(/^(\d+)\. /gm)].map(match => Number(match[1]));
  assert.deepEqual(numbers, Array.from({ length: 14 }, (_, index) => index + 1));
  assert.match(domains, /^14\. Languages and coding practice\./m);
  assert.match(domains, /Artifact: 08-languages-and-code\.md/);
  assert.match(domains, /checklists\/14-code\.md/);

  const playbook = read(root, `${CORE}/playbooks/research-and-memory.md`);
  const rows = [...playbook.matchAll(/^\| (\d+)\. [^\n]+ \|$/gm)];
  assert.deepEqual(rows.map(match => Number(match[1])), numbers);
  assert.match(rows[13][0], /Languages and coding practice/);
});

test('Build links coding research and code quality registered in the manifest', () => {
  const build = read(root, `${CORE}/prompts/05-stack-and-build.md`);
  assert.match(build, /\[[^\]]+\]\((?:\.\/)?13-coding-research\.md\)/,
    'prompts/05-stack-and-build.md must link to prompts/13-coding-research.md');
  assert.match(build, /\[[^\]]+\]\(\.\.\/checklists\/code-quality\.md\)/);
  const researchPosition = build.indexOf('13-coding-research.md');
  assert.ok(build.indexOf('\nCHOOSE\n') < researchPosition);
  assert.ok(researchPosition < build.indexOf('\nIMPLEMENT\n'));
  assert.match(build, /coding-standards\.md/);

  const data = manifest(root);
  const buildRoute = data.stageRoutes.find(route => route.id === 'choose-build');
  assert.ok(buildRoute.assets.includes('prompts/13-coding-research.md'));
  assert.ok(buildRoute.runtimeOutputs.includes('site-work/coding-standards.md'));
  for (const id of ['choose-build', 'challenge']) {
    const route = data.stageRoutes.find(route => route.id === id);
    assert.ok(route.assets.includes('checklists/code-quality.md'));
    for (let index = 1; index <= 6; index++) {
      assert.ok(route.checks.includes(`CQ${String(index).padStart(2, '0')}`));
    }
  }
  for (const [path, kind, bundle] of [
    ['prompts/13-coding-research.md', 'prompt', 'prompts'],
    ['checklists/code-quality.md', 'checklist', 'checklists']
  ]) {
    const asset = data.assets.find(asset => asset.path === path);
    assert.ok(asset, `${path} must be registered`);
    assert.equal(asset.active, true);
    assert.equal(asset.kind, kind);
    assert.equal(asset.sha256, digest(read(root, `${CORE}/${path}`)));
    assert.ok(data.bundles[bundle].includes(path));
    for (const distribution of asset.distributions) {
      assert.ok(data.distributions[distribution].members.includes(path));
    }
  }
});
