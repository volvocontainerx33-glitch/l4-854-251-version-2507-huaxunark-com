(function () {
    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
        }

        show(0);
        start();
    }

    function setupFilters() {
        var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var activeCategory = "all";
        var query = "";

        function cards() {
            return Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        }

        function apply() {
            var visible = 0;
            cards().forEach(function (card) {
                var cardCategory = card.getAttribute("data-category") || "";
                var cardWords = normalize(card.getAttribute("data-words"));
                var categoryMatched = activeCategory === "all" || cardCategory === activeCategory;
                var queryMatched = query === "" || cardWords.indexOf(query) !== -1;
                var show = categoryMatched && queryMatched;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            document.querySelectorAll("[data-empty-state]").forEach(function (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            });
        }

        controls.forEach(function (control) {
            control.addEventListener("click", function () {
                activeCategory = control.getAttribute("data-filter-value") || "all";
                controls.forEach(function (item) {
                    item.classList.toggle("is-active", item === control);
                });
                apply();
            });
        });

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                query = normalize(input.value);
                inputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                apply();
            });
        });
    }

    window.initPlayer = function (playUrl) {
        var video = document.querySelector("[data-player-video]");
        var shell = document.querySelector("[data-player-shell]");
        var button = document.querySelector("[data-player-button]");
        if (!video || !shell || !button || !playUrl) {
            return;
        }

        var started = false;
        var hlsInstance = null;

        function startVideo() {
            if (started) {
                var resume = video.play();
                if (resume && typeof resume.catch === "function") {
                    resume.catch(function () {});
                }
                return;
            }

            started = true;
            shell.classList.add("is-playing");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }

            video.controls = true;
            var playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {});
            }
        }

        button.addEventListener("click", startVideo);
        video.addEventListener("click", function () {
            if (!started) {
                startVideo();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
