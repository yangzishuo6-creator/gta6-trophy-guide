const watch = new Map([
  [28, ['Check spot access', 'The objective requires every meditation spot. Chapter access and revisit rules are unstated.']],
  [33, ['Check partner access', 'The escape must happen with your partner. Partner availability across the story is unstated.']],
  [34, ['Keep the streak active', 'The wanted level must persist across all three shops. A failed streak needs another attempt if available.']],
  [36, ['Use one activation', 'Five takedowns must fit within one use of Combat Focus. Later attempts may depend on access to qualifying encounters.']],
  [39, ['Check detection', 'Detection fails the stated condition for that robbery. Store reset and retry rules are unstated.']],
]);

export function watchReason(id) {
  const entry = watch.get(id);
  return entry && entry.join(' · ');
}

const route = [
  ['Story checkpoints', 'story', 'Track numbered Chapters 1 → 2 → 3 → 4 and the finale. Check the seven named mission trophies as they appear. The list gives no chapter assignments or replay rules.'],
  ['Collect as you explore', 'collectibles', 'Track 3 complete card sets, 100 WAiNK locations, 100 vehicle discoveries and 10 Scooter Bros registrations. Meditation, garages and Leonida exploration require full coverage.'],
  ['Clear side work', 'activities', 'Log 250 stunts, 20 distinct race wins, 50 challenges and 8 completed stranger strands. Check all shooting golds, every Top Fun venue and each activity type.'],
  ['Audit 100% and platinum', 'completion', 'Check the game’s 100% milestone and any outstanding individual trophies. Platinum follows the other 54. The list leaves the 100% checklist open.'],
];

function element(tag, text, style) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (style) node.className = style;
  return node;
}

export function renderRoadmap(container, trophies, concealed, openTracker) {
  const heading = element('h2', 'Roadmap to platinum');
  heading.id = 'roadmap-heading';
  const intro = element('div', '', 'heading');
  intro.append(heading);
  const proposed = element('p', 'Suggested order based on the official trophy descriptions. Start side objectives whenever the game makes them available.', 'roadmap-intro');
  const stages = element('ol', '', 'stages');
  for (const [name, kind, description] of route) {
    const item = element('li');
    const button = element('button', name + ' →', 'stage-link');
    button.addEventListener('click', () => openTracker(kind));
    item.append(button, element('p', description));
    if (kind === 'story') {
      const missions = trophies.filter(t => t.kind === 'story' && t.id !== 7 && !t.description.startsWith('Complete Chapter '));
      const visible = missions.filter(t => !concealed(t));
      const hidden = missions.length - visible.length;
      const summary = [
        ...visible.map(t => t.description.replace(/^Complete /, '').replace(/\.$/, '')),
        ...(hidden ? [hidden + ' mission names hidden'] : []),
      ];
      item.append(element('p', summary.join(' · '), 'mission-list'));
    }
    stages.append(item);
  }
  const panel = element('aside', '', 'watch-panel');
  panel.append(element('h3', 'Missable watch'), element('strong', '0 permanent lockouts confirmed', 'watch-total'),
    element('p', 'The list gives no permanent cutoff. These five objectives involve full coverage, partner access or a single clean attempt.'));
  const flags = element('ul');
  for (const [id, [label, reason]] of watch) {
    const trophy = trophies.find(t => t.id === id);
    const item = element('li');
    const button = element('button', concealed(trophy) ? 'Hidden story trophy' : trophy.name, 'watch-link');
    button.addEventListener('click', () => openTracker('missable', id));
    item.append(button, element('span', label, 'flag'), element('p', reason));
    flags.append(item);
  }
  panel.append(flags);
  const layout = element('div', '', 'roadmap-grid');
  layout.append(stages, panel);
  container.replaceChildren(intro, proposed, layout);
}
