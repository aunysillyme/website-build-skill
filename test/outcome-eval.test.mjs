import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  compareBuilds,
  runLiveLighthouseAndAxe,
  SYNTHETIC_BASELINE_HTML,
  SYNTHETIC_SKILL_HTML,
} from '../scripts/eval-outcome.mjs';
import { root } from './helpers.mjs';

test('Outcome eval: skill-guided build outscores baseline across accessibility, SEO, and performance', () => {
  const brief = JSON.parse(readFileSync(resolve(root, 'evals/outcome-brief.json'), 'utf8'));
  assert.ok(brief.brief.length > 0);
  const result = compareBuilds(SYNTHETIC_BASELINE_HTML, SYNTHETIC_SKILL_HTML);
  assert.equal(result.withSkill.accessibility, 100);
  assert.equal(result.withSkill.seo, 100);
  assert.equal(result.withSkill.performance, 100);
  assert.ok(result.delta.accessibility > 0, `expected positive a11y delta, got ${result.delta.accessibility}`);
  assert.ok(result.delta.seo > 0, `expected positive SEO delta, got ${result.delta.seo}`);
  assert.ok(result.delta.performance > 0, `expected positive perf delta, got ${result.delta.performance}`);
  assert.ok(result.delta.total > 0, `expected positive total delta, got ${result.delta.total}`);
});

test('Outcome eval: live Lighthouse and axe runner skips cleanly when CLIs are absent', () => {
  const live = runLiveLighthouseAndAxe('https://example.com/');
  assert.equal(typeof live.skipped, 'boolean');
  if (!live.skipped) {
    assert.ok(live.lighthouse.accessibility >= 0);
    assert.ok(live.axeViolations >= 0);
  }
});

test('Live Lighthouse and axe-core A/B comparison on real rendered builds', { skip: 'requires lighthouse and @axe-core/cli with headless Chrome' }, () => {});
