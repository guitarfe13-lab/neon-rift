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
import { getSkill, SKILLS, EVOLUTIONS } from './data/skills.js';
import { updateSkills, updateProjectiles } from './systems/skills.js';
import { addXp, rollChoices, applyChoice } from './systems/levelup.js';
import { makeInput } from './core/input.js';
import { makeAudio } from './core/audio.js';
import { drawHud } from './ui/hud.js';
import { showTitle, showLoadout, showMetaShop, showSettings, clearScreens } from './ui/screens.js';
import { drawSprite } from './ui/sprites.js';
import { drawSkillIcon, roundRect } from './ui/skillIcons.js';
import { getImage, getSprite, preload } from './ui/assets.js';
import * as FX from './ui/fx.js';
import * as R from './ui/render.js';

// #rrggbb → rgba(a)
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }

// 엔티티 렌더: 이미지 에셋(assets/sprites/<id>.png)이 있으면 그걸로, 없으면 코드 스프라이트로.
// 크기 확대 + 접지 그림자 + 은은한 네온 글로우로 '떠 있는 느낌' 제거.
function drawEntity(ctx, ent, x, y, r, color, t, angle, flash, live) {
  live = live || ent;
  let img = null, frame = null;
  if (ent.sheet) {   // 스프라이트시트 애니메이션(<id>_sheet, 4열×3행 등)
    const si = getSprite('assets/sprites/' + ent.id + '_sheet');
    if (si) { const sh = ent.sheet;
      const anim = (live._atk > 0 && sh.anims.attack) ? sh.anims.attack : (sh.anims.idle || [0]);
      const per = Math.max(1, Math.round(60 / (sh.fps || 8)));
      const idx = anim[Math.floor(t / per) % anim.length];
      const fw = si.width / sh.cols, fh = si.height / sh.rows;
      img = si; frame = { sx:(idx % sh.cols)*fw, sy:Math.floor(idx / sh.cols)*fh, fw, fh, scale: sh.scale||1 }; }
  }
  if (!img) img = getSprite('assets/sprites/' + ent.id);
  if (img) {
    const iw = frame ? frame.fw : img.width, ih = frame ? frame.fh : img.height;
    const sc = 4.6 * (ent.spriteScale || 1) * (frame ? frame.scale : 1); // 엔티티별 배율
    const w = r * sc, h = w * (ih / iw || 1);
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
    if (flash) { ctx.shadowBlur = 24; ctx.shadowColor = flash === true ? '#fff' : flash; }   // true=피격 흰색, 문자열=지정 색(빈사 등)
    if (frame) ctx.drawImage(img, frame.sx, frame.sy, frame.fw, frame.fh, -w / 2, foot - h, w, h);
    else ctx.drawImage(img, -w / 2, foot - h, w, h);
    ctx.restore();
  } else {
    // 동적 시인성: 일반 몹=이동 맥동, 네모 몹=회전 추가, 중간보스(악시온)=큰 맥동. 개체별 위상차로 동기화 방지.
    if (ent._ph === undefined) ent._ph = Math.random() * 6.283;
    let rr = r, rot = 0;
    if (ent.miniboss) rr = r * (1 + 0.09 * Math.sin(t * 0.07 + ent._ph));                       // 살짝 줄었다 커졌다
    else if (ent.hp != null && !ent.boss) {                                                     // 일반 몹(플레이어 제외)
      rr = r * (1 + 0.05 * Math.sin(t * 0.1 + ent._ph));                                        // 이동 맥동
      if (ent.shape === 'square') rot = t * 0.025 + ent._ph;                                    // 네모: 회전 추가
    }
    if (rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); drawSprite(ctx, ent.sprite, 0, 0, rr, color, t, angle); ctx.restore(); }
    else drawSprite(ctx, ent.sprite, x, y, rr, color, t, angle);
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
  // 우측 하단 소리 끄기/켜기 버튼(모든 화면 위에 상시 표시)
  const muteBtn = document.createElement('button');
  muteBtn.className = 'mute-btn'; muteBtn.title = '소리 끄기/켜기 (M)';
  const syncMute = () => { muteBtn.textContent = meta.settings.muted ? '🔇' : '🔊'; };
  const toggleMute = () => { meta.settings.muted = !meta.settings.muted; audio.setVolumes(meta.settings); saveMeta(meta); syncMute(); };
  syncMute(); muteBtn.onclick = toggleMute;
  document.getElementById('app').appendChild(muteBtn);
  addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'm') toggleMute(); });
  // 이미지 에셋 미리 로드(있으면 사용, 없으면 코드 스프라이트 유지)
  preload([
    ...Object.keys(CHARACTERS).map((id) => `assets/sprites/${id}.png`),
    ...Object.keys(ENEMIES).map((id) => `assets/sprites/${id}.png`),
    ...Object.keys(BOSSES).map((id) => `assets/sprites/${id}.png`),
    ...BIOMES.map((b) => `assets/bg/${b.id}.png`),
  ]);
  let scene = 'title', overlay = null, world, rs, dir, rng, sstate, frameCount = 0;
  let shake = 0, combo = 0, comboTimer = 0, slowmo = 0, whiteFlash = 0, pendingLevelUp = false;
  let announce = null, lastBoss = null;   // 보스 출현 중앙 경고 배너 {text,color,life,max}
  let levelupDelay = 0, goldFlash = 0, comboPop = 0;
  let autoPotion = meta.settings.autoPotion !== false;   // 물약 자동 사용(O 키/설정 토글)

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
    rs.potCd = { hp: 0, mp: 0 };                                            // 물약 쿨타임(30s, 스킬처럼)
    rs.oaths = meta.relics?.oath || 0;                                      // 신성의 맹세(부활) 반입
    rs.projShape = ch.projShape || null;                                    // 직업 기본 투사체 모양(궁수=화살, 검사=검기)
    dir = makeDirector(rng, BIOMES);
    sstate = {}; scene = 'run'; overlay = null;
    announce = null; lastBoss = null;
  }

  // 중앙 피해 처리: 스킬 데미지 × 공격력 배수 × (MP·편차) → 콤보에 따라 크리 확률↑.
  function damageEnemy(e, skillDmg, element) {
    e.hitStreak = (e.hitStreak || 0) + 1; e.hitTimer = 90;   // 연속 피격 스트릭(1.5s 창)
    // 크리 억제(밸런스): 상한 55%, 콤보/집중타격 계수 하향 + 집중타격 기여 상한 20%. 크리는 보너스이지 기본이 아니게.
    const critChance = Math.min(0.55, (rs.stats.crit || 0) + combo * 0.004 + Math.min(0.2, (e.hitStreak - 1) * 0.012));
    const crit = Math.random() < critChance;
    const mpBonus = 1 + ((rs.mp || 0) / (rs.stats.maxMp || 1)) * 0.05;        // MP 높을수록 소폭↑
    let d = skillDmg * (rs.stats.damage / rs.baseDamage) * mpBonus * (0.88 + Math.random() * 0.24); // ±12% 편차(각도/변동)
    if (crit) d *= (rs.stats.critMult || 1.55);
    d = Math.max(1, Math.round(d));
    const res = applyHit(e, d);
    e.flash = 6;
    if (world.particles.length < 600) FX.spawnImpact(world, e.x, e.y, element || 'physical', crit);   // 원소별 명중 이펙트
    if (crit || world.floaters.length < 120)   // 성능: 텍스트 폭주 방지(크리는 항상 표시)
      world.spawnFloater({ x:e.x, y:e.y-10, text: crit ? `Critical -${d}` : `-${d}`, color: crit?'#ffe14d':'#fff', life: crit?54:40, max: crit?54:40, vy:-0.7, crit });
    if (crit && frameCount % 3 === 0) audio.sfx('crit');
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

  // 처치 드랍: 몬스터별 드롭률(e.drop). 보스는 대량 + 히든 스킬 확률.
  function spawnDrops(e) {
    const j = () => (rng.next()-0.5)*18;
    const gold = Math.round(e.gold * rs.stats.goldGain);
    const dr = e.drop || {};
    world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'xp',   value:e.xp, radius:6 });
    // 코인: 절반 확률로 2배 값 하나(기대 골드 동일, 바닥 아이템 수 절반 → 산만함 감소)
    if (rng.next() < 0.5) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'coin', value:gold*2, radius:6 });
    // 추가 코인(탱커/광폭체 등 + 엘리트)
    const extraCoins = (dr.coins || 0) + (e.elite ? 2 : 0);
    for (let i=0;i<extraCoins;i++) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'coin', value:gold, radius:6 });
    // 마나/HP: 몬스터별 확률(기본값 하향 — 바닥 정리)
    if (e.boss || rng.next() < (dr.mana ?? 0.12)) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'mana', value: e.boss?70:(6+Math.floor(rng.next()*7)), radius:6 });
    if (e.boss || rng.next() < (dr.hp ?? 0.03))  world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'hp',   value: e.boss?70:(14+Math.floor(rng.next()*12)), radius:7 });
    // 보스: 대량 드롭
    if (e.boss) {
      for (let i=0;i<8;i++) world.spawnPickup({ x:e.x+j()*3, y:e.y+j()*3, kind:'coin', value:gold, radius:6 });
      for (let i=0;i<2;i++) world.spawnPickup({ x:e.x+j()*3, y:e.y+j()*3, kind:'mana', value:60, radius:6 });
    }
    // 히든 스킬: 보스 전용 드랍(8%). 일반 몹·엘리트는 드랍하지 않는다.
    if (e.boss && rng.next() < 0.08) world.spawnPickup({ x:e.x+j(), y:e.y+j(), kind:'skill', value:1, radius:9 });
  }
  // 히든 스킬 획득: 직업 풀과 무관한 무작위 미보유 스킬을 즉시 부여(= 히든).
  function grantHiddenSkill() {
    const owned = rs.ownedSkills; const p = world.player;
    audio.sfx('levelup'); goldFlash = 16;
    world.spawnParticle({ x:p.x, y:p.y, r:14, rMax:120, life:28, color:'#ff8cff', shock:true });
    const cands = Object.keys(SKILLS).filter(id => !owned[id] && !EVOLUTIONS.has(id) && !(SKILLS[id].evolveInto && owned[SKILLS[id].evolveInto]));
    if (!cands.length) { world.spawnFloater({ x:p.x, y:p.y-30, text:'✦ 히든 스킬 (모두 보유)', color:'#ff9cff', life:56, max:56, vy:-0.5, crit:true }); return; }
    const id = cands[Math.floor(rng.next()*cands.length)]; owned[id] = 1;
    world.spawnFloater({ x:p.x, y:p.y-30, text:`✦ 히든 스킬: ${SKILLS[id].name}`, color:'#ff9cff', life:64, max:64, vy:-0.4, crit:true });
  }

  // 픽업 획득 효과
  const PICK_COLOR = { coin:'#ffd54a', mana:'#4db3ff', hp:'#ff6b8a', xp:'#7cff6b', skill:'#ff8cff' };
  function collect(g) {
    // 획득 팝(작은 스파크)
    const col = PICK_COLOR[g.kind] || '#7cff6b';
    for (let i=0;i<3;i++){ const a=Math.random()*Math.PI*2; world.spawnParticle({ x:g.x, y:g.y, vx:Math.cos(a)*1.4, vy:Math.sin(a)*1.4-0.6, life:10, color:col, spark:true }); }
    if (g.kind === 'coin') { rs.gold += g.value; if (frameCount%3===0) audio.sfx('coin'); }
    else if (g.kind === 'mana') { rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} MP`, color:'#4db3ff', life:36, max:36, vy:-0.7 }); audio.sfx('pick'); }
    else if (g.kind === 'hp') { world.player.hp = Math.min(world.player.maxHp, world.player.hp + g.value);
      world.spawnFloater({ x:world.player.x, y:world.player.y-22, text:`+${g.value} HP`, color:'#ff6b8a', life:36, max:36, vy:-0.7 }); audio.sfx('upgrade'); }
    else if (g.kind === 'skill') { grantHiddenSkill(); }
    else { if (frameCount%3===0) audio.sfx('pick'); if (addXp(rs, g.value*rs.stats.xpGain).leveled) onLevelGain(); }
  }

  // 플레이어 피격(적 크리 가능, 연속 피격 시 크리 확률↑). raw = 적 피해 × 0.1.
  function hurtPlayer(raw) {
    if ((world.player.invuln || 0) > 0) return;
    const p = world.player;
    p.hurtStreak = (p.hurtStreak || 0) + 1; p.hurtTimer = 120;   // 연속 피격 스트릭(2s 창)
    const critChance = Math.min(0.7, 0.1 + (p.hurtStreak - 1) * 0.03);   // 연속으로 맞을수록↑
    const crit = Math.random() < critChance;
    const d = raw * (crit ? 1.6 : 1);
    p.hp -= d; p.invuln = 8;
    shake = Math.min(14, shake + (crit ? 9 : 6)); audio.sfx('hurt');
    const shown = Math.max(1, Math.round(d));
    world.spawnFloater({ x:p.x, y:p.y-22, text: crit ? `Critical -${shown}` : `-${shown}`,
      color: crit ? '#ff3b3b' : '#ff9a9a', life: crit?52:34, max: crit?52:34, vy:-0.7, crit });
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
    // 좌우 반전은 사람처럼: 반대 방향 이동이 15프레임(0.25s) 유지될 때만 전환(자동조작 잔떨림 방지)
    if (mv.x) {
      const want = mv.x < 0 ? Math.PI : 0;
      if (want === (world.player.face || 0)) world.player._faceT = 0;
      else if ((world.player._faceT = (world.player._faceT || 0) + 1) >= 15) { world.player.face = want; world.player._faceT = 0; }
    }
    if (world.player._atk > 0) world.player._atk--;                      // 공격 애니메이션 타이머
    // 보스 아레나: 플레이어 무한 후퇴 방지(원형 경계 안으로 제한)
    const ar = dir.getArena();
    if (ar) { const dx=world.player.x-ar.x, dy=world.player.y-ar.y, dd=Math.hypot(dx,dy);
      if (dd > ar.r) { world.player.x = ar.x + dx/dd*ar.r; world.player.y = ar.y + dy/dd*ar.r; } }
    // 스폰 + 적 이동(행동 AI)/접촉 피해 (플레이어 레벨을 넘겨 몹 능력치 동반 상향)
    dir.update(dt, world, rs.level);
    // 보스 출현 감지 → 화면 중앙 대형 경고 배너(위협감·경고)
    { const bref = dir.getBossRef();
      if (bref && bref !== lastBoss) { announce = { text: `${bref.name} 출현!`, color: bref.color || '#ff5cc8', life: 170, max: 170 }; audio.sfx('boss'); shake = Math.min(14, shake + 8); }
      lastBoss = bref; }
    for (const e of world.enemies) { if (!e.alive) continue;
      if (e._orbCd > 0) e._orbCd--;
      if (e.flash > 0) e.flash--;
      if (e.hitTimer > 0 && --e.hitTimer === 0) e.hitStreak = 0;   // 연속 피격 스트릭 소멸
      stepEnemy(e, world, rng);
      if (ar && e.boss) { const dx=e.x-ar.x, dy=e.y-ar.y, dd=Math.hypot(dx,dy);
        if (dd > ar.r+70) { e.x=ar.x+dx/dd*(ar.r+70); e.y=ar.y+dy/dd*(ar.r+70); } }
      if (Math.hypot(e.x-world.player.x, e.y-world.player.y) < e.radius+world.player.radius) hurtPlayer(e.damage*0.1);
    }
    if (world.player.invuln>0) world.player.invuln--;
    if (world.player.hurtTimer > 0 && --world.player.hurtTimer === 0) world.player.hurtStreak = 0; // 연속 피격 스트릭 소멸
    if (comboTimer>0) comboTimer--; else combo=0;
    if (levelupDelay>0) levelupDelay--;
    comboPop *= 0.85;
    shake *= 0.86; if (shake < 0.2) shake = 0;
    // 적 투사체(hazard) 이동/플레이어 피격
    for (const hz of world.hazards) { if (!hz.alive) continue;
      hz.x += hz.vx; hz.y += hz.vy; if (--hz.life <= 0) { hz.alive=false; continue; }
      if (Math.hypot(hz.x-world.player.x, hz.y-world.player.y) < hz.radius+world.player.radius) { hurtPlayer(hz.damage*0.1); hz.alive=false; }
    }
    // 스킬 실행 + 투사체 이동 (발사 시 슛 사운드, 과다 방지 스로틀)
    updateSkills(world, rs, rng, sstate, damageEnemy, () => { world.player._atk = 14; if (frameCount % 5 === 0) audio.sfx('shoot'); });
    updateProjectiles(world);
    // 투사체 트레일(직선 투사체만, 저빈도)
    if (frameCount % 2 === 0 && world.particles.length < 550) {
      for (const p of world.projectiles) { if (p.alive && !p.orbit && !p.beam) FX.spawnTrail(world, p.x, p.y, p.color, p.element); }
    }
    // 투사체-적 충돌
    for (const p of world.projectiles) { if (!p.alive || p.dmg<=0) continue;
      for (const e of world.enemies) { if (!e.alive) continue;
        if (Math.hypot(p.x-e.x, p.y-e.y) < p.radius+e.radius) {
          if (p.orbit) { if ((e._orbCd||0)>0) continue; damageEnemy(e, p.dmg, p.element); e._orbCd = 12; }
          else { damageEnemy(e, p.dmg, p.element); if (p.pierce>0) p.pierce--; else { p.alive=false; break; } }
        }
      }
    }
    // MP 재생
    rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + rs.stats.mpRegen);
    // 픽업: 드랍 좌표에 고정(자석 없음) → 아이템이 정적 지면 기준이 되어 이동감 살아남.
    //       획득 반경(pickupRange) 안으로 플레이어가 다가오면 수집.
    // 성능: TTL(60s, 히든스킬 120s)로 소멸 + 총량 상한(오래된 것부터 정리) → 장기전 누적 방지.
    let pkAlive = 0;
    for (const g of world.pickups) { if (!g.alive) continue;
      if (g.ttl == null) g.ttl = g.kind === 'skill' ? 7200 : 3600;
      if (--g.ttl <= 0) { g.alive = false; continue; }
      pkAlive++;
      if (Math.hypot(g.x-world.player.x, g.y-world.player.y) < rs.stats.pickupRange) { g.alive=false; collect(g); }
    }
    if (pkAlive > 400) for (const g of world.pickups) {           // 상한 초과 → 오래된 것부터(히든스킬 제외)
      if (g.alive && g.kind !== 'skill') { g.alive = false; if (--pkAlive <= 400) break; }
    }
    // 파티클/플로터 수명
    for (const pt of world.particles){ if(!pt.alive)continue; if(!FX.stepParticle(pt)) pt.alive=false; }
    for (const f of world.floaters){ if(!f.alive)continue; f.y+=f.vy; if(--f.life<=0) f.alive=false; }
    // 물약 자동 사용(옵션 ON): HP 25% 이하 / MP 20% 이하일 때 보유분을 자동 소비.
    // 종류별 30초 쿨타임(스킬처럼) — 연속 벌컥벌컥 방지, HUD에 남은 시간 표시.
    const POTION_CD_HP = 600, POTION_CD_MP = 1200;   // HP 10s / MP 20s(60fps) — 유리몸 캐릭터 생존 배려
    if (rs.potCd.hp > 0) rs.potCd.hp--;
    if (rs.potCd.mp > 0) rs.potCd.mp--;
    if (autoPotion && rs.potCd.hp <= 0 && rs.potions.hp > 0 && world.player.hp <= world.player.maxHp*0.25) {
      world.player.hp = Math.min(world.player.maxHp, world.player.hp + world.player.maxHp*0.5); rs.potions.hp--; rs.potCd.hp = POTION_CD_HP;
      world.spawnFloater({ x:world.player.x, y:world.player.y-26, text:'🧪 HP 물약!', color:'#ff6b8a', life:44, max:44, vy:-0.6 }); audio.sfx('upgrade');
    }
    if (autoPotion && rs.potCd.mp <= 0 && rs.potions.mp > 0 && (rs.mp||0) <= rs.stats.maxMp*0.2) {
      rs.mp = Math.min(rs.stats.maxMp, (rs.mp||0) + rs.stats.maxMp*0.6); rs.potions.mp--; rs.potCd.mp = POTION_CD_MP;
      world.spawnFloater({ x:world.player.x, y:world.player.y-26, text:'🔷 MP 물약!', color:'#4db3ff', life:44, max:44, vy:-0.6 }); audio.sfx('pick');
    }
    world.despawnDead();
    // 레벨업 창은 (보스 슬로우모션 + 레벨업 버스트 연출)이 끝난 뒤에 연다.
    if (pendingLevelUp && slowmo <= 0 && levelupDelay <= 0 && !overlay) { pendingLevelUp = false; openLevelUp(); }
    if (world.player.hp <= 0) { if (rs.oaths > 0) reviveWithOath(); else gameOver(); }
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
  // 신성의 맹세 발동: 레벨·스킬·골드 등 진행 상태 그대로, 그 자리에서 부활(HP 50% + 2s 무적).
  function reviveWithOath(){
    rs.oaths--;
    meta.relics = meta.relics || { oath: 0 }; meta.relics.oath = rs.oaths; saveMeta(meta);   // 소모 즉시 저장(중복 사용 방지)
    world.player.hp = Math.round(world.player.maxHp * 0.5);
    world.player.invuln = 120;
    world.hazards.length = 0;                                              // 주변 탄막 소거(부활 즉사 방지)
    const p = world.player;
    for (const e of world.enemies) if (e.alive && !e.boss && Math.hypot(e.x-p.x, e.y-p.y) < 140) e.hp = 0;  // 밀착 몹 정리
    for (let i=0;i<3;i++) world.spawnParticle({ x:p.x, y:p.y, r:10+i*8, rMax:120+i*40, life:22+i*4, color: i===1?'#fff':'#ffe58a', shock:true });
    world.spawnFloater({ x:p.x, y:p.y-40, text:'✝ 신성의 맹세 발동!', color:'#ffe58a', life:80, max:80, vy:-0.3, crit:true });
    goldFlash = 18; audio.sfx('levelup');
  }
  function gameOver(){
    scene='gameover'; audio.sfx('death');
    world.particles.length = 0; world.floaters.length = 0; world.hazards.length = 0;   // 잔여 이펙트 정리(성능)
    const stage = Math.max(1, (rs.timeMs/30000|0)+1);
    meta.souls += Math.round((stage*5 + rs.timeMs/2000) * rs.stats.soulGain);
    meta.gold = (meta.gold || 0) + rs.gold;   // 런에서 모은 황금코인을 영구 적립(상점에서 소울로 교환)
    meta.best.stage = Math.max(meta.best.stage, stage);
    meta.best.timeMs = Math.max(meta.best.timeMs, rs.timeMs);
    meta.potions = { hp: rs.potions.hp, mp: rs.potions.mp };  // 남은 물약 저장(자동 사용분 차감)
    meta.relics = { ...(meta.relics || {}), oath: rs.oaths || 0 };  // 남은 신성의 맹세 저장
    saveMeta(meta);
  }

  // 상태별 BGM: 런 중엔 바이옴별(track1~3), 보스전엔 track5, 그 외(메뉴)엔 track4.
  function updateBgm() {
    let want = 'track4.mp3';
    if (scene==='run' && world && dir) want = dir.getBossRef() ? 'boss.mp3' : `track${(dir.biomeIndex()%3)+1}.mp3`;
    audio.setBgm(want);
  }

  function render() {
    R.clear(ctx, canvas.width, canvas.height);
    updateBgm();
    if ((scene==='run' || scene==='gameover') && world) {
      const ch = getCharacter(rs.charId);
      if (scene==='gameover') ctx.filter = 'blur(3px) brightness(0.5)';   // 게임오버: 뒷배경 흐리게
      const camX = world.player.x - canvas.width/2 + (Math.random()-0.5)*shake;
      const camY = world.player.y - canvas.height/2 + (Math.random()-0.5)*shake;
      // 바이옴 배경: 이미지(assets/bg/<id>.png)가 있으면 시차 타일, 없으면 그라디언트+그리드
      const bio = dir.biome();
      const bgImg = getSprite('assets/bg/' + bio.id);
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
      // 화면 밖 컬링(성능): 뷰포트 + 여백 밖이면 그리지 않는다.
      const inView = (wx, wy, m) => { const sx = wx-camX, sy = wy-camY; return sx > -m && sx < canvas.width+m && sy > -m && sy < canvas.height+m; };
      // 파티클(트레일/스파크/충격파/볼트/링) — fx 모듈이 렌더
      for (const pt of world.particles) if (pt.alive && inView(pt.x ?? pt.x1, pt.y ?? pt.y1, 80)) FX.drawParticle(ctx, pt, camX, camY);
      for (const g of world.pickups) if (g.alive && inView(g.x, g.y, 40)) {
        const gx = g.x-camX, gy = g.y-camY;
        // 접지 그림자(바닥에 놓인 느낌)
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(gx, gy + g.radius*1.05, g.radius*0.95, g.radius*0.42, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
        // 종류별 형태: 코인=골드코인, HP=하트, 마나=파란 보석, XP=초록 보석, 히든스킬=맥동 마젠타
        if (g.kind==='coin') R.coin(ctx, gx, gy, g.radius);
        else if (g.kind==='hp') R.heart(ctx, gx, gy-1, g.radius, '#ff6b8a');
        else if (g.kind==='mana') R.gem(ctx, gx, gy, g.radius, '#4db3ff');
        else if (g.kind==='skill') { const pr=g.radius*(1.1+0.22*Math.sin(frameCount*0.15));
          R.gem(ctx, gx, gy, pr, '#ff8cff'); R.text(ctx, '✦', gx, gy+4, { size:11, align:'center', color:'#fff', weight:'800' }); }
        else R.gem(ctx, gx, gy, g.radius, '#7cff6b'); }
      for (const hz of world.hazards) if (hz.alive && inView(hz.x, hz.y, 40)) R.neonCircle(ctx, hz.x-camX, hz.y-camY, hz.radius, hz.color||'#ff5c5c');
      for (const e of world.enemies) { if (!e.alive || !inView(e.x, e.y, 160)) continue;
        // 보스 빈사(HP 20% 이하): 붉은색 점멸(본체 색 + 붉은 글로우)
        const dying = e.boss && e.hp <= e.maxHp*0.2 && (frameCount>>3)%2===0;
        drawEntity(ctx, e, e.x-camX, e.y-camY, e.radius, e.flash>0?'#ffffff':(dying?'#ff2a2a':e.color), frameCount, Math.atan2(world.player.y-e.y, world.player.x-e.x), e.flash>0 ? true : (dying ? '#ff2a2a' : false));
        // 머리 위 HP 바(피격으로 hp<maxHp일 때, 보스 제외 — 보스는 하단 바). 중간보스는 몸체에 가깝게.
        const headOff = e.miniboss ? 1.6 : 2.8;
        if (!e.boss && e.hp < e.maxHp) {
          const bw = Math.max(22, e.radius*2.2), bh = 4, bx = e.x-camX-bw/2, by = e.y-camY - e.radius*headOff - 6;
          ctx.save(); ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(bx-1, by-1, bw+2, bh+2); ctx.restore();
          R.bar(ctx, bx, by, bw, bh, e.hp/e.maxHp, '#ff4d6d');
        }
        // 머리 위 이름표: 보스=붉은색, 중간보스=노란색 (검은 외곽선으로 가독성)
        if (e.boss || e.miniboss) {
          const nx = e.x-camX, ny = e.y-camY - e.radius*headOff - (e.miniboss ? 12 : 4);
          ctx.save(); ctx.font = '800 12px system-ui'; ctx.textAlign = 'center';
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(e.name, nx, ny);
          ctx.fillStyle = e.boss ? '#ff5c5c' : '#ffe14d'; ctx.fillText(e.name, nx, ny); ctx.restore();
        } }
      for (const p of world.projectiles) { if (!p.alive) continue;
        if (p.beam) { const n=Math.hypot(p.vx,p.vy)||1, ux=p.vx/n, uy=p.vy/n;
          const ax=p.x-camX, ay=p.y-camY, bx=p.x-ux*p.len-camX, by=p.y-uy*p.len-camY;
          if (p.pshape === 'rail') {   // 레일건: 전자기 쌍레일 + 흰 탄체(슬러그) + 뾰족 탄두 — 레이저와 구분
            const px=-uy, py=ux, off=p.radius*0.95;
            ctx.save(); ctx.globalAlpha=0.8;
            R.neonLine(ctx, ax+px*off, ay+py*off, bx+px*off, by+py*off, 1.5, p.color||'#a0f0ff');   // 상단 레일
            R.neonLine(ctx, ax-px*off, ay-py*off, bx-px*off, by-py*off, 1.5, p.color||'#a0f0ff');   // 하단 레일
            ctx.restore();
            const mx=ax-ux*p.len*0.38, my=ay-uy*p.len*0.38;
            R.neonLine(ctx, ax, ay, mx, my, p.radius*1.15, '#ffffff');                              // 탄체(앞쪽 굵은 코어)
            R.lance(ctx, ax, ay, Math.atan2(uy,ux), p.radius*1.1, p.color||'#a0f0ff');              // 뾰족 탄두
          } else {
            // 슬림 레이저: 얇은 글로우 + 가는 흰 코어(화살과 구분). 판정(radius)은 그대로.
            ctx.save(); ctx.globalAlpha=0.35; R.neonLine(ctx, ax,ay,bx,by, p.radius*1.4, p.color||'#7cf9ff'); ctx.restore(); // 글로우
            R.neonLine(ctx, ax,ay,bx,by, Math.max(1.6, p.radius*0.4), '#ffffff'); } }                                        // 코어
        else if (p.pshape === 'lance' && (p.vx || p.vy))   // 창 계열: 진행 방향 뾰족한 창촉
          R.lance(ctx, p.x-camX, p.y-camY, Math.atan2(p.vy, p.vx), p.radius, p.color||'#a9e8ff');
        else if (p.pshape === 'arrow' && (p.vx || p.vy))   // 화살 계열: 샤프트+촉+깃
          R.arrow(ctx, p.x-camX, p.y-camY, Math.atan2(p.vy, p.vx), p.radius, p.color||'#c98bff');
        else if (p.pshape === 'slash' && (p.vx || p.vy))   // 검기: 초승달 참격파
          R.slash(ctx, p.x-camX, p.y-camY, Math.atan2(p.vy, p.vx), p.radius, p.color||'#42e6ff');
        // 궤도/드론 스킬: 이름에 맞는 전용 모양
        else if (p.pshape === 'blade')   R.bladeOrb(ctx, p.x-camX, p.y-camY, (p.oa||0) + Math.PI/2, p.radius, p.color);        // 회전 검(궤도 접선 방향)
        else if (p.pshape === 'saw')     R.sawOrb(ctx, p.x-camX, p.y-camY, frameCount*0.45, p.radius, p.color);                 // 톱날(고속 자전)
        else if (p.pshape === 'crystal') R.crystalOrb(ctx, p.x-camX, p.y-camY, (p.oa||0), p.radius, p.color);                   // 얼음 결정(바깥 지향)
        else if (p.pshape === 'turret')  R.turretOrb(ctx, p.x-camX, p.y-camY, p._aim ?? ((p.oa||0)+Math.PI/2), p.radius, p.color); // 포탑(조준 포신)
        else if (p.pshape === 'wisp')    R.wispOrb(ctx, p.x-camX, p.y-camY, frameCount, p.radius, p.color);                     // 정령 위습(맥동)
        else R.neonCircle(ctx, p.x-camX, p.y-camY, p.radius, p.color||'#ffe14d'); }
      // 플레이어(피격 무적 중 깜빡임)
      if (!(world.player.invuln>0 && frameCount%6<3))
        drawEntity(ctx, ch, world.player.x-camX, world.player.y-camY, world.player.radius, ch.color, frameCount, world.player.face||0, false, world.player);
      for (const f of world.floaters) if (f.alive && inView(f.x, f.y, 60)) {
        const age = f.max ? (f.max - f.life)/f.max : 0;
        const size = (f.crit?28:13) * Math.max(1, 1.5 - 0.5*Math.min(1, age*2.5));  // 초반 팝(크리 크게)
        ctx.save(); ctx.font = `${f.crit?'800':'700'} ${size}px system-ui`; ctx.textAlign = 'center';
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.strokeText(f.text, f.x-camX, f.y-camY);
        ctx.fillStyle = f.color; ctx.fillText(f.text, f.x-camX, f.y-camY); ctx.restore();
      }
      drawHud(ctx, rs, world, frameCount, meta.souls);
      // 상단 중앙: 필드명(위) → 콤보(아래) 순으로 배치(겹침 방지)
      R.text(ctx, `— ${bio.name} —`, canvas.width/2, 28, { size:13, align:'center', color:'#9ab' });
      if (combo > 2) {
        const cs = 22 * (1 + comboPop*0.6);
        const cc = combo>=30?'#ff4d6d':combo>=20?'#ff6a3d':combo>=10?'#ff9f45':'#ffd166';
        ctx.save(); ctx.font = `800 ${cs}px system-ui`; ctx.textAlign = 'center';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeText(`COMBO x${combo}`, canvas.width/2, 58);
        ctx.fillStyle = cc; ctx.fillText(`COMBO x${combo}`, canvas.width/2, 58); ctx.restore();
      }
      // 우측 상단: AUTO(이동) + 물약자동 토글
      R.text(ctx, input.isAutopilot()?'AUTO 이동 (P)':'수동 이동 (P)', canvas.width-16, 20, { size:12, align:'right', color: input.isAutopilot()?'#8effc7':'#8aa' });
      R.text(ctx, autoPotion?'물약자동 ON (O)':'물약자동 OFF (O)', canvas.width-16, 38, { size:12, align:'right', color: autoPotion?'#ffb3c0':'#889' });
      // 우측 상단: 현재 장착 스킬 아이콘 + 레벨
      { const isz=32, pad=7, x0=canvas.width-12-isz; let idx=0;
        for (const id of Object.keys(rs.ownedSkills)) { const s=getSkill(id); if (!s) continue;
          if (s.evolveInto && rs.ownedSkills[s.evolveInto]) continue;   // 진화형 보유 시 원본 숨김(최고 단계만)
          const yy=60+idx*(isz+pad); idx++;
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
        const bx = canvas.width/2-180, by = canvas.height-40, bw = 360, bh = 14;
        const bossDying = boss.hp <= boss.maxHp*0.2 && (frameCount>>3)%2===0;   // 빈사: 붉은 점멸
        R.text(ctx, `👑 ${boss.name}`, canvas.width/2, canvas.height-46, { size:14, align:'center', color: bossDying?'#ff5c5c':'#ff9ee0' });
        R.bar(ctx, bx, by, bw, bh, boss.hp/boss.maxHp, bossDying?'#ff2a2a':'#ff5cc8');
        // 보스 스킬 시전 시 HP 바 상단에 스킬명 표시(끝에 페이드아웃)
        if (boss._skillName && boss._skillNameT > 0) {
          ctx.save(); ctx.globalAlpha = Math.min(1, boss._skillNameT / 22);
          R.text(ctx, `✦ ${boss._skillName} ✦`, canvas.width/2, canvas.height-66, { size:17, align:'center', color:'#ffcf3d', weight:'800' });
          ctx.restore();
        }
        // 보스 초상: HP 바 앞(좌측) 구형 원 안에 보스 이미지(없으면 코드 스프라이트)
        const pr = 22, pcx = bx - pr - 8, pcy = by + bh/2;
        ctx.save();
        ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.shadowColor = '#ff5cc8'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
        ctx.save(); ctx.beginPath(); ctx.arc(pcx, pcy, pr-2, 0, Math.PI*2); ctx.clip();
        const bi = getSprite('assets/sprites/' + boss.id);
        if (bi) { const sc = Math.max((pr-2)*2/bi.width, (pr-2)*2/bi.height), iw = bi.width*sc, ih = bi.height*sc;
          ctx.drawImage(bi, pcx-iw/2, pcy-ih/2, iw, ih); }
        else drawSprite(ctx, boss.sprite, pcx, pcy, pr-5, boss.color, frameCount, 0);
        ctx.restore();
        ctx.beginPath(); ctx.arc(pcx, pcy, pr, 0, Math.PI*2); ctx.lineWidth = 2.5; ctx.strokeStyle = '#ff9ee0'; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.filter = 'none';   // 이후(플래시·GAME OVER 텍스트)는 선명하게
    // 보스 출현 경고 배너: 화면 중앙 대형 표시(페이드인 → 유지 → 페이드아웃, 렌더 프레임 감쇠)
    if (announce && announce.life > 0 && scene === 'run') {
      const t = announce.max - announce.life;                       // 경과 프레임
      const alpha = Math.min(1, t / 10, announce.life / 34);        // 인/아웃 페이드
      const pop = t < 12 ? 1.55 - 0.55 * (t / 12) : 1;              // 등장 순간 확대→안착
      const cy = canvas.height * 0.34;
      ctx.save(); ctx.globalAlpha = alpha;
      // 가독성 밴드 + 위/아래 경고선
      ctx.fillStyle = 'rgba(6,4,10,0.55)'; ctx.fillRect(0, cy - 52, canvas.width, 104);
      ctx.fillStyle = 'rgba(255,60,60,0.85)'; ctx.fillRect(0, cy - 52, canvas.width, 2); ctx.fillRect(0, cy + 50, canvas.width, 2);
      // WARNING 소제목 + 보스명(보스 색 네온)
      ctx.textAlign = 'center';
      ctx.font = '800 13px system-ui'; ctx.fillStyle = '#ff5c5c'; ctx.fillText('⚠  W A R N I N G  ⚠', canvas.width / 2, cy - 26);
      ctx.font = `900 ${Math.round(38 * pop)}px system-ui`;
      ctx.shadowColor = announce.color; ctx.shadowBlur = 26;
      ctx.fillStyle = announce.color; ctx.fillText(announce.text, canvas.width / 2, cy + 18);
      ctx.shadowBlur = 0; ctx.restore();
      announce.life--;
    }
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
    if (overlay?.type==='levelup') { const i='123'.indexOf(e.key); if (i>=0) selectChoice(i); return; }
    if (e.key.toLowerCase()==='o') { autoPotion = !autoPotion; meta.settings.autoPotion = autoPotion; saveMeta(meta); }
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
