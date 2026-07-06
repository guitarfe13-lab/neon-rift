// NEON RIFT 프로덕션 정적 서버(의존성 0, 무빌드). CloudType·Render·Railway 등에서 바로 구동.
//   실행: node server.mjs   (PORT 환경변수 사용, 기본 3000, 0.0.0.0 바인딩)
// 개발용은 serve.mjs(8080). 이쪽은 캐시·보안 헤더·클린URL·헬스체크 포함.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'); // 윈도우 경로 보정
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2',
};
// 정적 자산은 장기 캐시, HTML/텍스트는 항상 최신 확인.
const LONG_CACHE = new Set(['.js', '.mjs', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.mp3', '.ogg', '.wav', '.woff2']);

async function exists(f) { try { await stat(f); return true; } catch { return false; } }

async function resolve(path) {
  if (path === '/' || path === '') return join(ROOT, 'index.html');
  let file = normalize(join(ROOT, path));
  if (!file.startsWith(normalize(ROOT))) return null;               // 경로 이탈 차단
  if (await exists(file) && !(await stat(file)).isDirectory()) return file;
  if (!extname(path)) {                                             // 클린 URL: /guide → guide.html
    const html = normalize(join(ROOT, path + '.html'));
    if (html.startsWith(normalize(ROOT)) && await exists(html)) return html;
  }
  return null;
}

createServer(async (req, res) => {
  const path = decodeURIComponent((req.url || '/').split('?')[0]);
  if (path === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok'); return; }
  const baseHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
  };
  try {
    const file = await resolve(path);
    if (!file) {
      const body = await readFile(join(ROOT, '404.html')).catch(() => '404 Not Found');
      res.writeHead(404, { ...baseHeaders, 'Content-Type': 'text/html; charset=utf-8' }); res.end(body); return;
    }
    const ext = extname(file);
    const headers = { ...baseHeaders, 'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': LONG_CACHE.has(ext) ? 'public, max-age=604800' : 'no-cache' };
    if (req.method === 'HEAD') { res.writeHead(200, headers); res.end(); return; }
    res.writeHead(200, headers); res.end(await readFile(file));
  } catch {
    res.writeHead(500, { ...baseHeaders, 'Content-Type': 'text/plain; charset=utf-8' }).end('500 Internal Error');
  }
}).listen(PORT, '0.0.0.0', () => console.log(`NEON RIFT → http://0.0.0.0:${PORT}`));
