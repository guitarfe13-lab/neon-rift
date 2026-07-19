/* [임시 테스트도구] 하단 "15레벨 점프" 버튼.
 * 후반(마법 몹·보스 등) 테스트를 위해 즉시 15레벨 + 15레벨 수준 스킬·패시브를 부여한다.
 * 테스트 완료 후 이 파일 + play.html의 스크립트 한 줄 + main.js의 window.__neonTest 블록을 삭제하면 완전 제거. */
(function () {
  'use strict';
  var btn = document.createElement('button');
  btn.textContent = '⚡ TEST: 15레벨';
  btn.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:70;' +
    'padding:9px 16px;border-radius:10px;border:1px solid rgba(255,90,90,0.55);' +
    'background:rgba(22,8,8,0.9);color:#ffb3b3;font:700 13px system-ui;cursor:pointer';
  btn.onclick = function () {
    if (window.__neonTest && window.__neonTest.jumpTo15) {
      window.__neonTest.jumpTo15();
      btn.textContent = '✅ 15레벨 적용됨';
      setTimeout(function () { btn.textContent = '⚡ TEST: 15레벨'; }, 1200);
    } else {
      btn.textContent = '먼저 게임 시작';
      setTimeout(function () { btn.textContent = '⚡ TEST: 15레벨'; }, 1200);
    }
  };
  document.body.appendChild(btn);
})();
