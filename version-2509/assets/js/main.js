(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHeader() {
    var header = document.getElementById("site-header");
    if (!header) {
      return;
    }

    function syncHeader() {
      if (window.scrollY > 48) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  function initMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.getElementById("mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }

    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        stop();
        show(index);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCategoryFilters() {
    var scope = document.querySelector(".filter-panel");
    if (!scope) {
      return;
    }

    var keyword = scope.querySelector(".js-filter-keyword");
    var year = scope.querySelector(".js-filter-year");
    var region = scope.querySelector(".js-filter-region");
    var type = scope.querySelector(".js-filter-type");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-item"));
    var empty = document.querySelector(".empty-state");

    function apply() {
      var query = normalize(keyword && keyword.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedRegion && cardRegion !== selectedRegion) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHTML(movie.link) + '" class="movie-link" aria-label="' + escapeHTML(movie.title) + ' 在线观看">',
      '    <span class="poster-wrap">',
      '      <img src="' + escapeHTML(movie.image) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" class="movie-poster">',
      '      <span class="poster-shade"></span>',
      '      <span class="play-mark">▶</span>',
      '      <span class="duration">' + escapeHTML(movie.duration) + '</span>',
      '    </span>',
      '    <span class="movie-info">',
      '      <span class="meta-row">',
      '        <span class="badge">' + escapeHTML(movie.category) + '</span>',
      '        <span class="mini-text">' + escapeHTML(movie.year) + '</span>',
      '      </span>',
      '      <strong class="movie-title line-2">' + escapeHTML(movie.title) + '</strong>',
      '      <span class="movie-desc line-2">' + escapeHTML(movie.oneLine) + '</span>',
      '      <span class="card-foot">',
      '        <span>' + escapeHTML(movie.views) + ' 次观看</span>',
      '        <span>' + escapeHTML(movie.region) + '</span>',
      '      </span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var form = document.getElementById("search-page-form");
    var input = document.getElementById("search-page-input");
    var title = document.getElementById("search-title-line");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input) {
      input.value = query;
    }

    function render(value) {
      var clean = normalize(value);
      if (!clean) {
        results.innerHTML = '<div class="empty-state">输入片名、类型、地区或年份查找影片</div>';
        if (title) {
          title.textContent = "影片搜索";
        }
        return;
      }

      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.category,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" ")).indexOf(clean) !== -1;
      });

      if (title) {
        title.textContent = '搜索 “' + value + '”';
      }

      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }

      results.innerHTML = '<div class="movie-grid">' + matches.map(movieCard).join("") + '</div>';
    }

    if (form && input) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        history.replaceState(null, "", url);
        render(value);
      });
    }

    render(query);
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-start");
    var hls;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }
    if (cover) {
      cover.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        startPlayback();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initHeader();
    initMobileMenu();
    initHero();
    initCategoryFilters();
    initSearchPage();
  });
})();
