// localStorage 저장/로드. 순수 로직(store 주입 가능)로 테스트 격리.
const KEY = 'neonrift.meta';
export function defaultMeta() {
  return {
    version: 1, souls: 0, upgrades: {},
    unlockedCharacters: ['blade'], unlockedSkills: [],
    potions: { hp: 0, mp: 0 },
    settings: { master: 0.8, sfx: 0.9, bgm: 0.5, muted: false, autopilot: true },
    best: { stage: 0, timeMs: 0 },
  };
}
function deepMerge(base, over) {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    for (const k of Object.keys(base)) if (over && k in over) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}
function getStore(store) { return store || (typeof localStorage !== 'undefined' ? localStorage : null); }
export function loadMeta(store) {
  const s = getStore(store); if (!s) return defaultMeta();
  const raw = s.getItem(KEY); if (!raw) return defaultMeta();
  try { return deepMerge(defaultMeta(), JSON.parse(raw)); }
  catch { return defaultMeta(); }
}
export function saveMeta(meta, store) { const s = getStore(store); if (s) s.setItem(KEY, JSON.stringify(meta)); }
export function resetMeta(store) { const s = getStore(store); if (s) s.removeItem(KEY); }
