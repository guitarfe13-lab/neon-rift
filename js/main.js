// 부트스트랩 + 씬 상태기계 + 런 루프.
import { makeLoop } from './core/loop.js';
import { makeRng } from './core/rng.js';
import { loadMeta, saveMeta } from './core/storage.js';
import { createWorld } from './engine/entities.js';
import { makeDirector } from './engine/spawner.js';
import { stepEnemy, onEnemyDeath } from './engine/enemyAI.js';
import { applyHit } from './engine/combat.js';
import { computeStats } from './engine/stats.js';
import { getCharacter } from './data/characters.js';
import { BIOMES } from './data/biomes.js';
import { updateSkills, updateProjectiles } from './systems/skills.js';
import { addXp, rollChoices, applyChoice } from './systems/levelup.js';
import { makeInput } from './core/input.js';
import { drawHud } from './ui/hud.js';
import * as R from './ui/render.js';

export function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const meta = loadMeta();
  const input = makeInput(canvas);
  let scene = 'run', overlay = null, world, rs, dir, rng, sstate, frameCount = 0;

  function startRun(charId = 'blade') {
    rng = makeRng('run-' + (meta.best.timeMs + (frameCount % 1000)));
    world = createWorld();
    world.player.x = canvas.width/2; world.player.y = canvas.height/2;
    const ch = getCharacter(charId);
    rs = { charId, level:1, xp:0, timeMs:0, stage:1, gold:0, baseDamage: ch.base.damage,
      ownedSkills:{ [ch.startingSkill]:1 }, passives:{}, metaUpgrades: meta.upgrades, stats:{} };
    rs.stats = computeStats({ charId, metaUpgrades: meta.upgrades, runMods: [] });
    world.player.maxHp = rs.stats.maxHp; world.player.hp = rs.stats.maxHp;
    dir = makeDirector(rng, BIOMES);
    sstate = {}; scene = 'run'; overlay = null;
  }

  // 중앙 피해 처리: 스킬 데미지 × 플레이어 공격력 배수(×크리) → 처치 시 보상.
  function damageEnemy(e, skillDmg, crit) {
    let d = skillDmg * (rs.stats.damage / rs.baseDamage);
    if (crit) d *= (rs.stats.critMult || 2);
    d = Math.max(1, Math.round(d));
    const res = applyHit(e, d);
    world.spawnFloater({ x:e.x, y:e.y-10, text:String(d), color:crit?'#ffe14d':'#fff', life:40, vy:-0.8 });
    if (res.killed) { rs.gold += Math.round(e.gold*rs.stats.goldGain); world.spawnPickup({ x:e.x, y:e.y, xp:e.xp, radius:6 });
      onEnemyDeath(e, world, rng); }
  }

  function cleanupSkillState() {
    for (const id of Object.keys(sstate)) if (!rs.ownedSkills[id]) {
      const st = sstate[id];
      if (st.orbs) for (const o of st.orbs) o.alive = false;
      if (st.drone) st.drone.alive = false;
      delete sstate[id];
    }
  }

  function update(dt) {
    frameCount++;
    if (scene !== 'run' || overlay) return;
    rs.timeMs += dt;
    rs.stage = Math.max(1, (rs.timeMs/30000|0)+1);
    // 이동
    const mv = input.moveVector(world), sp = rs.stats.moveSpeed;
    world.player.x += mv.x * sp; world.player.y += mv.y * sp;
    // 스폰 + 적 이동(행동 AI)/접촉 피해
    dir.update(dt, world);
    for (const e of world.enemies) { if (!e.alive) continue;
      if (e._orbCd > 0) e._orbCd--;
      stepEnemy(e, world, rng);
      if (Math.hypot(e.x-world.player.x, e.y-world.player.y) < e.radius+world.player.radius) {
        if ((world.player.invuln||0)<=0){ world.player.hp -= e.damage*0.1; world.player.invuln=8; }
      }
    }
    if (world.player.invuln>0) world.player.invuln--;
    // 적 투사체(hazard) 이동/플레이어 피격
    for (const hz of world.hazards) { if (!hz.alive) continue;
      hz.x += hz.vx; hz.y += hz.vy; if (--hz.life <= 0) { hz.alive=false; continue; }
      if (Math.hypot(hz.x-world.player.x, hz.y-world.player.y) < hz.radius+world.player.radius) {
        if ((world.player.invuln||0)<=0){ world.player.hp -= hz.damage*0.1; world.player.invuln=8; } hz.alive=false; }
    }
    // 스킬 실행 + 투사체 이동
    updateSkills(world, rs, rng, sstate, damageEnemy);
    updateProjectiles(world);
    // 투사체-적 충돌
    for (const p of world.projectiles) { if (!p.alive || p.dmg<=0) continue;
      for (const e of world.enemies) { if (!e.alive) continue;
        if (Math.hypot(p.x-e.x, p.y-e.y) < p.radius+e.radius) {
          if (p.orbit) { if ((e._orbCd||0)>0) continue; damageEnemy(e, p.dmg, false); e._orbCd = 12; }
          else { damageEnemy(e, p.dmg, p.crit); if (p.pierce>0) p.pierce--; else { p.alive=false; break; } }
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
    // 파티클/플로터 수명
    for (const pt of world.particles){ if(!pt.alive)continue; if(--pt.life<=0) pt.alive=false; }
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
      const camX = world.player.x - canvas.width/2;
      const camY = world.player.y - canvas.height/2;
      // 바이옴 배경(방사형 그라디언트) + 팔레트 그리드
      const bio = dir.biome();
      const bg = ctx.createRadialGradient(canvas.width/2, canvas.height*0.45, 0, canvas.width/2, canvas.height*0.45, canvas.width*0.72);
      bg.addColorStop(0, bio.palette[0]); bg.addColorStop(1, bio.palette[1]);
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      R.grid(ctx, canvas.width, canvas.height, camX, camY, 48, bio.grid);
      // 파티클(오라 링 / 연쇄 볼트)
      for (const pt of world.particles) { if (!pt.alive) continue;
        ctx.save(); ctx.globalAlpha = Math.max(0, pt.life/8); ctx.strokeStyle = pt.color||'#5cf'; ctx.lineWidth = 2;
        if (pt.ring) { ctx.beginPath(); ctx.arc(pt.x-camX, pt.y-camY, pt.r, 0, Math.PI*2); ctx.stroke(); }
        else if (pt.bolt) { ctx.beginPath(); ctx.moveTo(pt.x1-camX, pt.y1-camY); ctx.lineTo(pt.x2-camX, pt.y2-camY); ctx.stroke(); }
        ctx.restore();
      }
      for (const g of world.pickups) if (g.alive) R.neonCircle(ctx, g.x-camX, g.y-camY, g.radius, '#7cff6b');
      for (const hz of world.hazards) if (hz.alive) R.neonCircle(ctx, hz.x-camX, hz.y-camY, hz.radius, hz.color||'#ff5c5c');
      for (const e of world.enemies) if (e.alive) R.neonShape(ctx, e.x-camX, e.y-camY, e.radius, e.shape, e.color);
      for (const p of world.projectiles) { if (!p.alive) continue;
        if (p.beam) { const n=Math.hypot(p.vx,p.vy)||1, ux=p.vx/n, uy=p.vy/n;
          R.neonLine(ctx, p.x-camX, p.y-camY, p.x-ux*p.len-camX, p.y-uy*p.len-camY, p.radius*1.7, p.color||'#7cf9ff'); }
        else R.neonCircle(ctx, p.x-camX, p.y-camY, p.radius, p.color||'#ffe14d'); }
      R.neonShape(ctx, world.player.x-camX, world.player.y-camY, world.player.radius, ch.shape, ch.color);
      for (const f of world.floaters) if (f.alive) R.text(ctx, f.text, f.x-camX, f.y-camY, { color:f.color, size:13, align:'center' });
      drawHud(ctx, rs, world);
      R.text(ctx, bio.name, 16, 84, { size:12, color:'#9ab' });
      R.text(ctx, input.isAutopilot()?'AUTO (P: 수동)':'수동 WASD (P: 오토)', canvas.width-16, 24, { size:12, align:'right', color:'#8aa' });
      const boss = dir.getBossRef();
      if (boss && boss.alive) {
        R.text(ctx, `👑 ${boss.name}`, canvas.width/2, canvas.height-46, { size:14, align:'center', color:'#ff9ee0' });
        R.bar(ctx, canvas.width/2-180, canvas.height-40, 360, 14, boss.hp/boss.maxHp, '#ff5cc8');
      }
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
      if (i>=0 && overlay.choices[i]){ applyChoice(rs, overlay.choices[i]); cleanupSkillState(); overlay=null; } }
  });
  canvas.addEventListener('pointerdown', () => { if (scene==='gameover') startRun(rs.charId); });

  const loop = makeLoop({ update, render, step: 1000/60 });
  startRun();
  requestAnimationFrame(function frame(t){ loop.tick(t); requestAnimationFrame(frame); });
  return { startRun };
}
if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', boot);
