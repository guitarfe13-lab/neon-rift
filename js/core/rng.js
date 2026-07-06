// 시드 기반 결정적 난수. FNV-1a 해시 + mulberry32.
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function makeRng(seed) {
  const s = typeof seed === 'number' ? seed >>> 0 : hashString(String(seed));
  const next = mulberry32(s);
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(next() * arr.length)];
  const weighted = (items) => {
    const total = items.reduce((a, it) => a + Math.max(0, it.weight), 0);
    if (total <= 0) return items[0]?.value;
    let roll = next() * total;
    for (const it of items) { roll -= Math.max(0, it.weight); if (roll < 0) return it.value; }
    return items[items.length - 1].value;
  };
  return { next, int, pick, weighted };
}
