// 적 정의. behavior가 있으면 engine/enemyAI.js가 특수 행동을 처리한다.
//  기본(무behavior): 플레이어를 향해 직진.
//  runner: 빠르고 약함 / tank: 느리고 단단 / shooter: 원거리 투사 /
//  splitter: 사망 시 분열 / charger: 주기적 돌진.
export const ENEMIES = {
  grunt:    { id:'grunt',    name:'스워머', shape:'circle',   sprite:'blob',   color:'#ff4d6d', hp:6,  speed:1.1, radius:12, damage:6,  xp:3,  gold:2 },
  runner:   { id:'runner',   name:'러너',   shape:'triangle', sprite:'dart',   color:'#ff9f45', hp:4,  speed:2.2, radius:11, damage:5,  xp:3,  gold:2, behavior:'none' },
  tank:     { id:'tank',     name:'탱커',   shape:'square',   sprite:'golem',  color:'#8a7dff', hp:34, speed:0.6, radius:20, damage:10, xp:8,  gold:6 },
  shooter:  { id:'shooter',  name:'슈터',   shape:'diamond',  sprite:'eyeball',color:'#4dd2ff', hp:10, speed:0.8, radius:14, damage:7,  xp:6,  gold:4, behavior:'shooter', shootCd:110, shotSpeed:3.2, shotRange:360 },
  splitter: { id:'splitter', name:'분열체', shape:'circle',   sprite:'cell',   color:'#66ffb3', hp:14, speed:1.0, radius:16, damage:7,  xp:7,  gold:5, behavior:'splitter', splitInto:'splitling', splitCount:2 },
  splitling:{ id:'splitling',name:'분열자',  shape:'circle',   sprite:'cell',   color:'#9dffd0', hp:4,  speed:1.5, radius:9,  damage:4,  xp:2,  gold:1 },
  charger:  { id:'charger',  name:'돌진체', shape:'triangle', sprite:'horned', color:'#ff6a3d', hp:16, speed:0.9, radius:16, damage:12, xp:8,  gold:6, behavior:'charger', dashCd:150, dashSpeed:6, dashDur:22 },
};
export function getEnemy(id) { return ENEMIES[id]; }
