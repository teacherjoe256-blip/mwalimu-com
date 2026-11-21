/* Mwalimu.site public content bridge
   Reads administrator-published content from public.mwalimu_site_content.
   Existing page content remains as a fallback when no records are published. */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://ilzbxafrtxfurccqdpub.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xodjAhF80sHdlo_8TyDCEA_B2ZCA5t_';
  if (!window.supabase || !window.supabase.createClient) return;
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const $ = (selector, root = document) => root.querySelector(selector);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function dateLabel(value) {
    if (!value) return 'Mwalimu.site update';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'Mwalimu.site update' :
      d.toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function makeDetailOpener(item, items) {
    const dialog = $('#updateDetailDialog');
    if (!dialog) return;
    const title = $('#updateDetailTitle');
    const meta = $('#updateDetailMeta');
    const image = $('#updateDetailImage');
    const body = $('#updateDetailText');
    const more = $('#moreUpdatesList');
    title.textContent = item.title || '';
    meta.textContent = [item.content_type === 'update' ? 'Mwalimu updates' : '', dateLabel(item.created_at)].filter(Boolean).join(' · ');
    if (item.image_url) {
      image.src = item.image_url;
      image.alt = item.title || '';
      image.hidden = false;
    } else {
      image.removeAttribute('src');
      image.hidden = true;
    }
    body.replaceChildren();
    String(item.body || item.summary || '').split(/\n{2,}/).map(x => x.trim()).filter(Boolean).forEach(paragraph => {
      body.append(el('p', '', paragraph));
    });
    if (item.link_url) {
      const external = el('a', 'feature-cta', 'Open related link →');
      external.href = item.link_url;
      external.target = '_blank';
      external.rel = 'noopener noreferrer';
      body.append(external);
    }
    more.replaceChildren();
    items.filter(x => x.id !== item.id).slice(0, 5).forEach(other => {
      const link = el('a', '', other.title);
      link.href = '#';
      link.addEventListener('click', event => {
        event.preventDefault();
        makeDetailOpener(other, items);
      });
      more.append(link);
    });
    if (!dialog.open && typeof dialog.showModal === 'function') dialog.showModal();
    else if (!dialog.open) dialog.setAttribute('open', '');
    if (location.pathname.endsWith('/updates.html')) {
      history.replaceState(null, '', location.pathname + location.search + '#content-' + item.id);
    }
  }
  function buildSlide(item, type, allItems) {
    const article = el('article', 'feature-card carousel-slide');
    const imageUrl = item.image_url || '';
    if (imageUrl) {
      const img = el('img');
      img.src = imageUrl;
      img.alt = item.title || 'Mwalimu.site content';
      img.loading = 'lazy';
      article.append(img);
    }
    const copy = el('div', 'feature-content');
    copy.append(el('span', 'tag', ({
      update: 'Mwalimu updates',
      hero: 'Featured on Mwalimu.site',
      ai: 'Mwalimu AI',
      job: 'Mwalimu jobs',
      academy: 'Mwalimu Academy',
      community: 'Mwalimu community'
    })[type] || 'Mwalimu.site'));
    copy.append(el('h2', '', item.title || ''));
    if (item.summary) copy.append(el('p', '', item.summary));
    const cta = el('a', 'feature-cta', type === 'update' ? 'Read more →' : 'Learn more →');
    if (type === 'update') {
      if (location.pathname.endsWith('/updates.html')) {
        cta.href = '#';
        cta.addEventListener('click', event => {
          event.preventDefault();
          makeDetailOpener(item, allItems);
        });
      } else {
        cta.href = '/updates.html?article=' + encodeURIComponent(item.id);
      }
    } else if (item.link_url) {
      cta.href = item.link_url;
      if (/^https?:\/\//i.test(item.link_url)) {
        cta.target = '_blank';
        cta.rel = 'noopener noreferrer';
      }
    } else {
      cta.remove();
    }
    if (type === 'update' || item.link_url) copy.append(cta);
    article.append(copy);
    return article;
  }
  function activateCarousel(carousel) {
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dots = $('.carousel-dots', carousel);
    if (!slides.length || !dots) return;
    dots.replaceChildren();
    let index = 0;
    const show = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      Array.from(dots.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    };
    slides.forEach((slide, i) => {
      const dot = el('button', 'carousel-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', () => show(i));
      dots.append(dot);
    });
    show(0);
    if (slides.length > 1) {
      const interval = Number(carousel.dataset.interval) || 5000;
      window.setInterval(() => show(index + 1), interval);
    }
  }
  function renderCarousel(sectionSelector, items, type) {
    const section = $(sectionSelector);
    const track = section && $('.carousel-track', section);
    if (!track || !items.length) return;
    track.replaceChildren(...items.map(item => buildSlide(item, type, items)));
    activateCarousel(section.querySelector('[data-carousel]'));
  }
  function renderCommunity(items) {
    const story = $('.community-story');
    if (!story || !items.length) return;
    const first = items[0];
    const photo = $('.community-photo img', story);
    const copy = $('.community-copy', story);
    if (photo && first.image_url) {
      photo.src = first.image_url;
      photo.alt = first.title || 'Mwalimu community';
    }
    if (copy) {
      const heading = $('h2', copy);
      const paragraph = $('p', copy);
      const link = $('a', copy);
      if (heading) heading.textContent = first.title || '';
      if (paragraph) paragraph.textContent = first.summary || first.body || '';
      if (link && first.link_url) {
        link.href = first.link_url;
        link.textContent = 'Join the community →';
      } else if (link) link.hidden = true;
    }
    if (items.length > 1) {
      const extra = el('div', 'community-admin-items');
      extra.style.cssText = 'display:grid;gap:12px;margin-top:18px';
      items.slice(1).forEach(item => {
        const card = el('article', 'panel');
        card.style.cssText = 'padding:16px;border:1px solid var(--line);border-radius:14px;background:white';
        card.append(el('h3', '', item.title || ''));
        if (item.summary) card.append(el('p', '', item.summary));
        if (item.link_url) {
          const a = el('a', 'feature-cta', 'Find out more →');
          a.href = item.link_url;
          card.append(a);
        }
        extra.append(card);
      });
      story.after(extra);
    }
  }
  async function loadPublishedContent() {
    const { data, error } = await client.from('mwalimu_site_content')
      .select('id,content_type,title,summary,body,image_url,link_url,sort_order,created_at')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Mwalimu published content could not be loaded:', error.message);
      return;
    }
    const rows = data || [];
    const byType = type => rows.filter(row => row.content_type === type);
    const updates = byType('update');
    const hero = byType('hero');
    const ai = byType('ai');
    const jobs = byType('job');
    const academy = byType('academy');
    const community = byType('community');

    const isUpdatesPage = document.body.classList.contains('page-updates');
    const homepageItems = (!isUpdatesPage && hero.length) ? hero : updates;
    renderCarousel('#updates', homepageItems, (!isUpdatesPage && hero.length) ? 'hero' : 'update');
    renderCarousel('#mwalimu-ai', ai, 'ai');
    renderCarousel('#jobs', jobs, 'job');
    renderCarousel('#academy', academy, 'academy');
    renderCommunity(community);

    if (updates.length) {
      const dataNode = $('#mwalimu-update-content');
      if (dataNode) dataNode.textContent = JSON.stringify(updates.map(item => ({
        id: item.id, category: 'Mwalimu updates', title: item.title,
        summary: item.summary, date: dateLabel(item.created_at),
        image: item.image_url, body: String(item.body || '').split(/\n{2,}/).filter(Boolean)
      })));
      const requested = new URLSearchParams(location.search).get('article');
      const requestedItem = requested && updates.find(item => item.id === requested);
      if (requestedItem) makeDetailOpener(requestedItem, updates);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublishedContent, { once: true });
  } else {
    loadPublishedContent();
  }
})();
