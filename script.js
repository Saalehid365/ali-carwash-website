(function () {
  function store(get, key, val) {
    try { return get ? localStorage.getItem(key) : localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- Mobile menu + "Book" dropdown ---------- */
  var nav = document.getElementById('nav');
  var menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  var drop = document.querySelector('.nav-drop');
  var dropBtn = document.querySelector('.nav-drop-btn');
  if (drop && dropBtn) {
    dropBtn.addEventListener('click', function () {
      var open = drop.classList.toggle('is-open');
      dropBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!drop.contains(e.target)) { drop.classList.remove('is-open'); dropBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Hero video: respect reduced motion (poster stays) ---------- */
  var video = document.querySelector('.hero-video');
  if (video) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      // Slow-motion feel: play the clip at half speed (change 0.5 to taste, e.g. 0.4 or 0.7).
      video.playbackRate = 0.5;
      video.addEventListener('loadedmetadata', function () { video.playbackRate = 0.5; });
      video.addEventListener('play', function () { video.playbackRate = 0.5; });
    }
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-shown', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Cookie notice ---------- */
  var cookie = document.getElementById('cookie');
  var cookieBtn = document.getElementById('cookieAccept');
  if (cookie && cookieBtn) {
    if (!store(true, 'acw-cookies')) cookie.hidden = false;
    cookieBtn.addEventListener('click', function () {
      store(false, 'acw-cookies', 'yes');
      cookie.hidden = true;
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    panel.style.transition = 'height .3s ease';
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.height = open ? panel.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------- Before / after slider ---------- */
  var frame = document.querySelector('.ba-frame');
  var beforeClip = document.getElementById('baBeforeClip');
  var seam = document.getElementById('baSeam');
  var handle = document.getElementById('baHandle');
  if (frame && beforeClip && seam && handle) {
    var pos = 50;
    var setPos = function (v) {
      pos = Math.max(0, Math.min(100, v));
      beforeClip.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      seam.style.left = pos + '%';
      handle.setAttribute('aria-valuenow', Math.round(pos));
    };
    var toPercent = function (x) {
      var r = frame.getBoundingClientRect();
      return ((x - r.left) / r.width) * 100;
    };
    var dragging = false, pid = null;
    frame.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      dragging = true;
      pid = e.pointerId;
      frame.setPointerCapture(pid);
      setPos(toPercent(e.clientX));
    });
    frame.addEventListener('pointermove', function (e) {
      if (dragging && e.pointerId === pid) setPos(toPercent(e.clientX));
    });
    ['pointerup', 'pointercancel'].forEach(function (evt) {
      frame.addEventListener(evt, function () { dragging = false; });
    });
    handle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') setPos(pos - 4);
      if (e.key === 'ArrowRight') setPos(pos + 4);
    });
  }

  /* ---------- Tyre quote tool ---------- */
  var tyreForm = document.getElementById('tyreForm');
  var tyreResult = document.getElementById('tyreResult');
  function tyrePrice(width, profile, rim) {
    var price = 38 + ((width - 155) / 10) * 3.4 + (rim - 13) * 7.5 + ((80 - profile) / 5) * 1.6;
    price = Math.max(42, Math.min(195, price));
    return Math.round(price / 5) * 5;
  }
  if (tyreForm) {
    tyreForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var w = parseInt(document.getElementById('tyreWidth').value, 10);
      var p = parseInt(document.getElementById('tyreProfile').value, 10);
      var r = parseInt(document.getElementById('tyreRim').value, 10);
      var used = tyreForm.elements.tyreType.value === 'used';
      var price = tyrePrice(w, p, r);
      if (used) price = Math.max(20, Math.round((price * 0.55) / 5) * 5);
      document.getElementById('tyreResultSize').textContent = (used ? 'Part worn' : 'New') + ' \u2022 ' + w + '/' + p + ' R' + r;
      document.getElementById('tyreResultPrice').textContent = '£' + price;
      document.getElementById('tyreResultNote').textContent = used
        ? 'Fitted price per part-worn tyre, inc. balancing & disposal. Inspected and road-legal, subject to stock.'
        : 'Fitted price per tyre, inc. balancing & disposal.';
      tyreResult.hidden = false;
    });
  }

  /* ---------- Booking form ---------- */
  var bookingForm = document.getElementById('bookingForm');
  var bookingSuccess = document.getElementById('bookingSuccess');
  var bookingRef = document.getElementById('bookingRef');
  var bookAgain = document.getElementById('bookAgain');
  function genRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'ACW-' + s;
  }
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!bookingForm.checkValidity()) { bookingForm.reportValidity(); return; }
      bookingRef.textContent = genRef();
      bookingForm.hidden = true;
      bookingSuccess.hidden = false;
    });
  }
  if (bookAgain) {
    bookAgain.addEventListener('click', function () {
      bookingForm.reset();
      bookingForm.hidden = false;
      bookingSuccess.hidden = true;
    });
  }
})();
