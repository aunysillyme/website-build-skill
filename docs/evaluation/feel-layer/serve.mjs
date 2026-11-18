import http from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };

function resolveRoute(url) {
  let pathname;
  try {
    pathname = new URL(url || '/', 'http://127.0.0.1').pathname;
  } catch {
    return null;
  }
  switch (pathname) {
    case '/':
    case '/baseline.html':
      return 'dist/baseline.html';
    case '/kit.html':
      return 'dist/kit.html';
    case '/kit.js':
      return 'dist/kit.js';
    default:
      return null;
  }
}

http.createServer((req, res) => {
  const p = resolveRoute(req.url);
  if (!p) { res.writeHead(404); return res.end(); }
  try {
    if (!statSync(p).isFile()) { res.writeHead(404); return res.end(); }
    const ext = p.slice(p.lastIndexOf('.'));
    const body = gzipSync(readFileSync(p), { level: 9 });
    res.writeHead(200, { 'content-type': types[ext] || 'text/plain', 'content-encoding': 'gzip', 'cache-control': 'no-cache' });
    res.end(body);
  } catch (err) {
    res.writeHead(err?.code === 'ENOENT' ? 404 : 500);
    res.end();
  }
}).listen(8123, '127.0.0.1', () => console.log('up'));
