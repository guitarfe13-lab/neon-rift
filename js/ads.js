/* NEON RIFT 광고(Google AdSense) + 동의 배너. 바닐라·의존성0·무빌드.
 * 콘텐츠 페이지(index/guide/privacy)에서 <script src="/js/ads.js" defer> 로 로드.
 * 광고 자리는 HTML의 <div class="ad-slot" data-ad-slot="번호"></div> 로 표기한다.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ 승인 후 아래 ADSENSE_CLIENT 한 줄만 실제 게시자 ID로 교체하면 │
 * │ 사이트 전체 광고가 활성화된다. (그 전엔 미리보기 박스 표시)   │
 * └──────────────────────────────────────────────────────────────┘
 */
(function () {
  'use strict';
  var ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';   // ← AdSense 승인 후 교체 (ca-pub-####)
  var CONSENT_KEY = 'neonrift.consent';
  var isPlaceholder = /X{6,}/.test(ADSENSE_CLIENT);

  function slots() { return Array.prototype.slice.call(document.querySelectorAll('.ad-slot')); }

  // 미설정 상태: 광고 위치를 눈으로 확인할 수 있는 미리보기 박스.
  function fillPlaceholders() {
    slots().forEach(function (s) {
      if (s.dataset.filled) return; s.dataset.filled = '1';
      s.classList.add('ad-placeholder');
      s.innerHTML = '<span>광고 영역</span><small>AdSense 승인·설정 후 실제 광고가 표시됩니다</small>';
    });
  }

  // 동의 후: AdSense 스크립트 로드 + 각 슬롯에 광고 유닛 삽입.
  function loadAdsense() {
    if (window.__neonAdsLoaded) return; window.__neonAdsLoaded = true;
    var sc = document.createElement('script');
    sc.async = true; sc.crossOrigin = 'anonymous';
    sc.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    document.head.appendChild(sc);
    slots().forEach(function (s) {
      if (s.dataset.filled) return; s.dataset.filled = '1';
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
      if (s.dataset.adSlot) ins.setAttribute('data-ad-slot', s.dataset.adSlot);
      ins.setAttribute('data-ad-format', s.dataset.adFormat || 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      s.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  function showConsent() {
    if (document.getElementById('consent-banner')) return;
    var b = document.createElement('div'); b.id = 'consent-banner';
    b.innerHTML =
      '<p>이 사이트는 게임 진행 저장에 브라우저 로컬 저장소를 사용하며, Google AdSense 광고 게재를 위해 쿠키를 사용할 수 있습니다. ' +
      '자세한 내용은 <a href="/privacy.html">개인정보 처리방침</a>을 확인하세요.</p>' +
      '<div class="consent-btns"><button id="consent-deny" class="btn ghost small">거부</button>' +
      '<button id="consent-accept" class="btn primary small">동의</button></div>';
    document.body.appendChild(b);
    document.getElementById('consent-accept').onclick = function () { b.remove(); setConsent('granted'); loadAdsense(); };
    document.getElementById('consent-deny').onclick = function () { b.remove(); setConsent('denied'); };
  }

  function init() {
    if (isPlaceholder) { fillPlaceholders(); return; }     // 아직 미설정 → 미리보기
    var c = null; try { c = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (c === 'granted') loadAdsense();
    else if (c === 'denied') { /* 광고 미표시 */ }
    else showConsent();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
