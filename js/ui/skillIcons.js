// 스킬 아이콘: 코드로 그리는 네온 글리프(타입별). assets/skills/<id>.png가 있으면 그 이미지 우선.
import { getImage } from './assets.js';

export function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath(); ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

function glyph(ctx, type, r) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (type === 'projectile') {
    ctx.beginPath(); ctx.moveTo(-r*0.7, 0); ctx.lineTo(r*0.15, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r*0.75, 0); ctx.lineTo(-r*0.05, -r*0.5); ctx.lineTo(-r*0.05, r*0.5); ctx.closePath(); ctx.fill();
  } else if (type === 'beam') {
    ctx.save(); ctx.lineWidth = r*0.42; ctx.beginPath(); ctx.moveTo(-r*0.8, 0); ctx.lineTo(r*0.8, 0); ctx.stroke(); ctx.restore();
  } else if (type === 'orbital') {
    ctx.save(); ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(0, 0, r*0.85, 0, 7); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r*0.24, 0, 7); ctx.fill();
    for (let i=0;i<3;i++){ const a=i/3*Math.PI*2; ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.85, Math.sin(a)*r*0.85, r*0.2, 0, 7); ctx.fill(); }
  } else if (type === 'aura') {
    for (const k of [0.45, 0.72, 1.0]) { ctx.save(); ctx.globalAlpha = 1 - k*0.55; ctx.beginPath(); ctx.arc(0, 0, r*k, 0, 7); ctx.stroke(); ctx.restore(); }
  } else if (type === 'chain') {
    ctx.beginPath(); ctx.moveTo(-r*0.6,-r*0.7); ctx.lineTo(r*0.05,-r*0.05); ctx.lineTo(-r*0.25,r*0.05); ctx.lineTo(r*0.6,r*0.7); ctx.stroke();
  } else if (type === 'summon') {
    ctx.beginPath(); ctx.moveTo(0,-r*0.7); ctx.lineTo(r*0.55,0); ctx.lineTo(0,r*0.7); ctx.lineTo(-r*0.55,0); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,r*0.2,0,7); ctx.fill();
  } else { // passive 등: 플러스
    ctx.save(); ctx.lineWidth = r*0.34; ctx.beginPath();
    ctx.moveTo(-r*0.6,0); ctx.lineTo(r*0.6,0); ctx.moveTo(0,-r*0.6); ctx.lineTo(0,r*0.6); ctx.stroke(); ctx.restore();
  }
}

// (x,y)는 좌상단, size는 정사각 크기.
export function drawSkillIcon(ctx, skill, x, y, size) {
  const c = (skill && skill.color) || '#8cf';
  ctx.save();
  ctx.fillStyle = 'rgba(10,14,26,0.92)'; roundRect(ctx, x, y, size, size, size*0.2); ctx.fill();
  ctx.lineWidth = Math.max(1.5, size*0.05); ctx.strokeStyle = c; ctx.shadowBlur = size*0.22; ctx.shadowColor = c;
  roundRect(ctx, x, y, size, size, size*0.2); ctx.stroke();
  ctx.restore();

  const img = skill && skill.id ? getImage('assets/skills/' + skill.id + '.png') : null;
  if (img) { ctx.save(); roundRect(ctx, x+size*0.08, y+size*0.08, size*0.84, size*0.84, size*0.14); ctx.clip();
    ctx.drawImage(img, x+size*0.08, y+size*0.08, size*0.84, size*0.84); ctx.restore(); return; }

  ctx.save(); ctx.translate(x+size/2, y+size/2);
  ctx.strokeStyle = c; ctx.fillStyle = c; ctx.shadowBlur = size*0.18; ctx.shadowColor = c;
  ctx.lineWidth = Math.max(1.5, size*0.08);
  glyph(ctx, skill && skill.type, size*0.3);
  ctx.restore();
}
