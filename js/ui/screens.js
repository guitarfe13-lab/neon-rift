// DOM 오버레이 화면(타이틀/로드아웃/메타상점/설정). #ui-root에 렌더.
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { CHARACTERS } from '../data/characters.js';
import { getSkill } from '../data/skills.js';
import { drawSkillIcon } from './skillIcons.js';
import { upgradeCost, canBuy, buyUpgrade, characterUnlockCost, isCharUnlocked, canUnlockChar, unlockChar,
  potionCost, canBuyPotion, buyPotion,
  GOLD_PER_SOUL, goldToSouls, exchangeGold, exchangeAllGold } from '../systems/meta.js';

const root = () => document.getElementById('ui-root');
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
export function clearScreens() { const r = root(); if (r) r.innerHTML = ''; }

export function showTitle({ meta, onPlay, onShop, onSettings }) {
  clearScreens();
  const p = el('div', 'screen center');
  p.appendChild(el('h1', 'game-logo', 'NEON RIFT'));
  p.appendChild(el('p', 'subtitle', '액션 로그라이크 방치형 RPG'));
  const info = el('p', 'muted');
  info.innerHTML = `최고 스테이지 ${meta.best.stage} &nbsp;·&nbsp; <span class="soul-dia">◆</span> ${meta.souls} 소울`;
  p.appendChild(info);
  const col = el('div', 'btn-col');
  const play = el('button', 'btn primary', '▶ 플레이'); play.onclick = onPlay;
  const shop = el('button', 'btn', '메타 상점'); shop.onclick = onShop;
  const set = el('button', 'btn', '설정'); set.onclick = onSettings;
  col.append(play, shop, set); p.appendChild(col);
  root().appendChild(p);
}

export function showLoadout({ meta, onStart, onBack }) {
  clearScreens();
  const p = el('div', 'screen center');
  p.appendChild(el('h2', 'screen-title', '캐릭터 선택'));
  const grid = el('div', 'char-grid');
  let selected = meta.unlockedCharacters[0];
  const cards = {};
  for (const id of Object.keys(CHARACTERS)) {
    const ch = CHARACTERS[id]; const unlocked = isCharUnlocked(meta, id);
    const card = el('button', 'char-card' + (unlocked ? '' : ' locked'));
    // 초상(이미지 없으면 숨김)
    const img = document.createElement('img'); img.className = 'char-portrait';
    img.src = 'assets/sprites/' + id + '.png'; img.alt = ch.name;
    img.onerror = () => { img.style.display = 'none'; };
    card.appendChild(img);
    const nm = el('div', 'char-name', ch.name); nm.style.color = ch.color; card.appendChild(nm);
    card.appendChild(el('div', 'char-desc', ch.desc));
    // 스탯(HP/MP)
    const st = el('div', 'char-stats');
    st.innerHTML = `<span class="stat hp">❤ HP <b>${ch.base.maxHp}</b></span><span class="stat mp">🔷 MP <b>${ch.base.maxMp}</b></span>`;
    card.appendChild(st);
    // 사용 스킬 아이콘(시작 스킬 강조)
    const sk = el('div', 'char-skills');
    for (const sid of ch.skillPool) { const s = getSkill(sid); if (!s) continue;
      const cvs = document.createElement('canvas'); cvs.width = 30; cvs.height = 30;
      cvs.className = 'skill-mini' + (sid === ch.startingSkill ? ' starting' : ''); cvs.title = s.name + (sid===ch.startingSkill?' (시작)':'');
      drawSkillIcon(cvs.getContext('2d'), s, 1, 1, 28); sk.appendChild(cvs);
    }
    card.appendChild(sk);
    if (!unlocked) { card.appendChild(el('div', 'char-lock', `🔒 소울 ${characterUnlockCost(id)}`)); card.disabled = true; }
    else card.onclick = () => { selected = id; Object.values(cards).forEach(c=>c.classList.remove('sel')); card.classList.add('sel'); };
    if (id === selected) card.classList.add('sel');
    cards[id] = card; grid.appendChild(card);
  }
  p.appendChild(grid);
  const col = el('div', 'btn-row');
  const start = el('button', 'btn primary', '런 시작'); start.onclick = () => onStart(selected);
  const back = el('button', 'btn', '뒤로'); back.onclick = onBack;
  col.append(start, back); p.appendChild(col);
  root().appendChild(p);
}

