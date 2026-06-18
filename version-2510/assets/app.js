(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function safeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (navToggle && mobilePanel) {
      navToggle.addEventListener("click", function () {
        var open = mobilePanel.hasAttribute("hidden");
        if (open) {
          mobilePanel.removeAttribute("hidden");
        } else {
          mobilePanel.setAttribute("hidden", "");
        }
        navToggle.setAttribute("aria-expanded", String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var active = 0;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var searchPanel = document.querySelector(".search-panel");
    var searchResults = document.querySelector(".search-results");
    var closeSearch = document.querySelector(".search-close");

    function closePanel() {
      if (searchPanel) {
        searchPanel.setAttribute("hidden", "");
      }
    }

    if (closeSearch) {
      closeSearch.addEventListener("click", closePanel);
    }

    if (searchPanel) {
      searchPanel.addEventListener("click", function (event) {
        if (event.target === searchPanel) {
          closePanel();
        }
      });
    }

    function renderSearch(term) {
      if (!searchPanel || !searchResults) {
        return;
      }
      var query = normalize(term);
      if (!query) {
        return;
      }
      var list = Array.isArray(movieSearchIndex) ? movieSearchIndex : [];
      var matches = list.filter(function (item) {
        return [item.title, item.category, item.year, item.region, item.genre, item.summary]
          .map(normalize)
          .join(" ")
          .indexOf(query) !== -1;
      }).slice(0, 36);
      searchResults.innerHTML = matches.length ? matches.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><small>' + item.category + ' · ' + item.region + ' · ' + item.year + '</small><small>' + item.summary + '</small></span>' +
          '</a>';
      }).join("") : '<div class="search-result-item"><span></span><span><strong>暂无匹配影片</strong><small>换一个片名、类型或地区试试</small></span></div>';
      searchPanel.removeAttribute("hidden");
    }

    Array.prototype.slice.call(document.querySelectorAll("form")).forEach(function (form) {
      var input = form.querySelector(".site-search");
      if (!input) {
        return;
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderSearch(input.value);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          renderSearch(input.value);
        }
      });
    });

    var filterInput = document.querySelector(".catalog-filter");
    var sortSelect = document.querySelector(".catalog-sort");
    var catalogGrid = document.querySelector(".catalog-grid");
    if (catalogGrid) {
      var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll(".movie-card"));
      function updateCatalog() {
        var term = normalize(filterInput && filterInput.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" "));
          card.hidden = term && haystack.indexOf(term) === -1;
        });
        var sorted = cards.slice();
        var mode = sortSelect ? sortSelect.value : "default";
        if (mode === "views") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          });
        }
        if (mode === "year") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        }
        if (mode === "title") {
          sorted.sort(function (a, b) {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          });
        }
        sorted.forEach(function (card) {
          catalogGrid.appendChild(card);
        });
      }
      if (filterInput) {
        filterInput.addEventListener("input", updateCatalog);
      }
      if (sortSelect) {
        sortSelect.addEventListener("change", updateCatalog);
      }
    }

    var playButton = document.querySelector(".play-overlay[data-video]");
    var video = document.querySelector("#movie-video");
    var videoMessage = document.querySelector(".video-message");
    var hlsPlayer = null;

    function showVideoMessage(message) {
      if (!videoMessage) {
        return;
      }
      videoMessage.textContent = message;
      videoMessage.removeAttribute("hidden");
      window.setTimeout(function () {
        videoMessage.setAttribute("hidden", "");
      }, 4200);
    }

    function startVideo() {
      if (!playButton || !video) {
        return;
      }
      var url = playButton.getAttribute("data-video");
      playButton.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", url);
        }
        video.play().catch(function () {
          showVideoMessage("点击视频画面继续播放");
        });
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsPlayer) {
          hlsPlayer = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsPlayer.loadSource(url);
          hlsPlayer.attachMedia(video);
          hlsPlayer.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showVideoMessage("视频暂时无法载入，请稍后再试");
            }
          });
        }
        video.play().catch(function () {
          showVideoMessage("点击视频画面继续播放");
        });
        return;
      }
      showVideoMessage("视频暂时无法载入，请稍后再试");
    }

    if (playButton) {
      playButton.addEventListener("click", startVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
    }
  });
})();
