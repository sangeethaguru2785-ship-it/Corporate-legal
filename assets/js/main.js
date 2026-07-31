/* ============================================
   STACKLY — Theme JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ----- Reduced motion / missing AOS: never leave content hidden -----
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || typeof window.AOS === 'undefined') {
    document.querySelectorAll('[data-aos]').forEach(function (el) {
      el.removeAttribute('data-aos');
      el.removeAttribute('data-aos-delay');
      el.removeAttribute('data-aos-duration');
    });
  }

  // ----- Navbar scroll effect -----
  var nav = document.getElementById('mainNav');
  var backToTop = document.getElementById('backToTop');

  function updateNav() {
    var scrollY = window.scrollY;
    if (nav) {
      if (scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    if (backToTop) {
      if (scrollY > 500) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ----- Back to top -----
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----- Active nav link (single-page sections) -----
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  if (sections.length && navLinks.length) {
    function updateActiveLink() {
      var current = '';
      var scrollPos = window.scrollY + 150;
      sections.forEach(function (sec) {
        var top = sec.offsetTop;
        var bottom = top + sec.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          current = sec.getAttribute('id');
        }
      });
      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ----- GSAP animations -----
  if (!reducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // ----- SplitType letter-by-letter heading animations -----
    if (typeof SplitType !== 'undefined') {
      var splitHeadings = [];
      document.querySelectorAll('h1, h2').forEach(function (h) {
        if (h.closest('.accordion-header') || h.closest('nav') || h.closest('footer')) return;
        splitHeadings.push(h);
      });
      splitHeadings.forEach(function (heading) {
        var splitText = new SplitType(heading, { types: 'chars,words', tagName: 'span' });
        var chars = splitText.chars;
        if (!chars || !chars.length) return;
        gsap.set(chars, { opacity: 0, y: 24 });
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: { each: 0.02, from: 'start' },
          scrollTrigger: { trigger: heading, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });
    }

    // Hero timeline
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl.to('.hero-bg', { scale: 1, duration: 1.6, ease: 'power2.out' });

    // Homepage hero only
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      // Hero parallax
      gsap.to('.hero-bg', {
        y: '12%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    }

    // Counter animation
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target, duration: 2.5, ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    // Resize handler
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 300);
    });
  }

  // ----- AOS scroll animations -----
  if (!reducedMotion && typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      duration: 900,
      easing: 'ease-out-cubic',
      offset: 70,
      delay: 0
    });
  }

  // ----- Hero background video loop (hero01 -> hero02 -> repeat) -----
  var heroVideo01 = document.getElementById('heroVideo01');
  var heroVideo02 = document.getElementById('heroVideo02');

  if (heroVideo01 && heroVideo02) {
    var FADE_S = 0.9;
    var LEAD_S = 0.4;
    var heroVideos = [heroVideo01, heroVideo02];
    var heroIdx = 0;
    var heroSwitching = false;

    function showHeroVideo(nextIdx) {
      if (heroSwitching) return;
      heroSwitching = true;
      var cur = heroVideos[heroIdx];
      var nxt = heroVideos[nextIdx];
      // Replay the outgoing video muted so it is warm for the next cycle
      cur.currentTime = 0;
      cur.play().catch(function () {});
      nxt.currentTime = 0;
      nxt.play().catch(function () {});
      cur.classList.remove('active');
      nxt.classList.add('active');
      heroIdx = nextIdx;
      setTimeout(function () { heroSwitching = false; }, (FADE_S + 0.15) * 1000);
    }

    heroVideos.forEach(function (video) {
      video.addEventListener('timeupdate', function () {
        if (video === heroVideos[heroIdx] && !heroSwitching &&
            video.currentTime > 0 && video.duration &&
            (video.duration - video.currentTime) < LEAD_S) {
          showHeroVideo((heroIdx + 1) % heroVideos.length);
        }
      });
      video.addEventListener('ended', function () {
        if (video === heroVideos[heroIdx]) {
          showHeroVideo((heroIdx + 1) % heroVideos.length);
        }
      });
    });

    function ensureHeroPlaying() {
      heroVideo01.classList.add('active');
      var p1 = heroVideo01.play();
      var p2 = heroVideo02.play();
      if (p1) p1.catch(function () {});
      if (p2) p2.catch(function () {});
    }

    // Start immediately on load; retry as data becomes available so the
    // first frame shows as soon as the browser has it (no placeholder).
    ensureHeroPlaying();
    heroVideo01.addEventListener('canplay', ensureHeroPlaying);
    heroVideo02.addEventListener('canplay', ensureHeroPlaying);
  }

  // ----- Newsletter form validation -----
  var newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    var newsletterInput = newsletterForm.querySelector('.newsletter-input');
    var newsletterMsg = document.getElementById('newsletterMessage');

    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = newsletterInput.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      newsletterInput.classList.remove('error');
      newsletterMsg.className = 'newsletter-message';
      newsletterMsg.textContent = '';

      if (!email) {
        newsletterInput.classList.add('error');
        newsletterMsg.className = 'newsletter-message error';
        newsletterMsg.textContent = 'Please enter your email address.';
        newsletterInput.focus();
        return;
      }

      if (!emailPattern.test(email)) {
        newsletterInput.classList.add('error');
        newsletterMsg.className = 'newsletter-message error';
        newsletterMsg.textContent = 'Please enter a valid email address.';
        newsletterInput.focus();
        return;
      }

      // Success
      newsletterMsg.className = 'newsletter-message success';
      newsletterMsg.textContent = 'Thank you! You have been subscribed successfully.';
      newsletterInput.value = '';
    });
  }

  // ----- Smooth scroll for anchor links (multi-page fallback) -----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
