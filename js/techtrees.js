// 테크트리 소개 렌더러(웹): techTrees.js(데이터) + describeMods(요약)를 직업별로 렌더.
import { TECH_TREES } from './data/techTrees.js';
import { CHARACTERS } from './data/characters.js';
import { describeMods } from './systems/techtree.js';

function nodeRow(node) {
  if (!node.options) {   // 진입 노드
    return `<div class="tt-node entry"><span class="tt-lv">Lv${node.lv}</span>
      <b>${node.name}</b><span class="tt-fx">${describeMods(node.mods, node.special)}</span>
      <span class="tt-tag">진입 보너스</span></div>`;
  }
  const opts = node.options.map((o) =>
    `<div class="tt-opt"><b>${o.name}</b><span class="tt-fx">${describeMods(o.mods, o.special)}</span></div>`).join('<span class="tt-or">또는</span>');
  return `<div class="tt-node"><span class="tt-lv">Lv${node.lv}</span><div class="tt-opts">${opts}</div></div>`;
}

function treeCard(tree) {
  return `<div class="tt-card" style="--acc:${tree.color}">
    <div class="tt-head"><span class="sk-dot"></span><h3>${tree.name}</h3></div>
    <p class="tt-desc">${tree.desc}</p>
    ${tree.nodes.map(nodeRow).join('')}
  </div>`;
}

function render() {
  const root = document.getElementById('tech-trees'); if (!root) return;
  let html = '';
  for (const [charId, trees] of Object.entries(TECH_TREES)) {
    const ch = CHARACTERS[charId]; if (!ch) continue;
    html += `<div class="sk-group"><h2 style="color:${ch.color}">${ch.name}</h2>
      <div class="tt-grid">${trees.map(treeCard).join('')}</div></div>`;
  }
  root.innerHTML = html;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
