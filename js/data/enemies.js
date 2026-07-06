// 적 정의. behavior가 있으면 engine/enemyAI.js가 특수 행동을 처리한다.
//  기본(무behavior): 플레이어를 향해 직진.
//  runner: 빠르고 약함 / tank: 느리고 단단 / shooter: 원거리 투사 /
//  splitter: 사망 시 분열 / charger: 주기적 돌진.
// drop: 처치 시 마나/HP물약 드랍 확률, coins=추가 코인 수, skill=히든 스킬 확률.
export const ENEMIES = {
  grunt:    { id:'grunt',    name:'스워머', shape:'circle',   sprite:'blob',   spriteScale:0.72, color:'#ff4d6d', hp:6,  speed:1.1, radius:12, damage:6,  xp:3,  gold:2,  drop:{ mana:0.22, hp:0.02 } },
  runner:   { id:'runner',   name:'러너',   shape:'triangle', sprite:'dart',   color:'#ff9f45', hp:4,  speed:2.2, radius:11, damage:5,  xp:3,  gold:2, behavior:'none', drop:{ mana:0.18, hp:0.02 } },
  tank:     { id:'tank',     name:'탱커',   shape:'square',   sprite:'golem',  color:'#8a7dff', hp:34, speed:0.6, radius:20, damage:10, xp:8,  gold:6,  drop:{ mana:0.5, hp:0.12, coins:2 } },
  shooter:  { id:'shooter',  name:'슈터',   shape:'diamond',  sprite:'eyeball',color:'#4dd2ff', hp:10, speed:0.8, radius:14, damage:7,  xp:6,  gold:4, behavior:'shooter', shootCd:110, shotSpeed:3.2, shotRange:360, drop:{ mana:0.45, hp:0.06 } },
  splitter: { id:'splitter', name:'분열체', shape:'circle',   sprite:'cell',   spriteScale:0.85, color:'#66ffb3', hp:14, speed:1.0, radius:16, damage:7,  xp:7,  gold:5, behavior:'splitter', splitInto:'splitling', splitCount:2, drop:{ mana:0.3, hp:0.04 } },
  splitling:{ id:'splitling',name:'분열자',  shape:'circle',   sprite:'cell',   spriteScale:0.7,  color:'#9dffd0', hp:4,  speed:1.5, radius:9,  damage:4,  xp:2,  gold:1,  drop:{ mana:0.08, hp:0.01 } },
  charger:  { id:'charger',  name:'돌진체', shape:'triangle', sprite:'horned', color:'#ff6a3d', hp:16, speed:0.9, radius:16, damage:12, xp:8,  gold:6, behavior:'charger', dashCd:150, dashSpeed:6, dashDur:22, drop:{ mana:0.4, hp:0.1 } },
  // 폭탄체: 사망 시 붉은 탄막 링을 사방으로 터뜨린다(cell 스프라이트 재사용).
  bomber:   { id:'bomber',   name:'폭탄체', shape:'circle',   sprite:'cell',   spriteScale:0.95, color:'#ff7a3d', hp:12, speed:1.0, radius:15, damage:9,  xp:8,  gold:6, behavior:'bomber', drop:{ mana:0.4, hp:0.06 } },
  // 광폭체: 거대·단단·강한 근접(golem 스프라이트 확대 재사용).
  brute:    { id:'brute',    name:'광폭체', shape:'square',   sprite:'golem',  spriteScale:1.25, color:'#c05cff', hp:60, speed:0.55, radius:24, damage:16, xp:14, gold:10, drop:{ mana:0.6, hp:0.18, coins:3, skill:0.02 } },
};
export function getEnemy(id) { return ENEMIES[id]; }
