// 인게임 HUD.
import { bar, text } from './render.js';
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
}
