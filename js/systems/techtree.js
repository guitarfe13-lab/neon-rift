// 테크트리 런타임(순수): 선택·분기 노드 개방·스탯 재계산·효과 설명. DOM 비의존 → node 테스트 안전.
import { getTrees, TECH_UNLOCK_LEVEL } from '../data/techTrees.js';
import { computeStats } from '../engine/stats.js';
import { passiveMods } from './levelup.js';

export { getTrees, TECH_UNLOCK_LEVEL };

function findTree(rs) { return getTrees(rs.charId).find((t) => t.id === rs.techTree) || null; }

function recompute(rs) {
  rs.stats = computeStats({ charId: rs.charId, metaUpgrades: rs.metaUpgrades,
    runMods: passiveMods(rs).concat(rs.treeMods || []) });
}

// 트리 선택(런당 1회). 노드 적용은 nextDueNode/applyNode로 별도 진행.
export function chooseTree(rs, tree) {
  if (rs.techTree) return false;
  rs.techTree = tree.id; rs.techTreeName = tree.name; rs.techTreeColor = tree.color;
  rs.treeMods = []; rs.treeApplied = 0;
  return true;
}

// 현재 레벨에 도달한 "다음 미개방 노드"(분기 여부 포함). 없으면 null.
export function nextDueNode(rs) {
  const tree = findTree(rs); if (!tree) return null;
  const node = tree.nodes[rs.treeApplied];
  return (node && node.lv <= rs.level) ? node : null;
}

// 다음 노드를 적용(분기 노드는 optionIdx 선택). 적용된 옵션({name,mods,special}) 반환.
export function applyNode(rs, optionIdx = 0) {
  const tree = findTree(rs); if (!tree) return null;
  const node = tree.nodes[rs.treeApplied]; if (!node || node.lv > rs.level) return null;
  const opt = node.options ? node.options[Math.max(0, Math.min(optionIdx, node.options.length - 1))] : node;
  rs.treeApplied++;
  rs.treeMods = (rs.treeMods || []).concat(opt.mods || []);
  if (opt.special?.lifesteal) rs.lifesteal = (rs.lifesteal || 0) + opt.special.lifesteal;
  recompute(rs);
  return opt;
}

// 효과 요약 문자열(웹 페이지·인게임 카드 공용).
const STAT_LABEL = {
  damage:'공격력', atkSpeed:'공격속도', area:'범위', projectiles:'투사체', pierce:'관통',
  crit:'치명타 확률', critMult:'치명타 피해', maxHp:'최대 체력', hpRegen:'체력 재생',
  maxMp:'최대 마나', mpRegen:'마나 재생', mpCostMul:'마나 소모', moveSpeed:'이동속도', pickupRange:'획득 범위',
};
export function describeMods(mods = [], special) {
  const parts = mods.map((m) => {
    const label = STAT_LABEL[m.stat] || m.stat;
    if (m.kind === 'mult') return `${label} ${m.value > 0 ? '+' : ''}${Math.round(m.value * 100)}%`;
    if (m.stat === 'crit') return `${label} +${Math.round(m.value * 100)}%`;
    if (m.stat === 'critMult') return `${label} +${Math.round(m.value * 100)}%`;
    if (m.stat === 'hpRegen' || m.stat === 'mpRegen') return `${label} +${m.value}/s`;
    return `${label} +${m.value}`;
  });
  if (special?.lifesteal) parts.push(`흡혈 ${Math.round(special.lifesteal * 100)}%`);
  return parts.join(' · ');
}
