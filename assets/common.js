
const P = (() => {
  const UI = {
    en: {
      site: 'Photostories from Southwest State',
      saved: 'Saved',
      savedStories: 'Saved photostories',
      save: 'Save',
      unsave: 'Unsave',
      yes: 'Yes',
      no: 'No',
      removeSavedTitle: 'Remove from saved?',
      removeSavedBody: 'This photostory will be removed from your saved list.',
      somali: 'Soomali',
      english: 'English',
      filters: 'Filters',
      cluster: 'Clusters',
      themes: 'Themes',
      district: 'District',
      all: 'All',
      reset: 'Reset',
      openStory: 'Open story',
      another: 'Another random story',
      explore: 'Explore by theme and location',
      share: 'Share',
      copyLink: 'Copy link',
      copied: 'Copied',
      noMatches: 'No stories match these filters.',
      results: 'stories',
      photographerHeading: 'Story',
      beholderHeading: 'Reflections by people in the photos or community viewers',
      photographerStorytellerLabel: 'Photographer storyteller:',
      chooseClusterToSeeThemes: 'Choose a cluster to see related themes',
      storyTagsLead: 'Show more photostories related to any of the tags of this photostory',
      surpriseMe: 'Surprise me with',
      randomOne: 'a random one!',
      show: 'Show',
      filteredEarlier: 'the ones I filtered earlier',
      letMe: 'Let me',
      exploreMyself: 'explore myself',
      savedEmpty: 'No saved stories yet.',
      close: 'Close',
      filtersAria: 'Language selector',
    },
    so: {
      site: 'Sheeko-sawirro ka socda Koonfur Galbeed',
      saved: 'La keydiyey',
      savedStories: 'Sheeko-sawirrada la keydiyey',
      save: 'Keydi',
      unsave: 'Ka saar keydka',
      yes: 'Haa',
      no: 'Maya',
      removeSavedTitle: 'Ma laga saaraa kuwa la keydiyey?',
      removeSavedBody: 'Sheeko-sawirkan waxaa laga saari doonaa liiskaaga kaydsan.',
      somali: 'Soomali',
      english: 'English',
      filters: 'Shaandhooyin',
      cluster: 'Qaybo',
      themes: 'Mawduucyo',
      district: 'Degmo',
      all: 'Dhammaan',
      reset: 'Tirtir',
      openStory: 'Fur sheekada',
      another: 'Sheeko kale oo random ah',
      explore: 'Ku baadh mawduuc iyo goob',
      share: 'La wadaag',
      copyLink: 'Nuqul ka qaad linkiga',
      copied: 'Waa la nuqulay',
      noMatches: 'Sheekooyin ku habboon shaandhooyinkan ma jiraan.',
      results: 'sheeko',
      photographerHeading: 'Sheekada',
      beholderHeading: 'Milicsiyada dadka sawirrada ku jira ama daawadayaasha bulshada',
      photographerStorytellerLabel: 'Sheeko-wadaha sawir-qaadaha:',
      chooseClusterToSeeThemes: 'Dooro qayb si aad u aragto mawduucyada la xiriira',
      storyTagsLead: 'I tus sheeko-sawirro kale oo la xiriira mid ka mid ah tags-ka sheekadan',
      surpriseMe: 'Igu yaabi',
      randomOne: 'mid random ah!',
      show: 'I tus',
      filteredEarlier: 'kuwii aan hore u shaandheeyey',
      letMe: 'I daa aniga',
      exploreMyself: 'aan is-baadho',
      savedEmpty: 'Weli sheekooyin la keydiyey ma jiraan.',
      close: 'Xir',
      filtersAria: 'Xulashada luqadda',
    }
  };

  const STORAGE_KEYS = {
    lang: 'photostory_lang',
    saved: 'photostory_saved',
    filters: 'photostory_filters',
    intro: 'photostory_intro_dismissed'
  };

  const state = {
    lang: localStorage.getItem(STORAGE_KEYS.lang) || 'en',
    saved: JSON.parse(localStorage.getItem(STORAGE_KEYS.saved) || '[]'),
    filters: JSON.parse(sessionStorage.getItem(STORAGE_KEYS.filters) || '{"cluster":"","themes":[],"districts":[]}'),
    introDismissed: sessionStorage.getItem(STORAGE_KEYS.intro) === '1',
    stories: [],
    taxonomy: null,
    storyImages: {},
  };

  const q = (sel, root=document) => root.querySelector(sel);
  const qq = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (str='') => String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'", '&#39;');
  const t = () => UI[state.lang];
  const clusterMap = () => new Map(state.taxonomy.clusters.map(x => [x.slug, x]));
  const districtMap = () => new Map(state.taxonomy.districts.map(x => [x.slug, x]));
  const themeMap = () => new Map(state.taxonomy.themes.map(x => [x.slug, x]));
  const bySlug = (list, slug) => list.find(x => x.slug === slug);
  const label = (item) => item?.[state.lang] || item?.en || '';
  const countSaved = () => state.saved.length;
  const saveState = () => {
    localStorage.setItem(STORAGE_KEYS.lang, state.lang);
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(state.saved));
    sessionStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(state.filters));
    document.documentElement.lang = state.lang === 'so' ? 'so' : 'en';
  };
  const dismissIntro = () => {
    state.introDismissed = true;
    sessionStorage.setItem(STORAGE_KEYS.intro, '1');
  };
  const isSaved = (code) => state.saved.includes(code);
  const toggleSaved = (code) => {
    if (isSaved(code)) state.saved = state.saved.filter(x => x !== code);
    else state.saved = [...state.saved, code];
    saveState();
  };
  const getStory = (code) => state.stories.find(s => s.StoryCode === code);
  const placeholderSvg = (story) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#edf2f7"/><stop offset="1" stop-color="#d9e2ec"/></linearGradient></defs><rect fill="url(#g)" width="1200" height="800" rx="36"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Lucida Sans Unicode, Lucida Grande, sans-serif" font-size="44" fill="#475569">${story.StoryCode}</text></svg>`)}`;
  const storyImages = (story) => state.storyImages[story.StoryCode] || [];
  const storyCoverPath = (story) => {
    const images = storyImages(story);
    return images.length ? images[Math.floor(Math.random() * images.length)] : placeholderSvg(story);
  };
  const storyImagePath = (story, n) => storyImages(story)[n - 1] || storyImages(story)[0] || placeholderSvg(story);
  const photoCount = (story) => Math.max(1, storyImages(story).length || 1);
  const photoAlt = (story, n) => {
    const district = label(bySlug(state.taxonomy.districts, story.District)) || story.District;
    return `Photo ${n} for ${story.StoryCode} by ${story.Storyteller} in ${district}`;
  };
  const storySummary = (story) => state.lang === 'so' ? story.StorySummary_SO : story.StorySummary_EN;
  const photographerText = (story) => state.lang === 'so' ? story.Story_SO : story.Story_EN;
  const communityText = (story) => state.lang === 'so' ? story.StoryCommunity_SO : story.StoryCommunity_EN;
  const metaChip = (kind, text) => `<span class="meta-chip ${kind}">${escapeHtml(text)}</span>`;
  const countBadge = (n) => `<span class="count-badge">${n}</span>`;
  const icon = {
    heart(fill=false, cls='icon'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="${fill ? 'currentColor':'none'}" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5c-4.8-3.3-8-6.2-8-10.2 0-2.5 2-4.5 4.4-4.5 1.5 0 2.8.7 3.6 2 0 0 .9-2 3.6-2 2.4 0 4.4 2 4.4 4.5 0 4-3.2 6.9-8 10.2Z"/></svg>`; },
    share(cls='icon'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4"/></svg>`; },
    copy(cls='icon sm'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/></svg>`; },
    mail(cls='icon sm'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`; },
    x(cls='icon sm'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>`; },
    chevronLeft(cls='icon'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m15 6-6 6 6 6"/></svg>`; },
    chevronRight(cls='icon'){ return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>`; },
  };

  async function loadData(){
    const [storiesRes, taxonomyRes, manifestRes] = await Promise.all([
      fetch('data/stories.json'),
      fetch('data/clusters-themes.json'),
      fetch('data/image-manifest.json')
    ]);
    const storiesJson = await storiesRes.json();
    state.stories = storiesJson.stories || [];
    state.taxonomy = await taxonomyRes.json();
    const manifestJson = await manifestRes.json();
    state.storyImages = manifestJson.stories || {};
    saveState();
  }

  function renderHeader(showLang = true){
    const ui = t();
    return `
      <header class="header">
        <div class="site-title">${escapeHtml(ui.site)}</div>
        <div class="header-actions">
          ${showLang ? `
            <div class="lang-switch" role="group" aria-label="${escapeHtml(ui.filtersAria)}">
              <button type="button" data-lang="so" aria-pressed="${state.lang === 'so'}">${escapeHtml(ui.somali)}</button>
              <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">${escapeHtml(ui.english)}</button>
            </div>` : ''}
          <button type="button" class="action-btn saved-btn" data-open-saved>
            <span>${escapeHtml(ui.saved)}</span>
            <span class="saved-count-heart" aria-hidden="true">${icon.heart(true)}<span class="count">${countSaved()}</span></span>
          </button>
        </div>
      </header>`;
  }

  function bindHeader(root=document){
    qq('[data-lang]', root).forEach(btn => btn.addEventListener('click', () => {
      state.lang = btn.dataset.lang;
      saveState();
      document.dispatchEvent(new CustomEvent('photostory:langchange'));
    }));
    qq('[data-open-saved]', root).forEach(btn => btn.addEventListener('click', showSavedModal));
  }

  function renderSavedModal(){
    const ui = t();
    const clusterOrder = Object.fromEntries(state.taxonomy.clusters.map((item, i) => [item.slug, i]));
    const districtOrder = Object.fromEntries(state.taxonomy.districts.map((item, i) => [item.slug, i]));
    const savedStories = state.stories.filter(s => isSaved(s.StoryCode)).sort((a,b) => {
      const c = (clusterOrder[a.Cluster] ?? 999) - (clusterOrder[b.Cluster] ?? 999);
      if (c) return c;
      const d = (districtOrder[a.District] ?? 999) - (districtOrder[b.District] ?? 999);
      if (d) return d;
      return a.StoryCode.localeCompare(b.StoryCode);
    });
    return `
      <div class="saved-backdrop" id="savedModal">
        <div class="saved-panel" role="dialog" aria-modal="true" aria-labelledby="savedTitle">
          <div class="saved-head">
            <h2 class="modal-title" id="savedTitle">${escapeHtml(ui.savedStories)}</h2>
            <button class="modal-close" data-close-saved>${icon.x()}<span class="sr-only">${escapeHtml(ui.close)}</span></button>
          </div>
          <div class="saved-body">
            ${savedStories.length ? `<div class="card-grid">${
              savedStories.map((story, idx) => storyCard(story, idx, true)).join('')
            }</div>` : `<div class="empty-note">${escapeHtml(ui.savedEmpty)}</div>`}
          </div>
        </div>
      </div>`;
  }

  function showSavedModal(){
    const wrap = document.createElement('div');
    wrap.innerHTML = renderSavedModal();
    document.body.appendChild(wrap.firstElementChild);
    q('[data-close-saved]').addEventListener('click', closeSavedModal);
    q('#savedModal').addEventListener('click', (e) => { if (e.target.id === 'savedModal') closeSavedModal(); });
  }
  function closeSavedModal(){ q('#savedModal')?.remove(); }

  function storyCard(story, index=0, fromSaved=false){
    const cluster = label(bySlug(state.taxonomy.clusters, story.Cluster));
    const district = label(bySlug(state.taxonomy.districts, story.District));
    const themes = story.Themes.map(slug => label(bySlug(state.taxonomy.themes, slug)));
    return `
      <a class="card" href="story.html?code=${encodeURIComponent(story.StoryCode)}">
        <div class="card-image-wrap">
          <img class="card-image" src="${storyCoverPath(story)}" alt="${escapeHtml(photoAlt(story,1))}">
          <div class="card-heart" aria-label="${isSaved(story.StoryCode) ? 'saved' : 'not saved'}">${icon.heart(isSaved(story.StoryCode), 'icon')}</div>
        </div>
        <div class="card-body">
          <p class="summary">${escapeHtml(storySummary(story))}</p>
          <div class="meta-row">
            ${metaChip('cluster', cluster)}
            ${themes.map(t => metaChip('theme', t)).join('')}
            ${metaChip('district', district)}
          </div>
        </div>
      </a>`;
  }

  function renderConfirm(anchorEl, code){
    const ui = t();
    const rect = anchorEl.getBoundingClientRect();
    const mobile = window.innerWidth < 768;
    if (mobile){
      const node = document.createElement('div');
      node.className = 'confirm-backdrop';
      node.id = 'confirmModal';
      node.innerHTML = `<div class="confirm-pop"><h2>${escapeHtml(ui.removeSavedTitle)}</h2><p>${escapeHtml(ui.removeSavedBody)}</p><div class="confirm-actions"><button class="action-btn" data-no>${escapeHtml(ui.no)}</button><button class="primary-btn" data-yes>${escapeHtml(ui.yes)}</button></div></div>`;
      document.body.appendChild(node);
      q('[data-no]', node).onclick = () => node.remove();
      q('[data-yes]', node).onclick = () => { toggleSaved(code); node.remove(); document.dispatchEvent(new CustomEvent('photostory:savedchange')); };
      node.onclick = (e) => { if (e.target === node) node.remove(); };
      return;
    }
    const pop = document.createElement('div');
    pop.className = 'confirm-pop';
    pop.id = 'confirmPop';
    pop.style.top = `${Math.min(window.innerHeight - 180, rect.bottom + 6)}px`;
    pop.style.left = `${Math.max(16, Math.min(window.innerWidth - 336, rect.left))}px`;
    pop.innerHTML = `<h2>${escapeHtml(ui.removeSavedTitle)}</h2><p>${escapeHtml(ui.removeSavedBody)}</p><div class="confirm-actions"><button class="action-btn" data-no>${escapeHtml(ui.no)}</button><button class="primary-btn" data-yes>${escapeHtml(ui.yes)}</button></div>`;
    document.body.appendChild(pop);
    const cleanup = () => pop.remove();
    q('[data-no]', pop).onclick = cleanup;
    q('[data-yes]', pop).onclick = () => { toggleSaved(code); cleanup(); document.dispatchEvent(new CustomEvent('photostory:savedchange')); };
    setTimeout(() => {
      const closer = (ev) => {
        if (!pop.contains(ev.target)) { cleanup(); document.removeEventListener('mousedown', closer); document.removeEventListener('touchstart', closer); }
      };
      document.addEventListener('mousedown', closer);
      document.addEventListener('touchstart', closer);
    }, 0);
  }

  function createShareMenu(code){
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]+$/, 'story.html');
    url.search = `?code=${encodeURIComponent(code)}`;
    const ui = t();
    const menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.innerHTML = `
      <button type="button" data-copy><span>${icon.copy()} ${escapeHtml(ui.copyLink)}</span><span class="copy-status"></span></button>
      <button type="button" data-mail><span>${icon.mail()} Email</span></button>
      <button type="button" data-facebook><span>f Facebook</span></button>
      <button type="button" data-x><span>X X</span></button>`;
    q('[data-copy]', menu).onclick = async () => {
      try{ await navigator.clipboard.writeText(url.toString()); q('.copy-status', menu).textContent = ui.copied; setTimeout(() => q('.copy-status', menu).textContent='', 1200); }catch{}
    };
    q('[data-mail]', menu).onclick = () => { window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(url.toString())}`; };
    q('[data-facebook]', menu).onclick = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.toString())}`, '_blank', 'noopener');
    q('[data-x]', menu).onclick = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url.toString())}`, '_blank', 'noopener');
    return menu;
  }

  return {
    state, t, loadData, saveState, dismissIntro, bySlug, label, icon,
    storyImages, storyCoverPath, storyImagePath, photoAlt, photoCount, getStory, storySummary,
    photographerText, communityText, metaChip, renderHeader, bindHeader,
    renderSavedModal, showSavedModal, closeSavedModal, storyCard,
    renderConfirm, createShareMenu, q, qq, escapeHtml
  };
})();
