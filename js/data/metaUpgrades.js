// 메타 상점 업그레이드. cost(lvl)은 다음 레벨 구매 비용.
export const META_UPGRADES = {
  might:   { id:'might',   name:'힘',     stat:'damage',   kind:'flat', perLevel:3,   maxLevel:10, cost:(l)=>10+l*8 },
  vitality:{ id:'vitality',name:'생명력', stat:'maxHp',    kind:'flat', perLevel:15,  maxLevel:10, cost:(l)=>10+l*8 },
  greed:   { id:'greed',   name:'탐욕',   stat:'goldGain', kind:'mult', perLevel:0.1, maxLevel:10, cost:(l)=>15+l*10 },
  fortune: { id:'fortune', name:'행운',   stat:'soulGain', kind:'mult', perLevel:0.1, maxLevel:10, cost:(l)=>20+l*12 },
};
