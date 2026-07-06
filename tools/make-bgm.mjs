// 원본 칩튠 BGM 루프를 합성해 assets/bgm/track1.wav로 굽는다(외부 음원 없이 자체 제작 = CC0).
// 실행: node tools/make-bgm.mjs
import { writeFileSync } from 'node:fs';

const SR = 22050, BPM = 112, beat = 60 / BPM, bars = 8;
const dur = bars * 4 * beat, N = Math.floor(SR * dur);
const buf = new Float32Array(N);

const nf = (m) => 440 * Math.pow(2, (m - 69) / 12);          // MIDI → Hz
const sq = (p) => (p % 1) < 0.5 ? 1 : -1;                    // p: 사이클
const tri = (p) => 2 * Math.abs(2 * (p % 1) - 1) - 1;
const sinw = (p) => Math.sin(p * 2 * Math.PI);

// 화음 진행 Am–F–C–G ×2 (A 단조)
const prog = [
  { root:45, arp:[57,60,64] }, { root:41, arp:[53,57,60] },
  { root:48, arp:[60,64,67] }, { root:43, arp:[55,59,62] },
  { root:45, arp:[57,60,64] }, { root:41, arp:[53,57,60] },
  { root:48, arp:[60,64,67] }, { root:43, arp:[55,59,62] },
];
// 리드 멜로디(펜타토닉), 바당 8분음표 8칸. null=쉼표.
const lead = [
  [69,null,72,null,74,null,72,69], [69,null,65,null,69,null,72,null],
  [72,null,76,null,79,null,76,72], [74,null,71,null,67,null,71,null],
  [69,null,72,74,76,null,74,72],   [77,null,76,null,72,null,69,null],
  [79,null,76,null,72,null,76,79], [74,null,67,null,69,null,71,72],
];

function note(startSec, durSec, freq, wave, amp, decay) {
  const s0 = Math.floor(startSec * SR), s1 = Math.min(N, Math.floor((startSec + durSec) * SR));
  for (let s = s0; s < s1; s++) { const t = (s - s0) / SR;
    const env = Math.exp(-t * decay) * (1 - Math.exp(-t * 80)); // 어택+감쇠(클릭 방지)
    buf[s] += wave(freq * (s / SR)) * amp * env; }
}
function kick(startSec) {
  const s0 = Math.floor(startSec * SR), len = Math.floor(0.14 * SR);
  for (let i = 0; i < len; i++) { const t = i / SR; const f = 120 * Math.exp(-t * 30) + 40; const env = Math.exp(-t * 22);
    if (s0 + i < N) buf[s0 + i] += sinw(f * t) * 0.5 * env; }
}
function hat(startSec) {
  const s0 = Math.floor(startSec * SR), len = Math.floor(0.03 * SR); let seed = (s0 * 9301 + 49297) % 233280;
  for (let i = 0; i < len; i++) { seed = (seed * 9301 + 49297) % 233280; const n = (seed / 233280) * 2 - 1; const env = Math.exp(-i / SR * 120);
    if (s0 + i < N) buf[s0 + i] += n * 0.1 * env; }
}

for (let bar = 0; bar < bars; bar++) {
  const c = prog[bar], b0 = bar * 4 * beat;
  for (let b = 0; b < 4; b++) note(b0 + b * beat, beat * 0.9, nf(c.root), sq, 0.16, 3);          // 베이스
  for (let e = 0; e < 8; e++) note(b0 + e * beat / 2, beat * 0.45, nf(c.arp[e % 3]), sq, 0.09, 6); // 아르페지오
  for (let e = 0; e < 8; e++) { const m = lead[bar][e]; if (m != null) note(b0 + e * beat / 2, beat * 0.5, nf(m), tri, 0.16, 4); } // 리드
  kick(b0); kick(b0 + 2 * beat);
  for (let e = 0; e < 8; e++) hat(b0 + e * beat / 2);
}

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const g = peak > 0 ? 0.9 / peak : 1;
const out = Buffer.alloc(44 + N * 2);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 2, 4); out.write('WAVE', 8);
out.write('fmt ', 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) { const v = Math.max(-1, Math.min(1, buf[i] * g)); out.writeInt16LE(Math.round(v * 32767), 44 + i * 2); }
writeFileSync(new URL('../assets/bgm/track1.wav', import.meta.url), out);
console.log('track1.wav 생성:', (out.length / 1024 | 0) + 'KB', dur.toFixed(1) + 's');
