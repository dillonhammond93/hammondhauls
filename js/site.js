function toggleMenu() {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  ham.classList.toggle('open');
  menu.classList.toggle('open');
  const open = menu.classList.contains('open');
  document.body.style.overflow = open ? 'hidden' : '';
  ham.setAttribute('aria-expanded', open ? 'true' : 'false');
}

document.getElementById('hamburger').addEventListener('click', toggleMenu);
document.querySelectorAll('#mobile-menu a').forEach(function (link) {
  link.addEventListener('click', toggleMenu);
});

// Before/after carousel
(function () {
  const carousel = document.getElementById('work-carousel');
  const track = document.getElementById('work-track');
  if (!carousel || !track) return;
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('work-dots');
  let idx = 0, timer = null, raf = null;

  function loadSlideImage(slide) {
    const img = slide && slide.querySelector('img[data-src]');
    if (!img || img.getAttribute('src')) return;
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');
    if (srcset) img.setAttribute('srcset', srcset);
    if (sizes) img.setAttribute('sizes', sizes);
    img.setAttribute('fetchpriority', 'low');
    img.setAttribute('src', img.getAttribute('data-src'));
  }

  slides.forEach(function (_, i) {
    const b = document.createElement('button');
    b.className = 'carousel-dot';
    b.setAttribute('aria-label', 'Show photo ' + (i + 1));
    b.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    idx = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
  }
  function go(i) {
    idx = (i + slides.length) % slides.length;
    loadSlideImage(slides[idx]);
    loadSlideImage(slides[(idx + 1) % slides.length]);
    track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
  }
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      update();
      loadSlideImage(slides[idx]);
    });
  });
  document.getElementById('work-prev').addEventListener('click', function () { go(idx - 1); });
  document.getElementById('work-next').addEventListener('click', function () { go(idx + 1); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
  });
  window.addEventListener('resize', function () {
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = idx * track.clientWidth;
    track.style.scrollBehavior = '';
  });

  // Gentle autoplay: only while visible, pauses on hover/focus/touch, off for reduced-motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start() { if (reduce || timer || slides.length < 2) return; timer = setInterval(function () { go(idx + 1); }, 4000); }
  function stop() { clearInterval(timer); timer = null; }
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { carousel.addEventListener(ev, stop, { passive: true }); });
  carousel.addEventListener('mouseleave', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.5 }).observe(carousel);
  }
  const heroImg = slides[0].querySelector('img');
  function warmNext() { loadSlideImage(slides[1]); }
  if (heroImg && heroImg.complete) warmNext();
  else if (heroImg) heroImg.addEventListener('load', warmNext, { once: true });
  update();
})();

async function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById('customer-name').value.trim();
  if (!name) { alert('Please enter your name.'); return; }

  const projectTypeEl = document.querySelector('[name="project_type"]');

  const formData = new FormData();
  formData.append('name', name);
  formData.append('phone', document.querySelector('[name="phone"]').value);
  formData.append('zip_code', document.querySelector('[name="zip_code"]').value);
  formData.append('project_type', projectTypeEl.value ? projectTypeEl.options[projectTypeEl.selectedIndex].text : 'Not specified');
  formData.append('notes', document.querySelector('[name="notes"]').value);

  const btn = document.querySelector('.form-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/xzdwnbez', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      document.getElementById('form-fields').style.display = 'none';
      document.getElementById('thank-you').style.display = 'block';
      document.getElementById('thankyou-name').textContent = 'Thanks, ' + name + '! We\'ll follow up within 1 hour. Feel free to text a few photos to (478) 297-4448 to help us quote faster.';
    } else {
      btn.textContent = 'Request My Project Quote →';
      btn.disabled = false;
      alert('Something went wrong. Please call us at (478) 297-4448.');
    }
  } catch (err) {
    btn.textContent = 'Request My Project Quote →';
    btn.disabled = false;
    alert('Something went wrong. Please call us at (478) 297-4448.');
  }
}

document.querySelector('.form-submit').addEventListener('click', submitForm);
