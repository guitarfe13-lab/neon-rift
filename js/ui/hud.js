// 인게임 HUD.
import { bar, text } from './render.js';
import { roundRect } from './skillIcons.js';

// 포션 병 아이콘: 코르크 + 유리병 + 하단 액체 채움.
function drawPotion(ctx, x, y, w, h, color) {
  ctx.save();
  const nw = w*0.42, nx = x + (w-nw)/2, ch = h*0.14;
  ctx.fillStyle = '#caa06a'; ctx.fillRect(nx, y, nw, ch);                 // 코르크
  const by = y + ch, bh = h - ch;
  roundRect(ctx, x, by, w, bh, w*0.34); ctx.fillStyle = 'rgba(230,240,255,0.16)'; ctx.fill();  // 유리
  ctx.save(); roundRect(ctx, x, by, w, bh, w*0.34); ctx.clip();
  ctx.fillStyle = color; ctx.fillRect(x, by+bh*0.30, w, bh);              // 액체
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x+w*0.22, by+bh*0.38, w*0.14, bh*0.5); // 하이라이트
  ctx.restore();
  roundRect(ctx, x, by, w, bh, w*0.34); ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.4; ctx.stroke();
  ctx.restore();
}
export function drawHud(ctx, rs, world, frame = 0) {
  const p = world.player;
  const blinkOn = Math.floor(frame / 8) % 2 === 0;   // 저잔량 경고 점멸
  const hpPct = p.hp / p.maxHp, hpLow = hpPct <= 0.3;
  bar(ctx, 16, 14, 220, 13, hpPct, hpLow ? (blinkOn ? '#ff2a2a' : '#5a1018') : '#ff4d6d');
  text(ctx, `HP ${Math.max(0,Math.ceil(p.hp))}/${Math.round(p.maxHp)}`, 20, 24, { size:11, color: hpLow && blinkOn ? '#ffdada' : '#eaf2ff' });
  const maxMp = rs.stats.maxMp || 1;
  const mpPct = (rs.mp ?? 0) / maxMp, mpLow = mpPct <= 0.3;
  bar(ctx, 16, 30, 220, 9, mpPct, mpLow ? (blinkOn ? '#ff2a2a' : '#3a1420') : '#4db3ff');
  text(ctx, `MP ${Math.max(0,Math.floor(rs.mp ?? 0))}/${Math.round(maxMp)}`, 20, 38, { size:10, color: mpLow && blinkOn ? '#ffdada' : '#eaf2ff' });
  bar(ctx, 16, 43, 220, 7, rs.xp / (8*Math.pow(rs.level,1.55)+4), '#42e6ff');
  text(ctx, `Lv ${rs.level}`, 244, 40, { size:13, color:'#42e6ff' });
  text(ctx, `⏱ ${(rs.timeMs/1000|0)}s   ⭐ ${rs.stage}   💰 ${rs.gold}`, 16, 70, { size:13 });
  const po = rs.potions || { hp:0, mp:0 };
  drawPotion(ctx, 18, 80, 15, 22, '#ff4d6d'); text(ctx, `×${po.hp}`, 38, 96, { size:13, weight:'800', color:'#ffb3c0' });
  drawPotion(ctx, 84, 80, 15, 22, '#4db3ff'); text(ctx, `×${po.mp}`, 104, 96, { size:13, weight:'800', color:'#a9d8ff' });
}
