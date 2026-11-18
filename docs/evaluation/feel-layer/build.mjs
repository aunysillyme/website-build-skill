import { build } from 'esbuild';
import { readFileSync, writeFileSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true }); mkdirSync('dist');
const tpl = readFileSync('src/page.html', 'utf8');
const atroposCss = readFileSync('node_modules/atropos/atropos.min.css', 'utf8');
await build({ entryPoints: { kit: 'src/kit.js' }, bundle: true, minify: true, format: 'esm', outdir: 'dist', target: 'es2020' });
const base = tpl.replace('<!--HEAD-->', '').replace('<!--BODY-->', '');
writeFileSync('dist/baseline.html', base);
// kit: eager module script + atropos css; number-flow needs no css file
writeFileSync('dist/kit.html', tpl.replace('<!--HEAD-->', `<style>${atroposCss}</style>`).replace('<!--BODY-->', '<script type="module" src="kit.js"></script>'));
console.log('built');
