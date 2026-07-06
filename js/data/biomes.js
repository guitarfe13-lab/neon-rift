// 바이옴 정의. 스테이지가 진행되며 순환한다. palette는 배경 그라디언트 색,
// enemySet은 스폰 풀, boss는 바이옴 보스, durationMs는 보스 등장까지 시간.
export const BIOMES = [
  { id:'neon_grid', name:'네온 그리드', palette:['#141830','#0a0b12'], grid:'rgba(66,230,255,0.07)',
    enemySet:['grunt','runner','shooter'], boss:'warden', durationMs:90000 },
  { id:'toxic_rift', name:'맹독 균열', palette:['#0f2418','#08120c'], grid:'rgba(120,255,140,0.07)',
    enemySet:['grunt','runner','tank','splitter','bomber'], boss:'hydra', durationMs:105000 },
  { id:'ember_wastes', name:'잿불 황야', palette:['#2a1410','#120806'], grid:'rgba(255,120,80,0.07)',
    enemySet:['runner','tank','shooter','charger','bomber','brute'], boss:'colossus', durationMs:120000 },
];
export function biomeAt(index) { return BIOMES[index % BIOMES.length]; }
