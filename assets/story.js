
(async function(){
  await P.loadData();
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || P.state.stories[0]?.StoryCode;
  let story = P.getStory(code) || P.state.stories[0];
  let activePhoto = 0;
  let autoplay = null;
  const app = document.getElementById('app');

  function hasFilters(){
    return !!(P.state.filters.cluster || P.state.filters.themes.length || P.state.filters.districts.length);
  }
  function relatedStories(){
    return P.state.stories.filter(candidate =>
      candidate.StoryCode !== story.StoryCode &&
      (candidate.Cluster === story.Cluster ||
       candidate.District === story.District ||
       candidate.Themes.some(slug => story.Themes.includes(slug)))
    );
  }
  function randomRelated(){
    const rel = relatedStories();
    const pool = rel.length ? rel : P.state.stories.filter(s => s.StoryCode !== story.StoryCode);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    if (chosen) {
      window.location.href = `story.html?code=${encodeURIComponent(chosen.StoryCode)}`;
    }
  }
  function updateTrack(rootSel, count, onLightbox){
    const track = P.q(`${rootSel} .story-track`);
    if (track) track.style.transform = `translateX(-${activePhoto * 100}%)`;
    P.qq(`${rootSel} .story-dots button`).forEach((btn, idx) => btn.classList.toggle('active', idx === activePhoto));
    const counter = P.q(`${rootSel} .story-counter`);
    if (counter) counter.textContent = `${activePhoto + 1}/${count}`;
  }
  function beginAutoplay(){
    clearInterval(autoplay);
    if (P.photoCount(story) <= 1) return;
    autoplay = setInterval(() => {
      activePhoto = (activePhoto + 1) % P.photoCount(story);
      updateTrack('.story-carousel', P.photoCount(story));
    }, 10000);
  }
  function showLightbox(){
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="lightbox-backdrop" id="lightbox">
        <div class="lightbox-panel">
          <button class="lightbox-close" data-lightbox-close>${P.icon.x()}<span class="sr-only">Close</span></button>
          <div class="lightbox-frame">
            <div class="lightbox-track">${Array.from({length:P.photoCount(story)}, (_,i)=>`<img src="${P.storyImagePath(story, i+1)}" alt="${P.escapeHtml(P.photoAlt(story, i+1))}">`).join('')}</div>
          </div>
          ${P.photoCount(story) > 1 ? `<button class="nav-arrow prev" data-prev>${P.icon.chevronLeft()}</button><button class="nav-arrow next" data-next>${P.icon.chevronRight()}</button>`:''}
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);
    const sync = () => { P.q('#lightbox .lightbox-track').style.transform = `translateX(-${activePhoto * 100}%)`; };
    sync();
    P.q('[data-lightbox-close]').onclick = () => P.q('#lightbox').remove();
    P.q('#lightbox').onclick = (e) => { if (e.target.id === 'lightbox') P.q('#lightbox').remove(); };
    P.q('[data-prev]')?.addEventListener('click', () => { activePhoto = (activePhoto - 1 + P.photoCount(story)) % P.photoCount(story); sync(); updateTrack('.story-carousel', P.photoCount(story)); });
    P.q('[data-next]')?.addEventListener('click', () => { activePhoto = (activePhoto + 1) % P.photoCount(story); sync(); updateTrack('.story-carousel', P.photoCount(story)); });
  }
  function render(){
    const ui = P.t();
    P.saveState();
    const cluster = P.label(P.bySlug(P.state.taxonomy.clusters, story.Cluster));
    const district = P.label(P.bySlug(P.state.taxonomy.districts, story.District));
    const themes = story.Themes.map(slug => ({slug, label: P.label(P.bySlug(P.state.taxonomy.themes, slug))}));
    app.innerHTML = `
      <div class="page">
        ${P.renderHeader(true)}
        <div class="story-layout">
          <section class="story-main">
            <div class="story-image-wrap">
              <div class="story-carousel">
                <div style="position:relative">
                  <div class="story-frame">
                    <div class="story-track">
                      ${Array.from({length:P.photoCount(story)}, (_,i)=>`<img src="${P.storyImagePath(story, i+1)}" alt="${P.escapeHtml(P.photoAlt(story, i+1))}">`).join('')}
                    </div>
                  </div>
                  ${P.photoCount(story) > 1 ? `<div class="story-counter">1/${P.photoCount(story)}</div>`:''}
                </div>
                ${P.photoCount(story) > 1 ? `<div class="story-dots">${Array.from({length:P.photoCount(story)}, (_,i)=>`<button aria-label="Go to photo ${i+1}" ${i===0?'class="active"':''}></button>`).join('')}</div>`:''}
              </div>
            </div>
            ${story.Storyteller ? `<p class="storyteller"><strong>${P.escapeHtml(ui.photographerStorytellerLabel)}</strong> ${P.escapeHtml(story.Storyteller)}</p>`:''}
            <div class="story-copy">
              <section><h2>${P.escapeHtml(ui.photographerHeading)}</h2><p>${P.escapeHtml(P.photographerText(story))}</p></section>
              ${P.communityText(story) ? `<section><h2>${P.escapeHtml(ui.beholderHeading)}</h2><p>${P.escapeHtml(P.communityText(story))}</p></section>`:''}
            </div>
          </section>
          <aside class="story-panel">
            <p class="panel-copy">${P.escapeHtml(ui.storyTagsLead)}</p>
            <div class="chips">
              <button class="tag-btn cluster" data-tag-cluster="${story.Cluster}">${P.escapeHtml(cluster)}</button>
              ${themes.map(th => `<button class="tag-btn theme" data-tag-theme="${th.slug}">${P.escapeHtml(th.label)}</button>`).join('')}
              <button class="tag-btn district" data-tag-district="${story.District}">${P.escapeHtml(district)}</button>
            </div>
            <div class="story-side-actions">
              ${hasFilters() ? `<div class="row-between"><span class="panel-copy">${P.escapeHtml(ui.show)}</span><button class="action-btn" data-back-filtered>${P.escapeHtml(ui.filteredEarlier)}</button></div>`:''}
              <div class="row-between"><span class="panel-copy">${P.escapeHtml(ui.surpriseMe)}</span><button class="action-btn" data-random>${P.escapeHtml(ui.randomOne)}</button></div>
              <div class="row-between"><span class="panel-copy">${P.escapeHtml(ui.letMe)}</span><button class="action-btn" data-explore>${P.escapeHtml(ui.exploreMyself)}</button></div>
            </div>
            <div class="story-buttons">
              <div style="position:relative">
                <button class="action-btn" data-share>${P.icon.share()} ${P.escapeHtml(ui.share)}</button>
              </div>
              <button class="save-btn" data-save-story>${P.icon.heart(P.state.saved.includes(story.StoryCode))} <span>${P.escapeHtml(P.state.saved.includes(story.StoryCode) ? ui.unsave : ui.save)}</span></button>
            </div>
          </aside>
        </div>
      </div>`;
    P.bindHeader(app);
    updateTrack('.story-carousel', P.photoCount(story));
    beginAutoplay();

    P.qq('.story-dots button').forEach((btn, idx) => btn.onclick = (e) => { e.stopPropagation(); activePhoto = idx; updateTrack('.story-carousel', P.photoCount(story)); });
    P.q('.story-carousel')?.addEventListener('click', showLightbox);
    let touchStartX = null;
    P.q('.story-carousel')?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
    P.q('.story-carousel')?.addEventListener('touchend', e => {
      if (touchStartX == null) return;
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 40) activePhoto = (activePhoto - 1 + P.photoCount(story)) % P.photoCount(story);
      if (diff < -40) activePhoto = (activePhoto + 1) % P.photoCount(story);
      updateTrack('.story-carousel', P.photoCount(story));
      touchStartX = null;
    });

    P.q('[data-tag-cluster]')?.addEventListener('click', () => { P.state.filters = {cluster: story.Cluster, themes: [], districts: []}; P.saveState(); window.location.href='index.html'; });
    P.qq('[data-tag-theme]').forEach(btn => btn.onclick = () => { P.state.filters = {cluster:'', themes:[btn.dataset.tagTheme], districts: []}; P.saveState(); window.location.href='index.html'; });
    P.q('[data-tag-district]')?.addEventListener('click', () => { P.state.filters = {cluster:'', themes:[], districts:[story.District]}; P.saveState(); window.location.href='index.html'; });
    P.q('[data-back-filtered]')?.addEventListener('click', () => { window.location.href='index.html'; });
    P.q('[data-random]')?.addEventListener('click', randomRelated);
    P.q('[data-explore]')?.addEventListener('click', () => { P.state.filters = {cluster:'', themes:[], districts:[]}; P.saveState(); window.location.href='index.html'; });
    P.q('[data-save-story]')?.addEventListener('click', (e) => {
      if (P.state.saved.includes(story.StoryCode)) P.renderConfirm(e.currentTarget, story.StoryCode);
      else { P.state.saved = [...P.state.saved, story.StoryCode]; P.saveState(); render(); }
    });
    P.q('[data-share]')?.addEventListener('click', (e) => {
      const parent = e.currentTarget.parentElement;
      const existing = parent.querySelector('.share-menu');
      if (existing) { existing.remove(); return; }
      const menu = P.createShareMenu(story.StoryCode);
      parent.appendChild(menu);
      setTimeout(() => {
        const closer = (ev) => {
          if (!menu.contains(ev.target) && ev.target !== e.currentTarget) { menu.remove(); document.removeEventListener('mousedown', closer); document.removeEventListener('touchstart', closer); }
        };
        document.addEventListener('mousedown', closer);
        document.addEventListener('touchstart', closer);
      }, 0);
    });
  }

  document.addEventListener('photostory:langchange', render);
  document.addEventListener('photostory:savedchange', render);
  render();
})();
