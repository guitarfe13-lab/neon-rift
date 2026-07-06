// 포털 공통 스크립트(바닐라 ES모듈): 홈 게임 그리드 렌더 + 유튜브 lite 임베드 + 스크린샷 자리표시.
//  콘텐츠 페이지에서 <script type="module" src="/js/site.js"></script> 로 로드.
import { SITE, GAMES } from './data/games.js';

// 이미지가 실제로 로드되면 넣고, 없으면 자리표시 텍스트를 남긴다(404 소음·깨진 이미지 방지).
function tryImage(container, src, alt, phText) {
  if (!src) { container.innerHTML = '<span class="ph">' + phText + '</span>'; return; }
  const img = new Image();
  img.onload = () => { container.innerHTML = ''; img.alt = alt || ''; container.appendChild(img); };
  img.onerror = () => { container.innerHTML = '<span class="ph">' + phText + '</span>'; };
  img.src = src;
}

// 홈: #game-grid 안에 GAMES 카드 렌더.
function mountGrid() {
  const grid = document.getElementById('game-grid');
  if (!grid) return;
  grid.innerHTML = '';
  GAMES.forEach((g) => {
    const live = g.status === 'live' && g.detail;
    const card = document.createElement(live ? 'a' : 'div');
    card.className = 'game-card' + (live ? '' : ' soon');
    if (live) card.href = g.detail;
    const thumb = document.createElement('div'); thumb.className = 'game-thumb';
    thumb.style.setProperty('border-bottom', '2px solid ' + (g.accent || '#42e6ff') + '55');
    const badge = live ? '<span class="badge live">플레이 가능</span>' : '<span class="badge soon">준비 중</span>';
    thumb.innerHTML = badge;
    const holder = document.createElement('div'); holder.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center';
    thumb.appendChild(holder);
    tryImage(holder, g.thumb, g.title, live ? '스크린샷 준비 중' : 'COMING SOON');
    const body = document.createElement('div'); body.className = 'game-body';
    body.innerHTML =
      '<div class="gt" style="color:' + (g.accent || '#42e6ff') + '">' + g.tagline + '</div>' +
      '<h3>' + g.title + '</h3><p>' + g.short + '</p>' +
      '<div class="game-tags">' + (g.tags || []).map((t) => '<span>' + t + '</span>').join('') + '</div>' +
      (live ? '<div class="play-line" style="color:' + (g.accent || '#42e6ff') + '">플레이 →</div>' : '');
    card.appendChild(thumb); card.appendChild(body);
    grid.appendChild(card);
  });
}

// 유튜브 lite: .yt-embed[data-yt] → 썸네일+재생버튼, 클릭 시에만 iframe 로드(no-cookie).
function mountYouTube() {
  document.querySelectorAll('.yt-embed').forEach((box) => {
    const id = (box.dataset.yt || '').trim();
    if (!id) { box.classList.add('empty'); box.innerHTML = '<span class="yt-ph">🎬 게임플레이 영상 준비 중</span>'; return; }
    box.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')";
    const btn = document.createElement('button');
    btn.className = 'yt-play'; btn.setAttribute('aria-label', '영상 재생');
    box.appendChild(btn);
    const play = () => {
      box.classList.add('playing'); box.style.backgroundImage = 'none';
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = '게임플레이 영상'; f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      box.innerHTML = ''; box.appendChild(f);
    };
    box.addEventListener('click', play);
  });
}

// 스크린샷: .shot[data-shot] → 이미지 로드 시도, 없으면 자리표시.
function mountShots() {
  document.querySelectorAll('.shot').forEach((s) => {
    tryImage(s, s.dataset.shot, s.dataset.alt || '', s.dataset.ph || '스크린샷 준비 중');
  });
}

// 포털 이름을 [data-site-name] 요소에 주입(브랜드 한 곳 관리).
function mountBrand() {
  document.querySelectorAll('[data-site-name]').forEach((e) => { e.textContent = SITE.name; });
}

function init() { mountBrand(); mountGrid(); mountYouTube(); mountShots(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
