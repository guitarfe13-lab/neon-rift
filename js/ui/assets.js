// 이미지 에셋 로더/캐시. 파일이 있으면 로드해 스프라이트로 쓰고, 없으면 null(코드 스프라이트로 폴백).
// 브라우저 전용(Image). Node import 시 최상위에서 Image를 만지지 않으므로 안전.
const cache = new Map(); // path -> { img, ready, failed }

export function getImage(path) {
  if (!path || typeof Image === 'undefined') return null;
  let e = cache.get(path);
  if (!e) {
    e = { img: new Image(), ready: false, failed: false };
    e.img.onload = () => { e.ready = true; };
    e.img.onerror = () => { e.failed = true; };
    e.img.src = path;
    cache.set(path, e);
  }
  return e.ready ? e.img : null;
}
// 알려진 경로를 미리 로드(첫 등장 시 깜빡임 방지). 없는 파일은 조용히 실패 처리.
export function preload(paths) { for (const p of paths) getImage(p); }
