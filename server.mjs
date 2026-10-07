import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const publicFiles = new Set([
  '/index.html', '/tickets.html', '/ticket-details.html', '/favicon.svg', '/css/style.css',
  '/js/dashboard.js', '/js/detail.js', '/js/status.js', '/js/store.js',
  '/js/tickets.js', '/js/ui.js'
]);
const port = Number(process.env.PORT) || 3000;

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  try {
    const requestedPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const pathname = requestedPath === '/' ? '/index.html' : requestedPath;
    if (!publicFiles.has(pathname)) {
      response.writeHead(404).end('Not found');
      return;
    }

    const path = join(root, ...pathname.split('/').filter(Boolean));
    const content = await readFile(path);
    response.writeHead(200, {
      'Content-Type': `${types[extname(path)]}; charset=utf-8`,
      'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Campus IT desk: http://127.0.0.1:${port}`);
});
