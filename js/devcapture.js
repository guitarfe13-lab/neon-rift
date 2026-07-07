/* [임시 개발도구] 게임 캔버스 캡쳐(PNG)·녹화(WebM) 버튼.
 * 홈페이지용 스크린샷/게임플레이 영상 제작을 위한 것 — 제작 완료 후 이 파일과
 * play.html의 <script src="/js/devcapture.js"> 한 줄을 삭제하면 완전 제거된다.
 * 녹화는 캔버스 영상만 담김(게임 오디오 미포함). */
(function () {
  'use strict';
  var cv = document.getElementById('game'); if (!cv) return;

  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:70;display:flex;gap:8px;align-items:center';
  function mk(txt) {
    var b = document.createElement('button'); b.textContent = txt;
    b.style.cssText = 'padding:9px 14px;border-radius:10px;border:1px solid rgba(66,230,255,0.4);' +
      'background:rgba(12,16,28,0.92);color:#eaf2ff;font:700 13px system-ui;cursor:pointer';
    bar.appendChild(b); return b;
  }
  var shotBtn = mk('📷 캡쳐');
  var recBtn = mk('🔴 녹화');

  function dl(url, name) { var a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000); }
  function ts() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }

  // 캡쳐: 현재 프레임을 PNG로 다운로드
  shotBtn.onclick = function () {
    cv.toBlob(function (b) { if (b) dl(URL.createObjectURL(b), 'neon-rift-' + ts() + '.png'); }, 'image/png');
    shotBtn.textContent = '✅ 저장됨'; setTimeout(function () { shotBtn.textContent = '📷 캡쳐'; }, 900);
  };

  // 녹화: 토글(시작/중지) → WebM 다운로드
  var mr = null, chunks = [];
  recBtn.onclick = function () {
    if (mr) { mr.stop(); return; }
    var stream = cv.captureStream(60);
    var mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
    chunks = [];
    mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = function () {
      dl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })), 'neon-rift-' + ts() + '.webm');
      mr = null; recBtn.textContent = '🔴 녹화'; recBtn.style.borderColor = 'rgba(66,230,255,0.4)';
    };
    mr.start();
    recBtn.textContent = '⏹ 녹화 중지'; recBtn.style.borderColor = '#ff4d4d';
  };

  document.body.appendChild(bar);
})();
