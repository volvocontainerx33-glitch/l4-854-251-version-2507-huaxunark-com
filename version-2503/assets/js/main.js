(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var active = 0;
            var setActive = function (index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    setActive(index);
                });
            });
            setInterval(function () {
                setActive(active + 1);
            }, 5200);
            setActive(0);
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var empty = scope.querySelector("[data-empty]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var category = "all";

            if (input && scope.getAttribute("data-query-sync") === "true") {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }

            var apply = function () {
                var keyword = normalize(input ? input.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedCategory = category === "all" || cardCategory === category;
                    var visible = matchedKeyword && matchedCategory;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            };

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    category = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            var form = scope.querySelector("[data-filter-form]");
            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    apply();
                });
            }

            apply();
        });
    });
})();
