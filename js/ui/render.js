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
// 창/랜스 투사체: 진행 방향으로 길게 뻗은 아주 뾰족한 삼각 창촉(+흰 코어 촉).
export function lance(ctx, x, y, ang, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const L = r * 4.4, W = r * 1.5;
  ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color;
  // 본체: 앞으로 극단적으로 뾰족, 꼬리는 살짝 파인 제비꼬리(창깃)
  ctx.beginPath(); ctx.moveTo(L * 0.62, 0);
  ctx.lineTo(-L * 0.30, W * 0.55); ctx.lineTo(-L * 0.16, 0); ctx.lineTo(-L * 0.30, -W * 0.55);
  ctx.closePath(); ctx.fill();
  // 흰 코어 촉(끝부분 하이라이트)
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(L * 0.62, 0);
  ctx.lineTo(L * 0.08, W * 0.20); ctx.lineTo(L * 0.08, -W * 0.20);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 네온 선분(빔 등). 방향을 가진 직선 형태로 그린다.
export function neonLine(ctx, x1, y1, x2, y2, width, color) {
  ctx.save(); ctx.shadowBlur = 14; ctx.shadowColor = color; ctx.strokeStyle = color;
  ctx.lineWidth = width; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
// 보석(다이아몬드) — 소울/경험치/마나 픽업용.
export function gem(ctx, x, y, r, color) {
  ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x+r*0.72, y); ctx.lineTo(x, y+r); ctx.lineTo(x-r*0.72, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x, y+r); ctx.moveTo(x-r*0.72, y); ctx.lineTo(x+r*0.72, y); ctx.stroke();
  ctx.restore();
}
// 골드 코인.
export function coin(ctx, x, y, r) {
  ctx.save(); ctx.shadowBlur = 12; ctx.shadowColor = '#ffcf3a';
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#ffcf3a'; ctx.fill();
  ctx.strokeStyle = '#c9931f'; ctx.lineWidth = Math.max(1, r*0.2); ctx.beginPath(); ctx.arc(x, y, r*0.62, 0, 7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,248,200,0.85)'; ctx.beginPath(); ctx.arc(x-r*0.3, y-r*0.3, r*0.22, 0, 7); ctx.fill();
  ctx.restore();
}
// 하트 — HP 물약 픽업용.
export function heart(ctx, x, y, r, color) {
  ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = color; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x, y+r*0.65);
  ctx.bezierCurveTo(x-r*1.2, y-r*0.35, x-r*0.35, y-r*1.05, x, y-r*0.25);
  ctx.bezierCurveTo(x+r*0.35, y-r*1.05, x+r*1.2, y-r*0.35, x, y+r*0.65);
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function bar(ctx, x, y, w, h, pct, color) {
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, pct)), h); ctx.restore();
}
export function text(ctx, str, x, y, { color = '#eaf2ff', size = 14, align = 'left', weight = '600' } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.font = `${weight} ${size}px system-ui`; ctx.textAlign = align;
  ctx.fillText(str, x, y); ctx.restore();
}
