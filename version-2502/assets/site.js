(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('[data-menu-toggle]');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var list = form.parentElement.querySelector('[data-filter-list]');
      var empty = form.parentElement.querySelector('[data-filter-empty]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var search = form.querySelector('[data-filter-search]');
      var region = form.querySelector('[data-filter-region]');
      var type = form.querySelector('[data-filter-type]');
      var year = form.querySelector('[data-filter-year]');
      var genre = form.querySelector('[data-filter-genre]');
      var params = new URLSearchParams(window.location.search);

      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      if (region && params.get('region')) {
        region.value = params.get('region');
      }
      if (type && params.get('type')) {
        type.value = params.get('type');
      }
      if (year && params.get('year')) {
        year.value = params.get('year');
      }
      if (genre && params.get('genre')) {
        genre.value = params.get('genre');
      }

      function apply() {
        var q = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var genreValue = normalize(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var matches = true;

          if (q && text.indexOf(q) === -1) {
            matches = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matches = false;
          }
          if (typeValue && cardType !== typeValue) {
            matches = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matches = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1) {
            matches = false;
          }

          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
