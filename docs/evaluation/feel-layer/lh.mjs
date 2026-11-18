import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { readdirSync } from 'node:fs';
const root = homedir() + '/.cache/ms-playwright/';
const chromePath = root + 'chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell';
const pages = ['baseline', 'kit'];
const RUNS = 5;
const out = {};
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--no-sandbox', '--disable-gpu'] });
for (const pg of pages) {
  out[pg] = [];
  for (let i = 0; i < RUNS; i++) {
    const r = await lighthouse(`http://127.0.0.1:8123/${pg}.html`, { port: chrome.port, output: 'json', onlyCategories: ['performance'], logLevel: 'error' });
    const a = r.lhr.audits;
    out[pg].push({
      perf: Math.round(r.lhr.categories.performance.score * 100),
      fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue,
      tbt: a['total-blocking-time'].numericValue, cls: a['cumulative-layout-shift'].numericValue,
      si: a['speed-index'].numericValue, bytes: a['total-byte-weight'].numericValue,
    });
  }
}
await chrome.kill();
writeFileSync('lh-results.json', JSON.stringify(out, null, 1));
const med = (arr) => { const s = [...arr].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
for (const pg of pages) {
  const o = out[pg];
  console.log(pg, 'perf', med(o.map((x) => x.perf)), 'FCP', Math.round(med(o.map((x) => x.fcp))), 'LCP', Math.round(med(o.map((x) => x.lcp))), 'TBT', Math.round(med(o.map((x) => x.tbt))), 'CLS', med(o.map((x) => x.cls)).toFixed(3), 'SI', Math.round(med(o.map((x) => x.si))), 'bytes', Math.round(med(o.map((x) => x.bytes))));
}
