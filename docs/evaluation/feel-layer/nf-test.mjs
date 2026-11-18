import { chromium } from 'playwright-core';
import { homedir } from 'node:os';
const exe = homedir() + '/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] });
for (const m of ['no-preference', 'reduce']) {
  const ctx = await browser.newContext({ reducedMotion: m, viewport: { width: 1000, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8123/kit.html');
  await page.waitForFunction(() => window.__feel);
  await new Promise((r) => setTimeout(r, 800));
  const res = await page.evaluate(async () => {
    const el = document.getElementById('n1');
    const v0 = el.value;
    let max = 0, maxSh = 0, samples = 0;
    document.getElementById('bump').click();
    const t0 = performance.now();
    while (performance.now() - t0 < 600) {
      await new Promise((r) => requestAnimationFrame(r));
      max = Math.max(max, document.getAnimations().length);
      maxSh = Math.max(maxSh, el.shadowRoot ? el.shadowRoot.getAnimations().length : 0);
      samples++;
    }
    return { v0, v1: el.value, maxDocAnims: max, maxShadowAnims: maxSh, samples, hasShadow: !!el.shadowRoot, respect: el.respectMotionPreference };
  });
  console.log(m, JSON.stringify(res));
  await ctx.close();
}
await browser.close();
