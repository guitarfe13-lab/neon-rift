// 인게임 HUD.
import { bar, text } from './render.js';
export function drawHud(ctx, rs, world) {
  const p = world.player;
  bar(ctx, 16, 16, 220, 14, p.hp / p.maxHp, '#ff4d6d');
  text(ctx, `HP ${Math.max(0,Math.ceil(p.hp))}/${Math.round(p.maxHp)}`, 20, 27, { size:11 });
  bar(ctx, 16, 36, 220, 8, rs.xp / (8*Math.pow(rs.level,1.55)+4), '#42e6ff');
  text(ctx, `Lv ${rs.level}`, 244, 30, { size:13, color:'#42e6ff' });
  text(ctx, `⏱ ${(rs.timeMs/1000|0)}s   ⭐ ${rs.stage}   💰 ${rs.gold}`, 16, 66, { size:13 });
}
