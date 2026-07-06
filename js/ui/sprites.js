// 코드로 그리는 캐릭터/몬스터 스프라이트(외부 이미지 0). 네온 벡터 합성:
// 어두운 바디 + 발광 외곽선 + 빛나는 눈 + 디테일. 좌표는 반지름 r 기준 상대값.
function outline(ctx, color, w = 2.5) { ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
function darkFill(ctx) { ctx.fillStyle = 'rgba(9,11,20,0.88)'; }
function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
function eye(ctx, x, y, r, c = '#fff') { ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore(); }
function line(ctx, x1, y1, x2, y2, color, w = 2.5) { ctx.save(); outline(ctx, color, w); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }

const SPRITES = {
  // ── 캐릭터 ──
  knight(ctx, r, color, t) {
    ctx.translate(0, Math.sin(t * 0.15) * 0.05 * r);
    darkFill(ctx); outline(ctx, color, 2.6);
    poly(ctx, [[-0.7*r,-0.15*r],[0.7*r,-0.15*r],[0.55*r,0.85*r],[0,1.05*r],[-0.55*r,0.85*r]]); ctx.fill(); ctx.stroke(); // 방패 몸통
    poly(ctx, [[-0.52*r,-0.15*r],[0.52*r,-0.15*r],[0.46*r,-0.72*r],[-0.46*r,-0.72*r]]); ctx.fill(); ctx.stroke(); // 투구
    line(ctx, -0.34*r,-0.42*r, 0.34*r,-0.42*r, color, 3); // 바이저 슬릿(눈)
    line(ctx, 0.66*r,0.35*r, 1.15*r,-0.55*r, '#dffcff', 3); // 검
  },
  mage(ctx, r, color, t) {
    ctx.translate(0, Math.sin(t * 0.13) * 0.05 * r);
    darkFill(ctx); outline(ctx, color, 2.6);
    poly(ctx, [[0,-0.55*r],[0.75*r,0.95*r],[-0.75*r,0.95*r]]); ctx.fill(); ctx.stroke(); // 로브
    poly(ctx, [[0,-1.15*r],[0.42*r,-0.4*r],[-0.42*r,-0.4*r]]); ctx.fill(); ctx.stroke(); // 후드
    eye(ctx, 0, -0.35*r, 0.11*r, color); // 후드 아래 눈
    ctx.save(); ctx.shadowBlur=16; ctx.shadowColor=color; ctx.fillStyle=color; // 지팡이 오브
    ctx.beginPath(); ctx.arc(0.7*r, -0.15*r + Math.sin(t*0.2)*0.08*r, 0.16*r, 0, 7); ctx.fill(); ctx.restore();
    line(ctx, 0.7*r,0.1*r, 0.7*r,0.9*r, color, 2); // 지팡이
  },
  ranger(ctx, r, color, t) {
    ctx.translate(0, Math.sin(t * 0.16) * 0.05 * r);
    darkFill(ctx); outline(ctx, color, 2.4);
    poly(ctx, [[0,-0.9*r],[0.45*r,0.2*r],[0.3*r,0.95*r],[-0.3*r,0.95*r],[-0.45*r,0.2*r]]); ctx.fill(); ctx.stroke(); // 날렵한 몸
    eye(ctx, 0.12*r, -0.35*r, 0.1*r, color);
    ctx.save(); outline(ctx, '#dffcff', 2.4); // 활
    ctx.beginPath(); ctx.arc(-0.15*r, 0.1*r, 0.85*r, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-0.15*r + Math.cos(-0.9)*0.85*r, 0.1*r + Math.sin(-0.9)*0.85*r);
    ctx.lineTo(-0.15*r + Math.cos(0.9)*0.85*r, 0.1*r + Math.sin(0.9)*0.85*r); ctx.stroke(); ctx.restore();
  },
  crystal(ctx, r, color, t) { // 정령술사: 부유 결정 + 회전 파편
    const pulse = 1 + Math.sin(t * 0.12) * 0.05;
    darkFill(ctx); outline(ctx, color, 2.6);
    poly(ctx, [[0,-1.05*r*pulse],[0.6*r,0],[0,1.05*r*pulse],[-0.6*r,0]]); ctx.fill(); ctx.stroke(); // 중앙 결정
    eye(ctx, 0, -0.05*r, 0.14*r, color);
    for (let i = 0; i < 3; i++) { const a = t * 0.04 + i * (Math.PI * 2 / 3); const sx = Math.cos(a) * 1.15 * r, sy = Math.sin(a) * 1.15 * r;
      ctx.save(); ctx.translate(sx, sy); outline(ctx, color, 1.8); darkFill(ctx);
      poly(ctx, [[0,-0.22*r],[0.16*r,0],[0,0.22*r],[-0.16*r,0]]); ctx.fill(); ctx.stroke(); ctx.restore(); }
  },

  // ── 몬스터 ──
  blob(ctx, r, color, t) { // 스워머: 물컹한 눈알 덩어리
    const w = 1 + Math.sin(t * 0.2) * 0.08;
    darkFill(ctx); outline(ctx, color, 2.4);
    ctx.beginPath(); ctx.ellipse(0, 0, r * w, r / w, 0, 0, 7); ctx.fill(); ctx.stroke();
    eye(ctx, -0.32*r, -0.1*r, 0.16*r); eye(ctx, 0.32*r, -0.1*r, 0.16*r);
    eye(ctx, -0.32*r, -0.1*r, 0.07*r, '#100'); eye(ctx, 0.32*r, -0.1*r, 0.07*r, '#100');
  },
  dart(ctx, r, color, t, facing) { // 러너: 화살촉 돌격체
    ctx.rotate(facing);
    darkFill(ctx); outline(ctx, color, 2.4);
    poly(ctx, [[1.1*r,0],[-0.5*r,0.7*r],[-0.2*r,0],[-0.5*r,-0.7*r]]); ctx.fill(); ctx.stroke();
    eye(ctx, 0.3*r, 0, 0.13*r, '#fff');
    line(ctx, -0.5*r,0.7*r, -0.9*r,0.4*r, color, 1.8); line(ctx, -0.5*r,-0.7*r, -0.9*r,-0.4*r, color, 1.8); // 꼬리 핀
  },
  golem(ctx, r, color, t) { // 탱커: 장갑 골렘
    darkFill(ctx); outline(ctx, color, 3);
    poly(ctx, [[-0.85*r,-0.7*r],[0.85*r,-0.7*r],[0.95*r,0.7*r],[-0.95*r,0.7*r]]); ctx.fill(); ctx.stroke();
    for (const [cx, cy] of [[-0.6*r,-0.45*r],[0.6*r,-0.45*r],[-0.6*r,0.45*r],[0.6*r,0.45*r]]) { // 리벳
      ctx.save(); outline(ctx, color, 1.6); ctx.beginPath(); ctx.arc(cx, cy, 0.1*r, 0, 7); ctx.stroke(); ctx.restore(); }
    eye(ctx, 0, 0, 0.22*r, color); eye(ctx, 0, 0, 0.1*r, '#100');
  },
  eyeball(ctx, r, color, t) { // 슈터: 부유 눈알 포탑
    const p = 1 + Math.sin(t * 0.18) * 0.06;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; line(ctx, Math.cos(a)*0.9*r, Math.sin(a)*0.9*r, Math.cos(a)*1.15*r*p, Math.sin(a)*1.15*r*p, color, 1.6); } // 가시 조리개
    darkFill(ctx); outline(ctx, color, 2.6); ctx.beginPath(); ctx.arc(0, 0, 0.9*r, 0, 7); ctx.fill(); ctx.stroke();
    eye(ctx, 0, 0, 0.5*r, '#fff'); eye(ctx, Math.cos(t*0.1)*0.18*r, Math.sin(t*0.1)*0.18*r, 0.22*r, color); eye(ctx, Math.cos(t*0.1)*0.18*r, Math.sin(t*0.1)*0.18*r, 0.1*r, '#100');
  },
  cell(ctx, r, color, t) { // 분열체: 세포/핵
    const w = 1 + Math.sin(t * 0.22) * 0.1;
    darkFill(ctx); outline(ctx, color, 2.2);
    ctx.beginPath(); ctx.ellipse(0, 0, r * w, r / w, 0, 0, 7); ctx.fill(); ctx.stroke();
    eye(ctx, 0, 0, 0.28*r, color); eye(ctx, 0, 0, 0.13*r, '#100');
    for (let i = 0; i < 4; i++) { const a = t * 0.05 + i * Math.PI / 2; eye(ctx, Math.cos(a)*0.55*r, Math.sin(a)*0.55*r, 0.06*r, color); }
  },
  horned(ctx, r, color, t, facing) { // 돌진체: 뿔 달린 짐승
    ctx.rotate(facing);
    darkFill(ctx); outline(ctx, color, 2.6);
    poly(ctx, [[0.9*r,0],[-0.6*r,0.75*r],[-0.6*r,-0.75*r]]); ctx.fill(); ctx.stroke();
    line(ctx, 0.4*r,0.35*r, 1.2*r,0.65*r, color, 2.4); line(ctx, 0.4*r,-0.35*r, 1.2*r,-0.65*r, color, 2.4); // 뿔
    eye(ctx, 0.1*r, 0.22*r, 0.11*r, '#ff5'); eye(ctx, 0.1*r, -0.22*r, 0.11*r, '#ff5');
  },
  boss(ctx, r, color, t) { // 보스: 왕관·다중 눈·회전 고리
    ctx.save(); ctx.rotate(t * 0.01); outline(ctx, color, 2); // 외곽 회전 고리
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, Math.cos(a)*1.15*r, Math.sin(a)*1.15*r, Math.cos(a)*1.35*r, Math.sin(a)*1.35*r, color, 2); } ctx.restore();
    darkFill(ctx); outline(ctx, color, 3.4);
    poly(ctx, [[-0.9*r,-0.6*r],[0.9*r,-0.6*r],[1.0*r,0.7*r],[0,1.05*r],[-1.0*r,0.7*r]]); ctx.fill(); ctx.stroke(); // 몸
    poly(ctx, [[-0.7*r,-0.6*r],[-0.45*r,-1.1*r],[-0.2*r,-0.6*r],[0,-1.15*r],[0.2*r,-0.6*r],[0.45*r,-1.1*r],[0.7*r,-0.6*r]]); ctx.fill(); ctx.stroke(); // 왕관
    eye(ctx, -0.4*r, -0.05*r, 0.15*r, color); eye(ctx, 0.4*r, -0.05*r, 0.15*r, color); eye(ctx, 0, 0.35*r, 0.18*r, '#fff');
    eye(ctx, -0.4*r, -0.05*r, 0.07*r, '#100'); eye(ctx, 0.4*r, -0.05*r, 0.07*r, '#100');
  },
};

export function drawSprite(ctx, key, x, y, r, color, t = 0, facing = 0) {
  ctx.save(); ctx.translate(x, y);
  const fn = SPRITES[key];
  if (fn) fn(ctx, r, color, t, facing);
  else { ctx.shadowBlur = 14; ctx.shadowColor = color; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
export function hasSprite(key) { return !!SPRITES[key]; }
