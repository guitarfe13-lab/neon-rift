// 인게임 HUD.
import { bar, text, gem } from './render.js';
import { roundRect } from './skillIcons.js';
import { getSprite } from './assets.js';
import { drawSprite } from './sprites.js';
import { getCharacter } from '../data/characters.js';

// 캐릭터 초상: 구형 원 안에 캐릭터 이미지(단일 → 시트 첫 프레임 → 코드 스프라이트 폴백).
// stun>0(마법 크리 스턴)이면 붉은 오버레이 + 줄어드는 잔여시간 링 + 남은 초를 덧그린다.
function drawPortrait(ctx, ch, cx, cy, r, t, stun = 0, stunMax = 180) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.shadowColor = ch.color; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r-2, 0, Math.PI*2); ctx.clip();
  const single = getSprite('assets/sprites/' + ch.id);
  const sheetImg = !single && ch.sheet ? getSprite('assets/sprites/' + ch.id + '_sheet') : null;
  if (single) {                                   // 전신 이미지: 상단정렬(머리/상반신이 보이게)
    const sc = Math.max((r-2)*2/single.width, (r-2)*2/single.height), iw = single.width*sc, ih = single.height*sc;
    ctx.drawImage(single, cx-iw/2, cy-r, iw, ih);
  } else if (sheetImg) {                           // 시트 대기 첫 프레임
    const sh = ch.sheet, idx = (sh.anims.idle && sh.anims.idle[0]) || 0;
    const fw = sheetImg.width/sh.cols, fh = sheetImg.height/sh.rows, fx = (idx%sh.cols)*fw, fy = Math.floor(idx/sh.cols)*fh;
    const sc = Math.max((r-2)*2/fw, (r-2)*2/fh), dw = fw*sc, dh = fh*sc;
    ctx.drawImage(sheetImg, fx, fy, fw, fh, cx-dw/2, cy-r, dw, dh);
  } else drawSprite(ctx, ch.sprite, cx, cy, r-5, ch.color, t, 0);
  if (stun > 0) {   // 스턴: 초상 내부를 붉게 맥동(피격/봉인 느낌) — clip 안에서 채움
    const pulse = 0.34 + 0.22 * Math.sin(t * 0.4);
    ctx.fillStyle = `rgba(255,40,60,${pulse})`; ctx.fillRect(cx-r, cy-r, r*2, r*2);
  }
  ctx.restore();
  if (stun > 0) {   // 붉은 외곽 링 + 위에서 시계방향으로 줄어드는 잔여시간 호(시간이 흐르는 표시) + 남은 초
    const frac = Math.max(0, Math.min(1, stun / (stunMax || 180)));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.lineWidth = 2.5; ctx.strokeStyle = '#ff5c6e'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r+3.5, -Math.PI/2, -Math.PI/2 + frac*Math.PI*2);
    ctx.lineWidth = 4; ctx.strokeStyle = '#ff2e4e'; ctx.shadowColor = '#ff2e4e'; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.font = '800 15px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const secs = `${Math.ceil(stun / 60)}`;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(secs, cx, cy);
    ctx.fillStyle = '#fff'; ctx.fillText(secs, cx, cy);
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.lineWidth = 2.5; ctx.strokeStyle = ch.color; ctx.stroke();
  }
  ctx.restore();
}

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
export function drawHud(ctx, rs, world, frame = 0, souls = 0) {
  const p = world.player;
  const blinkOn = Math.floor(frame / 8) % 2 === 0;   // 저잔량 경고 점멸
  // 캐릭터 초상(HP/MP 바 앞) → 바들은 우측으로 이동
  const ch = getCharacter(rs.charId);
  if (ch) drawPortrait(ctx, ch, 40, 32, 26, frame, rs.stun || 0, rs.stunMax || 180);
  const BX = 76, BW = 208;                          // 바 시작 x / 폭(초상 자리 확보)
  const hpPct = p.hp / p.maxHp, hpLow = hpPct <= 0.3;
  bar(ctx, BX, 14, BW, 13, hpPct, hpLow ? (blinkOn ? '#ff2a2a' : '#5a1018') : '#ff4d6d');
  text(ctx, `HP ${Math.max(0,Math.ceil(p.hp))}/${Math.round(p.maxHp)}`, BX+4, 24, { size:11, color: hpLow && blinkOn ? '#ffdada' : '#eaf2ff' });
  const maxMp = rs.stats.maxMp || 1;
  const mpPct = (rs.mp ?? 0) / maxMp, mpLow = mpPct <= 0.3;
  bar(ctx, BX, 30, BW, 9, mpPct, mpLow ? (blinkOn ? '#ff2a2a' : '#3a1420') : '#4db3ff');
  text(ctx, `MP ${Math.max(0,Math.floor(rs.mp ?? 0))}/${Math.round(maxMp)}`, BX+4, 38, { size:10, color: mpLow && blinkOn ? '#ffdada' : '#eaf2ff' });
  bar(ctx, BX, 43, BW, 7, rs.xp / (8*Math.pow(rs.level,1.55)+4), '#42e6ff');
  text(ctx, `Lv ${rs.level}`, BX+BW+8, 49, { size:13, color:'#42e6ff', weight:'800' });   // 경험치 바 옆
  if (rs.techTreeName) text(ctx, `🌟 ${rs.techTreeName}`, BX+BW+46, 49, { size:12, color: rs.techTreeColor || '#ffe14d', weight:'700' });
  const c = (n) => Math.round(n).toLocaleString('en-US');                              // 천단위 콤마
  const info = `⏱ ${c(rs.timeMs/1000)}s   ⭐ ${c(rs.stage)}   💰 ${c(rs.gold)}   `;
  text(ctx, info, 16, 74, { size:13 });
  ctx.save(); ctx.font = '600 13px system-ui'; const iw = ctx.measureText(info).width; ctx.restore();
  gem(ctx, 22 + iw, 70, 6, '#7cd0ff');                                   // 소울 = 다이아몬드
  text(ctx, c(souls), 32 + iw, 74, { size:13, color:'#bfe6ff' });
  // 물약: 좌측 세로 정렬(HP 위 / MP 아래) + 보유 개수
  const po = rs.potions || { hp:0, mp:0 };
  const cd = rs.potCd || { hp: 0, mp: 0 };
  const potionRow = (x, y, w, h, color, cnt, cntColor, cdLeft) => {
    drawPotion(ctx, x, y, w, h, color);
    if (cdLeft > 0) {   // 쿨타임 중: 병 어둡게 + 남은 초(스킬 쿨처럼)
      ctx.save(); ctx.fillStyle = 'rgba(6,8,16,0.68)'; ctx.fillRect(x - 2, y - 1, w + 4, h + 3);
      ctx.font = '800 11px system-ui'; ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(`${Math.ceil(cdLeft / 60)}`, x + w / 2, y + h * 0.68);
      ctx.fillStyle = '#eaf2ff'; ctx.fillText(`${Math.ceil(cdLeft / 60)}`, x + w / 2, y + h * 0.68); ctx.restore();
    }
    text(ctx, `×${cnt}`, x + 22, y + 16, { size: 14, weight: '800', color: cntColor });
  };
  potionRow(18, 80, 15, 22, '#ff4d6d', po.hp, '#ffb3c0', cd.hp);
  potionRow(18, 108, 15, 22, '#4db3ff', po.mp, '#a9d8ff', cd.mp);
  // 신성의 맹세(부활 유물) 보유 표시
  if (rs.oaths > 0) text(ctx, `✝ ×${rs.oaths}`, 18, 148, { size:15, weight:'800', color:'#ffe58a' });
}
