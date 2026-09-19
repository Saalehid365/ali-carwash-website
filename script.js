(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header scroll state */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var threshold = hero ? hero.offsetHeight - 110 : 140;
    if (window.scrollY > threshold) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobileNav');
  function closeMenu() {
    mobileNav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function openMenu() {
    mobileNav.classList.add('is-open');
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Animated counters */
  var counters = document.querySelectorAll('.count-num');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var decimals = el.getAttribute('data-decimals') === '1' ? 1 : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Before / after slider */
  var baRange = document.getElementById('baRange');
  var baBefore = document.getElementById('baBefore');
  var baHandle = document.getElementById('baHandle');
  var baSeam = document.getElementById('baSeam');
  function updateBA(v) {
    baBefore.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
    baHandle.style.left = v + '%';
    if (baSeam) baSeam.style.left = v + '%';
  }
  if (baRange) {
    baRange.addEventListener('input', function (e) { updateBA(e.target.value); });
    updateBA(baRange.value);
  }

  /* Review carousel */
  var track = document.getElementById('reviewTrack');
  var prevBtn = document.getElementById('reviewPrev');
  var nextBtn = document.getElementById('reviewNext');
  function cardStep() {
    var card = track.querySelector('blockquote');
    return card ? card.getBoundingClientRect().width + 48 : 400;
  }
  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });
  }

  /* Tyre quote tool */
  var tyreForm = document.getElementById('tyreForm');
  var tyreResult = document.getElementById('tyreResult');
  function tyrePrice(width, profile, rim) {
    var base = 38;
    var widthFactor = ((width - 155) / 10) * 3.4;
    var rimFactor = (rim - 13) * 7.5;
    var profileFactor = ((80 - profile) / 5) * 1.6;
    var price = base + widthFactor + rimFactor + profileFactor;
    price = Math.max(42, Math.min(195, price));
    return Math.round(price / 5) * 5;
  }
  if (tyreForm) {
    tyreForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var width = parseInt(document.getElementById('tyreWidth').value, 10);
      var profile = parseInt(document.getElementById('tyreProfile').value, 10);
      var rim = parseInt(document.getElementById('tyreRim').value, 10);
      var price = tyrePrice(width, profile, rim);
      document.getElementById('tyreResultSize').textContent = width + '/' + profile + ' R' + rim;
      var priceEl = document.getElementById('tyreResultPrice');
      tyreResult.hidden = false;
      if (reduceMotion) {
        priceEl.textContent = '£' + price;
      } else {
        var start = null;
        var duration = 700;
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var val = Math.round(price * (1 - Math.pow(1 - p, 3)));
          priceEl.textContent = '£' + val;
          if (p < 1) requestAnimationFrame(step);
        })();
      }
      tyreResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* Booking form */
  var bookingForm = document.getElementById('bookingForm');
  var bookingSuccess = document.getElementById('bookingSuccess');
  var bookingRef = document.getElementById('bookingRef');
  var bookAgainBtn = document.getElementById('bookAgain');
  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'ACW-' + s;
  }
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
        return;
      }
      bookingRef.textContent = genRef();
      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
    });
  }
  if (bookAgainBtn) {
    bookAgainBtn.addEventListener('click', function () {
      bookingForm.reset();
      bookingForm.hidden = false;
      bookingSuccess.hidden = true;
    });
  }
})();
