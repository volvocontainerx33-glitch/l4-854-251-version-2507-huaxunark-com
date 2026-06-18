(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentIndex = 0;

    function activateSlide(index) {
      currentIndex = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activateSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateSlide((currentIndex + 1) % slides.length);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (yearFilter && cards.length > 0) {
    var years = [];
    cards.forEach(function (card) {
      var year = card.getAttribute('data-year');
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    years.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !year || cardYear === year;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var streamUrl = player.getAttribute('data-stream');
    var hlsInstance = null;
    var started = false;

    function startPlayback() {
      if (!video || !streamUrl) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = streamUrl;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
