// 포털에 올라가는 게임 목록(데이터 주도). 새 게임 = 여기에 항목 한 줄 추가 → 홈 카드에 자동 노출.
//  status: 'live'(플레이 가능) | 'soon'(준비 중, 비활성 카드)
//  detail: 상세 페이지 경로 / play: 실행 페이지 / youtube: 영상 ID(비우면 "준비 중")
//  thumb: 카드 썸네일(assets/thumbs/*.png, 없으면 자동 자리표시)
export const SITE = {
  name: 'NEON ARCADE',
  tagline: '설치 없이 즐기는 네온 웹게임 모음',
  desc: '브라우저에서 바로 플레이하는 무료 아케이드. 새로운 게임이 계속 추가됩니다.',
  domain: 'https://neon-arcade.example.com',   // ← 실제 배포 도메인으로 교체
};

export const GAMES = [
  {
    id: 'neon-rift',
    title: 'NEON RIFT',
    tagline: '액션 로그라이크 방치형 RPG',
    short: '스킬을 조합해 자동 전투를 벌이고, 진화시키고, 회차마다 강해지는 보스를 무너뜨리는 네온 로그라이크.',
    accent: '#42e6ff',
    status: 'live',
    detail: '/neon-rift.html',
    play: '/play.html',
    guide: '/guide.html',
    youtube: 'DAxKArd6h-Q',            // 게임플레이 영상
    thumb: 'assets/thumbs/neon-rift.png',
    tags: ['로그라이크', '방치형', '액션'],
  },
  {
    id: 'coming-soon',
    title: '다음 게임',
    tagline: 'COMING SOON',
    short: '새로운 네온 웹게임을 제작 중입니다. 곧 이곳에 추가됩니다.',
    accent: '#ff4d9d',
    status: 'soon',
    detail: '', play: '', guide: '', youtube: '', thumb: '',
    tags: ['준비 중'],
  },
];

export function getGame(id) { return GAMES.find((g) => g.id === id) || null; }
