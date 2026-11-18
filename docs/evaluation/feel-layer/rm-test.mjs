import { chromium } from 'playwright-core';
import { homedir } from 'node:os';
const exe = homedir() + '/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--disable-gpu'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function run(reducedMotion) {
  const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1000, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:8123/kit.html');
  await page.waitForFunction(() => window.__feel);
  await sleep(1500); // let rough-notation draw finish
  const r = { mode: reducedMotion, errors };
  r.reducedFlag = await page.evaluate(() => window.__feel.reduced);
  // Rough Notation: any running animation on its svg right after load? re-create timing: inspect path styles
  r.roughAnimStyle = await page.evaluate(() => { const p = document.querySelector('.rough-annotation path'); return p ? (p.getAttribute('style') || '').slice(0, 120) : 'no svg'; });
  // Lenis
  r.lenis = await page.evaluate(async () => { window.__feel.lenis.scrollTo(1200); await new Promise((r) => setTimeout(r, 120)); const mid = window.scrollY; await new Promise((r) => setTimeout(r, 1500)); return { at120ms: Math.round(mid), final: Math.round(window.scrollY) }; });
  await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300);
  // NumberFlow
  r.numberflow = await page.evaluate(async () => { const el = document.getElementById('n1'); const before = document.getAnimations().length; document.getElementById('bump').click(); await new Promise((r) => setTimeout(r, 40)); const sh = el.shadowRoot ? el.shadowRoot.getAnimations ? el.shadowRoot.getAnimations().length : -1 : -2; return { docAnims: document.getAnimations().length - before, shadowAnims: sh }; });
  await sleep(1200);
  // AutoAnimate
  r.autoanimate = await page.evaluate(async () => { const before = document.getAnimations().length; document.getElementById('remove').click(); await new Promise((r) => setTimeout(r, 30)); return document.getAnimations().length - before; });
  // confetti
  r.confettiCanvas = await page.evaluate(async () => { const before = document.querySelectorAll('canvas').length; document.getElementById('party').click(); await new Promise((r) => setTimeout(r, 150)); return document.querySelectorAll('canvas').length - before; });
  // atropos tilt
  r.atropos = await page.evaluate(() => !!window.__feel.atropos);
  const box = await page.locator('#tilt').boundingBox();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#tilt').scrollIntoViewIfNeeded(); await sleep(300);
  const b2 = await page.locator('#tilt').boundingBox();
  await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2); await page.mouse.move(b2.x + b2.width * 0.9, b2.y + b2.height * 0.2, { steps: 5 }); await sleep(300);
  r.tiltTransform = await page.evaluate(() => getComputedStyle(document.querySelector('.atropos-rotate')).transform);
  await ctx.close();
  return r;
}
for (const m of ['no-preference', 'reduce']) console.log(JSON.stringify(await run(m)));
await browser.close();
