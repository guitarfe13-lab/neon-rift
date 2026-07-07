// 테크트리 런타임(순수): 선택·노드 개방·스탯 재계산. DOM 비의존 → node 테스트 안전.
import { getTrees, TECH_UNLOCK_LEVEL } from '../data/techTrees.js';
import { computeStats } from '../engine/stats.js';
import { passiveMods } from './levelup.js';

export { getTrees, TECH_UNLOCK_LEVEL };

function findTree(rs) { return getTrees(rs.charId).find((t) => t.id === rs.techTree) || null; }

function recompute(rs) {
  rs.stats = computeStats({ charId: rs.charId, metaUpgrades: rs.metaUpgrades,
    runMods: passiveMods(rs).concat(rs.treeMods || []) });
}

// 트리 선택: 즉시 현재 레벨 이하 노드를 전부 개방. 개방된 노드 목록 반환.
export function chooseTree(rs, tree) {
  if (rs.techTree) return [];
  rs.techTree = tree.id; rs.techTreeName = tree.name; rs.techTreeColor = tree.color;
  rs.treeMods = []; rs.treeApplied = 0;
  return applyDueNodes(rs);
}

// 현재 레벨에 도달한 미개방 노드를 순서대로 적용. 적용한 노드 배열 반환.
export function applyDueNodes(rs) {
  const tree = findTree(rs); if (!tree) return [];
  const applied = [];
  while (rs.treeApplied < tree.nodes.length && tree.nodes[rs.treeApplied].lv <= rs.level) {
    const node = tree.nodes[rs.treeApplied++];
    rs.treeMods = (rs.treeMods || []).concat(node.mods || []);
    if (node.special?.lifesteal) rs.lifesteal = (rs.lifesteal || 0) + node.special.lifesteal;
    applied.push(node);
  }
  if (applied.length) recompute(rs);
  return applied;
}
