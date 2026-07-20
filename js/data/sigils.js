// 각인(Sigil): 40레벨 이후 +5레벨마다 3택1로 획득하는 스택형 강화(무한 성장).
//  mods: 스택당 runMods(스탯형, computeStats에 합성). special: main.js 전투 훅이 해석하는 거동 id.
//  max: 최대 스택(기본 5). 같은 각인을 다시 고르면 스택이 쌓여 강해진다.
export const SIGILS = {
  // ── 스탯형(mods) ──
  radiance:    { id:'radiance',    name:'광휘',       color:'#ffe14d', desc:'치명타 확률 +6% · 치명타 피해 +20%',
                 mods:[{ stat:'crit', kind:'flat', value:0.06 }, { stat:'critMult', kind:'flat', value:0.2 }] },
  multishot:   { id:'multishot',   name:'다중 사격',   color:'#8ff0ff', desc:'투사체 +1', max:3,
                 mods:[{ stat:'projectiles', kind:'flat', value:1 }] },
  pierce_up:   { id:'pierce_up',   name:'관통 강화',   color:'#a0f0ff', desc:'관통 +2',
                 mods:[{ stat:'pierce', kind:'flat', value:2 }] },
  titan:       { id:'titan',       name:'거인의 심장', color:'#ff7a3d', desc:'최대 HP +20% · 공격력 +8%',
                 mods:[{ stat:'maxHp', kind:'mult', value:0.2 }, { stat:'damage', kind:'mult', value:0.08 }] },
  swift:       { id:'swift',       name:'쾌속',       color:'#8effc7', desc:'이동속도 +8% · 공격속도 +6%',
                 mods:[{ stat:'moveSpeed', kind:'mult', value:0.08 }, { stat:'atkSpeed', kind:'mult', value:0.06 }] },
  avarice:     { id:'avarice',     name:'탐욕',       color:'#ffd54a', desc:'골드 +20% · 획득범위 +30% · 경험치 +15%',
                 mods:[{ stat:'goldGain', kind:'mult', value:0.2 }, { stat:'pickupRange', kind:'mult', value:0.3 }, { stat:'xpGain', kind:'mult', value:0.15 }] },
  // ── 거동형(special, main.js 전투 훅) ──
  chain_bolt:  { id:'chain_bolt',  name:'연쇄 낙뢰',   color:'#b28bff', desc:'처치 시 번개가 인접 적에 피해(스택마다 확률↑)', special:'chainKill' },
  splinter:    { id:'splinter',    name:'분열탄',     color:'#ff9f45', desc:'투사체가 적 처치 시 파편 방출(스택마다↑)', special:'splinter' },
  siphon_core: { id:'siphon_core', name:'흡성 핵',    color:'#ff6b8a', desc:'처치 시 최대 HP 1.5% 회복(스택마다↑)', special:'siphonCore' },
  frost_pulse: { id:'frost_pulse', name:'서리 파동',   color:'#8bd8ff', desc:'주기적으로 주변 적 감속(스택마다 빠르게)', special:'frostPulse' },
  cursed:      { id:'cursed',      name:'저주받은 힘', color:'#ff5c6a', desc:'주는 피해 +40% / 받는 피해 +12%(스택마다)', max:3,
                 mods:[{ stat:'damage', kind:'mult', value:0.4 }], special:'cursed' },
  aegis:       { id:'aegis',       name:'반사 장막',   color:'#42a6ff', desc:'받은 피해의 일부를 가까운 적에게 반사(스택마다↑)', special:'aegis' },
};
export const SIGIL_IDS = Object.keys(SIGILS);
export function getSigil(id) { return SIGILS[id]; }
