// 고정 타임스텝 루프. 브라우저에선 tick(performance.now())를 rAF로 호출.
export function makeLoop({ update, render, step = 1000 / 60, maxFrame = 250 }) {
  let last = null, acc = 0;
  function tick(now) {
    if (last === null) { last = now; return; }
    let frame = now - last; last = now;
    if (frame > maxFrame) frame = maxFrame;
    acc += frame;
    while (acc >= step) { update(step); acc -= step; }
    if (render) render(acc / step);
  }
  function reset() { last = null; acc = 0; }
  return { tick, reset };
}
