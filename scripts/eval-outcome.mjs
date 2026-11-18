import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function parseAttrs(tag) {
  const attrs = new Map();
  const body = tag.replace(/^<[a-z0-9-]+\s*/i, '').replace(/\/?>$/, '');
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const m of body.matchAll(re)) {
    const name = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    if (!attrs.has(name)) attrs.set(name, val);
  }
  return attrs;
}

/**
 * Deterministically score static HTML output across accessibility, SEO, and performance hygiene.
 * This provides an offline structural outcome check alongside optional live Lighthouse/axe runs.
 * Note: labelledInputs, imgAlt, and imgDimensions use .every(), passing vacuously when zero
 * applicable elements exist and failing if any element lacks the required attributes.
 */
export function auditHtmlOutcome(html) {
  const inputs = [...html.matchAll(/<input\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
  const labelMatches = [...html.matchAll(/<label\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)];
  const labelFors = new Set(
    labelMatches.map(m => parseAttrs(m[0]).get('for')?.trim()).filter(Boolean),
  );
  const wrappedLabels = [...html.matchAll(/<label\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/label>/gi)]
    .filter(m => (m[1].match(/<input\b/gi) || []).length === 1 && m[1].replace(/<[^>]*>/g, '').trim().length > 0);
  const isWrapped = index => wrappedLabels.some(m => index >= m.index && index < m.index + m[0].length);
  const checkableInputs = inputs.filter(m => {
    const type = (parseAttrs(m[0]).get('type') || 'text').trim().toLowerCase();
    return !['hidden', 'submit', 'button', 'reset'].includes(type);
  });
  const imgs = [...html.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)].map(m => parseAttrs(m[0]));

  const checks = {
    accessibility: {
      htmlLang: /<html[^>]*\blang=["'][a-z]{2,}/i.test(html),
      skipLink: /<a[^>]*href=["']#main["'][^>]*>/i.test(html),
      mainLandmark: /<main\b[^>]*id=["']main["']/i.test(html) || /<main\b/i.test(html),
      singleH1: (html.match(/<h1\b/gi) || []).length === 1,
      labelledInputs: checkableInputs.every(m => {
        const attrs = parseAttrs(m[0]);
        const id = attrs.get('id')?.trim();
        const ariaLabel = attrs.get('aria-label')?.trim();
        const ariaLabelledBy = attrs.get('aria-labelledby')?.trim();
        return Boolean((id && labelFors.has(id)) || ariaLabel || ariaLabelledBy || isWrapped(m.index));
      }),
      imgAlt: imgs.every(attrs => attrs.has('alt')),
    },
    seo: {
      title: /<title>[^<]{5,}<\/title>/i.test(html),
      metaDescription: /<meta[^>]*\bname=["']description["'][^>]*\bcontent=["'][^"']{10,}["']/i.test(html),
      canonical: /<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']https?:\/\//i.test(html),
      jsonLd: /<script[^>]*\btype=["']application\/ld\+json["'][^>]*>/i.test(html),
    },
    performance: {
      charset: /<meta[^>]*\bcharset=["']utf-8["']/i.test(html),
      viewport: /<meta[^>]*\bname=["']viewport["'][^>]*\bcontent=["'][^"']*width=device-width/i.test(html),
      imgDimensions: imgs.every(attrs => Boolean(attrs.get('width')?.trim()) && Boolean(attrs.get('height')?.trim())),
      reducedMotion: /prefers-reduced-motion/i.test(html),
    },
  };

  const scoreGroup = group => {
    const values = Object.values(group);
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  };

  const accessibility = scoreGroup(checks.accessibility);
  const seo = scoreGroup(checks.seo);
  const performance = scoreGroup(checks.performance);
  const total = Math.round((accessibility + seo + performance) / 3);

  return { accessibility, seo, performance, total, checks };
}

/**
 * Compare a baseline (without skill) HTML build against a skill-guided HTML build for the same brief.
 */
export function compareBuilds(baselineHtml, skillHtml) {
  const baseline = auditHtmlOutcome(baselineHtml);
  const withSkill = auditHtmlOutcome(skillHtml);
  return {
    baseline,
    withSkill,
    delta: {
      accessibility: withSkill.accessibility - baseline.accessibility,
      seo: withSkill.seo - baseline.seo,
      performance: withSkill.performance - baseline.performance,
      total: withSkill.total - baseline.total,
    },
  };
}

/**
 * Run live Lighthouse and @axe-core/cli against a URL when both CLIs are installed.
 */
export function runLiveLighthouseAndAxe(url) {
  try {
    execFileSync('lighthouse', ['--version'], { stdio: 'ignore' });
    execFileSync('axe', ['--version'], { stdio: 'ignore' });
  } catch {
    return { skipped: true, reason: 'lighthouse and/or axe CLI not installed' };
  }
  const lhRaw = execFileSync(
    'lighthouse',
    [url, '--output=json', '--quiet', '--chrome-flags=--headless'],
    { encoding: 'utf8' },
  );
  const lh = JSON.parse(lhRaw);
  const axeRaw = execFileSync('axe', [url, '--stdout'], { encoding: 'utf8' });
  const axe = JSON.parse(axeRaw);
  return {
    skipped: false,
    lighthouse: {
      performance: Math.round((lh.categories?.performance?.score ?? 0) * 100),
      accessibility: Math.round((lh.categories?.accessibility?.score ?? 0) * 100),
      seo: Math.round((lh.categories?.seo?.score ?? 0) * 100),
    },
    axeViolations: Array.isArray(axe) ? (axe[0]?.violations?.length ?? 0) : (axe.violations?.length ?? 0),
  };
}

export const SYNTHETIC_BASELINE_HTML = `<!doctype html>
<html>
<head><title>Studio</title></head>
<body>
  <div class="header">Kiln &amp; Clay</div>
  <img src="studio.jpg">
  <form><input type="email" placeholder="Email"><button>Send</button></form>
</body>
</html>`;

export const SYNTHETIC_SKILL_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kiln &amp; Clay - Neighborhood Ceramics Studio</title>
  <meta name="description" content="Wheel-throwing classes, open studio hours, and beginner workshops at Kiln &amp; Clay.">
  <link rel="canonical" href="https://example.com/">
  <style>@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }</style>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Kiln & Clay","url":"https://example.com/"}</script>
</head>
<body>
  <a href="#main">Skip to main content</a>
  <header><nav aria-label="Primary"><a href="#classes">Classes</a></nav></header>
  <main id="main">
    <h1>Kiln &amp; Clay Ceramics Studio</h1>
    <img src="studio.jpg" alt="Pottery wheels lined up in a sunlit studio" width="1200" height="800">
    <form>
      <label for="inquiry-email">Email</label>
      <input id="inquiry-email" type="email" required>
      <button type="submit">Request class info</button>
    </form>
  </main>
</body>
</html>`;

const isEntrypoint = (() => {
  if (!process.argv[1]) return false;
  try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; }
  catch { return false; }
})();

if (isEntrypoint) {
  const brief = JSON.parse(readFileSync(resolve(process.cwd(), 'evals/outcome-brief.json'), 'utf8'));
  const result = compareBuilds(SYNTHETIC_BASELINE_HTML, SYNTHETIC_SKILL_HTML);
  console.log(JSON.stringify({ brief: brief.name, ...result }, null, 2));
}
