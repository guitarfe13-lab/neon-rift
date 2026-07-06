// 보스 정의. behavior:'boss'로 enemyAI가 처리. 페이즈는 hp 비율 임계에서 강화.
//  pattern: 'ring'(방사형 탄막) / 'spiral'(회전 탄막) / 'burst'(집중 3연발).
//  아레나(spawner)로 플레이어를 가두므로 보스는 빠르게 압박한다(단, 플레이어 이속보다는 느림).
// skill: 보스 전용 특수기(상시 탄막과 별개). 런 레벨↑ → 티어↑ → 링 수·탄 수·데미지 증가(광역·강력).
//   name(HUD 표시) / cd(시전 간격 프레임) / dmgMul(기본 데미지 배수).
export const BOSSES = {
  warden: { id:'warden', name:'감시자', shape:'square', color:'#ff5cc8', boss:true, sprite:'boss', spriteScale:1.7, behavior:'boss',
    hp:900, speed:1.25, radius:40, damage:24, xp:150, gold:150,
    pattern:'ring', shootCd:74, shotSpeed:3.0, shotCount:14,
    skill:{ name:'감시의 원환', cd:320, dmgMul:1.25 },
    phases:[{ at:0.6, speed:1.55, shootCd:58 }, { at:0.3, speed:1.9, shootCd:42, shotCount:18 }] },
  hydra: { id:'hydra', name:'히드라', shape:'diamond', color:'#5cff9e', boss:true, sprite:'boss', spriteScale:1.7, behavior:'boss',
    hp:1450, speed:1.3, radius:42, damage:26, xp:210, gold:210,
    pattern:'spiral', shootCd:7, shotSpeed:3.0, shotCount:2,
    skill:{ name:'맹독의 나선', cd:300, dmgMul:1.2 },
    phases:[{ at:0.5, speed:1.55, shootCd:5 }, { at:0.25, speed:1.85, shootCd:4 }] },
  colossus: { id:'colossus', name:'콜로서스', shape:'square', color:'#ffb03d', boss:true, sprite:'boss', spriteScale:1.85, behavior:'boss',
    hp:2350, speed:1.0, radius:48, damage:32, xp:300, gold:300,
    pattern:'burst', shootCd:58, shotSpeed:3.8, shotCount:4,
    skill:{ name:'대지 붕괴', cd:340, dmgMul:1.35 },
    phases:[{ at:0.6, speed:1.2, shootCd:46 }, { at:0.3, speed:1.5, shootCd:32, shotCount:6 }] },
  // 중간보스(미니보스): 바이옴 중반에 확률 등장. boss 플래그 없음 → 아레나·보스BGM·바이옴 진행과 무관.
  axion: { id:'axion', name:'네온의 집행자 악시온', shape:'diamond', color:'#7dffce', miniboss:true, sprite:'boss', spriteScale:1.35, behavior:'boss',
    hp:520, speed:1.5, radius:30, damage:20, xp:90, gold:90,
    pattern:'burst', shootCd:64, shotSpeed:3.4, shotCount:3,
    skill:{ name:'집행 선고', cd:300, dmgMul:1.15 },
    drop:{ mana:0.9, hp:0.6, coins:5 },
    phases:[{ at:0.5, speed:1.8, shootCd:48, shotCount:4 }] },
};
export function getBoss(id) { return BOSSES[id]; }
