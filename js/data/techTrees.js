// 테크트리(데이터 주도): 런 레벨 20 도달 시 직업별 3계열 중 하나를 선택.
// 진입(lv20) 노드는 즉시 적용, 이후 25/30/35 도달마다 "2택 분기"를 선택한다.
//  entry 노드: { lv:20, name, mods, special? }
//  분기 노드:  { lv, options:[ {name, mods, special?}, {name, mods} ] }
//  mods는 computeStats runMods 형식({stat,kind:'flat'|'mult',value}). special은 main 전투 훅.
export const TECH_TREES = {
  blade: [
    { id:'berserker', name:'피의 광전사', color:'#ff5c6a', desc:'몰아치고, 벤 만큼 회복한다. 공격이 곧 생존.',
      nodes:[
        { lv:20, name:'광폭화', mods:[{stat:'atkSpeed',kind:'mult',value:0.20}] },
        { lv:25, options:[
          { name:'피의 흡수', mods:[], special:{ lifesteal:0.06 } },
          { name:'압도',     mods:[{stat:'damage',kind:'mult',value:0.18}] } ] },
        { lv:30, options:[
          { name:'살육 본능', mods:[{stat:'damage',kind:'mult',value:0.25}] },
          { name:'광기 가속', mods:[{stat:'atkSpeed',kind:'mult',value:0.18}] } ] },
        { lv:35, options:[
          { name:'광혈 각성', mods:[{stat:'critMult',kind:'flat',value:0.6}] },
          { name:'학살자',   mods:[{stat:'damage',kind:'mult',value:0.20},{stat:'atkSpeed',kind:'mult',value:0.10}] } ] },
      ] },
    { id:'guardian', name:'불괴의 수호자', color:'#42a6ff', desc:'철벽의 몸. 무너지지 않고 끝까지 전진한다.',
      nodes:[
        { lv:20, name:'강철 피부', mods:[{stat:'maxHp',kind:'mult',value:0.30}] },
        { lv:25, options:[
          { name:'재생 갑주', mods:[{stat:'hpRegen',kind:'flat',value:1.2}] },
          { name:'육중한 일격', mods:[{stat:'damage',kind:'mult',value:0.15}] } ] },
        { lv:30, options:[
          { name:'반격 태세', mods:[{stat:'damage',kind:'mult',value:0.15},{stat:'area',kind:'mult',value:0.10}] },
          { name:'철옹성',   mods:[{stat:'maxHp',kind:'mult',value:0.25}] } ] },
        { lv:35, options:[
          { name:'불괴 완성', mods:[{stat:'maxHp',kind:'mult',value:0.30},{stat:'moveSpeed',kind:'mult',value:0.10}] },
          { name:'수호의 격노', mods:[{stat:'damage',kind:'mult',value:0.25}] } ] },
      ] },
    { id:'flash', name:'섬광의 검객', color:'#ffe14d', desc:'바람처럼 움직이고 빛처럼 벤다. 기교의 극치.',
      nodes:[
        { lv:20, name:'질풍', mods:[{stat:'moveSpeed',kind:'mult',value:0.15}] },
        { lv:25, options:[
          { name:'예리',     mods:[{stat:'crit',kind:'flat',value:0.10}] },
          { name:'가속',     mods:[{stat:'atkSpeed',kind:'mult',value:0.15}] } ] },
        { lv:30, options:[
          { name:'절제',     mods:[{stat:'critMult',kind:'flat',value:0.5}] },
          { name:'질주',     mods:[{stat:'moveSpeed',kind:'mult',value:0.12},{stat:'pickupRange',kind:'mult',value:0.25}] } ] },
        { lv:35, options:[
          { name:'섬광 완성', mods:[{stat:'damage',kind:'mult',value:0.20},{stat:'crit',kind:'flat',value:0.08}] },
          { name:'무영검',   mods:[{stat:'atkSpeed',kind:'mult',value:0.20}] } ] },
      ] },
  ],
  mage: [
    { id:'archmage', name:'대마도사', color:'#c98bff', desc:'더 넓게, 더 싸게. 마법의 극한 효율.',
      nodes:[
        { lv:20, name:'비전 증폭', mods:[{stat:'damage',kind:'mult',value:0.20}] },
        { lv:25, options:[
          { name:'마나 절제', mods:[{stat:'mpCostMul',kind:'mult',value:-0.25}] },
          { name:'명상',     mods:[{stat:'mpRegen',kind:'flat',value:0.6}] } ] },
        { lv:30, options:[
          { name:'광역 지배', mods:[{stat:'area',kind:'mult',value:0.20}] },
          { name:'집중 포화', mods:[{stat:'damage',kind:'mult',value:0.20}] } ] },
        { lv:35, options:[
          { name:'현자의 경지', mods:[{stat:'projectiles',kind:'flat',value:1}] },
          { name:'대붕괴',   mods:[{stat:'damage',kind:'mult',value:0.30}] } ] },
      ] },
    { id:'stormweaver', name:'폭주 마도', color:'#ff8ce0', desc:'제어를 버리고 출력을 택한다. 연사하는 마법.',
      nodes:[
        { lv:20, name:'과부하', mods:[{stat:'atkSpeed',kind:'mult',value:0.15}] },
        { lv:25, options:[
          { name:'날카로운 주문', mods:[{stat:'crit',kind:'flat',value:0.10}] },
          { name:'폭주 가속',   mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] } ] },
        { lv:30, options:[
          { name:'마나 폭풍', mods:[{stat:'mpRegen',kind:'flat',value:0.6}] },
          { name:'여파',     mods:[{stat:'area',kind:'mult',value:0.15}] } ] },
        { lv:35, options:[
          { name:'폭주 해방', mods:[{stat:'damage',kind:'mult',value:0.30}] },
          { name:'이중 시전', mods:[{stat:'projectiles',kind:'flat',value:1}] } ] },
      ] },
    { id:'wardmage', name:'비전 수호자', color:'#8be0ff', desc:'버티는 마법. 유리 대포에서 강철 대포로.',
      nodes:[
        { lv:20, name:'마력 방벽', mods:[{stat:'maxHp',kind:'mult',value:0.25}] },
        { lv:25, options:[
          { name:'재생 문양', mods:[{stat:'hpRegen',kind:'flat',value:1.0}] },
          { name:'마나 샘',   mods:[{stat:'maxMp',kind:'mult',value:0.40}] } ] },
        { lv:30, options:[
          { name:'수호 확장', mods:[{stat:'area',kind:'mult',value:0.15}] },
          { name:'압축 마력', mods:[{stat:'damage',kind:'mult',value:0.18}] } ] },
        { lv:35, options:[
          { name:'대현자의 방벽', mods:[{stat:'maxHp',kind:'mult',value:0.30},{stat:'damage',kind:'mult',value:0.15}] },
          { name:'마나 화신',   mods:[{stat:'mpCostMul',kind:'mult',value:-0.30}] } ] },
      ] },
  ],
  ranger: [
    { id:'sniper', name:'관통 저격수', color:'#7cf9ff', desc:'한 발이 전열을 꿰뚫는다. 치명타의 미학.',
      nodes:[
        { lv:20, name:'관통 화살', mods:[{stat:'pierce',kind:'flat',value:1}] },
        { lv:25, options:[
          { name:'약점 간파', mods:[{stat:'crit',kind:'flat',value:0.12}] },
          { name:'신속 장전', mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] } ] },
        { lv:30, options:[
          { name:'급소 사격', mods:[{stat:'critMult',kind:'flat',value:0.6}] },
          { name:'이중 관통', mods:[{stat:'pierce',kind:'flat',value:1}] } ] },
        { lv:35, options:[
          { name:'궁극의 관통', mods:[{stat:'pierce',kind:'flat',value:2},{stat:'damage',kind:'mult',value:0.20}] },
          { name:'처형자',     mods:[{stat:'critMult',kind:'flat',value:0.8}] } ] },
      ] },
    { id:'stormrain', name:'화살 폭풍', color:'#8effc7', desc:'하늘을 화살로 덮는다. 수가 곧 힘.',
      nodes:[
        { lv:20, name:'다연장', mods:[{stat:'projectiles',kind:'flat',value:1}] },
        { lv:25, options:[
          { name:'속사',   mods:[{stat:'atkSpeed',kind:'mult',value:0.15}] },
          { name:'확산',   mods:[{stat:'area',kind:'mult',value:0.15}] } ] },
        { lv:30, options:[
          { name:'질풍 기동', mods:[{stat:'moveSpeed',kind:'mult',value:0.10},{stat:'pickupRange',kind:'mult',value:0.25}] },
          { name:'화력 보강', mods:[{stat:'damage',kind:'mult',value:0.15}] } ] },
        { lv:35, options:[
          { name:'화살비 완성', mods:[{stat:'projectiles',kind:'flat',value:1}] },
          { name:'폭풍의 눈',   mods:[{stat:'damage',kind:'mult',value:0.25}] } ] },
      ] },
    { id:'shadow', name:'그림자 사냥꾼', color:'#b28bff', desc:'보이지 않는 곳에서 치명적으로. 암습의 명수.',
      nodes:[
        { lv:20, name:'그림자 걸음', mods:[{stat:'moveSpeed',kind:'mult',value:0.12}] },
        { lv:25, options:[
          { name:'암습',     mods:[{stat:'crit',kind:'flat',value:0.10}] },
          { name:'침묵 사격', mods:[{stat:'damage',kind:'mult',value:0.15}] } ] },
        { lv:30, options:[
          { name:'치명 강화', mods:[{stat:'critMult',kind:'flat',value:0.5}] },
          { name:'신속',     mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] } ] },
        { lv:35, options:[
          { name:'그림자 처형', mods:[{stat:'crit',kind:'flat',value:0.10},{stat:'critMult',kind:'flat',value:0.5}] },
          { name:'무형 기동',   mods:[{stat:'moveSpeed',kind:'mult',value:0.15},{stat:'damage',kind:'mult',value:0.15}] } ] },
      ] },
  ],
  elementalist: [
    { id:'frostlord', name:'동토의 군주', color:'#8bd8ff', desc:'닿는 모든 것을 얼려붙이는 광역의 지배자.',
      nodes:[
        { lv:20, name:'영역 확장', mods:[{stat:'area',kind:'mult',value:0.20}] },
        { lv:25, options:[
          { name:'혹한 강화', mods:[{stat:'damage',kind:'mult',value:0.15}] },
          { name:'서리 순환', mods:[{stat:'mpRegen',kind:'flat',value:0.5}] } ] },
        { lv:30, options:[
          { name:'정수 순환', mods:[{stat:'mpCostMul',kind:'mult',value:-0.20}] },
          { name:'확장 냉기', mods:[{stat:'area',kind:'mult',value:0.15}] } ] },
        { lv:35, options:[
          { name:'절대 영도', mods:[{stat:'area',kind:'mult',value:0.25},{stat:'damage',kind:'mult',value:0.15}] },
          { name:'빙하기',   mods:[{stat:'damage',kind:'mult',value:0.30}] } ] },
      ] },
    { id:'erosion', name:'침식의 현자', color:'#9cff8b', desc:'끊임없이 스며들어 갉아먹는 지속의 힘.',
      nodes:[
        { lv:20, name:'가속 침식', mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] },
        { lv:25, options:[
          { name:'정기 흡수', mods:[{stat:'mpRegen',kind:'flat',value:0.5}] },
          { name:'부식',     mods:[{stat:'damage',kind:'mult',value:0.15}] } ] },
        { lv:30, options:[
          { name:'맹독 강화', mods:[{stat:'damage',kind:'mult',value:0.20}] },
          { name:'침식 영역', mods:[{stat:'area',kind:'mult',value:0.15}] } ] },
        { lv:35, options:[
          { name:'침식 완성', mods:[{stat:'projectiles',kind:'flat',value:1}] },
          { name:'역병 화신', mods:[{stat:'damage',kind:'mult',value:0.25}] } ] },
      ] },
    { id:'stormcaller', name:'폭풍 원소사', color:'#ffd166', desc:'한순간의 방출에 모든 정수를 싣는다.',
      nodes:[
        { lv:20, name:'방출 증폭', mods:[{stat:'damage',kind:'mult',value:0.20}] },
        { lv:25, options:[
          { name:'정전기',   mods:[{stat:'crit',kind:'flat',value:0.10}] },
          { name:'가속 방출', mods:[{stat:'atkSpeed',kind:'mult',value:0.12}] } ] },
        { lv:30, options:[
          { name:'연쇄 공명', mods:[{stat:'area',kind:'mult',value:0.18}] },
          { name:'정수 압축', mods:[{stat:'damage',kind:'mult',value:0.18}] } ] },
        { lv:35, options:[
          { name:'폭풍우 강림', mods:[{stat:'damage',kind:'mult',value:0.25},{stat:'crit',kind:'flat',value:0.08}] },
          { name:'원소 분열',   mods:[{stat:'projectiles',kind:'flat',value:1}] } ] },
      ] },
  ],
};
export const TECH_UNLOCK_LEVEL = 20;
export function getTrees(charId) { return TECH_TREES[charId] || []; }
