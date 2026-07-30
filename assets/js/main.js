/* ============================================
   STERLING & ASSOCIATES — Theme JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

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
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero timeline
    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .to('.hero-bg', { scale: 1, duration: 1.6, ease: 'power2.out' })
      .to('.hero .gsap-fade', { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 }, '-=0.6')
      .to('.hero .gsap-scale', { opacity: 1, scale: 1, duration: 0.8, stagger: 0.12 }, '-=0.4');

    // Homepage hero only
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
      // Hero parallax
      gsap.to('.hero-bg', {
        y: '12%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    }

    // Scroll-triggered animations
    function createScrollTrigger(selector, props) {
      var els = document.querySelectorAll(selector);
      if (!els.length) return;
      var defaults = { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.85, ease: 'power3.out' };
      var merged = Object.assign({}, defaults, props);
      els.forEach(function (el) {
        // Skip elements already handled by hero timeline
        if (heroSection && heroSection.contains(el)) return;
        gsap.to(el, {
          ...merged,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });
    }

    setTimeout(function () {
      createScrollTrigger('.gsap-fade', { opacity: 1, y: 0 });
      createScrollTrigger('.gsap-fade-left', { opacity: 1, x: 0 });
      createScrollTrigger('.gsap-fade-right', { opacity: 1, x: 0 });
      createScrollTrigger('.gsap-scale', { opacity: 1, scale: 1 });
      ScrollTrigger.refresh();
    }, 200);

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
