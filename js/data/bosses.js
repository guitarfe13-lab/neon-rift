// 보스 정의. behavior:'boss'로 enemyAI가 처리. 페이즈는 hp 비율 임계에서 강화.
//  pattern: 'ring'(방사형 탄막) / 'spiral'(회전 탄막) / 'burst'(집중 3연발).
//  아레나(spawner)로 플레이어를 가두므로 보스는 빠르게 압박한다(단, 플레이어 이속보다는 느림).
export const BOSSES = {
  warden: { id:'warden', name:'감시자', shape:'square', color:'#ff5cc8', boss:true, sprite:'boss', spriteScale:1.7, behavior:'boss',
    hp:900, speed:1.25, radius:40, damage:24, xp:150, gold:150,
    pattern:'ring', shootCd:74, shotSpeed:3.0, shotCount:14,
    phases:[{ at:0.6, speed:1.55, shootCd:58 }, { at:0.3, speed:1.9, shootCd:42, shotCount:18 }] },
  hydra: { id:'hydra', name:'히드라', shape:'diamond', color:'#5cff9e', boss:true, sprite:'boss', spriteScale:1.7, behavior:'boss',
    hp:1450, speed:1.3, radius:42, damage:26, xp:210, gold:210,
    pattern:'spiral', shootCd:7, shotSpeed:3.0, shotCount:2,
    phases:[{ at:0.5, speed:1.55, shootCd:5 }, { at:0.25, speed:1.85, shootCd:4 }] },
  colossus: { id:'colossus', name:'콜로서스', shape:'square', color:'#ffb03d', boss:true, sprite:'boss', spriteScale:1.85, behavior:'boss',
    hp:2350, speed:1.0, radius:48, damage:32, xp:300, gold:300,
    pattern:'burst', shootCd:58, shotSpeed:3.8, shotCount:4,
    phases:[{ at:0.6, speed:1.2, shootCd:46 }, { at:0.3, speed:1.5, shootCd:32, shotCount:6 }] },
};
export function getBoss(id) { return BOSSES[id]; }
