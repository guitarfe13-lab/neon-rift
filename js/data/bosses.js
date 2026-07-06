// 보스 정의. behavior:'boss'로 enemyAI가 처리. 페이즈는 hp 비율 임계에서 강화.
//  pattern: 'ring'(방사형 탄막) / 'spiral'(회전 탄막) / 'burst'(집중 3연발).
export const BOSSES = {
  warden: { id:'warden', name:'감시자', shape:'square', color:'#ff5cc8', boss:true, behavior:'boss',
    hp:900, speed:0.7, radius:38, damage:16, xp:120, gold:120,
    pattern:'ring', shootCd:90, shotSpeed:2.6, shotCount:12,
    phases:[{ at:0.6, speed:0.95, shootCd:70 }, { at:0.3, speed:1.2, shootCd:50, shotCount:16 }] },
  hydra: { id:'hydra', name:'히드라', shape:'diamond', color:'#5cff9e', boss:true, behavior:'boss',
    hp:1400, speed:0.8, radius:40, damage:18, xp:180, gold:180,
    pattern:'spiral', shootCd:8, shotSpeed:2.8, shotCount:2,
    phases:[{ at:0.5, shootCd:6 }, { at:0.25, shootCd:4, speed:1.1 }] },
  colossus: { id:'colossus', name:'콜로서스', shape:'square', color:'#ffb03d', boss:true, behavior:'boss',
    hp:2200, speed:0.5, radius:46, damage:24, xp:260, gold:260,
    pattern:'burst', shootCd:70, shotSpeed:3.4, shotCount:3,
    phases:[{ at:0.6, speed:0.75, shootCd:55 }, { at:0.3, speed:1.0, shootCd:40, shotCount:5 }] },
};
export function getBoss(id) { return BOSSES[id]; }
