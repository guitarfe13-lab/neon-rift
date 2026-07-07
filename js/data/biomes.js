// 바이옴 정의. 스테이지가 진행되며 순환한다. palette는 배경 그라디언트 색,
// enemySet은 스폰 풀, boss는 바이옴 보스, durationMs는 보스 등장까지 시간.
export const BIOMES = [
  { id:'neon_grid', name:'네온 그리드', palette:['#141830','#0a0b12'], grid:'rgba(66,230,255,0.07)',
    enemySet:['grunt','runner','shooter'], boss:'warden', durationMs:150000 },
  { id:'toxic_rift', name:'맹독 균열', palette:['#0f2418','#08120c'], grid:'rgba(120,255,140,0.07)',
    enemySet:['grunt','runner','tank','splitter','bomber'], boss:'hydra', durationMs:165000 },
  { id:'ember_wastes', name:'잿불 황야', palette:['#2a1410','#120806'], grid:'rgba(255,120,80,0.07)',
    enemySet:['runner','tank','shooter','charger','bomber','brute'], boss:'colossus', durationMs:180000 },
  // ── 4~6스테이지(2주차 난이도, 배경: assets/bg/<id>.png — 없으면 그라디언트 폴백) ──
  { id:'frost_core', name:'서리 코어', palette:['#12233a','#080e18'], grid:'rgba(139,216,255,0.07)',
    enemySet:['runner','shooter','splitter','charger','tank'], boss:'warden', durationMs:195000 },
  { id:'violet_abyss', name:'보랏빛 심연', palette:['#1d1230','#0c0714'], grid:'rgba(201,139,255,0.07)',
    enemySet:['grunt','shooter','splitter','bomber','brute'], boss:'hydra', durationMs:210000 },
  { id:'aurum_circuit', name:'황금 회로', palette:['#2a2210','#141006'], grid:'rgba(255,209,102,0.07)',
    enemySet:['runner','tank','charger','bomber','brute'], boss:'colossus', durationMs:225000 },
  // ── 7~10스테이지(3주차 난이도, 배경: assets/bg/<id>.png — 없으면 그라디언트 폴백) ──
  { id:'magenta_reactor', name:'마젠타 리액터', palette:['#2a0f1e','#12060d'], grid:'rgba(255,92,168,0.07)',
    enemySet:['grunt','shooter','charger','bomber','splitter'], boss:'warden', durationMs:240000 },
  { id:'deep_trench', name:'심해 단층', palette:['#07211f','#03100f'], grid:'rgba(63,216,200,0.07)',
    enemySet:['runner','tank','shooter','splitter','brute'], boss:'hydra', durationMs:255000 },
  { id:'ashen_void', name:'잿빛 공허', palette:['#20242c','#0c0e12'], grid:'rgba(207,214,228,0.06)',
    enemySet:['grunt','runner','charger','bomber','brute'], boss:'colossus', durationMs:270000 },
  { id:'omega_core', name:'오메가 코어', palette:['#1c1030','#0a0616'], grid:'rgba(224,208,255,0.07)',
    enemySet:['tank','shooter','charger','bomber','brute'], boss:'warden', durationMs:285000 },
];
export function biomeAt(index) { return BIOMES[index % BIOMES.length]; }
