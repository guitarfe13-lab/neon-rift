// 부트스트랩 + 씬 상태기계 + 런 루프.
import { makeLoop } from './core/loop.js';
import { makeRng } from './core/rng.js';
import { loadMeta, saveMeta } from './core/storage.js';
import { createWorld } from './engine/entities.js';
import { makeDirector } from './engine/spawner.js';
import { applyHit, damageOf } from './engine/combat.js';
import { computeStats } from './engine/stats.js';
import { getCharacter } from './data/characters.js';
import { getSkill } from './data/skills.js';
import { runtimeStats } from './systems/skillScaling.js';
import { fireProjectile, updateProjectiles } from './systems/skills.js';
import { addXp, rollChoices, applyChoice } from './systems/levelup.js';
import { makeInput } from './core/input.js';
import { drawHud } from './ui/hud.js';
import * as R from './ui/render.js';

export function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const meta = loadMeta();
  const input = makeInput(canvas);
  let scene = 'run', overlay = null, world, rs, dir, rng, fireTimer = 0, frameCount = 0;

  function startRun(charId = 'blade') {
    rng = makeRng('run-' + (meta.best.timeMs + (frameCount % 1000)));
    world = createWorld();
    world.player.x = canvas.width/2; world.player.y = canvas.height/2;
    const ch = getCharacter(charId);
    rs = { charId, level:1, xp:0, timeMs:0, stage:1, gold:0,
      ownedSkills:{ [ch.startingSkill]:1 }, passives:{}, metaUpgrades: meta.upgrades, stats:{} };
    rs.stats = computeStats({ charId, metaUpgrades: meta.upgrades, runMods: [] });
    world.player.maxHp = rs.stats.maxHp; world.player.hp = rs.stats.maxHp;
    dir = makeDirector(rng, { enemySet:['grunt'] });
    scene = 'run'; overlay = null; fireTimer = 0;
  }

  function update(dt) {
    frameCount++;
    if (scene !== 'run' || overlay) return;
    rs.timeMs += dt;
    rs.stage = Math.max(1, (rs.timeMs/30000|0)+1);
    // 이동
    const mv = input.moveVector(world), sp = rs.stats.moveSpeed;
    world.player.x += mv.x * sp; world.player.y += mv.y * sp;
    // 스폰 + 적 이동/충돌
    dir.update(dt, rs.timeMs, world, 1);
    for (const e of world.enemies) { if (!e.alive) continue;
      const a = Math.atan2(world.player.y-e.y, world.player.x-e.x);
      e.x += Math.cos(a)*e.speed; e.y += Math.sin(a)*e.speed;
      if (Math.hypot(e.x-world.player.x, e.y-world.player.y) < e.radius+world.player.radius) {
        if ((world.player.invuln||0)<=0){ world.player.hp -= e.damage*0.1; world.player.invuln=8; }
      }
    }
    if (world.player.invuln>0) world.player.invuln--;
    // 자동 발사
    const skillId = Object.keys(rs.ownedSkills)[0];
    const rt = runtimeStats(getSkill(skillId), rs.ownedSkills[skillId]);
    if (--fireTimer <= 0) { fireProjectile(world, world.player, rs.stats, rt, rng); fireTimer = rt.cooldown; }
    updateProjectiles(world);
    // 투사체-적 충돌
    for (const p of world.projectiles) { if (!p.alive) continue;
      for (const e of world.enemies) { if (!e.alive) continue;
        if (Math.hypot(p.x-e.x, p.y-e.y) < p.radius+e.radius) {
          const dmg = damageOf(rs.stats, p.dmg, p.crit);
          const res = applyHit(e, dmg, p.crit);
          world.spawnFloater({ x:e.x, y:e.y-10, text:String(dmg|0), color:p.crit?'#ffe14d':'#fff', life:40, vy:-0.8 });
          if (p.pierce>0) p.pierce--; else p.alive=false;
          if (res.killed) { rs.gold += Math.round(e.gold*rs.stats.goldGain); world.spawnPickup({ x:e.x, y:e.y, xp:e.xp, radius:6 }); }
          break;
        }
      }
    }
    // 픽업(자석)
    for (const g of world.pickups) { if (!g.alive) continue;
      const d = Math.hypot(g.x-world.player.x, g.y-world.player.y);
      if (d < rs.stats.pickupRange) { const a=Math.atan2(world.player.y-g.y, world.player.x-g.x);
        g.x+=Math.cos(a)*4; g.y+=Math.sin(a)*4; }
      if (d < world.player.radius) { g.alive=false; if (addXp(rs, g.xp*rs.stats.xpGain).leveled) openLevelUp(); }
    }
    // 플로터
    for (const f of world.floaters){ if(!f.alive)continue; f.y+=f.vy; if(--f.life<=0) f.alive=false; }
    world.despawnDead();
    if (world.player.hp <= 0) gameOver();
  }

  function openLevelUp(){ overlay = { type:'levelup', choices: rollChoices(rs, rng, 3) }; }
  function gameOver(){
    scene='gameover';
    const stage = Math.max(1, (rs.timeMs/30000|0)+1);
    meta.souls += Math.round((stage*5 + rs.timeMs/2000) * rs.stats.soulGain);
    meta.best.stage = Math.max(meta.best.stage, stage);
    meta.best.timeMs = Math.max(meta.best.timeMs, rs.timeMs);
    saveMeta(meta);
  }

  function render() {
    R.clear(ctx, canvas.width, canvas.height);
    if (scene==='run' || scene==='gameover') {
      const ch = getCharacter(rs.charId);
      for (const g of world.pickups) if (g.alive) R.neonCircle(ctx, g.x, g.y, g.radius, '#7cff6b');
      for (const e of world.enemies) if (e.alive) R.neonShape(ctx, e.x, e.y, e.radius, e.shape, e.color);
      for (const p of world.projectiles) if (p.alive) R.neonCircle(ctx, p.x, p.y, p.radius, '#ffe14d');
      R.neonShape(ctx, world.player.x, world.player.y, world.player.radius, ch.shape, ch.color);
      for (const f of world.floaters) if (f.alive) R.text(ctx, f.text, f.x, f.y, { color:f.color, size:13, align:'center' });
      drawHud(ctx, rs, world);
      R.text(ctx, input.isAutopilot()?'AUTO (P: 수동)':'수동 WASD (P: 오토)', canvas.width-16, 24, { size:12, align:'right', color:'#8aa' });
    }
    if (overlay?.type==='levelup') drawLevelUp();
    if (scene==='gameover') { R.text(ctx,'GAME OVER',canvas.width/2,canvas.height/2-20,{size:44,align:'center',color:'#ff4d9d'});
      R.text(ctx,'클릭하면 다시 시작',canvas.width/2,canvas.height/2+24,{size:16,align:'center'}); }
  }
  function drawLevelUp(){
    ctx.save(); ctx.fillStyle='rgba(4,6,14,0.72)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    R.text(ctx,'LEVEL UP — 하나 선택 (1/2/3)',canvas.width/2,120,{size:22,align:'center',color:'#42e6ff'});
    overlay.choices.forEach((c,i)=>R.text(ctx,`${i+1}. ${c.label}`,canvas.width/2,190+i*46,{size:18,align:'center'}));
  }

  addEventListener('keydown', e => {
    if (overlay?.type==='levelup') { const i='123'.indexOf(e.key);
      if (i>=0){ applyChoice(rs, overlay.choices[i]); overlay=null; } }
  });
  canvas.addEventListener('pointerdown', () => { if (scene==='gameover') startRun(rs.charId); });

  const loop = makeLoop({ update, render, step: 1000/60 });
  startRun();
  requestAnimationFrame(function frame(t){ loop.tick(t); requestAnimationFrame(frame); });
  return { startRun };
}
if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', boot);
