// 네온 캔버스 드로잉 헬퍼. shadowBlur로 글로우.
export function clear(ctx, w, h) { ctx.clearRect(0, 0, w, h); }
// 카메라 오프셋에 따라 스크롤되는 배경 그리드(이동감 표현).
export function grid(ctx, w, h, camX, camY, spacing = 48, color = 'rgba(66,230,255,0.07)') {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath();
  const ox = -(((camX % spacing) + spacing) % spacing);
  const oy = -(((camY % spacing) + spacing) % spacing);
  for (let x = ox; x <= w; x += spacing) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = oy; y <= h; y += spacing) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke(); ctx.restore();
}
export function neonCircle(ctx, x, y, r, color) {
  ctx.save(); ctx.shadowBlur = 16; ctx.shadowColor = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
export function neonShape(ctx, x, y, r, shape, color, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.shadowBlur = 16; ctx.shadowColor = color;
  ctx.fillStyle = color; ctx.beginPath();
  if (shape === 'circle') ctx.arc(0, 0, r, 0, Math.PI * 2);
  else {
    const sides = shape === 'triangle' ? 3 : shape === 'diamond' ? 4 : 4;
    const off = shape === 'square' ? Math.PI / 4 : -Math.PI / 2;
    for (let i = 0; i < sides; i++) {
      const a = off + (i / sides) * Math.PI * 2;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  ctx.fill(); ctx.restore();
}
// 네온 선분(빔 등). 방향을 가진 직선 형태로 그린다.
export function neonLine(ctx, x1, y1, x2, y2, width, color) {
  ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = color; ctx.strokeStyle = color;
  ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
export function bar(ctx, x, y, w, h, pct, color) {
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h); ctx.restore();
}
export function text(ctx, str, x, y, { color = '#eaf2ff', size = 14, align = 'left', weight = '600' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.font = `${weight} ${size}px system-ui`; ctx.textAlign = align;
  ctx.fillText(str, x, y); ctx.restore();
}
