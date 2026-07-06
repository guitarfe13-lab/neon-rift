// 입력 + 오토파일럿 조향(가장 가까운 위협 반대 + 근접 XP 유도).
export function makeInput(canvas) {
  const keys = new Set(); const pointer = { x: 0, y: 0, down: false };
  let autopilot = true;
  addEventListener('keydown', e => { keys.add(e.key.toLowerCase()); if (e.key.toLowerCase()==='p') autopilot=!autopilot; });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX-r.left) * canvas.width/r.width; pointer.y = (e.clientY-r.top) * canvas.height/r.height; });
  canvas.addEventListener('pointerdown', () => pointer.down = true);
  addEventListener('pointerup', () => pointer.down = false);
  function manualVector() {
    let x=0,y=0;
    if (keys.has('a')||keys.has('arrowleft')) x-=1; if (keys.has('d')||keys.has('arrowright')) x+=1;
    if (keys.has('w')||keys.has('arrowup')) y-=1; if (keys.has('s')||keys.has('arrowdown')) y+=1;
    const m = Math.hypot(x,y)||1; return { x:x/m, y:y/m };
  }
  function autopilotVector(world) {
    const p = world.player; let tx=0,ty=0;
    let near=null, nd=Infinity;
    for (const e of world.enemies){ if(!e.alive)continue; const d=(e.x-p.x)**2+(e.y-p.y)**2; if(d<nd){nd=d;near=e;} }
    if (near){ const a=Math.atan2(p.y-near.y,p.x-near.x); tx+=Math.cos(a); ty+=Math.sin(a); }
    let gem=null, gd=Infinity;
    for (const g of world.pickups){ if(!g.alive)continue; const d=(g.x-p.x)**2+(g.y-p.y)**2; if(d<gd){gd=d;gem=g;} }
    if (gem){ const a=Math.atan2(gem.y-p.y,gem.x-p.x); tx+=Math.cos(a)*0.6; ty+=Math.sin(a)*0.6; }
    const m=Math.hypot(tx,ty)||1; return { x:tx/m, y:ty/m };
  }
  return { keys, pointer, isAutopilot: () => autopilot, toggleAutopilot: () => autopilot=!autopilot,
    moveVector(world){ return autopilot ? autopilotVector(world) : manualVector(); } };
}
