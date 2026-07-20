// 각인(Sigil) 런타임(순수, DOM 비의존 → node --test).
// 보유 각인(스택) → computeStats runMods 합성 / 3택1 후보 롤 / 각인 적용.
import { SIGILS, SIGIL_IDS } from '../data/sigils.js';

// 40레벨 이후 사용 가능한 각인 수: 40에서 1개, 이후 +5레벨마다 1개.
export function sigilsEligible(level) {
  return level >= 40 ? Math.floor((level - 40) / 5) + 1 : 0;
}

// 보유 각인의 스탯 mods를 스택 수만큼 배수해 runMods 배열로.
export function sigilMods(rs) {
  const out = [];
  const owned = rs.sigils || {};
  for (const id of Object.keys(owned)) {
    const s = SIGILS[id]; const n = owned[id]; if (!s || !s.mods || !n) continue;
    for (const m of s.mods) out.push({ stat: m.stat, kind: m.kind, value: m.value * n });
  }
  return out;
}

// 각인 3택1 후보: 최대 스택 미만인 것 중 무작위. 미보유는 가중 2(신규 다양성), 보유는 1.
export function rollSigils(rs, rng, count = 3) {
  const avail = SIGIL_IDS.filter((id) => (rs.sigils?.[id] || 0) < (SIGILS[id].max || 5));
  const picks = [];
  while (picks.length < count && avail.length) {
    const weights = avail.map((id) => (rs.sigils?.[id] ? 1 : 2));
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = rng.next() * total, idx = 0;
    for (; idx < avail.length - 1; idx++) { roll -= weights[idx]; if (roll < 0) break; }
    picks.push(avail[idx]); avail.splice(idx, 1);
  }
  return picks.map((id) => SIGILS[id]);
}

// 각인 획득(스택 +1).
export function applySigil(rs, id) {
  if (!SIGILS[id]) return;
  rs.sigils = rs.sigils || {};
  rs.sigils[id] = (rs.sigils[id] || 0) + 1;
}
