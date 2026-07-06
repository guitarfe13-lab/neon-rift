// 부트스트랩 + 씬 상태기계 + 런 루프.
import { makeLoop } from './core/loop.js';
import { makeRng } from './core/rng.js';
import { loadMeta, saveMeta } from './core/storage.js';
import { createWorld } from './engine/entities.js';
import { makeDirector } from './engine/spawner.js';
import { stepEnemy, onEnemyDeath } from './engine/enemyAI.js';
import { applyHit } from './engine/combat.js';
import { computeStats } from './engine/stats.js';
import { getCharacter, CHARACTERS } from './data/characters.js';
import { ENEMIES } from './data/enemies.js';
import { BOSSES } from './data/bosses.js';
import { BIOMES } from './data/biomes.js';
import { updateSkills, updateProjectiles } from './systems/skills.js';
import { addXp, rollChoices, applyChoice } from './systems/levelup.js';
import { makeInput } from './core/input.js';
import { makeAudio } from './core/audio.js';
import { drawHud } from './ui/hud.js';
import { showTitle, showLoadout, showMetaShop, showSettings, clearScreens } from './ui/screens.js';
import { drawSprite } from './ui/sprites.js';
import { getImage, preload } from './ui/assets.js';
import * as R from './ui/render.js';

// #rrggbb → rgba(a)
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }

// 엔티티 렌더: 이미지 에셋(assets/sprites/<id>.png)이 있으면 그걸로, 없으면 코드 스프라이트로.
// 크기 확대 + 접지 그림자 + 은은한 네온 글로우로 '떠 있는 느낌' 제거.
function drawEntity(ctx, ent, x, y, r, color, t, angle, flash) {
  const img = getImage('assets/sprites/' + ent.id + '.png');
  if (img) {
    const sc = 4.6 * (ent.spriteScale || 1);                   // 엔티티별 배율(보스 크게·슬라임 작게)
    const w = r * sc, h = w * (img.height / img.width || 1);
    const bob = Math.sin(t * 0.15 + x * 0.02) * r * 0.05;
    const foot = y + r * 1.2;                                   // 접지선을 아래로(뜬 느낌 완화)
    const sw = r * 1.05 * (ent.spriteScale || 1);              // 그림자 폭도 배율 반영
    // 뒤 네온 글로우(엔티티 색)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.3);
    g.addColorStop(0, hexA(color, 0.30)); g.addColorStop(1, hexA(color, 0));
    ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.3, 0, 7); ctx.fill(); ctx.restore();
    // 접지 그림자(부드럽게: 가장자리 페이드 + 약하게)
    const sg = ctx.createRadialGradient(x, foot, 0, x, foot, sw);
    sg.addColorStop(0, 'rgba(0,0,0,0.22)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x, foot, sw, sw * 0.36, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // 스프라이트(발이 접지선에 오도록 위로)
    ctx.save(); ctx.translate(x, bob);
    if (Math.cos(angle) < 0) ctx.scale(-1, 1);                  // 진행/조준 방향으로 좌우 반전
    if (flash) { ctx.shadowBlur = 24; ctx.shadowColor = '#fff'; }
    ctx.drawImage(img, -w / 2, foot - h, w, h);
    ctx.restore();
  } else {
    drawSprite(ctx, ent.sprite, x, y, r, color, t, angle);
  }
}

