(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(() => {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
      });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      let current = 0;
      const showSlide = (index) => {
        current = index % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
      };
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => showSlide(i));
      });
      window.setInterval(() => showSlide(current + 1), 5200);
    }

    const getText = (card) => [
      card.dataset.title,
      card.dataset.region,
      card.dataset.year,
      card.dataset.genre,
      card.dataset.tags
    ].join(" ").toLowerCase();

    const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));
    filterForms.forEach((form) => {
      const input = form.querySelector("[data-filter-input]");
      const scope = document.querySelector(form.dataset.scope || "body");
      const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : [];
      const empty = scope ? scope.querySelector(".empty-state") : null;
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }
      const apply = () => {
        const value = input ? input.value.trim().toLowerCase() : "";
        let visible = 0;
        cards.forEach((card) => {
          const ok = !value || getText(card).includes(value);
          card.classList.toggle("hidden-card", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        apply();
      });
      if (input) {
        input.addEventListener("input", apply);
      }
      apply();
    });

    const navForms = Array.from(document.querySelectorAll("[data-nav-search]"));
    navForms.forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector("input[name='q']");
        const q = input ? input.value.trim() : "";
        const target = q ? `./library.html?q=${encodeURIComponent(q)}` : "./library.html";
        window.location.href = target;
      });
    });

    const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.dataset.filterChip || "";
        const form = document.querySelector("[data-filter-form]");
        const input = form ? form.querySelector("[data-filter-input]") : null;
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        chips.forEach((item) => item.classList.remove("is-active"));
        chip.classList.add("is-active");
      });
    });

    const video = document.getElementById("movie-player");
    const trigger = document.querySelector("[data-player-trigger]");
    let hlsInstance = null;
    let hlsPromise = null;

    const loadHls = () => {
      if (window.Hls) {
        return Promise.resolve(window.Hls);
      }
      if (hlsPromise) {
        return hlsPromise;
      }
      hlsPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector("script[data-hls-lib]");
        if (existing) {
          existing.addEventListener("load", () => resolve(window.Hls));
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-lib", "true");
        script.addEventListener("load", () => resolve(window.Hls));
        script.addEventListener("error", reject);
        document.head.appendChild(script);
      });
      return hlsPromise;
    };

    const bindStream = async () => {
      if (!video || video.dataset.ready === "true") {
        return;
      }
      const stream = video.getAttribute("data-stream");
      if (!stream) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.dataset.ready = "true";
        return;
      }
      try {
        const Hls = await loadHls();
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          video.dataset.ready = "true";
        } else {
          video.src = stream;
          video.dataset.ready = "true";
        }
      } catch (error) {
        video.src = stream;
        video.dataset.ready = "true";
      }
    };

    const startPlayer = async () => {
      if (!video) {
        return;
      }
      await bindStream();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    };

    if (video && trigger) {
      trigger.addEventListener("click", startPlayer);
      video.addEventListener("click", () => {
        if (video.paused) {
          startPlayer();
        }
      });
      window.addEventListener("beforeunload", () => {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
