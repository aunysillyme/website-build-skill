import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Deterministically score static HTML output across accessibility, SEO, and performance hygiene.
 * This provides an offline structural outcome check alongside optional live Lighthouse/axe runs.
 */
export function auditHtmlOutcome(html) {
  const checks = {
    accessibility: {
      htmlLang: /<html[^>]*\blang=["'][a-z]{2,}/i.test(html),
      skipLink: /<a[^>]*href=["']#main["'][^>]*>/i.test(html),
      mainLandmark: /<main\b[^>]*id=["']main["']/i.test(html) || /<main\b/i.test(html),
      singleH1: (html.match(/<h1\b/gi) || []).length === 1,
      labelledInputs: !/<input\b(?![^>]*\btype=["'](?:hidden|submit|button)["'])/i.test(html) || /<label[^>]*\bfor=/i.test(html),
      imgAlt: !/<img\b/i.test(html) || /<img\b[^>]*\balt=["'][^"']*["']/i.test(html),
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
      imgDimensions: !/<img\b/i.test(html) || (/<img\b[^>]*\bwidth=/i.test(html) && /<img\b[^>]*\bheight=/i.test(html)),
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const brief = JSON.parse(readFileSync(resolve(process.cwd(), 'evals/outcome-brief.json'), 'utf8'));
  const result = compareBuilds(SYNTHETIC_BASELINE_HTML, SYNTHETIC_SKILL_HTML);
  console.log(JSON.stringify({ brief: brief.name, ...result }, null, 2));
}
