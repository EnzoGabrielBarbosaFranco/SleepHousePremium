// ----------------------------------------------------
// GSAP Setup — sem Lenis para máxima performance
// ----------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Ativar lag smoothing padrão do GSAP (ajuda em computadores lentos)
gsap.ticker.lagSmoothing(500, 33);


// ----------------------------------------------------
// GSAP Animations
// ----------------------------------------------------

// 1. Hero Animation on Load
const heroTimeline = gsap.timeline();
gsap.utils.toArray('.hero__animate').forEach(element => {
  let delay = parseFloat(element.getAttribute('data-delay')) || 0;
  heroTimeline.to(element, { 
    autoAlpha: 1, 
    y: 0, 
    duration: 0.9, 
    ease: 'power3.out' 
  }, delay / 1000);
});


// 2. Generic Reveal Up elements — usando IntersectionObserver para melhor performance
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delayAttr = el.style.getPropertyValue('--delay');
      const delay = delayAttr ? parseFloat(delayAttr.replace('s', '')) : 0;
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        delay: delay,
        ease: 'power3.out'
      });
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

gsap.utils.toArray('.reveal-up').forEach(el => {
  gsap.set(el, { autoAlpha: 0, y: 40 });
  revealObserver.observe(el);
});


// 3. Section Headers Stagger — também via IntersectionObserver
const headerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      gsap.to(Array.from(entry.target.children), {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out'
      });
      headerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

gsap.utils.toArray('.section-header').forEach(header => {
  gsap.set(Array.from(header.children), { autoAlpha: 0, y: 25 });
  headerObserver.observe(header);
});


// 4. Parallax leve — apenas se não for dispositivo de baixa performance
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  gsap.utils.toArray('.parallax-break__image').forEach(img => {
    gsap.to(img, {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: img.closest('.parallax-break'),
        start: "top bottom",
        end: "bottom top",
        scrub: 2  // valor maior = menos atualizações por frame
      }
    });
  });
}


// ----------------------------------------------------
// Navbar / Mobile Menu
// ----------------------------------------------------
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isExpanded));
  });
}


// Smooth scroll nativo para links de âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      
      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });
});


// ----------------------------------------------------
// Product Filters
// ----------------------------------------------------
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

if (filterBtns.length > 0 && productCards.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          gsap.fromTo(card, { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.35, overwrite: true });
        } else {
          card.style.display = 'none';
        }
      });

      ScrollTrigger.refresh();
    });
  });
}
