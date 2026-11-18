import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import {
  auditHtmlOutcome,
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

test('Outcome eval: every input and image must pass instead of letting one valid element mask invalid siblings', () => {
  const mixedInputHtml = '<form><label for="a">A</label><input id="a" type="text"><input type="text" placeholder="Unlabelled"></form>';
  assert.equal(auditHtmlOutcome(mixedInputHtml).checks.accessibility.labelledInputs, false);

  const mismatchedLabelHtml = '<form><label for="a">A</label><input id="b" type="text"></form>';
  assert.equal(auditHtmlOutcome(mismatchedLabelHtml).checks.accessibility.labelledInputs, false);

  const excludedOnlyInputsHtml = '<form><input type="hidden" name="t"><input type="submit" value="Go"><input type="button" value="B"><input type="reset" value="R"></form>';
  assert.equal(auditHtmlOutcome(excludedOnlyInputsHtml).checks.accessibility.labelledInputs, true);

  const accessibleInputsHtml = '<form><input type="search" aria-label="Search"><label>Name <input type="text"></label></form>';
  assert.equal(auditHtmlOutcome(accessibleInputsHtml).checks.accessibility.labelledInputs, true);

  const mixedImgsHtml = '<img src="a.jpg" alt="A" width="100" height="50"><img src="b.jpg">';
  assert.equal(auditHtmlOutcome(mixedImgsHtml).checks.accessibility.imgAlt, false);
  assert.equal(auditHtmlOutcome(mixedImgsHtml).checks.performance.imgDimensions, false);

  const prefixedAttrHtml = '<img src="a.jpg" data-alt="x" data-width="100" data-height="50">';
  assert.equal(auditHtmlOutcome(prefixedAttrHtml).checks.accessibility.imgAlt, false);
  assert.equal(auditHtmlOutcome(prefixedAttrHtml).checks.performance.imgDimensions, false);

  const quotedAttrConfusionHtml = '<img src="a.jpg" alt="width=100 height=50">';
  assert.equal(auditHtmlOutcome(quotedAttrConfusionHtml).checks.accessibility.imgAlt, true);
  assert.equal(auditHtmlOutcome(quotedAttrConfusionHtml).checks.performance.imgDimensions, false);

  const decorativeImgHtml = '<img src="a.jpg" alt="" width="16" height="16">';
  assert.equal(auditHtmlOutcome(decorativeImgHtml).checks.accessibility.imgAlt, true);
  assert.equal(auditHtmlOutcome(decorativeImgHtml).checks.performance.imgDimensions, true);

  const noMediaOrInputsHtml = '<html><body><main><h1>Text only</h1></main></body></html>';
  const vacuous = auditHtmlOutcome(noMediaOrInputsHtml);
  assert.equal(vacuous.checks.accessibility.labelledInputs, true);
  assert.equal(vacuous.checks.accessibility.imgAlt, true);
  assert.equal(vacuous.checks.performance.imgDimensions, true);
});

test('Outcome eval CLI entrypoint works when invoked via a symlink', () => {
  const dir = mkdtempSync(resolve(realpathSync(tmpdir()), 'eval-cli-'));
  try {
    const link = resolve(dir, 'eval-outcome-link.mjs');
    symlinkSync(resolve(root, 'scripts/eval-outcome.mjs'), link);
    const run = spawnSync(process.execPath, [link], { cwd: root, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const parsed = JSON.parse(run.stdout);
    assert.ok(parsed.brief);
    assert.equal(parsed.withSkill.total, 100);
    assert.ok(parsed.delta.total > 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Live Lighthouse and axe-core A/B comparison on real rendered builds', { skip: 'requires lighthouse and @axe-core/cli with headless Chrome' }, () => {});
