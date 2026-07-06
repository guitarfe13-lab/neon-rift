// 스킬노트(웹 페이지용 설명). 게임 로직과 분리 — skills.js의 수치와 합쳐 skillnotes.html에서 렌더.
//  각 항목: { note: 설명, tip?: 팁 }.  원소/타입/진화 정보는 skills.js에서 자동으로 가져온다.
export const ELEMENTS = {
  physical:  { label: '물리', emoji: '⚔️', color: '#cfe3ff' },
  arcane:    { label: '비전', emoji: '🔮', color: '#c98bff' },
  fire:      { label: '화염', emoji: '🔥', color: '#ff6a3d' },
  ice:       { label: '얼음', emoji: '❄️', color: '#8bd8ff' },
  lightning: { label: '번개', emoji: '⚡', color: '#b28bff' },
  holy:      { label: '신성', emoji: '✨', color: '#ffe58a' },
  poison:    { label: '독',   emoji: '☠️', color: '#9cff8b' },
};
export const TYPE_LABEL = {
  projectile: '투사체', beam: '빔', orbital: '궤도', aura: '오라', chain: '연쇄', summon: '소환',
};

export const SKILL_NOTES = {
  // 물리
  strike:      { note: '검사의 시작 스킬. 근거리에서 빠르게 내지르는 단타. 사거리는 짧지만 쿨이 짧아 꾸준한 딜을 넣는다.', tip: '3레벨을 찍으면 검기 투사가 해금된다.' },
  blade_orbit: { note: '검기를 앞으로 날리는 원거리 물리. 기본 타격을 익힌 뒤 배울 수 있다.', tip: '파워 패시브를 8까지 올리면 폭풍검으로 진화한다.' },
  twin_shot:   { note: '두 발을 동시에 쏘는 물리 투사체. 레벨업으로 발수가 늘어 탄막이 촘촘해진다.', tip: '관통이 없으니 적이 몰릴 때 유리하다.' },
  spread_shot: { note: '부채꼴로 여러 발을 뿌리는 근~중거리 광역. 다수의 적 정리에 강하다.', tip: '정면에 밀집한 적에게 최대 효율.' },
  orbit_blade: { note: '몸 주위를 도는 검으로 접근하는 적을 지속 타격한다. MP를 쓰지 않는다.', tip: '회전 검 4레벨 이후 might_core로 톱날 폭풍 진화.' },
  rail:        { note: '긴 직선을 관통하는 초고위력 물리 빔. 쿨이 길지만 일렬의 적을 한 번에 꿰뚫는다.', tip: '적을 직선으로 유도해 쏘면 최고 효율.' },
  quake:       { note: '발밑에서 광역 충격을 일으켜 주변 전체에 피해. MP 무소모.', tip: '기본 타격 5레벨 후 해금. 포위됐을 때 탈출용으로 강력하다.' },
  turret:      { note: '포탑 드론을 소환해 자동으로 사격한다. MP 무소모.', tip: '드론이 대신 딜을 넣어 이동에 집중할 수 있다.' },
  // 비전
  arcane_bolt: { note: '마법사의 기본 원거리. 관통이 있어 뒤의 적까지 노린다.', tip: 'haste 패시브로 비전 폭풍으로 진화한다.' },
  laser:       { note: '즉발 관통 빔. 사거리 안의 적을 동시에 때린다.', tip: 'power 패시브로 프리즘 빔으로 진화한다.' },
  spirit:      { note: '따라다니며 자동으로 적을 쏘는 소환 정령.', tip: '이동 중에도 딜이 유지된다.' },
  // 화염
  fireball:    { note: '느리지만 강력한 관통 화염 투사체. 명중하면 잔불이 튄다.', tip: '관통 2로 뭉친 적을 한 번에 태운다.' },
  flame_aura:  { note: '몸 주위에 화염 장판을 둘러 접근한 적을 지속적으로 태운다.', tip: '적 무리로 파고들며 광역 딜.' },
  // 얼음
  ice_shard:   { note: '관통하는 얼음 파편. 안정적인 중거리 딜을 제공한다.' },
  ice_lance:   { note: '정령술사의 기본. 관통 2의 얼음창을 던진다.' },
  frost_ring:  { note: '회전하는 얼음 고리로 근접을 방어한다. MP 무소모.' },
  frost_aura:  { note: '주변에 냉기 장판을 펼친다.', tip: 'giant 패시브로 눈보라로 진화한다.' },
  // 번개
  chain_spark: { note: '가까운 적들 사이를 튀며 연쇄하는 번개.', tip: 'haste 패시브로 폭풍우로 진화한다.' },
  arc_whip:    { note: '채찍처럼 휘둘러 여러 대상을 연쇄 감전시킨다.' },
  // 신성
  holy_lance:  { note: '관통 3의 신성 창. 여러 적을 꿰뚫고 명중 시 섬광이 터진다.' },
  holy_field:  { note: '발밑에 성역을 펼쳐 광역 지속 피해를 준다.' },
  // 독
  venom_cloud: { note: '넓은 독 구름을 남겨 지역을 오염시키고 지속 피해를 준다.', tip: '길목에 깔아두면 효율이 높다.' },
  // 진화(강화판)
  blade_storm:  { note: '검기 투사의 진화. 다섯 갈래 검기를 폭풍처럼 난사한다.' },
  arcane_storm: { note: '비전 화살의 진화. 관통하는 비전탄을 폭풍처럼 퍼붓는다.' },
  prism_beam:   { note: '레이저의 진화. 초고위력 관통 프리즘 빔.' },
  saw_storm:    { note: '회전 검의 진화. 여섯 개의 톱날이 몸을 두른다.' },
  blizzard:     { note: '서리 오라의 진화. 광역 눈보라로 화면을 얼려붙인다.' },
  tempest:      { note: '연쇄 번개의 진화. 일곱 갈래 번개 폭풍으로 전장을 덮는다.' },
};
