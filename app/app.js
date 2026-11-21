import { renderRoadmap } from './roadmap.js';

const STORAGE = 'vice-trophy-atlas';
const OLD_STORAGE = 'gta6-trophy-checklist';
const categories = ['All', 'Story', 'Missable', 'Collectibles', 'Activities', 'Milestones'];
const grades = ['platinum', 'gold', 'silver', 'bronze'];
const $ = (id) => document.getElementById(id);
const shield = $('shield');
let trophies = [];
let earned = new Set();
let category = 'All';
let selected = 1;

const sources = '<div class="source-links"><a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/" target="_blank" rel="noopener noreferrer">Exophase ↗</a><a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi" target="_blank" rel="noopener noreferrer">PSNProfiles ↗</a></div>';

function escapeText(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function concealed(trophy) {
  return shield.checked && trophy.kind === 'Story' && !earned.has(trophy.name);
}

function titleFor(trophy) {
  return concealed(trophy) ? 'Hidden story trophy' : trophy.name;
}

function objectiveFor(trophy) {
  return concealed(trophy) ? 'Objective revealed when earned.' : trophy.description;
}

function notify(message) {
  $('save-status').textContent = message;
}

function knownNames(names) {
  const official = new Set(trophies.map((trophy) => trophy.name));
  return new Set(names.filter((name) => official.has(name)));
}

function restoreProgress() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) ?? 'null');
    const previous = data?.earned ?? JSON.parse(localStorage.getItem(OLD_STORAGE) ?? '[]');
    earned = knownNames(Array.isArray(previous) ? previous : []);
    shield.checked = data?.shield !== false;
  } catch {
    notify('Saved progress unavailable');
  }
}

function saveProgress(message = 'Saved on this device') {
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ earned: [...earned], shield: shield.checked }));
    notify(message);
  } catch {
    notify('Storage unavailable · export a backup');
  }
}

function matchesCategory(trophy, filter) {
  if (filter === 'Missable') return Boolean(trophy.watch);
  return filter === 'All' || trophy.kind === filter;
}

function visibleTrophies() {
  const query = $('search').value.trim().toLowerCase();
  return trophies.filter((trophy) => matchesCategory(trophy, category)
    && (!$('unearned').checked || !earned.has(trophy.name))
    && `${titleFor(trophy)} ${objectiveFor(trophy)}`.toLowerCase().includes(query));
}

function gradeBadge(grade) {
  return `<span class="grade ${grade}">${grade}</span>`;
}

function renderProgress() {
  $('stat').innerHTML = `${earned.size} <small>/ ${trophies.length} earned</small>`;
  $('progress').value = earned.size;
  $('medals').innerHTML = grades.map((grade) => {
    const group = trophies.filter((trophy) => trophy.grade === grade);
    const count = group.filter((trophy) => earned.has(trophy.name)).length;
    return `<span class="${grade}">${grade} <b>${count}/${group.length}</b></span>`;
  }).join('');
}

function renderTracker() {
  const list = visibleTrophies();
  if (!list.some((trophy) => trophy.id === selected)) selected = list[0]?.id;
  $('filters').innerHTML = categories.map((filter) => {
    const count = trophies.filter((trophy) => matchesCategory(trophy, filter)).length;
    return `<button type="button" data-filter="${filter}" aria-pressed="${filter === category}">${filter} <span>${count}</span></button>`;
  }).join('');
  $('list-count').textContent = `${list.length} of ${trophies.length} trophies${category === 'Missable' ? ' · watchlist, availability unverified' : ''}`;
  $('rows').innerHTML = list.map((trophy) => {
    const title = escapeText(titleFor(trophy));
    const objective = escapeText(objectiveFor(trophy));
    return `<div class="row ${trophy.id === selected ? 'selected' : ''}">
      <label class="tick"><input type="checkbox" data-earned="${trophy.id}" ${earned.has(trophy.name) ? 'checked' : ''} aria-label="Mark trophy ${trophy.id} earned"><span aria-hidden="true"></span></label>
      <button type="button" class="row-open" data-open="${trophy.id}" aria-current="${trophy.id === selected}"><span><strong>${title}</strong><small>${objective}</small></span><span class="row-meta">${trophy.watch ? '<span class="watch-dot" title="Availability watch" aria-label="Availability watch">!</span>' : ''}${gradeBadge(trophy.grade)}<span aria-hidden="true">›</span></span></button>
    </div>`;
  }).join('');
  if (!list.length) $('rows').innerHTML = '<p class="empty">No matches. Clear the search or choose another filter.</p>';
  renderDetail(list.find((trophy) => trophy.id === selected));
}

