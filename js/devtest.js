/* [임시 테스트도구] 하단 레벨 점프 버튼(15 / 20전직 / 40각인).
 * 후반 콘텐츠(마법 몹·전직 키스톤·각인) 테스트를 위해 즉시 해당 레벨 + 상응 스킬·전직·각인을 부여한다.
 * 테스트 완료 후 이 파일 + play.html의 스크립트 한 줄 + main.js의 window.__neonTest 블록을 삭제하면 완전 제거. */
(function () {
  'use strict';
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:70;display:flex;gap:8px';
  function mkBtn(label, call) {
    var btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = 'padding:9px 14px;border-radius:10px;border:1px solid rgba(255,90,90,0.55);' +
      'background:rgba(22,8,8,0.9);color:#ffb3b3;font:700 13px system-ui;cursor:pointer';
    btn.onclick = function () {
      var ok = window.__neonTest && call(window.__neonTest);
      var t = btn.textContent;
      btn.textContent = ok ? '✅' : '먼저 시작';
      setTimeout(function () { btn.textContent = t; }, 900);
    };
    wrap.appendChild(btn);
  }
  mkBtn('⚡15레벨', function (t) { if (t.jumpTo15) { t.jumpTo15(); return true; } });
  mkBtn('⚔️20전직', function (t) { if (t.jumpTo20) { t.jumpTo20(); return true; } });
  mkBtn('🔮40각인', function (t) { if (t.jumpTo40) { t.jumpTo40(); return true; } });
  document.body.appendChild(wrap);
})();
