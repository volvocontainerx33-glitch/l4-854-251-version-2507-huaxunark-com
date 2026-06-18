
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-button]');
  const nav = $('[data-mobile-nav]');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupBackToTop() {
  const button = $('[data-back-to-top]');
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.classList.toggle('is-visible', window.scrollY > 560);
  }, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupHeroSlider() {
  const slider = $('[data-hero-slider]');
  if (!slider) return;

  const slides = $$('[data-hero-slide]', slider);
  const dots = $$('[data-hero-dot]', slider);
  if (slides.length <= 1) return;

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === index));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
  };

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  start();
}

function setupFilters() {
  const panel = $('[data-filter-panel]');
  if (!panel) return;

  const searchInput = $('[data-search-input]', panel);
  const yearFilter = $('[data-year-filter]', panel);
  const typeFilter = $('[data-type-filter]', panel);
  const countNode = $('[data-result-count]', panel);
  const emptyState = $('[data-empty-state]');
  const cards = $$('[data-movie-card]');

  const matchesCard = (card, keyword, year, type) => {
    const searchText = (card.dataset.search || '').toLowerCase();
    const title = (card.dataset.title || '').toLowerCase();
    const cardYear = card.dataset.year || '';
    const cardType = card.dataset.type || '';
    const keywordOk = !keyword || searchText.includes(keyword) || title.includes(keyword);
    const yearOk = !year || cardYear === year;
    const typeOk = !type || cardType === type;
    return keywordOk && yearOk && typeOk;
  };

  const apply = () => {
    const keyword = (searchInput?.value || '').trim().toLowerCase();
    const year = yearFilter?.value || '';
    const type = typeFilter?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const ok = matchesCard(card, keyword, year, type);
      card.hidden = !ok;
      if (ok) visible += 1;
    });

    if (countNode) countNode.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible !== 0;
  };

  [searchInput, yearFilter, typeFilter].forEach((control) => {
    if (control) control.addEventListener('input', apply);
    if (control) control.addEventListener('change', apply);
  });
}

async function setupPlayers() {
  const players = $$('[data-player]');
  if (!players.length) return;

  let Hls = null;
  try {
    const module = await import('./hls-dru42stk.js');
    Hls = module.H;
  } catch (error) {
    console.warn('HLS module failed to load. Native HLS fallback will be used when available.', error);
  }

  players.forEach((shell) => {
    const video = $('.video-element', shell);
    const button = $('[data-play-button]', shell);
    const message = $('[data-player-message]', shell);
    if (!video || !button) return;

    let initialized = false;
    let hlsInstance = null;

    const setMessage = (text) => {
      if (message) message.textContent = text || '';
    };

    const startPlayback = async () => {
      const src = video.dataset.src;
      if (!src) {
        setMessage('未检测到播放源。');
        return;
      }

      try {
        if (!initialized) {
          if (Hls && Hls.isSupported && Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(() => setMessage('浏览器阻止了自动播放，请再次点击播放按钮。'));
            });
            hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
              if (data && data.fatal) {
                setMessage('播放源加载失败，请稍后重试。');
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            setMessage('当前浏览器不支持 HLS 播放。');
            return;
          }
          initialized = true;
        }

        shell.classList.add('is-playing');
        await video.play();
      } catch (error) {
        console.warn('Playback failed', error);
        setMessage('播放启动失败，请检查网络或播放源。');
      }
    };

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (!video.currentTime) shell.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', () => {
      if (hlsInstance) hlsInstance.destroy();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupBackToTop();
  setupHeroSlider();
  setupFilters();
  setupPlayers();
});
