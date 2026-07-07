// 테크트리(데이터 주도): 런 레벨 20 도달 시 직업별 2계열 중 하나를 선택.
// 선택 즉시 lv20 노드가 적용되고, 25/30/35 도달마다 다음 노드가 자동 개방된다.
//  node: { lv, name, mods:[{stat,kind:'flat'|'mult',value}], special?:{lifesteal} }
//  mods는 computeStats의 runMods 형식과 동일. special은 main의 전투 훅으로 처리.
export const TECH_TREES = {
  blade: [
    { id:'berserker', name:'피의 광전사', color:'#ff5c6a',
      desc:'몰아치고, 벤 만큼 회복한다. 공격이 곧 생존.',
      nodes:[
        { lv:20, name:'광폭화',   mods:[{stat:'atkSpeed',kind:'mult',value:0.20}] },
        { lv:25, name:'피의 흡수', mods:[], special:{ lifesteal:0.06 } },
        { lv:30, name:'살육 본능', mods:[{stat:'damage',kind:'mult',value:0.25}] },
        { lv:35, name:'광혈 각성', mods:[{stat:'critMult',kind:'flat',value:0.5},{stat:'atkSpeed',kind:'mult',value:0.10}] },
      ] },
    { id:'guardian', name:'불괴의 수호자', color:'#42a6ff',
      desc:'철벽의 몸. 무너지지 않고 끝까지 전진한다.',
      nodes:[
        { lv:20, name:'강철 피부', mods:[{stat:'maxHp',kind:'mult',value:0.30}] },
        { lv:25, name:'재생 갑주', mods:[{stat:'hpRegen',kind:'flat',value:1.2}] },
        { lv:30, name:'반격 태세', mods:[{stat:'damage',kind:'mult',value:0.15},{stat:'area',kind:'mult',value:0.10}] },
        { lv:35, name:'불괴 완성', mods:[{stat:'maxHp',kind:'mult',value:0.30},{stat:'moveSpeed',kind:'mult',value:0.10}] },
      ] },
  ],
  mage: [
    { id:'archmage', name:'대마도사', color:'#c98bff',
      desc:'더 넓게, 더 싸게. 마법의 극한 효율.',
      nodes:[
        { lv:20, name:'비전 증폭', mods:[{stat:'damage',kind:'mult',value:0.20}] },
        { lv:25, name:'마나 절제', mods:[{stat:'mpCostMul',kind:'mult',value:-0.25}] },
        { lv:30, name:'광역 지배', mods:[{stat:'area',kind:'mult',value:0.20}] },
        { lv:35, name:'현자의 경지', mods:[{stat:'projectiles',kind:'flat',value:1}] },
      ] },
    { id:'stormweaver', name:'폭주 마도', color:'#ff8ce0',
      desc:'제어를 버리고 출력을 택한다. 연사하는 마법.',
      nodes:[
        { lv:20, name:'과부하',   mods:[{stat:'atkSpeed',kind:'mult',value:0.15}] },
        { lv:25, name:'날카로운 주문', mods:[{stat:'crit',kind:'flat',value:0.10}] },
        { lv:30, name:'마나 폭풍', mods:[{stat:'mpRegen',kind:'flat',value:0.6}] },
        { lv:35, name:'폭주 해방', mods:[{stat:'damage',kind:'mult',value:0.30}] },
      ] },
  ],
  ranger: [
    { id:'sniper', name:'관통 저격수', color:'#7cf9ff',
      desc:'한 발이 전열을 꿰뚫는다. 치명타의 미학.',
      nodes:[
        { lv:20, name:'관통 화살', mods:[{stat:'pierce',kind:'flat',value:1}] },
        { lv:25, name:'약점 간파', mods:[{stat:'crit',kind:'flat',value:0.12}] },
        { lv:30, name:'급소 사격', mods:[{stat:'critMult',kind:'flat',value:0.6}] },
        { lv:35, name:'궁극의 관통', mods:[{stat:'pierce',kind:'flat',value:2},{stat:'damage',kind:'mult',value:0.20}] },
      ] },
    { id:'stormrain', name:'화살 폭풍', color:'#8effc7',
      desc:'하늘을 화살로 덮는다. 수가 곧 힘.',
      nodes:[
        { lv:20, name:'다연장',   mods:[{stat:'projectiles',kind:'flat',value:1}] },
        { lv:25, name:'속사',     mods:[{stat:'atkSpeed',kind:'mult',value:0.15}] },
        { lv:30, name:'질풍 기동', mods:[{stat:'moveSpeed',kind:'mult',value:0.10},{stat:'pickupRange',kind:'mult',value:0.25}] },
        { lv:35, name:'화살비 완성', mods:[{stat:'projectiles',kind:'flat',value:1}] },
      ] },
  ],
  elementalist: [
    { id:'frostlord', name:'동토의 군주', color:'#8bd8ff',
      desc:'닿는 모든 것을 얼려붙이는 광역의 지배자.',
      nodes:[
        { lv:20, name:'영역 확장', mods:[{stat:'area',kind:'mult',value:0.20}] },
        { lv:25, name:'혹한 강화', mods:[{stat:'damage',kind:'mult',value:0.15}] },
        { lv:30, name:'정수 순환', mods:[{stat:'mpCostMul',kind:'mult',value:-0.20}] },
        { lv:35, name:'절대 영도', mods:[{stat:'area',kind:'mult',value:0.25},{stat:'damage',kind:'mult',value:0.15}] },
      ] },
    { id:'erosion', name:'침식의 현자', color:'#9cff8b',
      desc:'끊임없이 스며들어 갉아먹는 지속의 힘.',
      nodes:[
        { lv:20, name:'가속 침식', mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] },
        { lv:25, name:'정기 흡수', mods:[{stat:'mpRegen',kind:'flat',value:0.5}] },
        { lv:30, name:'맹독 강화', mods:[{stat:'damage',kind:'mult',value:0.20}] },
        { lv:35, name:'침식 완성', mods:[{stat:'projectiles',kind:'flat',value:1}] },
      ] },
  ],
};
export const TECH_UNLOCK_LEVEL = 20;
export function getTrees(charId) { return TECH_TREES[charId] || []; }
