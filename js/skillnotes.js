// 스킬노트 렌더러: skills.js(수치·타입·진화) + skillNotes.js(설명)를 합쳐 원소별로 카드 렌더.
import { SKILLS, EVOLUTIONS, getSkill } from './data/skills.js';
import { ELEMENTS, TYPE_LABEL, SKILL_NOTES } from './data/skillNotes.js';

function badge(txt, cls, style) { return '<span class="sk-badge' + (cls ? ' ' + cls : '') + '"' + (style ? ' style="' + style + '"' : '') + '>' + txt + '</span>'; }

function card(skill) {
  const el = (skill.tags && skill.tags[0]) || 'physical';
  const em = ELEMENTS[el] || ELEMENTS.physical;
  const n = SKILL_NOTES[skill.id] || {};
  const b = [badge(em.emoji + ' ' + em.label, null, 'border-color:' + em.color + '66;color:' + em.color)];
  b.push(badge(TYPE_LABEL[skill.type] || skill.type));
  b.push(badge('MP ' + (skill.mpCost || 0)));
  if (skill.base && skill.base.pierce > 0 && skill.base.pierce < 50) b.push(badge('관통 ' + skill.base.pierce));
  if (EVOLUTIONS.has(skill.id)) b.push(badge('진화 스킬', 'evo'));
  let meta = '';
  if (skill.evolveInto) { const ev = getSkill(skill.evolveInto); if (ev) meta += '<div class="sk-meta">→ 진화: <b>' + ev.name + '</b></div>'; }
  if (skill.requires) { const rq = getSkill(skill.requires.skill); meta += '<div class="sk-meta">🔒 해금: ' + (rq ? rq.name : skill.requires.skill) + ' Lv' + skill.requires.level + '</div>'; }
  return '<div class="sk-card" style="--acc:' + (skill.color || em.color) + '">' +
    '<div class="sk-head"><span class="sk-dot"></span><h3>' + skill.name + '</h3></div>' +
    '<div class="sk-badges">' + b.join('') + '</div>' +
    '<p>' + (n.note || '') + '</p>' +
    (n.tip ? '<p class="sk-tip">💡 ' + n.tip + '</p>' : '') + meta + '</div>';
}

function render() {
  const root = document.getElementById('skill-notes'); if (!root) return;
  const buckets = {};
  Object.values(SKILLS).forEach((s) => { const el = (s.tags && s.tags[0]) || 'physical'; (buckets[el] = buckets[el] || []).push(s); });
  let html = '';
  Object.keys(ELEMENTS).forEach((el) => {
    const list = buckets[el]; if (!list || !list.length) return;
    const em = ELEMENTS[el];
    html += '<div class="sk-group"><h2 style="color:' + em.color + '">' + em.emoji + ' ' + em.label + '</h2>' +
      '<div class="sk-grid">' + list.map(card).join('') + '</div></div>';
  });
  root.innerHTML = html;
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
