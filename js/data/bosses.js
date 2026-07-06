// 보스 정의. behavior:'boss'로 enemyAI가 처리. 페이즈는 hp 비율 임계에서 강화.
//  pattern: 'ring'(방사형 탄막) / 'spiral'(회전 탄막) / 'burst'(집중 3연발).
//  아레나(spawner)로 플레이어를 가두므로 보스는 빠르게 압박한다(단, 플레이어 이속보다는 느림).
export const BOSSES = {
  warden: { id:'warden', name:'감시자', shape:'square', color:'#ff5cc8', boss:true, behavior:'boss',
    hp:820, speed:1.2, radius:40, damage:20, xp:140, gold:140,
    pattern:'ring', shootCd:80, shotSpeed:2.8, shotCount:12,
    phases:[{ at:0.6, speed:1.5, shootCd:62 }, { at:0.3, speed:1.85, shootCd:46, shotCount:16 }] },
  hydra: { id:'hydra', name:'히드라', shape:'diamond', color:'#5cff9e', boss:true, behavior:'boss',
    hp:1300, speed:1.25, radius:42, damage:22, xp:200, gold:200,
    pattern:'spiral', shootCd:8, shotSpeed:2.9, shotCount:2,
    phases:[{ at:0.5, speed:1.5, shootCd:6 }, { at:0.25, speed:1.8, shootCd:4 }] },
  colossus: { id:'colossus', name:'콜로서스', shape:'square', color:'#ffb03d', boss:true, behavior:'boss',
    hp:2100, speed:0.95, radius:48, damage:28, xp:280, gold:280,
    pattern:'burst', shootCd:64, shotSpeed:3.6, shotCount:3,
    phases:[{ at:0.6, speed:1.15, shootCd:50 }, { at:0.3, speed:1.45, shootCd:36, shotCount:5 }] },
};
export function getBoss(id) { return BOSSES[id]; }
