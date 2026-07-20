// 심연 변이(Abyss Mutation): 35레벨 이후 스폰 몹에 위협 티어에 비례해 부여되는 위험 변이.
//  color=시각 표시색, reward=처치 보상(xp·gold) 배수, symbol=머리 위 마커.
//  거동은 여러 곳에서 id로 해석: spawner(스탯)·enemyAI(점멸/자폭)·main(배리어/렌더).
export const MUTATIONS = {
  barrier:  { id:'barrier',  name:'수호', color:'#42e6ff', reward:1.6, symbol:'🛡' },   // 보호막이 실제 HP보다 먼저 소모
  volatile: { id:'volatile', name:'폭심', color:'#ff7a3d', reward:1.5, symbol:'💥' },   // 사망 시 폭발 탄막
  blink:    { id:'blink',    name:'점멸', color:'#c98bff', reward:1.7, symbol:'✦' },    // 주기적 순간이동(카이팅 방해)
  frenzy:   { id:'frenzy',   name:'격노', color:'#ff4d5e', reward:1.5, symbol:'‼' },    // 빠르고 강하지만 약간 무름
};
export const MUTATION_IDS = Object.keys(MUTATIONS);

// 위협 티어: 35레벨에서 1, 이후 +5레벨마다 +1. 변이 확률·보상·연출의 기준.
export function abyssTier(level) { return level >= 35 ? Math.floor((level - 35) / 5) + 1 : 0; }

// 스폰 스탯(st)에 변이를 적용(spawner에서 엘리트 보정 후·maxHp 확정 전 호출).
export function applyMutation(st, mutId, tier) {
  const m = MUTATIONS[mutId]; if (!m) return;
  st.mutation = mutId; st.mutColor = m.color;
  st.xp = Math.round(st.xp * m.reward); st.gold = Math.round(st.gold * m.reward);
  if (mutId === 'barrier') { st.barrier = Math.round(st.hp * (0.5 + tier * 0.12)); st.barrierMax = st.barrier; }
  else if (mutId === 'frenzy') { st.speed *= 1.35; st.damage = Math.round(st.damage * 1.3); st.hp = Math.max(1, Math.round(st.hp * 0.8)); }
  else if (mutId === 'blink') { st.blink = true; }
  else if (mutId === 'volatile') { st.volatile = true; }
}
