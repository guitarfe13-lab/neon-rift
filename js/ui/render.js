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
// ── 궤도/드론 스킬 전용 모양(이름에 맞는 형태) ──
// 회전 검: 길쭉한 양날 검신 + 흰 날 하이라이트 + 작은 코등이.
export function bladeOrb(ctx, x, y, rot, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const L = r * 3.0, W = r * 0.72;
  ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(L * 0.62, 0); ctx.lineTo(0, W); ctx.lineTo(-L * 0.38, W * 0.45);
  ctx.lineTo(-L * 0.38, -W * 0.45); ctx.lineTo(0, -W); ctx.closePath(); ctx.fill();     // 검신
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  ctx.fillRect(-L * 0.30, -W * 0.12, L * 0.82, W * 0.24);                                // 날 하이라이트
  ctx.fillStyle = color; ctx.fillRect(-L * 0.46, -W * 0.9, L * 0.10, W * 1.8);           // 코등이
  ctx.restore();
}
// 톱날: 이빨 달린 원판(안쪽 구멍 + 중심점).
export function sawOrb(ctx, x, y, rot, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color;
  const teeth = 8; ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r * 1.35 : r * 0.95;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();                  // 구멍
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// 얼음 결정: 길쭉한 마름모 결정 + 흰 심.
export function crystalOrb(ctx, x, y, rot, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const L = r * 1.9, W = r * 0.75;
  ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, W); ctx.lineTo(-L * 0.6, 0); ctx.lineTo(0, -W); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.moveTo(L * 0.55, 0); ctx.lineTo(0, W * 0.35); ctx.lineTo(-L * 0.3, 0); ctx.lineTo(0, -W * 0.35); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 포탑 드론: 각진 본체 + 조준 방향 포신 + 코어 점.
export function turretOrb(ctx, x, y, aim, r, color) {
  ctx.save(); ctx.translate(x, y);
  ctx.shadowBlur = 10; ctx.shadowColor = color;
  ctx.fillStyle = 'rgba(10,14,24,0.9)'; ctx.strokeStyle = color; ctx.lineWidth = 2;
  const s = r * 1.15; ctx.rotate(Math.PI / 4);
  ctx.beginPath(); ctx.rect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4); ctx.fill(); ctx.stroke();  // 마름모 본체
  ctx.rotate(-Math.PI / 4);
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(Math.cos(aim) * r * 0.4, Math.sin(aim) * r * 0.4);
  ctx.lineTo(Math.cos(aim) * r * 1.7, Math.sin(aim) * r * 1.7); ctx.stroke();                 // 포신
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2); ctx.fill(); // 코어
  ctx.restore();
}
// 정령 위습: 맥동하는 이중 발광 구체 + 위성 불꽃.
export function wispOrb(ctx, x, y, t, r, color) {
  ctx.save(); ctx.translate(x, y);
  const pul = 1 + 0.15 * Math.sin(t * 0.2);
  ctx.shadowBlur = 14; ctx.shadowColor = color;
  ctx.globalAlpha = 0.35; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.25 * pul, 0, Math.PI * 2); ctx.fill();     // 외광
  ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, r * 0.7 * pul, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.fill();            // 코어
  const sa = t * 0.13;                                                             // 위성 불꽃 2개
  for (const off of [0, Math.PI]) { ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(Math.cos(sa + off) * r * 1.35, Math.sin(sa + off) * r * 1.35, r * 0.16, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// 검기(참격파): 진행 방향으로 볼록한 초승달 궤적 + 흰 날 선.
export function slash(ctx, x, y, ang, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const R2 = r * 2.1, span = 1.15;   // 호 반지름·펼침 각
  ctx.shadowBlur = 12; ctx.shadowColor = color;
  ctx.strokeStyle = color; ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.9;
  ctx.beginPath(); ctx.arc(-R2 * 0.55, 0, R2, -span, span); ctx.stroke();          // 본체 호(앞으로 볼록)
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.4, r * 0.3);
  ctx.beginPath(); ctx.arc(-R2 * 0.55, 0, R2 + r * 0.25, -span * 0.82, span * 0.82); ctx.stroke();  // 흰 날
  ctx.restore();
}
// 화살 투사체: 가는 샤프트 + 삼각 화살촉 + 꼬리 깃(fletching).
export function arrow(ctx, x, y, ang, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const L = r * 4.2, W = r * 0.9;
  ctx.shadowBlur = 10; ctx.shadowColor = color;
  // 샤프트
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.6, r * 0.32); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(L * 0.34, 0); ctx.lineTo(-L * 0.52, 0); ctx.stroke();
  // 화살촉
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(L * 0.62, 0); ctx.lineTo(L * 0.26, W * 0.55); ctx.lineTo(L * 0.26, -W * 0.55); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(L * 0.62, 0); ctx.lineTo(L * 0.38, W * 0.26); ctx.lineTo(L * 0.38, -W * 0.26); ctx.closePath(); ctx.fill();  // 촉 하이라이트
  // 꼬리 깃(2쌍 사선)
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.4, r * 0.26);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(-L * 0.52, 0); ctx.lineTo(-L * 0.66, W * 0.5 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-L * 0.40, 0); ctx.lineTo(-L * 0.54, W * 0.5 * s); ctx.stroke();
  }
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
