import { renderRoadmap, watchReason } from './roadmap.js';

const $ = (id) => document.getElementById(id);
const progressKey = 'gta6-trophy-checklist';
const spoilerKey = 'vice-trophy-atlas-spoilers';
const kinds = {
  all: 'All', story: 'Story', missable: 'Missable watch', collectibles: 'Collectibles',
  activities: 'Activities', completion: 'Completion',
};
const grades = ['platinum', 'gold', 'silver', 'bronze'];
const sourceNames = { exophase: 'Exophase', psnprofiles: 'PSNProfiles' };

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    $('notice').textContent = 'Browser storage is unavailable. Export JSON to keep your progress.';
    return false;
  }
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function gradeLabel(grade) {
  const item = node('span', 'grade ' + grade);
  item.append(node('i', 'dot'), grade);
  return item;
}

async function start() {
  const response = await fetch(new URL('./data/trophies.json', import.meta.url));
  if (!response.ok) throw new Error('Trophy list unavailable');
  const { trophies, sources } = await response.json();
  const names = new Set(trophies.map(t => t.name));
  const saved = readStorage(progressKey, []);
  let earned = new Set(Array.isArray(saved) ? saved.filter(name => names.has(name)) : []);
  let active = 'all';
  let selected = 17;
  const spoilers = $('spoilers');
  spoilers.checked = readStorage(spoilerKey, true) !== false;

  const concealed = t => spoilers.checked && t.kind === 'story' && !earned.has(t.name);
  const title = t => concealed(t) ? 'Hidden story trophy' : t.name;
  const kindMatches = (t, kind) => kind === 'all' || t.kind === kind ||
    (kind === 'missable' && t.missable === 'verify');

  function renderProgress() {
    $('earned-count').textContent = earned.size + ' / ' + trophies.length;
    $('progress').max = trophies.length;
    $('progress').value = earned.size;
    $('grades').replaceChildren(...grades.map(grade => {
      const group = trophies.filter(t => t.grade === grade);
      const count = group.filter(t => earned.has(t.name)).length;
      const label = gradeLabel(grade);
      label.append(' ' + count + '/' + group.length);
      return label;
    }));
  }

  function renderGuide(t) {
    const panel = $('guide');
    if (!t) {
      panel.replaceChildren(node('p', 'empty', 'Select a trophy to read its guide.'));
      return;
    }
    const meta = node('div', 'guide-meta');
    meta.append(gradeLabel(t.grade), kinds[t.kind]);
    const heading = node('h3', '', title(t));
    if (concealed(t)) {
      panel.replaceChildren(meta, heading, node('p', '', 'Earn and check off this trophy, or turn off spoiler protection to show its name, objective and guide.'));
      return;
    }
    const objective = node('div', 'objective');
    objective.append(node('h4', '', 'Official objective'), node('p', '', t.description));
    const links = node('div', 'sources', 'Official PS5 trophy list via ');
    t.sources.forEach((source, index) => {
      if (index) links.append(' · ');
      const link = node('a', '', sourceNames[source]);
      link.href = sources[source];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    });
    const flag = watchReason(t.id);
    panel.replaceChildren(meta, heading, objective, node('h4', '', 'Guide'),
      node('p', '', t.guide), node('p', 'flag', flag || 'Missability: no cutoff stated in the list.'), links);
  }

  function renderTracker(resetScroll = false, focus = '') {
    const query = $('search').value.trim().toLocaleLowerCase();
    const shown = trophies.filter(t => kindMatches(t, active) &&
      (!$('remaining').checked || !earned.has(t.name)) &&
      (!query || (title(t) + ' ' + (concealed(t) ? '' : t.description)).toLocaleLowerCase().includes(query)));
    const current = shown.find(t => t.id === selected) ?? shown[0];
    selected = current?.id ?? 0;
    $('result-count').textContent = shown.length + ' of ' + trophies.length + ' trophies';
    const list = $('rows');
    const scroll = list.scrollTop;
    const rows = shown.map(t => {
      const row = node('li', 'trophy-row');
      const check = node('input');
      check.type = 'checkbox';
      check.id = 'earned-' + t.id;
      check.checked = earned.has(t.name);
      check.setAttribute('aria-label', 'Mark ' + title(t) + ' as earned');
      check.addEventListener('change', () => {
        if (check.checked) earned.add(t.name);
        else earned.delete(t.name);
        saveStorage(progressKey, [...earned]);
        renderProgress();
        renderTracker(false, check.id);
      });

      const button = node('button', 'row-button');
      button.type = 'button';
      button.id = 'view-' + t.id;
      button.setAttribute('aria-controls', 'guide');
      button.setAttribute('aria-pressed', String(t.id === selected));
      if (t.id === selected) row.dataset.selected = '';
      const copy = node('span', 'row-copy');
      copy.append(node('strong', '', title(t)), node('small', '', concealed(t) ? 'Objective hidden until earned' : t.description));
      button.append(copy, gradeLabel(t.grade));
      button.addEventListener('click', () => {
        selected = t.id;
        renderTracker(false, button.id);
        if (matchMedia('(max-width: 760px)').matches) {
          const panel = $('guide');
          panel.tabIndex = -1;
          panel.focus({ preventScroll: true });
          panel.scrollIntoView({ block: 'nearest' });
        }
      });
      row.append(check, button);
      return row;
    });
    list.replaceChildren(...(rows.length ? rows : [node('li', 'empty', 'No trophies match. Try another filter or search.')]));
    list.scrollTop = resetScroll ? 0 : scroll;
    if (focus) ($(focus) ?? $('remaining')).focus({ preventScroll: true });
    renderGuide(current);
  }

  function selectKind(kind, trophyId) {
    active = kind;
    selected = trophyId ?? 0;
    for (const button of $('filters').children) {
      button.setAttribute('aria-pressed', String(button.dataset.kind === active));
    }
    renderTracker(true);
  }

  for (const [kind, label] of Object.entries(kinds)) {
    const button = node('button', '', label);
    button.type = 'button';
    button.dataset.kind = kind;
    button.setAttribute('aria-pressed', String(kind === active));
    button.append(node('small', '', trophies.filter(t => kindMatches(t, kind)).length));
    button.addEventListener('click', () => selectKind(kind, selected));
    $('filters').append(button);
  }

  function route() {
    const roadmap = location.hash === '#roadmap';
    $('tracker-view').hidden = roadmap;
    $('roadmap-view').hidden = !roadmap;
    for (const page of ['tracker', 'roadmap']) {
      const link = $('nav-' + page);
      if ((page === 'roadmap') === roadmap) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (roadmap) {
      renderRoadmap($('roadmap-view'), trophies, concealed, (kind, id) => {
        $('search').value = '';
        $('remaining').checked = false;
        selectKind(kind, id);
        location.hash = 'tracker';
      });
    } else $('roadmap-view').replaceChildren();
  }

  window.addEventListener('hashchange', route);
  for (const id of ['search', 'remaining']) $(id).addEventListener('input', () => renderTracker(true));
  spoilers.addEventListener('change', () => {
    saveStorage(spoilerKey, spoilers.checked);
    renderTracker();
    route();
  });

  $('export').addEventListener('click', () => {
    const payload = { guide: 'vice-trophy-atlas', version: 1, earned: [...earned] };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = node('a');
    link.href = url;
    link.download = 'vice-trophy-atlas-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('notice').textContent = 'Progress exported as JSON.';
  });

  $('import-button').addEventListener('click', () => $('import').click());
  $('import').addEventListener('change', async () => {
    const input = $('import');
    const file = input.files[0];
    if (!file) return;
    try {
      if (file.size > 65536) throw new Error('Oversized progress file');
      const data = JSON.parse(await file.text());
      const items = Array.isArray(data) ? data : data?.guide === 'vice-trophy-atlas' && data.version === 1 ? data.earned : null;
      if (!Array.isArray(items) || items.some(name => !names.has(name))) throw new Error('Invalid progress file');
      earned = new Set(items);
      if (saveStorage(progressKey, [...earned])) $('notice').textContent = 'Imported ' + earned.size + ' earned trophies. Previous checkmarks replaced.';
      renderProgress();
      renderTracker();
      route();
    } catch {
      $('notice').textContent = 'Could not import this progress file. Your checkmarks are unchanged.';
    } finally {
      input.value = '';
    }
  });

  renderProgress();
  renderTracker();
  route();
}

start().catch(() => {
  $('notice').textContent = 'Could not load the trophy list. Serve the app folder over local HTTP and reload.';
});
