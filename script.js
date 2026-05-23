// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Connect GSAP ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ----------------------------------------------------
// Hero Background Canvas Sequence
// ----------------------------------------------------
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const context = canvas.getContext('2d');
  canvas.width = 1920;
  canvas.height = 1080;

  const frameCount = 80;
  const currentFrame = index => (
    `Bedroom_transitioning_to_bed_202605222040_${index.toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  const seq = { frame: 0 };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  images[0].onload = () => {
    context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
  };

  gsap.to(seq, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5
    },
    onUpdate: () => {
      const img = images[seq.frame];
      if (img && img.complete) {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    }
  });
}

// ----------------------------------------------------
// GSAP Animations
// ----------------------------------------------------

// 1. Hero Animation on Load
const heroTimeline = gsap.timeline();
heroTimeline.from('.hero__headline', { y: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
            .from('.hero__headline em', { autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, "-=0.5")
            .from('.hero__body', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, "-=0.6")
            .from('.hero__actions', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, "-=0.6")
            .from('.hero__scroll-hint', { autoAlpha: 0, duration: 1, ease: 'power2.out' }, "-=0.4");


// 2. Generic Reveal Up elements (used on products, testimonials, trust bar, etc)
gsap.utils.toArray('.reveal-up').forEach(element => {
  // Try to parse the --delay variable, otherwise default to 0
  let delayAttr = element.style.getPropertyValue('--delay');
  let delay = delayAttr ? parseFloat(delayAttr.replace('s', '')) : 0;
  
  gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    autoAlpha: 0,
    duration: 0.8,
    delay: delay,
    ease: 'power3.out'
  });
});

// 3. Parallax Image Effect for background images
gsap.utils.toArray('.parallax-break__image').forEach(img => {
  gsap.to(img, {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: img.parentElement,
      start: "top bottom", 
      end: "bottom top",
      scrub: 1
    }
  });
});

// 4. Section Headers Stagger (label, title, body)
gsap.utils.toArray('.section-header').forEach(header => {
  gsap.from(header.children, {
    scrollTrigger: {
      trigger: header,
      start: "top 85%",
      toggleActions: "play none none reverse"
    },
    y: 30,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  });
});

// ----------------------------------------------------
// Navbar / Mobile Menu / Scroll
// ----------------------------------------------------

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
  });
}

// Add class to navbar on scroll for glass effect
lenis.on('scroll', (e) => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scroll for anchor links using Lenis
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      lenis.scrollTo(targetElement, { offset: -80 });
      
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
      // Remove active from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          gsap.fromTo(card, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, overwrite: true });
        } else {
          card.style.display = 'none';
        }
      });
      
      // Refresh ScrollTrigger so it recalculates heights
      ScrollTrigger.refresh();
    });
  });
}
