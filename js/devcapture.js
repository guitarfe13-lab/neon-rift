/* [임시 개발도구] 게임 캔버스 캡쳐(PNG)·녹화(WebM, 게임 오디오 포함) 버튼.
 * 홈페이지용 미디어 제작을 위한 것 — 완료 후 이 파일 + play.html의 스크립트 한 줄 +
 * main.js의 window.__neonDev 블록을 삭제하면 완전 제거된다. */
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
  var recBtn = mk('🔴 녹화(소리)');
  var fullBtn = mk('⚡ 풀스킬');
  fullBtn.onclick = function () {
    if (window.__neonDev) { window.__neonDev.fullSkills(); fullBtn.textContent = '⚡ 다시 굴리기'; }
  };

  function dl(url, name) { var a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000); }
  function ts() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }

  shotBtn.onclick = function () {
    cv.toBlob(function (b) { if (b) dl(URL.createObjectURL(b), 'neon-rift-' + ts() + '.png'); }, 'image/png');
    shotBtn.textContent = '✅ 저장됨'; setTimeout(function () { shotBtn.textContent = '📷 캡쳐'; }, 900);
  };

  // 녹화: 캔버스 영상(60fps) + 게임 오디오(마스터 출력) 병합 → WebM
  var mr = null, chunks = [];
  recBtn.onclick = function () {
    if (mr) { mr.stop(); return; }
    var vs = cv.captureStream(60);
    var as = window.__neonDev && window.__neonDev.audioStream && window.__neonDev.audioStream();
    var tracks = vs.getVideoTracks().concat(as ? as.getAudioTracks() : []);
    if (!as || !as.getAudioTracks().length) console.warn('[devcapture] 오디오 트랙 없음 — 게임에서 한 번 클릭(오디오 활성) 후 녹화하세요.');
    var stream = new MediaStream(tracks);
    var mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find(function (m) { return MediaRecorder.isTypeSupported(m); });
    mr = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000, audioBitsPerSecond: 160000 });
    chunks = [];
    mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    mr.onstop = function () {
      dl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })), 'neon-rift-' + ts() + '.webm');
      mr = null; recBtn.textContent = '🔴 녹화(소리)'; recBtn.style.borderColor = 'rgba(66,230,255,0.4)';
    };
    mr.start();
    recBtn.textContent = '⏹ 녹화 중지'; recBtn.style.borderColor = '#ff4d4d';
  };

  document.body.appendChild(bar);
})();
