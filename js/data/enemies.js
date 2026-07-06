// 적 정의.
export const ENEMIES = {
  grunt: { id:'grunt', name:'스워머', shape:'circle', color:'#ff4d6d', hp:6, speed:1.1, radius:12, damage:6, xp:3, gold:2 },
};
export function getEnemy(id) { return ENEMIES[id]; }
