// DOM 오버레이 화면(타이틀/로드아웃/메타상점/설정). #ui-root에 렌더.
import { META_UPGRADES } from '../data/metaUpgrades.js';
import { CHARACTERS } from '../data/characters.js';
import { upgradeCost, canBuy, buyUpgrade, characterUnlockCost, isCharUnlocked, canUnlockChar, unlockChar } from '../systems/meta.js';

const root = () => document.getElementById('ui-root');
function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
export function clearScreens() { const r = root(); if (r) r.innerHTML = ''; }

export function showTitle({ meta, onPlay, onShop, onSettings }) {
  clearScreens();
  const p = el('div', 'screen center');
  p.appendChild(el('h1', 'game-logo', 'NEON RIFT'));
  p.appendChild(el('p', 'subtitle', '액션 로그라이크 방치형 RPG'));
  p.appendChild(el('p', 'muted', `최고 스테이지 ${meta.best.stage} · 보유 소울 ${meta.souls}`));
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
  const grid = el('div', 'card-grid');
  let selected = meta.unlockedCharacters[0];
  const cards = {};
  for (const id of Object.keys(CHARACTERS)) {
    const ch = CHARACTERS[id]; const unlocked = isCharUnlocked(meta, id);
    const card = el('button', 'card' + (unlocked ? '' : ' locked'));
    card.innerHTML = `<div class="card-name" style="color:${ch.color}">${ch.name}</div>
      <div class="card-desc">${ch.desc}</div>
      <div class="card-meta">${unlocked ? 'HP '+ch.base.maxHp+' · 공격 '+ch.base.damage : '🔒 소울 '+characterUnlockCost(id)}</div>`;
    if (unlocked) card.onclick = () => { selected = id; Object.values(cards).forEach(c=>c.classList.remove('sel')); card.classList.add('sel'); };
    else card.disabled = true;
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
    p.appendChild(el('p', 'souls', `💠 소울 ${meta.souls}`));
    const list = el('div', 'shop-list');
    for (const id of Object.keys(META_UPGRADES)) {
      const u = META_UPGRADES[id]; const lvl = meta.upgrades[id] || 0; const cost = upgradeCost(meta, id);
      const row = el('div', 'shop-row');
      row.innerHTML = `<div><b>${u.name}</b> <span class="lvl">Lv ${lvl}/${u.maxLevel}</span></div>`;
      const btn = el('button', 'btn small', cost == null ? 'MAX' : `구매 (${cost})`);
      btn.disabled = !canBuy(meta, id);
      btn.onclick = () => { buyUpgrade(meta, id); save(); render(); };
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
  const back = el('button', 'btn', '뒤로'); back.onclick = onBack; p.appendChild(back);
  root().appendChild(p);
}
