
(async function(){
  await P.loadData();

  const app = document.getElementById('app');

  function countStoriesForCluster(clusterSlug){
    return P.state.stories.filter(story =>
      (!clusterSlug || story.Cluster === clusterSlug) &&
      (!P.state.filters.themes.length || P.state.filters.themes.some(slug => story.Themes.includes(slug))) &&
      (!P.state.filters.districts.length || P.state.filters.districts.includes(story.District))
    ).length;
  }
  function countStoriesForTheme(themeSlug){
    return P.state.stories.filter(story =>
      (!P.state.filters.cluster || story.Cluster === P.state.filters.cluster) &&
      story.Themes.includes(themeSlug) &&
      (!P.state.filters.districts.length || P.state.filters.districts.includes(story.District))
    ).length;
  }
  function countStoriesForDistrict(districtSlug){
    return P.state.stories.filter(story =>
      (!P.state.filters.cluster || story.Cluster === P.state.filters.cluster) &&
      (!P.state.filters.themes.length || P.state.filters.themes.some(slug => story.Themes.includes(slug))) &&
      (!districtSlug || story.District === districtSlug)
    ).length;
  }
  function filteredStories(){
    return P.state.stories.filter(story =>
      (!P.state.filters.cluster || story.Cluster === P.state.filters.cluster) &&
      (!P.state.filters.themes.length || P.state.filters.themes.some(slug => story.Themes.includes(slug))) &&
      (!P.state.filters.districts.length || P.state.filters.districts.includes(story.District))
    );
  }
  function toggleArray(arr, value){ return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]; }
  function allThemeCount(){
    return P.state.stories.filter(story =>
      (!P.state.filters.cluster || story.Cluster === P.state.filters.cluster) &&
      (!P.state.filters.districts.length || P.state.filters.districts.includes(story.District))
    ).length;
  }
  function renderFilterChip(text, kind, active, count, attrs=''){
    return `<button class="filter-chip ${kind || ''} ${active ? 'active':''}" ${attrs}>${P.escapeHtml(text)} ${typeof count === 'number' ? `<span class="count-badge">${count}</span>`:''}</button>`;
  }

  function renderIntroModal(heroStory){
    const ui = P.t();
    const cluster = P.label(P.bySlug(P.state.taxonomy.clusters, heroStory.Cluster));
    const district = P.label(P.bySlug(P.state.taxonomy.districts, heroStory.District));
    const themes = heroStory.Themes.map(slug => P.label(P.bySlug(P.state.taxonomy.themes, slug)));
    return `
      <div class="hero-backdrop" id="introModal">
        <div class="hero-panel modal-panel" role="dialog" aria-modal="true" aria-labelledby="introTitle">
          <div class="modal-inner">
            <div class="hero-image-wrap">
              <img class="hero-image" src="${P.storyCoverPath(heroStory)}" alt="${P.escapeHtml(P.photoAlt(heroStory,1))}">
            </div>
            <div class="hero-copy">
              <div>
                <div class="lang-wrap">
                  <div class="lang-switch" role="group" aria-label="${P.escapeHtml(ui.filtersAria)}">
                    <button type="button" data-modal-lang="so" aria-pressed="${P.state.lang === 'so'}">${P.escapeHtml(ui.somali)}</button>
                    <button type="button" data-modal-lang="en" aria-pressed="${P.state.lang === 'en'}">${P.escapeHtml(ui.english)}</button>
                  </div>
                </div>
                <div class="meta-row">
                  ${P.metaChip('cluster', cluster)}
                  ${themes.map(x => P.metaChip('theme', x)).join('')}
                  ${P.metaChip('district', district)}
                </div>
                <p class="summary" style="font-size:18px;line-height:1.45;margin-top:16px">${P.escapeHtml(P.storySummary(heroStory))}</p>
              </div>
              <div style="display:grid;gap:10px">
                <button class="primary-btn" data-intro-open>${P.escapeHtml(ui.openStory)}</button>
                <button class="action-btn" data-intro-random>${P.escapeHtml(ui.another)}</button>
                <button class="action-btn" data-intro-explore>${P.escapeHtml(ui.explore)}</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function render(){
    const ui = P.t();
    P.saveState();
    const visibleThemes = !P.state.filters.cluster ? [] : P.state.taxonomy.themes.filter(theme => theme.cluster === P.state.filters.cluster);
    const stories = filteredStories();
    const heroStory = stories[0] || P.state.stories[0];
    app.innerHTML = `
      <div class="page">
        ${P.renderHeader(!(!P.state.introDismissed && !P.state.filters.cluster && !P.state.filters.themes.length && !P.state.filters.districts.length))}
        <div class="layout">
          <aside class="filter-panel">
            <div class="row-between">
              <h2 class="modal-title">${P.escapeHtml(ui.filters)}</h2>
              <button class="reset-link" data-reset>${P.escapeHtml(ui.reset)}</button>
            </div>
            <div class="filter-section">
              <div class="filter-label">${P.escapeHtml(ui.cluster)}</div>
              <div class="chips">
                ${renderFilterChip(ui.all, '', P.state.filters.cluster === '', countStoriesForCluster(''), 'data-cluster=""')}
                ${P.state.taxonomy.clusters.map(c => renderFilterChip(P.label(c), 'cluster', P.state.filters.cluster === c.slug, countStoriesForCluster(c.slug), `data-cluster="${c.slug}"`)).join('')}
              </div>
            </div>
            <div class="filter-section">
              <div class="filter-label">${P.escapeHtml(ui.themes)}</div>
              ${!P.state.filters.cluster ? `<p class="panel-copy">${P.escapeHtml(ui.chooseClusterToSeeThemes)}</p>` : `
              <div class="chips">
                ${renderFilterChip(ui.all, '', P.state.filters.themes.length === 0, allThemeCount(), 'data-theme=""')}
                ${visibleThemes.map(th => renderFilterChip(P.label(th), 'theme', P.state.filters.themes.includes(th.slug), countStoriesForTheme(th.slug), `data-theme="${th.slug}"`)).join('')}
              </div>`}
            </div>
            <div class="filter-section">
              <div class="filter-label">${P.escapeHtml(ui.district)}</div>
              <div class="chips">
                ${renderFilterChip(ui.all, '', P.state.filters.districts.length === 0, countStoriesForDistrict(''), 'data-district=""')}
                ${P.state.taxonomy.districts.map(d => renderFilterChip(P.label(d), 'district', P.state.filters.districts.includes(d.slug), countStoriesForDistrict(d.slug), `data-district="${d.slug}"`)).join('')}
              </div>
            </div>
          </aside>
          <section>
            <div class="results">${stories.length} ${P.escapeHtml(ui.results)}</div>
            ${stories.length ? `<div class="card-grid">${stories.map((story, idx) => P.storyCard(story, idx)).join('')}</div>` : `<div class="empty-note">${P.escapeHtml(ui.noMatches)}</div>`}
          </section>
        </div>
      </div>
      ${(!P.state.introDismissed && !P.state.filters.cluster && !P.state.filters.themes.length && !P.state.filters.districts.length) ? renderIntroModal(heroStory) : ''}`;
    P.bindHeader(app);

    P.qq('[data-cluster]', app).forEach(btn => btn.onclick = () => {
      P.state.filters.cluster = btn.dataset.cluster || '';
      P.state.filters.themes = [];
      render();
    });
    P.qq('[data-theme]', app).forEach(btn => btn.onclick = () => {
      const slug = btn.dataset.theme;
      P.state.filters.themes = !slug ? [] : toggleArray(P.state.filters.themes, slug);
      render();
    });
    P.qq('[data-district]', app).forEach(btn => btn.onclick = () => {
      const slug = btn.dataset.district;
      P.state.filters.districts = !slug ? [] : toggleArray(P.state.filters.districts, slug);
      render();
    });
    P.q('[data-reset]', app).onclick = () => { P.state.filters = {cluster:'', themes:[], districts:[]}; render(); };

    const modal = P.q('#introModal');
    if (modal){
      P.qq('[data-modal-lang]', modal).forEach(btn => btn.onclick = () => { P.state.lang = btn.dataset.modalLang; render(); });
      P.q('[data-intro-open]', modal).onclick = () => { P.dismissIntro(); window.location.href = `story.html?code=${encodeURIComponent(heroStory.StoryCode)}`; };
      P.q('[data-intro-explore]', modal).onclick = () => { P.dismissIntro(); render(); };
      P.q('[data-intro-random]', modal).onclick = () => {
        const pool = filteredStories().length ? filteredStories() : P.state.stories;
        const idx = Math.floor(Math.random() * pool.length);
        const chosen = pool[idx];
        P.q('.hero-image', modal).src = P.storyCoverPath(chosen);
        P.q('.hero-image', modal).alt = P.photoAlt(chosen,1);
        const cluster = P.label(P.bySlug(P.state.taxonomy.clusters, chosen.Cluster));
        const district = P.label(P.bySlug(P.state.taxonomy.districts, chosen.District));
        const themes = chosen.Themes.map(slug => P.label(P.bySlug(P.state.taxonomy.themes, slug)));
        P.q('.meta-row', modal).innerHTML = P.metaChip('cluster', cluster) + themes.map(x => P.metaChip('theme', x)).join('') + P.metaChip('district', district);
        P.q('.summary', modal).textContent = P.storySummary(chosen);
        P.q('[data-intro-open]', modal).onclick = () => { P.dismissIntro(); window.location.href = `story.html?code=${encodeURIComponent(chosen.StoryCode)}`; };
      };
    }
  }

  document.addEventListener('photostory:langchange', render);
  document.addEventListener('photostory:savedchange', render);
  render();
})();
