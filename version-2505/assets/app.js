(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-slide-dot]'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    if (slides.length > 0) {
      showSlide(0);
      schedule();
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          schedule();
        });
      });
    }
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-search-input]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const chips = Array.from(scope.querySelectorAll('[data-filter]'));
    let activeFilter = 'all';

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        const title = normalize(card.getAttribute('data-title'));
        const region = normalize(card.getAttribute('data-region'));
        const genre = normalize(card.getAttribute('data-genre'));
        const tags = normalize(card.getAttribute('data-tags'));
        const textMatch = !keyword || title.includes(keyword) || region.includes(keyword) || genre.includes(keyword) || tags.includes(keyword);
        const filterMatch = activeFilter === 'all' || genre.includes(activeFilter) || tags.includes(activeFilter) || region.includes(activeFilter);
        card.classList.toggle('hidden', !(textMatch && filterMatch));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = normalize(chip.getAttribute('data-filter'));
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });
  });
})();
