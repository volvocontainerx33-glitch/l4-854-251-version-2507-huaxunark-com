(function () {
  var hlsPromise = null;

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initPosterFallbacks() {
    selectAll('img[data-poster]').forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.poster, .hero-poster, .detail-poster, .ranking-row-poster');

        if (poster) {
          poster.classList.add('poster-fallback');
        }

        image.remove();
      }, { once: true });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var rails = selectAll('[data-hero-rail]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      rails.forEach(function (rail, railIndex) {
        rail.classList.toggle('is-active', railIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    rails.forEach(function (rail) {
      rail.addEventListener('mouseenter', function () {
        show(Number(rail.getAttribute('data-hero-rail')) || 0);
        stop();
      });

      rail.addEventListener('mouseleave', start);
    });

    if (slides.length > 1) {
      start();
    }
  }

  function filterCards(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var cards = selectAll('[data-movie-card]', scope);
    var keyword = normalize(input && input.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || cardYear === year;
      var matchesRegion = !region || cardRegion === region;

      card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesRegion));
    });
  }

  function initFilters() {
    var query = new URLSearchParams(window.location.search).get('q') || '';

    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var controls = selectAll('[data-filter-input], [data-filter-year], [data-filter-region]', scope);

      if (query && input) {
        input.value = query;
      }

      controls.forEach(function (control) {
        control.addEventListener('input', function () {
          filterCards(scope);
        });

        control.addEventListener('change', function () {
          filterCards(scope);
        });
      });

      filterCards(scope);
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
      return hlsPromise;
    }

    hlsPromise = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = './assets/hls-local.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });

    return hlsPromise;
  }

  function setStatus(player, message) {
    var status = player.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  function prepareVideo(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-src');

    if (!video || !source) {
      return Promise.resolve(null);
    }

    if (video.getAttribute('data-ready') === 'true') {
      return Promise.resolve(video);
    }

    setStatus(player, '播放资源加载中');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.setAttribute('data-ready', 'true');
      setStatus(player, '高清播放');
      return Promise.resolve(video);
    }

    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        player.hlsInstance = hls;
        video.setAttribute('data-ready', 'true');
        setStatus(player, '高清播放');
        return video;
      }

      video.src = source;
      video.setAttribute('data-ready', 'true');
      setStatus(player, '高清播放');
      return video;
    });
  }

  function playVideo(player) {
    prepareVideo(player).then(function (video) {
      if (!video) {
        setStatus(player, '播放源暂不可用');
        return;
      }

      player.classList.add('is-playing');

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
          setStatus(player, '点击画面继续播放');
        });
      }
    });
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (player) {
      var button = player.querySelector('[data-play-button]');
      var video = player.querySelector('video');

      if (button) {
        button.addEventListener('click', function () {
          playVideo(player);
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo(player);
          }
        });

        video.addEventListener('playing', function () {
          player.classList.add('is-playing');
          setStatus(player, '正在播放');
        });

        video.addEventListener('pause', function () {
          setStatus(player, '已暂停');
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initPosterFallbacks();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