export function showMetaShop({ meta, save, onBack }) {
  const render = () => {
    clearScreens();
    const p = el('div', 'screen');
    p.appendChild(el('h2', 'screen-title', '메타 상점'));
    const sl = el('p', 'souls');
    sl.innerHTML = `<span class="soul-dia">◆</span> ${(meta.souls||0).toLocaleString()} 소울` +
      `<span style="color:#ffd166; margin-left:14px">💰 ${(meta.gold||0).toLocaleString()} 골드</span>`;
    p.appendChild(sl);
    const list = el('div', 'shop-list');
    // 황금코인 → 소울 교환(GOLD_PER_SOUL:1)
    const gRow = el('div', 'shop-row'); const avail = goldToSouls(meta.gold);
    gRow.innerHTML = `<div>💰 <b>골드 → 소울 교환</b> <span class="lvl">${GOLD_PER_SOUL}골드 = 1소울 · 최대 +${avail.toLocaleString()}소울</span></div>`;
    const gBtns = el('div'); gBtns.style.cssText = 'display:flex; gap:6px';
    const b10 = el('button', 'btn small', '+10 소울'); b10.disabled = avail < 10;
    b10.onclick = () => { exchangeGold(meta, 10); save(); render(); };
    const bAll = el('button', 'btn small', `전부 교환 (+${avail.toLocaleString()})`); bAll.disabled = avail < 1;
    bAll.onclick = () => { exchangeAllGold(meta); save(); render(); };
    gBtns.appendChild(b10); gBtns.appendChild(bAll); gRow.appendChild(gBtns); list.appendChild(gRow);
    for (const id of Object.keys(META_UPGRADES)) {
      const u = META_UPGRADES[id]; const lvl = meta.upgrades[id] || 0; const cost = upgradeCost(meta, id);
      const row = el('div', 'shop-row');
      row.innerHTML = `<div><b>${u.name}</b> <span class="lvl">Lv ${lvl}/${u.maxLevel}</span></div>`;
      const btn = el('button', 'btn small', cost == null ? 'MAX' : `구매 (${cost})`);
      btn.disabled = !canBuy(meta, id);
      btn.onclick = () => { buyUpgrade(meta, id); save(); render(); };
      row.appendChild(btn); list.appendChild(row);
    }
    // 물약(자동 사용): 저잔량 시 런 중 자동 소비
    for (const kind of ['hp', 'mp']) {
      const nm = kind === 'hp' ? '체력 물약' : '마나 물약', ic = kind === 'hp' ? '🧪' : '🔷';
      const row = el('div', 'shop-row');
      row.innerHTML = `<div>${ic} <b>${nm}</b> <span class="lvl">보유 ${meta.potions?.[kind]||0} · 저잔량 시 자동 사용</span></div>`;
      const btn = el('button', 'btn small', `+10 구매 (${potionCost(kind)})`);
      btn.disabled = !canBuyPotion(meta, kind);
      btn.onclick = () => { buyPotion(meta, kind); save(); render(); };
      row.appendChild(btn); list.appendChild(row);
    }
    // 캐릭터 해금
    for (const id of Object.keys(CHARACTERS)) {
      if (characterUnlockCost(id) == null || isCharUnlocked(meta, id)) continue;
      const ch = CHARACTERS[id]; const row = el('div', 'shop-row');
      row.innerHTML = `<div>🔓 <b style="color:${ch.color}">${ch.name}</b> <span class="lvl">${ch.desc}</span></div>`;
      const btn = el('button', 'btn small', `해금 (${characterUnlockCost(id)})`);
      btn.disabled = !canUnlockChar(meta, id);
      btn.onclick = () => { unlockChar(meta, id); save(); render(); };
      row.appendChild(btn); list.appendChild(row);
    }
    p.appendChild(list);
    const back = el('button', 'btn', '뒤로'); back.onclick = onBack; p.appendChild(back);
    root().appendChild(p);
  };
  render();
}

export function showSettings({ meta, save, onBack }) {
  clearScreens();
  const p = el('div', 'screen');
  p.appendChild(el('h2', 'screen-title', '설정'));
  const slider = (label, key) => {
    const wrap = el('div', 'set-row'); wrap.appendChild(el('span', null, label));
    const input = document.createElement('input'); input.type = 'range'; input.min = 0; input.max = 1; input.step = 0.05;
    input.value = meta.settings[key];
    input.oninput = () => { meta.settings[key] = Number(input.value); save(); };
    wrap.appendChild(input); return wrap;
  };
  p.appendChild(slider('마스터 볼륨', 'master'));
  p.appendChild(slider('효과음(SFX)', 'sfx'));
  p.appendChild(slider('배경음(BGM)', 'bgm'));
  const toggle = (label, key) => {
    const wrap = el('div', 'set-row'); wrap.appendChild(el('span', null, label));
    const btn = el('button', 'btn small', meta.settings[key] ? 'ON' : 'OFF');
    btn.onclick = () => { meta.settings[key] = !meta.settings[key]; btn.textContent = meta.settings[key] ? 'ON' : 'OFF'; save(); };
    wrap.appendChild(btn); return wrap;
  };
  p.appendChild(toggle('음소거', 'muted'));
  p.appendChild(toggle('오토파일럿 기본', 'autopilot'));
  p.appendChild(toggle('물약 자동 사용', 'autoPotion'));
  const back = el('button', 'btn', '뒤로'); back.onclick = onBack; p.appendChild(back);
  root().appendChild(p);
}
