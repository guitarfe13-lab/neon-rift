// 엔티티 풀. GC 최소화를 위해 배열 재사용 + despawnDead 압축.
export function createWorld() {
  const world = {
    player: { x: 0, y: 0, hp: 100, maxHp: 100, alive: true, radius: 16, invuln: 0 },
    enemies: [], projectiles: [], hazards: [], pickups: [], particles: [], floaters: [],
  };
  const mk = (list) => (props) => { const o = { alive: true, ...props }; list.push(o); return o; };
  world.spawnEnemy = mk(world.enemies);
  world.spawnProjectile = mk(world.projectiles);
  world.spawnHazard = mk(world.hazards);       // 적 투사체(플레이어에게 피해)
  world.spawnPickup = mk(world.pickups);
  world.spawnParticle = mk(world.particles);
  world.spawnFloater = mk(world.floaters);
  world.despawnDead = () => {
    for (const key of ['enemies','projectiles','hazards','pickups','particles','floaters']) {
      const list = world[key]; let n = 0;
      for (let i = 0; i < list.length; i++) if (list[i].alive) list[n++] = list[i];
      list.length = n;
    }
  };
  return world;
}
