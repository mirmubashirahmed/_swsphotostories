(async function () {
  await P.loadData();

  const app = document.getElementById('app');
  let activePhoto = 0;
  let autoplayTimer = null;
  let touchStartX = null;

  const routeCode = P.readRouteStoryCode();
  const initialStory = routeCode ? P.getStory(routeCode) : P.randomStory();
  P.setCurrentStory(initialStory?.StoryCode || P.state.stories[0]?.StoryCode || '');

  function hasActiveFilters() {
    const filters = P.state.filters;
    return Boolean(filters.primaryTheme || filters.secondaryThemes.length || filters.actors.length || filters.districts.length);
  }

  function currentStory() {
    return P.getStory(P.state.currentStoryCode) || P.state.stories[0] || null;
  }

  function matchesFilters(story, filters = P.state.filters) {
    if (!story) return false;
    const primaryMatch = !filters.primaryTheme || story.PrimaryTheme === filters.primaryTheme;
    const secondaryMatch = !filters.secondaryThemes.length || filters.secondaryThemes.some(slug => story.SecondaryThemes.includes(slug));
    const actorMatch = !filters.actors.length || filters.actors.some(slug => story.Actors.includes(slug));
    const districtMatch = !filters.districts.length || filters.districts.includes(story.District);
    return primaryMatch && secondaryMatch && actorMatch && districtMatch;
  }

  function filteredStories() {
    const selected = currentStory();
    return P.state.stories
      .filter(story => matchesFilters(story))
      .sort((a, b) => {
        if (selected) {
          if (a.StoryCode === selected.StoryCode) return -1;
          if (b.StoryCode === selected.StoryCode) return 1;
        }
        return a.StoryCode.localeCompare(b.StoryCode);
      });
  }

  function cloneFilters() {
    return {
      primaryTheme: P.state.filters.primaryTheme,
      secondaryThemes: [...P.state.filters.secondaryThemes],
      actors: [...P.state.filters.actors],
      districts: [...P.state.filters.districts]
    };
  }

  function toggleArray(list, value) {
    return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
  }

  function countForPrimary(slug) {
    const filters = cloneFilters();
    filters.primaryTheme = slug;
    return P.state.stories.filter(story => matchesFilters(story, filters)).length;
  }

  function countForSecondary(slug) {
    const filters = cloneFilters();
    filters.secondaryThemes = [slug];
    return P.state.stories.filter(story => matchesFilters(story, filters)).length;
  }

  function countForActor(slug) {
    const filters = cloneFilters();
    filters.actors = [slug];
    return P.state.stories.filter(story => matchesFilters(story, filters)).length;
  }

  function countForDistrict(slug) {
    const filters = cloneFilters();
    filters.districts = [slug];
    return P.state.stories.filter(story => matchesFilters(story, filters)).length;
  }

  function allPrimaryThemes() {
    const seen = new Set();
    return P.state.stories
      .map(story => story.PrimaryTheme)
      .filter(slug => slug && !seen.has(slug) && seen.add(slug));
  }

  function allSecondaryThemes() {
    const seen = new Set();
    return P.state.stories
      .flatMap(story => story.SecondaryThemes)
      .filter(slug => slug && !seen.has(slug) && seen.add(slug));
  }

  function storySimilarity(baseStory, candidate) {
    if (!baseStory || !candidate || baseStory.StoryCode === candidate.StoryCode) return -1;
    let score = 0;
    if (baseStory.PrimaryTheme === candidate.PrimaryTheme) score += 6;
    if (baseStory.Cluster === candidate.Cluster) score += 2;
    if (baseStory.District === candidate.District) score += 2;
    score += baseStory.SecondaryThemes.filter(slug => candidate.SecondaryThemes.includes(slug)).length * 2;
    score += baseStory.Actors.filter(slug => candidate.Actors.includes(slug)).length * 1.5;
    return score;
  }

  function pickRandomRelated(baseStory) {
    const scores = P.state.stories
      .filter(candidate => candidate.StoryCode !== baseStory.StoryCode)
      .map(candidate => ({ candidate, score: storySimilarity(baseStory, candidate) }))
      .sort((a, b) => b.score - a.score);

    if (!scores.length) return P.randomStory(baseStory.StoryCode);
    const bestScore = scores[0].score;
    const pool = bestScore > 0 ? scores.filter(item => item.score === bestScore).map(item => item.candidate) : scores.map(item => item.candidate);
    return pool[Math.floor(Math.random() * pool.length)] || pool[0] || P.randomStory(baseStory.StoryCode);
  }

  function applyFiltersFromStory(story) {
    P.state.filters = {
      primaryTheme: story.PrimaryTheme || '',
      secondaryThemes: [...story.SecondaryThemes],
      actors: [...story.Actors],
      districts: story.District ? [story.District] : []
    };
    P.saveState();
  }

  function clearFilters() {
    P.state.filters = P.defaultFilters();
    P.saveState();
  }

  function selectStory(code, options = {}) {
    const story = P.setCurrentStory(code);
    if (!story) return;
    activePhoto = 0;
    render();
    if (options.scrollToTop) P.scrollToId('story-section');
    if (options.toast) P.showToast(options.toast);
  }

  function nextPhoto(direction = 1) {
    const story = currentStory();
    if (!story) return;
    const total = P.photoCount(story);
    activePhoto = (activePhoto + direction + total) % total;
    syncCarousel();
  }

  function syncCarousel() {
    const story = currentStory();
    if (!story) return;
    const total = P.photoCount(story);
    const track = P.q('.stage-track', app);
    if (track) track.style.transform = `translateX(-${activePhoto * 100}%)`;
    P.qq('[data-stage-dot]', app).forEach((button, index) => {
      button.classList.toggle('active', index === activePhoto);
      button.setAttribute('aria-pressed', index === activePhoto ? 'true' : 'false');
    });
    const counter = P.q('.stage-counter', app);
    if (counter) counter.textContent = `${P.t().imageLabel} ${activePhoto + 1} ${P.t().of} ${total}`;
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function startAutoplay() {
    stopAutoplay();
    const story = currentStory();
    if (!story || P.photoCount(story) <= 1) return;
    autoplayTimer = window.setInterval(() => {
      nextPhoto(1);
    }, 5000);
  }

  function bindCarouselTouch() {
    const carousel = P.q('.stage-carousel', app);
    if (!carousel) return;
    carousel.addEventListener('touchstart', event => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', event => {
      if (touchStartX == null) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (delta > 40) nextPhoto(-1);
      if (delta < -40) nextPhoto(1);
      touchStartX = null;
      startAutoplay();
    }, { passive: true });
  }

  function renderStage(story) {
    const total = P.photoCount(story);
    const canNavigate = total > 1;
    return `
      <section class="story-stage section-tone stage-tone full-bleed" id="story-section">
        <div class="shell section-shell stage-shell">
          <div class="section-head compact-head">
            <div>
              <div class="section-kicker">${P.escapeHtml(P.t().selectedStory)}</div>
              <h1 class="storyteller-name">${P.escapeHtml(story.Storyteller || story.StoryCode)}</h1>
            </div>
          </div>
          <div class="stage-carousel">
            <div class="stage-frame">
              <div class="stage-track">
                ${Array.from({ length: total }, (_, index) => `<img src="${P.storyImagePath(story, index)}" alt="${P.escapeHtml(P.photoAlt(story, index))}">`).join('')}
              </div>
            </div>
            ${canNavigate ? `<button type="button" class="stage-arrow prev" data-stage-prev>${P.icon.chevronLeft()}</button><button type="button" class="stage-arrow next" data-stage-next>${P.icon.chevronRight()}</button>` : ''}
            <div class="stage-counter">${P.escapeHtml(P.t().imageLabel)} 1 ${P.escapeHtml(P.t().of)} ${total}</div>
          </div>
          ${canNavigate ? `<div class="stage-dots">${Array.from({ length: total }, (_, index) => `<button type="button" data-stage-dot="${index}" aria-pressed="${index === 0 ? 'true' : 'false'}" class="${index === 0 ? 'active' : ''}"><span class="sr-only">${P.escapeHtml(P.t().imageLabel)} ${index + 1}</span></button>`).join('')}</div>` : ''}
        </div>
      </section>`;
  }

  function renderStoryBands(story) {
    return `
      <section class="section-tone storyteller-tone">
        <div class="shell section-shell narrative-shell">
          <div class="narrative-grid">
            <div class="story-meta-column">
              <div class="section-kicker">${P.escapeHtml(P.t().storyteller)}</div>
              <h2 class="storyteller-name inner">${P.escapeHtml(story.Storyteller || story.StoryCode)}</h2>
              <div class="chip-row">${P.storyMetaChips(story)}</div>
            </div>
            <div class="story-copy-block">
              <p class="story-summary lead">${P.escapeHtml(P.storySummary(story))}</p>
              <div class="copy-panel">
                <h3>${P.escapeHtml(P.t().story)}</h3>
                <p>${P.escapeHtml(P.storyText(story))}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-tone reflection-tone">
        <div class="shell section-shell narrative-shell secondary-shell">
          <div class="copy-panel reflection-panel">
            <div class="section-kicker">${P.escapeHtml(P.t().reflections)}</div>
            <p>${P.escapeHtml(P.communityText(story) || P.storySummary(story))}</p>
          </div>
        </div>
      </section>
      <section class="section-tone action-tone">
        <div class="shell section-shell actions-shell">
          <div class="story-actions-grid">
            <button type="button" class="action-pill ${P.isSaved(story.StoryCode) ? 'active' : ''}" data-save-toggle="${P.escapeHtml(story.StoryCode)}">${P.icon.heart(P.isSaved(story.StoryCode))}${P.escapeHtml(P.isSaved(story.StoryCode) ? P.t().unsave : P.t().save)}</button>
            <button type="button" class="action-pill" data-share-story="${P.escapeHtml(story.StoryCode)}">${P.icon.share()}${P.escapeHtml(P.t().share)}</button>
            <button type="button" class="action-pill strong" data-random-related>${P.escapeHtml(P.t().seeRandomRelated)}</button>
            <button type="button" class="action-pill" data-show-related>${P.escapeHtml(P.t().seeRelated)}</button>
            <button type="button" class="action-pill" data-explore-filters>${P.escapeHtml(P.t().exploreFilters)}</button>
          </div>
        </div>
      </section>`;
  }

  function renderFilterChip(label, attrs, active, count, kind) {
    return `<button type="button" class="filter-chip ${kind || ''} ${active ? 'active' : ''}" ${attrs}>${P.escapeHtml(label)}<span class="chip-count">${count}</span></button>`;
  }

  function renderGallery() {
    const stories = filteredStories();
    const primaryThemes = allPrimaryThemes();
    const secondaryThemes = allSecondaryThemes().filter(slug => slug !== P.state.filters.primaryTheme);
    const districts = P.state.taxonomy.districts || [];
    const actors = P.state.taxonomy.actors || [];

    return `
      <section class="section-tone gallery-tone" id="gallery-section">
        <div class="shell section-shell gallery-shell">
          <div class="gallery-intro">
            <div>
              <div class="section-kicker">${P.escapeHtml(P.t().galleryTitle)}</div>
              <h2 class="section-title">${P.escapeHtml(P.t().galleryTitle)}</h2>
            </div>
            <p class="section-copy">${P.escapeHtml(P.t().galleryBody)}</p>
          </div>
          <div class="gallery-layout">
            <aside class="filter-panel">
              <div class="filter-panel-head">
                <h3>${P.escapeHtml(P.t().filters)}</h3>
                <button type="button" class="text-btn" data-reset-filters>${P.escapeHtml(P.t().reset)}</button>
              </div>
              ${hasActiveFilters() ? `<div class="filter-banner">${P.escapeHtml(P.t().currentFilters)}</div>` : ''}
              <div class="filter-group">
                <div class="filter-label">${P.escapeHtml(P.t().primaryTheme)}</div>
                <div class="chip-wrap">
                  ${renderFilterChip(P.t().all, 'data-primary-theme=""', P.state.filters.primaryTheme === '', P.state.stories.filter(story => matchesFilters(story, { ...cloneFilters(), primaryTheme: '' })).length, 'primary')}
                  ${primaryThemes.map(slug => renderFilterChip(P.themeLabel(slug), `data-primary-theme="${slug}"`, P.state.filters.primaryTheme === slug, countForPrimary(slug), 'primary')).join('')}
                </div>
              </div>
              <div class="filter-group subdued">
                <div class="filter-label">${P.escapeHtml(P.t().people)}</div>
                <div class="chip-wrap">
                  ${renderFilterChip(P.t().all, 'data-actor=""', P.state.filters.actors.length === 0, P.state.stories.filter(story => matchesFilters(story, { ...cloneFilters(), actors: [] })).length, 'actor')}
                  ${actors.map(item => renderFilterChip(P.label(item), `data-actor="${item.slug}"`, P.state.filters.actors.includes(item.slug), countForActor(item.slug), 'actor')).join('')}
                </div>
              </div>
              <div class="filter-group subdued">
                <div class="filter-label">${P.escapeHtml(P.t().secondaryThemes)}</div>
                <div class="chip-wrap">
                  ${renderFilterChip(P.t().all, 'data-secondary-theme=""', P.state.filters.secondaryThemes.length === 0, P.state.stories.filter(story => matchesFilters(story, { ...cloneFilters(), secondaryThemes: [] })).length, 'secondary')}
                  ${secondaryThemes.map(slug => renderFilterChip(P.themeLabel(slug), `data-secondary-theme="${slug}"`, P.state.filters.secondaryThemes.includes(slug), countForSecondary(slug), 'secondary')).join('')}
                </div>
              </div>
              <div class="filter-group subdued">
                <div class="filter-label">${P.escapeHtml(P.t().district)}</div>
                <div class="chip-wrap">
                  ${renderFilterChip(P.t().all, 'data-district=""', P.state.filters.districts.length === 0, P.state.stories.filter(story => matchesFilters(story, { ...cloneFilters(), districts: [] })).length, 'district')}
                  ${districts.map(item => renderFilterChip(P.label(item), `data-district="${item.slug}"`, P.state.filters.districts.includes(item.slug), countForDistrict(item.slug), 'district')).join('')}
                </div>
              </div>
            </aside>
            <div class="gallery-results">
              <div class="results-row">
                <div class="results-count">${stories.length} ${P.escapeHtml(P.t().results)}</div>
                ${hasActiveFilters() ? `<button type="button" class="text-btn" data-clear-and-explore>${P.escapeHtml(P.t().clearAndExplore)}</button>` : ''}
              </div>
              ${stories.length ? `<div class="gallery-grid">${stories.map(story => P.storyCard(story, { selected: story.StoryCode === P.state.currentStoryCode })).join('')}</div>` : `<div class="empty-state">${P.escapeHtml(P.t().noMatches)}</div>`}
            </div>
          </div>
        </div>
      </section>`;
  }

  function render() {
    const story = currentStory();
    if (!story) {
      app.innerHTML = '<div class="shell"><p>No stories available.</p></div>';
      return;
    }

    app.innerHTML = `
      <div class="page-shell">
        ${P.renderHeader()}
        ${renderStage(story)}
        ${renderStoryBands(story)}
        ${renderGallery()}
      </div>`;

    P.saveState();
    bindCarouselTouch();
    syncCarousel();
    startAutoplay();
  }

  app.addEventListener('click', async event => {
    const langButton = event.target.closest('[data-lang]');
    if (langButton) {
      P.state.lang = langButton.dataset.lang;
      P.saveState();
      render();
      return;
    }

    if (event.target.closest('[data-scroll-gallery]')) {
      P.scrollToId('gallery-section');
      return;
    }

    if (event.target.closest('[data-scroll-story]')) {
      P.scrollToId('story-section');
      return;
    }

    if (event.target.closest('[data-open-saved]')) {
      P.renderSavedModal({
        onSelectStory: code => selectStory(code, { scrollToTop: true, toast: P.t().loadedStory })
      });
      return;
    }

    const saveToggle = event.target.closest('[data-save-toggle]');
    if (saveToggle) {
      P.toggleSaved(saveToggle.dataset.saveToggle);
      render();
      return;
    }

    const shareButton = event.target.closest('[data-share-story]');
    if (shareButton) {
      await P.shareStory(shareButton.dataset.shareStory);
      return;
    }

    if (event.target.closest('[data-random-related]')) {
      const related = pickRandomRelated(currentStory());
      if (related) selectStory(related.StoryCode, { scrollToTop: true, toast: P.t().randomReady });
      return;
    }

    if (event.target.closest('[data-show-related]')) {
      applyFiltersFromStory(currentStory());
      render();
      P.scrollToId('gallery-section');
      P.showToast(P.t().relatedReady);
      return;
    }

    if (event.target.closest('[data-explore-filters]')) {
      clearFilters();
      render();
      P.scrollToId('gallery-section');
      return;
    }

    const selectStoryButton = event.target.closest('[data-story-select]');
    if (selectStoryButton) {
      selectStory(selectStoryButton.dataset.storySelect, { scrollToTop: true, toast: P.t().loadedStory });
      return;
    }

    if (event.target.closest('[data-reset-filters]') || event.target.closest('[data-clear-and-explore]')) {
      clearFilters();
      render();
      return;
    }

    const primaryButton = event.target.closest('[data-primary-theme]');
    if (primaryButton) {
      P.state.filters.primaryTheme = primaryButton.dataset.primaryTheme || '';
      P.saveState();
      render();
      return;
    }

    const secondaryButton = event.target.closest('[data-secondary-theme]');
    if (secondaryButton) {
      const slug = secondaryButton.dataset.secondaryTheme || '';
      P.state.filters.secondaryThemes = slug ? toggleArray(P.state.filters.secondaryThemes, slug) : [];
      P.saveState();
      render();
      return;
    }

    const actorButton = event.target.closest('[data-actor]');
    if (actorButton) {
      const slug = actorButton.dataset.actor || '';
      P.state.filters.actors = slug ? toggleArray(P.state.filters.actors, slug) : [];
      P.saveState();
      render();
      return;
    }

    const districtButton = event.target.closest('[data-district]');
    if (districtButton) {
      const slug = districtButton.dataset.district || '';
      P.state.filters.districts = slug ? toggleArray(P.state.filters.districts, slug) : [];
      P.saveState();
      render();
      return;
    }

    if (event.target.closest('[data-stage-prev]')) {
      nextPhoto(-1);
      startAutoplay();
      return;
    }

    if (event.target.closest('[data-stage-next]')) {
      nextPhoto(1);
      startAutoplay();
      return;
    }

    const dotButton = event.target.closest('[data-stage-dot]');
    if (dotButton) {
      activePhoto = Number(dotButton.dataset.stageDot || 0);
      syncCarousel();
      startAutoplay();
    }
  });

  document.addEventListener('photostory:savedchange', render);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  window.addEventListener('popstate', () => {
    const code = P.readRouteStoryCode();
    if (code && code !== P.state.currentStoryCode) {
      activePhoto = 0;
      P.setCurrentStory(code);
      render();
    }
  });

  render();
})();
