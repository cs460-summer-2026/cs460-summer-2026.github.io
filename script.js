/* ============================================================
   CS460 Summer 2026 — Lab Site Scripts
   Handles: lab dropdown hover/click, mobile dropdown,
            TOC scroll-spy on lab pages.
   ============================================================ */

(function () {
  /* ---------- Lab Dropdown (hover + click) ---------- */
  const dropdown = document.querySelector('.nav__dropdown');
  if (dropdown) {
    const summary = dropdown.querySelector('summary');
    let hoverTimer = null;

    // Desktop hover with 100ms open delay
    dropdown.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        hoverTimer = setTimeout(() => { dropdown.open = true; }, 100);
      }
    });
    dropdown.addEventListener('mouseleave', () => {
      if (hoverTimer) clearTimeout(hoverTimer);
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        dropdown.open = false;
      }
    });

    // Click outside closes
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.open = false;
      }
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dropdown.open = false;
    });

    // Close after a click on a panel item (so navigation feels clean)
    dropdown.querySelectorAll('.nav__panel a').forEach((a) => {
      a.addEventListener('click', () => { dropdown.open = false; });
    });
  }

  /* ---------- TOC Scroll Spy ---------- */
  const tocLinks = document.querySelectorAll('.toc__list a[href^="#"]');
  if (tocLinks.length) {
    const linkMap = new Map();
    tocLinks.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      linkMap.set(id, a);
    });

    const sections = Array.from(linkMap.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const setActive = (id) => {
      tocLinks.forEach((a) => a.classList.remove('is-active'));
      const active = linkMap.get(id);
      if (active) active.classList.add('is-active');
    };

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: '-90px 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );
    sections.forEach((s) => io.observe(s));

    // Initial state: first section
    if (sections[0]) setActive(sections[0].id);
  }

  /* ---------- Site Search ---------- */
  const searchBtn = document.querySelector('.nav__search');
  const overlay = document.getElementById('search-overlay');
  if (searchBtn && overlay) {
    const input = overlay.querySelector('.search__input');
    const resultsEl = overlay.querySelector('.search__results');
    const closeBtn = overlay.querySelector('.search__close');
    const backBtn = overlay.querySelector('.search__back');

    const PAGES = [
      { href: 'index.html',  title: 'Home' },
      { href: 'lab-1.html',  title: 'Lab 1' },
      { href: 'lab-2.html',  title: 'Lab 2' },
      { href: 'lab-3.html',  title: 'Lab 3' },
      { href: 'lab-4.html',  title: 'Lab 4' },
      { href: 'lab-5.html',  title: 'Lab 5' },
      { href: 'lab-6.html',  title: 'Lab 6' },
    ];

    // Index = one entry per page, with the page's full text body concatenated.
    // We fetch each page once on first open and cache.
    let INDEX = null;
    let indexPromise = null;

    const buildIndex = () => {
      if (indexPromise) return indexPromise;
      indexPromise = Promise.all(PAGES.map(async (p) => {
        try {
          const res = await fetch(p.href);
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          // Pull text from the main content, fall back to body
          const main = doc.querySelector('#main') || doc.body;
          // Drop nav / footer text that crept in
          main.querySelectorAll('.nav, .footer, .toc, .toc-mobile, script, style').forEach((n) => n.remove());
          const text = (main.textContent || '').replace(/\s+/g, ' ').trim();
          return { ...p, text };
        } catch {
          return { ...p, text: '' };
        }
      })).then((rows) => { INDEX = rows; return rows; });
      return indexPromise;
    };

    const escapeHtml = (s) =>
      s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

    const highlight = (text, query) => {
      const q = query.trim();
      if (!q) return escapeHtml(text);
      const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return escapeHtml(text).replace(re, '<b>$1</b>');
    };

    const snippetFor = (text, query, len = 180) => {
      if (!text) return '';
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx < 0) return text.slice(0, len) + (text.length > len ? '…' : '');
      const start = Math.max(0, idx - 60);
      const end   = Math.min(text.length, idx + query.length + len - 60);
      const prefix = start > 0 ? '…' : '';
      const suffix = end < text.length ? '…' : '';
      return prefix + text.slice(start, end) + suffix;
    };

    const search = (query) => {
      if (!INDEX) return [];
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return INDEX
        .map((p) => {
          const titleHit = p.title.toLowerCase().includes(q);
          const textHit  = p.text.toLowerCase().includes(q);
          if (!titleHit && !textHit) return null;
          return { ...p, score: (titleHit ? 100 : 0) + (textHit ? 10 : 0) };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);
    };

    const render = (query) => {
      const q = query.trim();
      if (!q) {
        resultsEl.innerHTML = '';
        resultsEl.classList.remove('is-visible');
        return;
      }
      if (!INDEX) {
        resultsEl.innerHTML = '<li class="search__empty">Loading…</li>';
        resultsEl.classList.add('is-visible');
        return;
      }
      const hits = search(q);
      if (!hits.length) {
        resultsEl.innerHTML =
          '<li class="search__header">Results from this site</li>' +
          '<li class="search__empty">No matches.</li>';
        resultsEl.classList.add('is-visible');
        return;
      }
      resultsEl.innerHTML =
        '<li class="search__header">Results from this site</li>' +
        hits.map((p) => (
          '<li class="search__result">' +
            '<a href="' + p.href + '">' +
              '<div class="search__title">' + highlight(p.title, q) + '</div>' +
              '<div class="search__snippet">' + highlight(snippetFor(p.text, q), q) + '</div>' +
            '</a>' +
          '</li>'
        )).join('');
      resultsEl.classList.add('is-visible');
    };

    const open = () => {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      input.value = '';
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('is-visible');
      setTimeout(() => input.focus(), 10);
      buildIndex().then(() => { if (input.value) render(input.value); });
    };
    const close = () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    searchBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backBtn)  backBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    input.addEventListener('input', (e) => render(e.target.value));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        overlay.classList.contains('is-open') ? close() : open();
      }
    });
  }

  /* ---------- Copy-to-clipboard buttons ---------- */
  document.querySelectorAll('.code-copy[data-copy-target]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target) return;
      const text = target.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for older browsers / non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      }
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('is-copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-copied');
      }, 1400);
    });
  });
})();