export function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const meta = loadMeta();
  const input = makeInput(canvas, meta.settings.autopilot);
  const audio = makeAudio(meta.settings);
  // 최초 사용자 제스처에서 오디오 활성(브라우저 자동재생 정책)
  const resumeAudio = () => audio.resume();
  addEventListener('pointerdown', resumeAudio, { once: true });
  addEventListener('keydown', resumeAudio, { once: true });
  // 이미지 에셋 미리 로드(있으면 사용, 없으면 코드 스프라이트 유지)
  preload([
    ...Object.keys(CHARACTERS).map((id) => `assets/sprites/${id}.png`),
    ...Object.keys(ENEMIES).map((id) => `assets/sprites/${id}.png`),
    ...Object.keys(BOSSES).map((id) => `assets/sprites/${id}.png`),
    ...BIOMES.map((b) => `assets/bg/${b.id}.png`),
  ]);
  let scene = 'title', overlay = null, world, rs, dir, rng, sstate, frameCount = 0;
  let shake = 0, combo = 0, comboTimer = 0, slowmo = 0, whiteFlash = 0;

  function startRun(charId = 'blade') {
    clearScreens();
    rng = makeRng('run-' + (meta.best.timeMs + (frameCount % 1000)));
    world = createWorld();
    world.player.x = canvas.width/2; world.player.y = canvas.height/2;
    const ch = getCharacter(charId);
    rs = { charId, level:1, xp:0, timeMs:0, stage:1, gold:0, baseDamage: ch.base.damage,
      ownedSkills:{ [ch.startingSkill]:1 }, passives:{}, metaUpgrades: meta.upgrades, stats:{} };
    rs.stats = computeStats({ charId, metaUpgrades: meta.upgrades, runMods: [] });
    world.player.maxHp = rs.stats.maxHp; world.player.hp = rs.stats.maxHp;
    rs.mp = rs.stats.maxMp;
    dir = makeDirector(rng, BIOMES);
    sstate = {}; scene = 'run'; overlay = null;
  }

  // 중앙 피해 처리: 스킬 데미지 × 플레이어 공격력 배수(×크리) → 처치 시 보상.
  function damageEnemy(e, skillDmg, crit) {
    let d = skillDmg * (rs.stats.damage / rs.baseDamage);
    if (crit) d *= (rs.stats.critMult || 2);
    d = Math.max(1, Math.round(d));
    const res = applyHit(e, d);
    e.flash = 6;
    world.spawnFloater({ x:e.x, y:e.y-10, text:`-${d}`, color:crit?'#ffe14d':'#fff', life:40, vy:-0.8, crit });
    if (crit && frameCount % 5 === 0) audio.sfx('crit');
    if (e.boss) shake = Math.min(6, shake + 0.5);
    if (res.killed) {
      audio.sfx(e.boss ? 'boss' : 'kill');
      spawnDrops(e);
      combo++; comboTimer = 90;
      shake = Math.min(12, shake + (e.boss ? 9 : 1.5));
      const bursts = e.boss ? 44 : 6;
      for (let i=0;i<bursts;i++){ const a=(i/bursts)*Math.PI*2 + Math.random(); const s=(e.boss?2.5:1.5)+Math.random()*(e.boss?4:2.5);
        world.spawnParticle({ x:e.x, y:e.y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:e.boss?26:14, color: i%3===0?'#fff':e.color, spark:true }); }
      // 보스 처치 연출: 슬로우모션 + 충격파 + 화면 플래시 + 강한 셰이크
      if (e.boss) {
        slowmo = 78; whiteFlash = 14; shake = 18;
        world.spawnParticle({ x:e.x, y:e.y, r:12, rMax:280, life:44, color:'#fff', shock:true });
        world.spawnParticle({ x:e.x, y:e.y, r:8,  rMax:200, life:52, color:e.color, shock:true });
        audio.sfx('boss'); audio.sfx('death');
      }
      onEnemyDeath(e, world, rng);
    }
  }

  // 처치 드랍: 경험치 젬 + 코인(항상), 마나(확률), HP 물약(낮은 확률). 보스는 대량.
  function spawnDrops(e) {
    const j = () => (rng.next()-0.5)*18;
    const gold = Math.round(e.gold * rs.stats.goldGain);
    world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'xp',   value:e.xp, radius:6 });
    world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'coin', value:gold, radius:6 });
    if (e.boss || rng.next() < 0.4)  world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'mana', value: e.boss?45:(4+Math.floor(rng.next()*7)), radius:6 });
    if (e.boss || rng.next() < 0.08) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'hp',   value: e.boss?60:(14+Math.floor(rng.next()*12)), radius:7 });
    if (e.boss) for (let i=0;i<6;i++) world.spawnPickup({ x:e.x+j()*3, y:e.y+j()*3, kind:'coin', value:gold, radius:6 });
  }
  // 픽업 획득 효과
  function collect(g) {
    if (g.kind === 'coin') { rs.gold += g.value; if (frameCount%3===0) audio.sfx('coin'); }
    else if (g.kind === 'mana') { rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} MP`, color:'#4db3ff', life:36, vy:-0.7 }); audio.sfx('pick'); }
    else if (g.kind === 'hp') { world.player.hp = Math.min(world.player.maxHp, world.player.hp + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} HP`, color:'#ff6b8a', life:36, vy:-0.7 }); audio.sfx('upgrade'); }
    else { if (frameCount%3===0) audio.sfx('pick'); if (addXp(rs, g.value*rs.stats.xpGain).leveled) openLevelUp(); }
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
    // 슬로우모션: 게임 로직을 1/3 속도로(보스 처치 연출)
    if (slowmo > 0) { slowmo--; if (frameCount % 3 !== 0) return; }
    rs.timeMs += dt;
    rs.stage = Math.max(1, (rs.timeMs/30000|0)+1);
    // 이동
    const mv = input.moveVector(world), sp = rs.stats.moveSpeed;
    world.player.x += mv.x * sp; world.player.y += mv.y * sp;
    // 보스 아레나: 플레이어 무한 후퇴 방지(원형 경계 안으로 제한)
    const ar = dir.getArena();
    if (ar) { const dx=world.player.x-ar.x, dy=world.player.y-ar.y, dd=Math.hypot(dx,dy);
      if (dd > ar.r) { world.player.x = ar.x + dx/dd*ar.r; world.player.y = ar.y + dy/dd*ar.r; } }
    // 스폰 + 적 이동(행동 AI)/접촉 피해
    dir.update(dt, world);
    for (const e of world.enemies) { if (!e.alive) continue;
      if (e._orbCd > 0) e._orbCd--;
      if (e.flash > 0) e.flash--;
      stepEnemy(e, world, rng);
      if (ar && e.boss) { const dx=e.x-ar.x, dy=e.y-ar.y, dd=Math.hypot(dx,dy);
        if (dd > ar.r+70) { e.x=ar.x+dx/dd*(ar.r+70); e.y=ar.y+dy/dd*(ar.r+70); } }
      if (Math.hypot(e.x-world.player.x, e.y-world.player.y) < e.radius+world.player.radius) {
        if ((world.player.invuln||0)<=0){ world.player.hp -= e.damage*0.1; world.player.invuln=8; shake=Math.min(12,shake+6); audio.sfx('hurt'); }
      }
    }
    if (world.player.invuln>0) world.player.invuln--;
    if (comboTimer>0) comboTimer--; else combo=0;
    shake *= 0.86; if (shake < 0.2) shake = 0;
    // 적 투사체(hazard) 이동/플레이어 피격
    for (const hz of world.hazards) { if (!hz.alive) continue;
      hz.x += hz.vx; hz.y += hz.vy; if (--hz.life <= 0) { hz.alive=false; continue; }
      if (Math.hypot(hz.x-world.player.x, hz.y-world.player.y) < hz.radius+world.player.radius) {
        if ((world.player.invuln||0)<=0){ world.player.hp -= hz.damage*0.1; world.player.invuln=8; shake=Math.min(12,shake+5); audio.sfx('hurt'); } hz.alive=false; }
    }
    // 스킬 실행 + 투사체 이동 (발사 시 슛 사운드, 과다 방지 스로틀)
    updateSkills(world, rs, rng, sstate, damageEnemy, () => { if (frameCount % 5 === 0) audio.sfx('shoot'); });
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
    // MP 재생
    rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + rs.stats.mpRegen);
    // 픽업(자석) + 획득 효과
    for (const g of world.pickups) { if (!g.alive) continue;
      const d = Math.hypot(g.x-world.player.x, g.y-world.player.y);
      if (d < rs.stats.pickupRange) { const a=Math.atan2(world.player.y-g.y, world.player.x-g.x);
        g.x+=Math.cos(a)*4; g.y+=Math.sin(a)*4; }
      if (d < world.player.radius) { g.alive=false; collect(g); }
    }
    // 파티클/플로터 수명
    for (const pt of world.particles){ if(!pt.alive)continue;
      if (pt.spark){ pt.x+=pt.vx; pt.y+=pt.vy; pt.vx*=0.9; pt.vy*=0.9; }
      else if (pt.shock){ pt.r += (pt.rMax - pt.r) * 0.12; }
      if(--pt.life<=0) pt.alive=false; }
    for (const f of world.floaters){ if(!f.alive)continue; f.y+=f.vy; if(--f.life<=0) f.alive=false; }
    world.despawnDead();
    if (world.player.hp <= 0) gameOver();
  }

  function openLevelUp(){ audio.sfx('levelup'); overlay = { type:'levelup', choices: rollChoices(rs, rng, 3) }; }
  function gameOver(){
    scene='gameover'; audio.sfx('death');
    const stage = Math.max(1, (rs.timeMs/30000|0)+1);
    meta.souls += Math.round((stage*5 + rs.timeMs/2000) * rs.stats.soulGain);
    meta.best.stage = Math.max(meta.best.stage, stage);
    meta.best.timeMs = Math.max(meta.best.timeMs, rs.timeMs);
    saveMeta(meta);
  }

  function render() {
    R.clear(ctx, canvas.width, canvas.height);
    if ((scene==='run' || scene==='gameover') && world) {
      const ch = getCharacter(rs.charId);
      const camX = world.player.x - canvas.width/2 + (Math.random()-0.5)*shake;
      const camY = world.player.y - canvas.height/2 + (Math.random()-0.5)*shake;
      // 바이옴 배경: 이미지(assets/bg/<id>.png)가 있으면 시차 타일, 없으면 그라디언트+그리드
      const bio = dir.biome();
      const bgImg = getImage('assets/bg/' + bio.id + '.png');
      if (bgImg) {
        const tw = bgImg.width, th = bgImg.height;
        const ox = -((((camX*0.5) % tw) + tw) % tw), oy = -((((camY*0.5) % th) + th) % th);
        for (let yy = oy; yy < canvas.height; yy += th) for (let xx = ox; xx < canvas.width; xx += tw) ctx.drawImage(bgImg, xx, yy);
      } else {
        const bg = ctx.createRadialGradient(canvas.width/2, canvas.height*0.45, 0, canvas.width/2, canvas.height*0.45, canvas.width*0.72);
        bg.addColorStop(0, bio.palette[0]); bg.addColorStop(1, bio.palette[1]);
        ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
        R.grid(ctx, canvas.width, canvas.height, camX, camY, 48, bio.grid);
      }
      // 보스 아레나 경계
      const arn = dir.getArena();
      if (arn) { ctx.save(); ctx.strokeStyle='rgba(255,92,200,0.5)'; ctx.lineWidth=3; ctx.setLineDash([12,12]);
        ctx.beginPath(); ctx.arc(arn.x-camX, arn.y-camY, arn.r, 0, Math.PI*2); ctx.stroke(); ctx.restore(); }
      // 파티클(오라 링 / 연쇄 볼트 / 처치 스파크)
      for (const pt of world.particles) { if (!pt.alive) continue;
        ctx.save();
        if (pt.spark) { ctx.globalAlpha = Math.max(0, pt.life/26); ctx.fillStyle = pt.color||'#fff';
          ctx.beginPath(); ctx.arc(pt.x-camX, pt.y-camY, 3, 0, Math.PI*2); ctx.fill(); }
        else if (pt.shock) { ctx.globalAlpha = Math.max(0, pt.life/44); ctx.strokeStyle = pt.color||'#fff'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(pt.x-camX, pt.y-camY, pt.r, 0, Math.PI*2); ctx.stroke(); }
        else { ctx.globalAlpha = Math.max(0, pt.life/8); ctx.strokeStyle = pt.color||'#5cf'; ctx.lineWidth = 2;
          if (pt.ring) { ctx.beginPath(); ctx.arc(pt.x-camX, pt.y-camY, pt.r, 0, Math.PI*2); ctx.stroke(); }
          else if (pt.bolt) { ctx.beginPath(); ctx.moveTo(pt.x1-camX, pt.y1-camY); ctx.lineTo(pt.x2-camX, pt.y2-camY); ctx.stroke(); } }
        ctx.restore();
      }
      for (const g of world.pickups) if (g.alive) {
        const col = g.kind==='coin' ? '#ffd54a' : g.kind==='mana' ? '#4db3ff' : g.kind==='hp' ? '#ff6b8a' : '#7cff6b';
        R.neonCircle(ctx, g.x-camX, g.y-camY, g.radius, col);
        if (g.kind==='hp') R.text(ctx, '+', g.x-camX, g.y-camY+4, { color:'#3a0', size:11, align:'center', weight:'800' }); }
      for (const hz of world.hazards) if (hz.alive) R.neonCircle(ctx, hz.x-camX, hz.y-camY, hz.radius, hz.color||'#ff5c5c');
      for (const e of world.enemies) if (e.alive)
        drawEntity(ctx, e, e.x-camX, e.y-camY, e.radius, e.flash>0?'#ffffff':e.color, frameCount, Math.atan2(world.player.y-e.y, world.player.x-e.x), e.flash>0);
      for (const p of world.projectiles) { if (!p.alive) continue;
        if (p.beam) { const n=Math.hypot(p.vx,p.vy)||1, ux=p.vx/n, uy=p.vy/n;
          R.neonLine(ctx, p.x-camX, p.y-camY, p.x-ux*p.len-camX, p.y-uy*p.len-camY, p.radius*1.7, p.color||'#7cf9ff'); }
        else R.neonCircle(ctx, p.x-camX, p.y-camY, p.radius, p.color||'#ffe14d'); }
      // 플레이어(피격 무적 중 깜빡임)
      if (!(world.player.invuln>0 && frameCount%6<3))
        drawEntity(ctx, ch, world.player.x-camX, world.player.y-camY, world.player.radius, ch.color, frameCount, 0, false);
      for (const f of world.floaters) if (f.alive) R.text(ctx, f.text, f.x-camX, f.y-camY, { color:f.color, size:f.crit?18:13, align:'center', weight:f.crit?'800':'600' });
      drawHud(ctx, rs, world);
      if (combo > 2) R.text(ctx, `COMBO x${combo}`, canvas.width/2, 46, { size:22, align:'center', color:'#ffd166', weight:'800' });
      R.text(ctx, bio.name, 16, 84, { size:12, color:'#9ab' });
      R.text(ctx, input.isAutopilot()?'AUTO (P: 수동)':'수동 WASD (P: 오토)', canvas.width-16, 24, { size:12, align:'right', color:'#8aa' });
      const boss = dir.getBossRef();
      if (boss && boss.alive) {
        R.text(ctx, `👑 ${boss.name}`, canvas.width/2, canvas.height-46, { size:14, align:'center', color:'#ff9ee0' });
        R.bar(ctx, canvas.width/2-180, canvas.height-40, 360, 14, boss.hp/boss.maxHp, '#ff5cc8');
      }
    }
    // 보스 처치 화면 플래시(렌더 프레임마다 감쇠 — 슬로우모션 영향 안 받음)
    if (whiteFlash > 0) { ctx.save(); ctx.globalAlpha = (whiteFlash/14)*0.6; ctx.fillStyle='#fff';
      ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore(); whiteFlash--; }
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
      if (i>=0 && overlay.choices[i]){ audio.sfx('upgrade'); applyChoice(rs, overlay.choices[i]); cleanupSkillState(); overlay=null; } }
  });
  canvas.addEventListener('pointerdown', () => { if (scene==='gameover') toTitle(); });

  // 씬 내비게이션
  function toTitle(){ scene='title'; clearScreens(); showTitle({ meta, onPlay:toLoadout, onShop:toShop, onSettings:toSettings }); }
  function toLoadout(){ scene='loadout'; showLoadout({ meta, onStart:beginRun, onBack:toTitle }); }
  function toShop(){ scene='shop'; showMetaShop({ meta, save:()=>saveMeta(meta), onBack:toTitle }); }
  function toSettings(){ scene='settings'; showSettings({ meta, save:()=>{ saveMeta(meta); audio.setVolumes(meta.settings); }, onBack:toTitle }); }
  function beginRun(id){ startRun(id); }

  const loop = makeLoop({ update, render, step: 1000/60 });
  toTitle();
  requestAnimationFrame(function frame(t){ loop.tick(t); requestAnimationFrame(frame); });
  return { startRun, toTitle };
}
if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', boot);