function renderDetail(trophy) {
  if (!trophy) {
    $('detail').innerHTML = '<p class="empty">Select a trophy to read its guide.</p>';
    return;
  }
  const hidden = concealed(trophy);
  const checked = earned.has(trophy.name);
  $('detail').innerHTML = `<div class="detail-top"><span>GUIDE ${String(trophy.id).padStart(2, '0')} / ${trophies.length}</span>${gradeBadge(trophy.grade)}</div>
    <h2>${escapeText(titleFor(trophy))}</h2>
    <p class="objective">${escapeText(objectiveFor(trophy))}</p>
    ${trophy.count && !hidden ? `<span class="target">TARGET <strong>${trophy.count.toLocaleString('en-US')}${trophy.id === 14 ? '%' : ''}</strong></span>` : ''}
    <h3>${hidden ? 'Story spoiler protection' : 'How to track it'}</h3>
    <p>${hidden ? 'The title, objective and guide unlock here when you mark the PlayStation trophy earned.' : escapeText(trophy.guide)}</p>
    ${hidden ? '' : `<div class="source-block"><h3>Official list sources</h3>${sources}</div>`}
    ${trophy.watch ? '<p class="watch-note">Availability watch · the list gives no cutoff.</p>' : ''}
    <button type="button" id="detail-earn" data-earn="${trophy.id}" class="earn-button" aria-pressed="${checked}">${checked ? '✓ Earned · undo' : '□ Mark as earned'}</button>`;
}

function render() {
  const roadmap = location.hash === '#roadmap';
  $('tracker').hidden = roadmap;
  $('roadmap').hidden = !roadmap;
  $('tracker-tab').setAttribute('aria-current', roadmap ? 'false' : 'page');
  $('roadmap-tab').setAttribute('aria-current', roadmap ? 'page' : 'false');
  renderProgress();
  if (roadmap) renderRoadmap($('roadmap'), trophies, earned, shield.checked, sources);
  else renderTracker();
}

function toggleEarned(id, focusSelector) {
  const trophy = trophies.find((item) => item.id === id);
  if (!trophy) return;
  if (!earned.delete(trophy.name)) earned.add(trophy.name);
  saveProgress();
  render();
  (document.querySelector(focusSelector) ?? $('search')).focus({ preventScroll: true });
}

$('filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  category = button.dataset.filter;
  renderTracker();
  $('filters').querySelector('[aria-pressed="true"]').focus();
});

$('rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-open]');
  if (!button) return;
  selected = Number(button.dataset.open);
  renderTracker();
  if (matchMedia('(max-width: 760px)').matches) $('detail').scrollIntoView({ block: 'start' });
  document.querySelector(`[data-open="${selected}"]`).focus({ preventScroll: true });
});

$('rows').addEventListener('change', (event) => {
  const id = event.target.dataset.earned;
  if (id) toggleEarned(Number(id), `[data-earned="${id}"]`);
});

$('detail').addEventListener('click', (event) => {
  const id = event.target.dataset.earn;
  if (id) toggleEarned(Number(id), '#detail-earn');
});

$('roadmap').addEventListener('click', (event) => {
  const button = event.target.closest('[data-roadmap-filter]');
  if (!button) return;
  category = button.dataset.roadmapFilter;
  $('search').value = '';
  $('unearned').checked = false;
  location.hash = 'tracker';
});

shield.addEventListener('change', () => {
  saveProgress();
  render();
});
$('search').addEventListener('input', renderTracker);
$('unearned').addEventListener('change', renderTracker);
window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
});

$('export').addEventListener('click', () => {
  const backup = { format: STORAGE, version: 1, earned: [...earned] };
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-trophy-atlas-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Progress backup exported');
});

$('import').addEventListener('click', () => $('backup').click());
$('backup').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 65536) throw new Error('Backup too large');
    const backup = JSON.parse(await file.text());
    const names = Array.isArray(backup) ? backup : backup?.format === STORAGE && backup.version === 1 && backup.earned;
    if (!Array.isArray(names) || names.some((name) => typeof name !== 'string')) throw new Error('Invalid backup');
    const imported = knownNames(names);
    if (imported.size !== new Set(names).size) throw new Error('Unknown trophy');
    earned = new Set([...earned, ...imported]);
    saveProgress(`Merged ${imported.size} trophies from backup`);
    render();
  } catch {
    notify('Could not import this progress file');
  } finally {
    event.target.value = '';
  }
});

try {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error('Trophy list unavailable');
  ({ trophies } = await response.json());
  restoreProgress();
  render();
} catch {
  $('list-count').textContent = 'Could not load the trophy list. Serve the app folder over local HTTP and reload.';
}
