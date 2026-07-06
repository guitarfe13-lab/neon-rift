// 부트스트랩 + 씬 상태기계 + 런 루프.
import { makeLoop } from './core/loop.js';
import { makeRng } from './core/rng.js';
import { loadMeta, saveMeta } from './core/storage.js';
import { createWorld } from './engine/entities.js';
import { makeDirector } from './engine/spawner.js';
import { stepEnemy, onEnemyDeath, MOVE_SCALE } from './engine/enemyAI.js';
import { applyHit } from './engine/combat.js';
import { computeStats } from './engine/stats.js';
import { getCharacter, CHARACTERS } from './data/characters.js';
import { ENEMIES } from './data/enemies.js';
import { BOSSES } from './data/bosses.js';
import { BIOMES } from './data/biomes.js';
import { getSkill } from './data/skills.js';
import { updateSkills, updateProjectiles } from './systems/skills.js';
import { addXp, rollChoices, applyChoice } from './systems/levelup.js';
import { makeInput } from './core/input.js';
import { makeAudio } from './core/audio.js';
import { drawHud } from './ui/hud.js';
import { showTitle, showLoadout, showMetaShop, showSettings, clearScreens } from './ui/screens.js';
import { drawSprite } from './ui/sprites.js';
import { drawSkillIcon, roundRect } from './ui/skillIcons.js';
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
  let shake = 0, combo = 0, comboTimer = 0, slowmo = 0, whiteFlash = 0, pendingLevelUp = false;
  let levelupDelay = 0, goldFlash = 0, comboPop = 0;

  // 레벨업 순간 연출(버스트 + 골드 플래시 + 문구). 오버레이는 잠시 뒤 열림.
  function onLevelGain() {
    pendingLevelUp = true; levelupDelay = 20; goldFlash = 12;
    const p = world.player;
    world.spawnParticle({ x:p.x, y:p.y, r:12, rMax:100, life:26, color:'#ffe14d', shock:true });
    for (let i=0;i<16;i++){ const a=i/16*Math.PI*2; world.spawnParticle({ x:p.x, y:p.y, vx:Math.cos(a)*2.4, vy:Math.sin(a)*2.4-1, life:24, color:'#ffe14d', spark:true }); }
    world.spawnFloater({ x:p.x, y:p.y-34, text:'LEVEL UP!', color:'#ffe14d', life:44, max:44, vy:-0.5, crit:true });
  }

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
    rs.potions = { hp: meta.potions?.hp || 0, mp: meta.potions?.mp || 0 };  // 상점 구매분 반입
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
    world.spawnFloater({ x:e.x, y:e.y-10, text:`-${d}`, color:crit?'#ffe14d':'#fff', life:40, max:40, vy:-0.8, crit });
    if (crit && frameCount % 5 === 0) audio.sfx('crit');
    if (e.boss) shake = Math.min(6, shake + 0.5);
    if (res.killed) {
      audio.sfx(e.boss ? 'boss' : 'kill');
      spawnDrops(e);
      combo++; comboTimer = 90; comboPop = 1;
      shake = Math.min(12, shake + (e.boss ? 9 : 2.6));
      const bursts = e.boss ? 44 : 8;
      for (let i=0;i<bursts;i++){ const a=(i/bursts)*Math.PI*2 + Math.random(); const s=(e.boss?2.5:1.6)+Math.random()*(e.boss?4:2.6);
        world.spawnParticle({ x:e.x, y:e.y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:e.boss?26:14, color: i%3===0?'#fff':e.color, spark:true }); }
      // 일반 몹: 약한 충격파 링
      if (!e.boss) world.spawnParticle({ x:e.x, y:e.y, r:e.radius*0.7, rMax:e.radius*2.6, life:12, color:e.color, shock:true });
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
    if (e.boss || rng.next() < 0.55) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'mana', value: e.boss?70:(6+Math.floor(rng.next()*7)), radius:6 });
    if (e.boss || rng.next() < 0.1)  world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'hp',   value: e.boss?70:(14+Math.floor(rng.next()*12)), radius:7 });
    if (e.boss) for (let i=0;i<6;i++) world.spawnPickup({ x:e.x+j()*3, y:e.y+j()*3, kind:'coin', value:gold, radius:6 });
  }
  // 픽업 획득 효과
  const PICK_COLOR = { coin:'#ffd54a', mana:'#4db3ff', hp:'#ff6b8a', xp:'#7cff6b' };
  function collect(g) {
    // 획득 팝(작은 스파크)
    const col = PICK_COLOR[g.kind] || '#7cff6b';
    for (let i=0;i<3;i++){ const a=Math.random()*Math.PI*2; world.spawnParticle({ x:g.x, y:g.y, vx:Math.cos(a)*1.4, vy:Math.sin(a)*1.4-0.6, life:10, color:col, spark:true }); }
    if (g.kind === 'coin') { rs.gold += g.value; if (frameCount%3===0) audio.sfx('coin'); }
    else if (g.kind === 'mana') { rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} MP`, color:'#4db3ff', life:36, max:36, vy:-0.7 }); audio.sfx('pick'); }
    else if (g.kind === 'hp') { world.player.hp = Math.min(world.player.maxHp, world.player.hp + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} HP`, color:'#ff6b8a', life:36, max:36, vy:-0.7 }); audio.sfx('upgrade'); }
    else { if (frameCount%3===0) audio.sfx('pick'); if (addXp(rs, g.value*rs.stats.xpGain).leveled) onLevelGain(); }
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
    const mv = input.moveVector(world), sp = rs.stats.moveSpeed * MOVE_SCALE;
    world.player.x += mv.x * sp; world.player.y += mv.y * sp;
    // 보스 아레나: 플레이어 무한 후퇴 방지(원형 경계 안으로 제한)
    const ar = dir.getArena();
    if (ar) { const dx=world.player.x-ar.x, dy=world.player.y-ar.y, dd=Math.hypot(dx,dy);
      if (dd > ar.r) { world.player.x = ar.x + dx/dd*ar.r; world.player.y = ar.y + dy/dd*ar.r; } }
    // 스폰 + 적 이동(행동 AI)/접촉 피해 (플레이어 레벨을 넘겨 몹 능력치 동반 상향)
    dir.update(dt, world, rs.level);
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
    if (levelupDelay>0) levelupDelay--;
    comboPop *= 0.85;
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
    // 픽업: 드랍 좌표에 고정(자석 없음) → 아이템이 정적 지면 기준이 되어 이동감 살아남.
    //       획득 반경(pickupRange) 안으로 플레이어가 다가오면 수집.
    for (const g of world.pickups) { if (!g.alive) continue;
      if (Math.hypot(g.x-world.player.x, g.y-world.player.y) < rs.stats.pickupRange) { g.alive=false; collect(g); }
    }
    // 파티클/플로터 수명
    for (const pt of world.particles){ if(!pt.alive)continue;
      if (pt.spark){ pt.x+=pt.vx; pt.y+=pt.vy; pt.vx*=0.9; pt.vy*=0.9; }
      else if (pt.shock){ pt.r += (pt.rMax - pt.r) * 0.12; }
      if(--pt.life<=0) pt.alive=false; }
    for (const f of world.floaters){ if(!f.alive)continue; f.y+=f.vy; if(--f.life<=0) f.alive=false; }
    // 물약 자동 사용: HP 25% 이하 / MP 20% 이하일 때 보유분을 자동 소비
    if (rs.potions.hp > 0 && world.player.hp <= world.player.maxHp*0.25) {
      world.player.hp = Math.min(world.player.maxHp, world.player.hp + world.player.maxHp*0.5); rs.potions.hp--;
      world.spawnFloater({ x:world.player.x, y:world.player.y-26, text:'🧪 HP 물약!', color:'#ff6b8a', life:44, max:44, vy:-0.6 }); audio.sfx('upgrade');
    }
    if (rs.potions.mp > 0 && (rs.mp||0) <= rs.stats.maxMp*0.2) {
      rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + rs.stats.maxMp*0.6); rs.potions.mp--;
      world.spawnFloater({ x:world.player.x, y:world.player.y-26, text:'🔷 MP 물약!', color:'#4db3ff', life:44, max:44, vy:-0.6 }); audio.sfx('pick');
    }
    world.despawnDead();
    // 레벨업 창은 (보스 슬로우모션 + 레벨업 버스트 연출)이 끝난 뒤에 연다.
    if (pendingLevelUp && slowmo <= 0 && levelupDelay <= 0 && !overlay) { pendingLevelUp = false; openLevelUp(); }
    if (world.player.hp <= 0) gameOver();
  }

  function openLevelUp(){ audio.sfx('levelup'); overlay = { type:'levelup', choices: rollChoices(rs, rng, 3) }; }
  // 레벨업 선택지 카드 위치(그리기·클릭 공용)
  function choiceRect(i){ const bw=Math.min(540, canvas.width-64), bh=66, gap=14, y0=178;
    return { x:canvas.width/2-bw/2, y:y0+i*(bh+gap), w:bw, h:bh }; }
  function choiceSkill(c){
    if (c.kind==='passive') return { type:'passive', color:'#ffd166' };
    return getSkill(c.kind==='evolve' ? c.into : c.id) || { type:'passive', color:'#8cf' };
  }
  function selectChoice(i){
    if (!overlay || overlay.type!=='levelup' || !overlay.choices[i]) return;
    audio.sfx('upgrade'); applyChoice(rs, overlay.choices[i]); cleanupSkillState(); overlay=null;
  }
  function gameOver(){
    scene='gameover'; audio.sfx('death');
    const stage = Math.max(1, (rs.timeMs/30000|0)+1);
    meta.souls += Math.round((stage*5 + rs.timeMs/2000) * rs.stats.soulGain);
    meta.best.stage = Math.max(meta.best.stage, stage);
    meta.best.timeMs = Math.max(meta.best.timeMs, rs.timeMs);
    meta.potions = { hp: rs.potions.hp, mp: rs.potions.mp };  // 남은 물약 저장(자동 사용분 차감)
    saveMeta(meta);
  }

  function render() {
    R.clear(ctx, canvas.width, canvas.height);
    if ((scene==='run' || scene==='gameover') && world) {
      const ch = getCharacter(rs.charId);
      if (scene==='gameover') ctx.filter = 'blur(3px) brightness(0.5)';   // 게임오버: 뒷배경 흐리게
      const camX = world.player.x - canvas.width/2 + (Math.random()-0.5)*shake;
      const camY = world.player.y - canvas.height/2 + (Math.random()-0.5)*shake;
      // 바이옴 배경: 이미지(assets/bg/<id>.png)가 있으면 시차 타일, 없으면 그라디언트+그리드
      const bio = dir.biome();
      const bgImg = getImage('assets/bg/' + bio.id + '.png');
      if (bgImg) {
        // 지면은 월드 좌표에 고정(시차 1배) → 아이템·캐릭터와 같은 속도로 스크롤해 '바닥에 붙은' 느낌.
        const tw = bgImg.width, th = bgImg.height;
        const ox = -(((camX % tw) + tw) % tw), oy = -(((camY % th) + th) % th);
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
        const gx = g.x-camX, gy = g.y-camY;
        // 접지 그림자(바닥에 놓인 느낌)
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(gx, gy + g.radius*1.05, g.radius*0.95, g.radius*0.42, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
        R.neonCircle(ctx, gx, gy, g.radius, col);
        if (g.kind==='hp') R.text(ctx, '+', gx, gy+4, { color:'#3a0', size:11, align:'center', weight:'800' }); }
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
      for (const f of world.floaters) if (f.alive) {
        const age = f.max ? (f.max - f.life)/f.max : 0;
        const size = (f.crit?18:13) * Math.max(1, 1.5 - 0.5*Math.min(1, age*2.5));  // 초반 팝
        ctx.save(); ctx.font = `${f.crit?'800':'700'} ${size}px system-ui`; ctx.textAlign = 'center';
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.strokeText(f.text, f.x-camX, f.y-camY);
        ctx.fillStyle = f.color; ctx.fillText(f.text, f.x-camX, f.y-camY); ctx.restore();
      }
      drawHud(ctx, rs, world, frameCount);
      if (combo > 2) {
        const cs = 22 * (1 + comboPop*0.6);
        const cc = combo>=30?'#ff4d6d':combo>=20?'#ff6a3d':combo>=10?'#ff9f45':'#ffd166';
        ctx.save(); ctx.font = `800 ${cs}px system-ui`; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeText(`COMBO x${combo}`, canvas.width/2, 50);
        ctx.fillStyle = cc; ctx.fillText(`COMBO x${combo}`, canvas.width/2, 50); ctx.restore();
      }
      R.text(ctx, bio.name, 16, 106, { size:12, color:'#9ab' });
      R.text(ctx, input.isAutopilot()?'AUTO (P: 수동)':'수동 WASD (P: 오토)', canvas.width-16, 24, { size:12, align:'right', color:'#8aa' });
      // 우측 상단: 현재 장착 스킬 아이콘 + 레벨
      { const isz=32, pad=7, x0=canvas.width-12-isz; let idx=0;
        for (const id of Object.keys(rs.ownedSkills)) { const s=getSkill(id); if (!s) continue;
          if (s.evolveInto && rs.ownedSkills[s.evolveInto]) continue;   // 진화형 보유 시 원본 숨김(최고 단계만)
          const yy=40+idx*(isz+pad); idx++;
          drawSkillIcon(ctx, s, x0, yy, isz);
          // 쿨타임 시계: 남은 재충전을 어두운 부채꼴로(12시부터 시계방향), 다 차면 사라짐
          const st = sstate[id];
          if (st && st.cdMax && st.timer > 0) { const frac=Math.max(0,Math.min(1, st.timer/st.cdMax));
            const cx=x0+isz/2, cy=yy+isz/2, a0=-Math.PI/2;
            ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle='#000';
            ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy, isz*0.54, a0, a0+frac*Math.PI*2); ctx.closePath(); ctx.fill(); ctx.restore(); }
          ctx.save(); ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.beginPath(); ctx.arc(x0+isz-5, yy+isz-5, 9, 0, 7); ctx.fill();
          ctx.fillStyle='#fff'; ctx.font='800 11px system-ui'; ctx.textAlign='center';
          ctx.fillText(String(rs.ownedSkills[id]), x0+isz-5, yy+isz-1); ctx.restore(); } }
      const boss = dir.getBossRef();
      if (boss && boss.alive) {
        R.text(ctx, `👑 ${boss.name}`, canvas.width/2, canvas.height-46, { size:14, align:'center', color:'#ff9ee0' });
        R.bar(ctx, canvas.width/2-180, canvas.height-40, 360, 14, boss.hp/boss.maxHp, '#ff5cc8');
      }
    }
    ctx.filter = 'none';   // 이후(플래시·GAME OVER 텍스트)는 선명하게
    // 보스 처치 화면 플래시(렌더 프레임마다 감쇠 — 슬로우모션 영향 안 받음)
    if (whiteFlash > 0) { ctx.save(); ctx.globalAlpha = (whiteFlash/14)*0.6; ctx.fillStyle='#fff';
      ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore(); whiteFlash--; }
    if (goldFlash > 0) { ctx.save(); ctx.globalAlpha = (goldFlash/12)*0.32; ctx.fillStyle='#ffe14d';
      ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore(); goldFlash--; }
    if (overlay?.type==='levelup') drawLevelUp();
    if (scene==='gameover') { R.text(ctx,'GAME OVER',canvas.width/2,canvas.height/2-20,{size:44,align:'center',color:'#ff4d9d'});
      R.text(ctx,'클릭하면 다시 시작',canvas.width/2,canvas.height/2+24,{size:16,align:'center'}); }
  }
  function drawLevelUp(){
    ctx.save(); ctx.fillStyle='rgba(4,6,14,0.76)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.restore();
    ctx.save(); ctx.shadowBlur=22; ctx.shadowColor='#ffd166'; ctx.fillStyle='#ffe14d';
    ctx.font='800 30px system-ui'; ctx.textAlign='center'; ctx.fillText('⬆ LEVEL UP', canvas.width/2, 112); ctx.restore();
    R.text(ctx,'스킬을 클릭하거나 1 / 2 / 3 키로 선택',canvas.width/2,142,{size:13,align:'center',color:'#9fb'});
    overlay.choices.forEach((c,i)=>{
      const R0=choiceRect(i), isEvo=c.kind==='evolve';
      ctx.save(); ctx.fillStyle=isEvo?'rgba(255,225,77,0.12)':'rgba(20,28,48,0.92)';
      ctx.strokeStyle=isEvo?'#ffe14d':'rgba(120,150,200,0.5)'; ctx.lineWidth=1.8;
      roundRect(ctx, R0.x, R0.y, R0.w, R0.h, 10); ctx.fill(); ctx.stroke(); ctx.restore();
      const isz=R0.h-16; drawSkillIcon(ctx, choiceSkill(c), R0.x+10, R0.y+8, isz);
      R.text(ctx, `${i+1}`, R0.x+R0.w-18, R0.y+24, { size:14, align:'center', color:'#7fa', weight:'800' });
      R.text(ctx, c.label, R0.x+isz+24, R0.y+R0.h/2+6, { size:16, align:'left', color:isEvo?'#ffe14d':'#eaf2ff', weight:'700' });
    });
  }

  addEventListener('keydown', e => {
    if (overlay?.type==='levelup') { const i='123'.indexOf(e.key); if (i>=0) selectChoice(i); }
  });
  canvas.addEventListener('pointerdown', (e) => {
    if (scene==='gameover') { toTitle(); return; }
    if (overlay?.type==='levelup') {
      const rct = canvas.getBoundingClientRect();
      const px=(e.clientX-rct.left)*canvas.width/rct.width, py=(e.clientY-rct.top)*canvas.height/rct.height;
      for (let i=0;i<overlay.choices.length;i++){ const R0=choiceRect(i);
        if (px>=R0.x && px<=R0.x+R0.w && py>=R0.y && py<=R0.y+R0.h) { selectChoice(i); break; } }
    }
  });

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
