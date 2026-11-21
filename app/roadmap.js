const phases = [
  {
    category: 'Story', title: 'Follow the main story',
    detail: 'Gone Fishing → Chapters 1, 2, 3 and 4 → final mission. Tick named missions as they occur.',
    protected: 'Check off the story milestones as you reach them. The spoiler switch hides mission and chapter details.'
  },
  {
    category: 'Story', title: 'Log named mission clears',
    detail: 'Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory. Chapter placements are unspecified.',
    protected: 'Six named mission awards sit alongside the chapter and finale trophies. Their titles are protected by the spoiler switch.'
  },
  {
    category: 'Missable', title: 'Follow up with contacts',
    detail: 'Finish 8 stranger mission strands. Prioritize the named contacts on the availability watchlist when their objectives appear.'
  },
  {
    category: 'Collectibles', title: 'Sweep Leonida',
    detail: 'Finish 3 card sets and 100 WAiNK It locations. Log 18 meditation spots, 52 areas, 100 vehicle discoveries and 8 garages.'
  },
  {
    category: 'Activities', title: 'Clear the activity targets',
    detail: 'Work through 250 stunts, 42 range golds, 14 Top Fun venues, 20 distinct race wins and 50 challenges. Check off the remaining activities.'
  },
  {
    category: 'Milestones', title: 'Verify 100% and platinum',
    detail: 'Check the in-game completion percentage for A Long Road. Finish all 54 other trophies, then verify Vice Got a Price! on PlayStation.'
  }
];

export function renderRoadmap(container, trophies, earned, protectedStory, sources) {
  const watch = trophies.filter((trophy) => trophy.watch);
  const pending = watch.filter((trophy) => !earned.has(trophy.name)).length;
  container.innerHTML = `<div class="section-head"><h2>Platinum roadmap</h2><p class="road-head-note">Suggested order · Official list and tracked targets</p></div>
    <div class="road-grid">${phases.map((phase, index) => `<article class="road-card">
      <p class="phase">${String(index + 1).padStart(2, '0')} / ${phase.category.toUpperCase()}</p>
      <h3>${phase.title}</h3>
      <p>${protectedStory && phase.protected ? phase.protected : phase.detail}</p>
      <button type="button" data-roadmap-filter="${phase.category}">Open ${phase.category.toLowerCase()} →</button>
    </article>`).join('')}</div>
    <section class="watch-card" aria-labelledby="watch-heading">
      <h3 id="watch-heading">! Missable watchlist · ${pending} of ${watch.length} open</h3>
      <div class="watch-layout"><p>The official descriptions give zero confirmed cutoffs. Check Cal’s challenge, Bret’s hunt and the finales for Andy, Kenton, Billy, Randy and Tyrone as they become available.</p>
      <button type="button" data-roadmap-filter="Missable">Open watchlist →</button></div>
    </section>
    <div class="road-sources">${sources}</div>`;
}
