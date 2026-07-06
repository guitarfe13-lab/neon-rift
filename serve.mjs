// 개발용 정적 서버(의존성 0). ES 모듈은 file://에서 CORS로 막히므로 http로 서빙한다.
// 실행: node serve.mjs   →  http://localhost:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'); // 윈도우 경로 보정
const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(req.url.split('?')[0]);
    if (path === '/') path = '/index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(normalize(ROOT))) { res.writeHead(403).end('Forbidden'); return; }
    const body = await readFile(file);
    const type = MIME[extname(file)] || 'application/octet-stream';
    // Range(206) 지원: 오디오/미디어 스트리밍 필수 — 없으면 브라우저가 루프마다 전체 재다운로드(무한 로딩바).
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      const start = m[1] ? parseInt(m[1], 10) : Math.max(0, body.length - parseInt(m[2], 10));
      const end = (m[1] && m[2]) ? Math.min(parseInt(m[2], 10), body.length - 1) : body.length - 1;
      if (start >= body.length || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${body.length}` }); res.end(); return;
      }
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
      res.end(body.subarray(start, end + 1)); return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': body.length });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
  }
}).listen(PORT, () => console.log(`NEON RIFT dev server → http://localhost:${PORT}`));
