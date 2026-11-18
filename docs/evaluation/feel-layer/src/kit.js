// Feel layer: six picks, one init. Reduced motion handled per pick.
import Lenis from 'lenis';
import NumberFlow from 'number-flow';
import { annotate } from 'rough-notation';
import confetti from 'canvas-confetti';
import autoAnimate from '@formkit/auto-animate';
import Atropos from 'atropos';

if (!customElements.get('number-flow')) customElements.define('number-flow', NumberFlow);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const report = { reduced };

// 1 Lenis: library respects reduced motion by default
const lenis = new Lenis({ autoRaf: true });
report.lenis = lenis;

// 2 NumberFlow: rolling digits
const nfs = ['n1', 'n2', 'n3'].map((id) => document.getElementById(id));
report.nfs = nfs;
document.getElementById('bump').addEventListener('click', () => {
  nfs[0].update(Math.round(1000 + Math.random() * 9000));
  nfs[1].update(Math.round(10 + Math.random() * 90));
  nfs[2].update(Math.round(100 + Math.random() * 900));
});

// 3 Rough Notation: no built-in reduced-motion, so pass animate:false
const mark = annotate(document.getElementById('hl'), { type: 'underline', color: '#c2410c', strokeWidth: 3, animate: !reduced });
mark.show();

// 4 canvas-confetti: disableForReducedMotion
document.getElementById('party').addEventListener('click', () => confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, disableForReducedMotion: true }));

// 5 AutoAnimate: respects reduced motion by default
const list = document.getElementById('list');
autoAnimate(list);
let n = 3;
document.getElementById('add').addEventListener('click', () => { const li = document.createElement('li'); li.textContent = 'Item ' + (++n); list.prepend(li); });
document.getElementById('remove').addEventListener('click', () => list.firstElementChild?.remove());

// 6 Atropos: no built-in reduced-motion, so do not attach under the media query
report.atropos = reduced ? null : Atropos({ el: '#tilt', activeOffset: 30, shadow: false });

window.__feel = report;
