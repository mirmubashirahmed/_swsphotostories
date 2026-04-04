const P = (() => {
  const UI = {
    en: {
      site: 'Photostories from Southwest State',
      introKicker: 'A curated story space',
      introBody: 'A random photostory opens on arrival. Swipe through the images, then move into the gallery to stay with related themes, people, and places.',
      saved: 'Saved',
      savedStories: 'Saved stories',
      save: 'Save',
      unsave: 'Saved',
      share: 'Share',
      copied: 'Link copied',
      filters: 'Filters',
      reset: 'Reset all',
      primaryTheme: 'Primary theme',
      secondaryThemes: 'Secondary themes',
      people: 'People / actors',
      district: 'District',
      all: 'All',
      story: 'Story',
      reflections: 'Community reflections',
      storyteller: 'Storyteller',
      photoGallery: 'Photo sequence',
      selectedStory: 'Selected story',
      results: 'stories',
      openFromGallery: 'Load story',
      seeRandomRelated: 'See a random related story',
      seeRelated: 'See related stories',
      exploreFilters: 'Explore stories through filters',
      galleryTitle: 'Gallery',
      galleryBody: 'Use the lighter taxonomy to move through the collection. Primary theme leads, people stay secondary, and optional secondary themes help refine the space without making it feel technical.',
      currentFilters: 'Current story filters applied',
      noMatches: 'No stories match these filters yet.',
      jumpToGallery: 'Explore gallery',
      savedEmpty: 'No saved stories yet.',
      language: 'Language',
      english: 'English',
      somali: 'Soomali',
      imageLabel: 'Image',
      of: 'of',
      close: 'Close',
      clearAndExplore: 'Clear filters',
      relatedReady: 'Gallery aligned to this story',
      randomReady: 'Showing a related story',
      loadedStory: 'Story loaded',
    },
    so: {
      site: 'Sheeko-sawirro ka socda Koonfur Galbeed',
      introKicker: 'Goob sheeko oo la hagayo',
      introBody: 'Marka hore waxaa furmaya sheeko-sawir random ah. Sawirrada jiid, dabadeedna u deg qaybta gallery-ga si aad ugu sii socoto mawduucyo, dad, iyo goobo la xiriira.',
      saved: 'La keydiyey',
      savedStories: 'Sheekooyinka la keydiyey',
      save: 'Keydi',
      unsave: 'Waa la keydiyey',
      share: 'La wadaag',
      copied: 'Linkiga waa la nuqulay',
      filters: 'Shaandhooyin',
      reset: 'Dib u nadiifi',
      primaryTheme: 'Mawduuca koowaad',
      secondaryThemes: 'Mawduucyo dheeri ah',
      people: 'Dadka / jilayaasha',
      district: 'Degmo',
      all: 'Dhammaan',
      story: 'Sheekada',
      reflections: 'Milicsiyada bulshada',
      storyteller: 'Sheeko-wade',
      photoGallery: 'Taxanaha sawirrada',
      selectedStory: 'Sheekada la doortay',
      results: 'sheeko',
      openFromGallery: 'Soo geli sheekada',
      seeRandomRelated: 'I tus sheeko random ah oo la xiriirta',
      seeRelated: 'I tus sheekooyinka la xiriira',
      exploreFilters: 'Sheekooyinka ku baadh shaandhooyin',
      galleryTitle: 'Gallery',
      galleryBody: 'Ku dhex soco kaydka adigoo adeegsanaya taxanahan fudud. Mawduuca koowaad ayaa hormuud ah, dadka waxay ahaanayaan lakab labaad, mawduucyada dheeraadka ahna waxay si deggan u sifeeyaan raadinta.',
      currentFilters: 'Shaandhooyinka sheekadan ayaa la saaray',
      noMatches: 'Weli ma jiraan sheekooyin ku habboon shaandhooyinkan.',
      jumpToGallery: 'Tag gallery-ga',
      savedEmpty: 'Weli wax sheeko ah maadan keydin.',
      language: 'Luqad',
      english: 'English',
      somali: 'Soomali',
      imageLabel: 'Sawir',
      of: 'ka mid ah',
      close: 'Xir',
      clearAndExplore: 'Nadiifi shaandhooyinka',
      relatedReady: 'Gallery-gu wuxuu la jaanqaaday sheekadan',
      randomReady: 'Waxaa muuqata sheeko la xiriirta',
      loadedStory: 'Sheekadii waa la soo geliyey',
    }
  };

  const ACTORS = [
    { slug: 'children', en: 'Children', so: 'Carruur' },
    { slug: 'youth', en: 'Youth', so: 'Dhallinyaro' },
    { slug: 'women-girls', en: 'Women / girls', so: 'Haween / gabdho' },
    { slug: 'men-boys', en: 'Men / boys', so: 'Rag / wiilal' },
    { slug: 'elders', en: 'Elders', so: 'Waayeel' }
  ];

  const STORAGE_KEYS = {
    lang: 'photostory_lang',
    saved: 'photostory_saved',
    filters: 'photostory_filters_v2'
  };

  const defaultFilters = () => ({
    primaryTheme: '',
    secondaryThemes: [],
    actors: [],
    districts: []
  });

  function parseStoredJSON(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function normaliseFilters(raw) {
    const base = defaultFilters();
    if (!raw || typeof raw !== 'object') return base;
    return {
      primaryTheme: typeof raw.primaryTheme === 'string' ? raw.primaryTheme : '',
      secondaryThemes: Array.isArray(raw.secondaryThemes) ? raw.secondaryThemes.filter(Boolean) : [],
      actors: Array.isArray(raw.actors) ? raw.actors.filter(Boolean) : [],
      districts: Array.isArray(raw.districts) ? raw.districts.filter(Boolean) : []
    };
  }

  const state = {
    lang: localStorage.getItem(STORAGE_KEYS.lang) || 'en',
    saved: parseStoredJSON(localStorage, STORAGE_KEYS.saved, []),
    filters: normaliseFilters(parseStoredJSON(sessionStorage, STORAGE_KEYS.filters, defaultFilters())),
    stories: [],
    taxonomy: null,
    storyImages: {},
    currentStoryCode: ''
  };

  const q = (sel, root = document) => root.querySelector(sel);
  const qq = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const t = () => UI[state.lang] || UI.en;
  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.lang, state.lang);
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(state.saved));
    sessionStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(state.filters));
    document.documentElement.lang = state.lang === 'so' ? 'so' : 'en';
  }

  function bySlug(list, slug) {
    return (list || []).find(item => item.slug === slug);
  }

  function label(item) {
    return item?.[state.lang] || item?.en || '';
  }

  function storyPrimaryTheme(story) {
    return story.PrimaryTheme || story.Themes?.[0] || '';
  }

  function storySecondaryThemes(story) {
    const fallback = (story.Themes || []).filter(slug => slug !== storyPrimaryTheme(story)).slice(0, 2);
    return Array.isArray(story.SecondaryThemes) && story.SecondaryThemes.length ? story.SecondaryThemes : fallback;
  }

  function storyActors(story) {
    return Array.isArray(story.Actors) ? story.Actors : [];
  }

  function storyAllThemes(story) {
    return [storyPrimaryTheme(story), ...storySecondaryThemes(story)].filter(Boolean);
  }

  function enhanceStory(story) {
    return {
      ...story,
      PrimaryTheme: storyPrimaryTheme(story),
      SecondaryThemes: storySecondaryThemes(story),
      Actors: storyActors(story),
      AllThemes: storyAllThemes(story)
    };
  }

  async function loadData() {
    const [storiesRes, taxonomyRes, manifestRes] = await Promise.all([
      fetch('data/stories.json'),
      fetch('data/clusters-themes.json'),
      fetch('data/image-manifest.json')
    ]);

    const storiesJson = await storiesRes.json();
    const taxonomyJson = await taxonomyRes.json();
    const manifestJson = await manifestRes.json();

    state.stories = (storiesJson.stories || []).map(enhanceStory);
    state.storyImages = manifestJson.stories || {};
    state.taxonomy = {
      ...taxonomyJson,
      actors: ACTORS
    };
    saveState();
  }

  function getStory(code) {
    return state.stories.find(story => story.StoryCode === code);
  }

  function randomStory(exceptCode = '') {
    const pool = state.stories.filter(story => story.StoryCode !== exceptCode);
    if (!pool.length) return state.stories[0] || null;
    return pool[Math.floor(Math.random() * pool.length)] || pool[0] || null;
  }

  function storyImages(story) {
    return state.storyImages[story?.StoryCode] || [];
  }

  function placeholderSvg(story) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#1a2430"/><stop offset="1" stop-color="#243243"/></linearGradient></defs><rect fill="url(#g)" width="1600" height="1000" rx="40"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="68" fill="#e7edf2">${story?.StoryCode || 'Story'}</text></svg>`)}`;
  }

  function storyCoverPath(story) {
    return storyImages(story)[0] || placeholderSvg(story);
  }

  function storyImagePath(story, index) {
    return storyImages(story)[index] || storyImages(story)[0] || placeholderSvg(story);
  }

  function photoCount(story) {
    return Math.max(1, storyImages(story).length || 1);
  }

  function photoAlt(story, index) {
    const district = label(bySlug(state.taxonomy?.districts, story.District)) || story.District;
    return `Photo ${index + 1} for ${story.StoryCode} by ${story.Storyteller} in ${district}`;
  }

  function storySummary(story) {
    return state.lang === 'so' ? story.StorySummary_SO : story.StorySummary_EN;
  }

  function storyText(story) {
    return state.lang === 'so' ? story.Story_SO : story.Story_EN;
  }

  function communityText(story) {
    return state.lang === 'so' ? story.StoryCommunity_SO : story.StoryCommunity_EN;
  }

  function themeLabel(slug) {
    return label(bySlug(state.taxonomy?.themes, slug));
  }

  function districtLabel(slug) {
    return label(bySlug(state.taxonomy?.districts, slug));
  }

  function actorLabel(slug) {
    return label(bySlug(state.taxonomy?.actors, slug));
  }

  function clusterLabel(slug) {
    return label(bySlug(state.taxonomy?.clusters, slug));
  }

  function storyMetaChips(story) {
    const chips = [
      `<span class="meta-chip primary">${escapeHtml(themeLabel(story.PrimaryTheme))}</span>`,
      ...story.SecondaryThemes.map(slug => `<span class="meta-chip secondary">${escapeHtml(themeLabel(slug))}</span>`),
      ...story.Actors.map(slug => `<span class="meta-chip actor">${escapeHtml(actorLabel(slug))}</span>`),
      `<span class="meta-chip district">${escapeHtml(districtLabel(story.District))}</span>`
    ];
    return chips.join('');
  }

  function isSaved(code) {
    return state.saved.includes(code);
  }

  function toggleSaved(code) {
    if (isSaved(code)) state.saved = state.saved.filter(item => item !== code);
    else state.saved = [...state.saved, code];
    saveState();
  }

  function updateUrl(code) {
    if (!code) return;
    const url = new URL(window.location.href);
    url.searchParams.set('code', code);
    window.history.replaceState({ code }, '', url);
  }

  function readRouteStoryCode() {
    const code = new URLSearchParams(window.location.search).get('code') || '';
    return getStory(code) ? code : '';
  }

  function setCurrentStory(code) {
    const story = getStory(code);
    if (!story) return null;
    state.currentStoryCode = story.StoryCode;
    updateUrl(story.StoryCode);
    document.title = `${story.Storyteller} - ${t().site}`;
    return story;
  }

  function scrollToId(id) {
    q(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let toastTimer = null;
  function showToast(message) {
    const existing = q('#toast');
    if (existing) existing.remove();
    const node = document.createElement('div');
    node.id = 'toast';
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.remove(), 2200);
  }

  async function shareStory(code) {
    const story = getStory(code);
    if (!story) return;
    const url = new URL(window.location.href);
    url.searchParams.set('code', code);
    const shareData = {
      title: `${story.Storyteller} - ${t().site}`,
      text: storySummary(story),
      url: url.toString()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      showToast(t().copied);
    } catch {
      showToast(url.toString());
    }
  }

  function renderHeader() {
    return `
      <header class="site-header shell">
        <div class="site-lockup">
          <button class="site-brand" type="button" data-scroll-story>
            <span class="site-kicker">${escapeHtml(t().introKicker)}</span>
            <span class="site-title">${escapeHtml(t().site)}</span>
          </button>
          <p class="site-intro">${escapeHtml(t().introBody)}</p>
        </div>
        <div class="site-actions">
          <div class="lang-switch" role="group" aria-label="${escapeHtml(t().language)}">
            <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">${escapeHtml(t().english)}</button>
            <button type="button" data-lang="so" aria-pressed="${state.lang === 'so'}">${escapeHtml(t().somali)}</button>
          </div>
          <button type="button" class="ghost-btn" data-open-saved>
            ${icon.heart(isSaved(state.currentStoryCode), 'icon sm', true)}
            <span>${escapeHtml(t().saved)}</span>
            <span class="saved-count">${state.saved.length}</span>
          </button>
          <button type="button" class="primary-btn" data-scroll-gallery>${escapeHtml(t().jumpToGallery)}</button>
        </div>
      </header>`;
  }

  function storyCard(story, options = {}) {
    const selected = options.selected ? 'selected' : '';
    return `
      <article class="gallery-card ${selected}" data-story-card="${escapeHtml(story.StoryCode)}">
        <button type="button" class="card-main" data-story-select="${escapeHtml(story.StoryCode)}">
          <div class="card-image-wrap">
            <img class="card-image" src="${storyCoverPath(story)}" alt="${escapeHtml(photoAlt(story, 0))}">
          </div>
          <div class="card-body">
            <div class="card-meta-row">
              <span class="card-eyebrow">${escapeHtml(themeLabel(story.PrimaryTheme))}</span>
              <span class="card-district">${escapeHtml(districtLabel(story.District))}</span>
            </div>
            <h3 class="card-title">${escapeHtml(story.Storyteller || story.StoryCode)}</h3>
            <p class="card-summary">${escapeHtml(storySummary(story))}</p>
            <div class="chip-row compact">${storyMetaChips(story)}</div>
          </div>
        </button>
        <div class="card-footer">
          <button type="button" class="mini-btn" data-story-select="${escapeHtml(story.StoryCode)}">${escapeHtml(t().openFromGallery)}</button>
          <button type="button" class="mini-btn ${isSaved(story.StoryCode) ? 'active' : ''}" data-save-toggle="${escapeHtml(story.StoryCode)}">${escapeHtml(isSaved(story.StoryCode) ? t().unsave : t().save)}</button>
        </div>
      </article>`;
  }

  function iconButtonLabel(text, svg) {
    return `${svg}<span>${escapeHtml(text)}</span>`;
  }

  function renderSavedModal(options = {}) {
    const onSelectStory = typeof options.onSelectStory === 'function' ? options.onSelectStory : null;
    const savedStories = state.stories.filter(story => isSaved(story.StoryCode));
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="overlay" id="savedModal">
        <div class="saved-modal" role="dialog" aria-modal="true" aria-labelledby="savedTitle">
          <div class="saved-modal-head">
            <div>
              <div class="section-kicker">${escapeHtml(t().saved)}</div>
              <h2 class="modal-title" id="savedTitle">${escapeHtml(t().savedStories)}</h2>
            </div>
            <button type="button" class="icon-btn" data-close-saved>${icon.x()}</button>
          </div>
          <div class="saved-modal-body">
            ${savedStories.length ? `<div class="gallery-grid saved-grid">${savedStories.map(story => storyCard(story, { selected: story.StoryCode === state.currentStoryCode })).join('')}</div>` : `<div class="empty-state">${escapeHtml(t().savedEmpty)}</div>`}
          </div>
        </div>
      </div>`;

    const modal = wrap.firstElementChild;
    document.body.appendChild(modal);

    modal.addEventListener('click', event => {
      const closeButton = event.target.closest('[data-close-saved]');
      if (closeButton || event.target === modal) {
        modal.remove();
        return;
      }
      const saveButton = event.target.closest('[data-save-toggle]');
      if (saveButton) {
        toggleSaved(saveButton.dataset.saveToggle);
        modal.remove();
        renderSavedModal(options);
        document.dispatchEvent(new CustomEvent('photostory:savedchange'));
        return;
      }
      const selectButton = event.target.closest('[data-story-select]');
      if (selectButton && onSelectStory) {
        modal.remove();
        onSelectStory(selectButton.dataset.storySelect);
      }
    });
  }

  const icon = {
    heart(fill = false, cls = 'icon', tight = false) {
      const fillValue = fill ? 'currentColor' : 'none';
      const clsValue = tight ? `${cls} tight` : cls;
      return `<svg class="${clsValue}" viewBox="0 0 24 24" aria-hidden="true" fill="${fillValue}" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5c-4.8-3.3-8-6.2-8-10.2 0-2.5 2-4.5 4.4-4.5 1.5 0 2.8.7 3.6 2 0 0 .9-2 3.6-2 2.4 0 4.4 2 4.4 4.5 0 4-3.2 6.9-8 10.2Z"/></svg>`;
    },
    share(cls = 'icon') {
      return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/></svg>`;
    },
    chevronLeft(cls = 'icon') {
      return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 6-6 6 6 6"/></svg>`;
    },
    chevronRight(cls = 'icon') {
      return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>`;
    },
    x(cls = 'icon') {
      return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
    }
  };

  return {
    ACTORS,
    state,
    t,
    q,
    qq,
    escapeHtml,
    saveState,
    loadData,
    bySlug,
    label,
    themeLabel,
    districtLabel,
    actorLabel,
    clusterLabel,
    storyPrimaryTheme,
    storySecondaryThemes,
    storyActors,
    storyAllThemes,
    getStory,
    randomStory,
    storyImages,
    storyCoverPath,
    storyImagePath,
    photoCount,
    photoAlt,
    storySummary,
    storyText,
    communityText,
    storyMetaChips,
    isSaved,
    toggleSaved,
    readRouteStoryCode,
    setCurrentStory,
    updateUrl,
    scrollToId,
    showToast,
    shareStory,
    renderHeader,
    storyCard,
    renderSavedModal,
    icon,
    iconButtonLabel,
    defaultFilters,
    normaliseFilters
  };
})();
