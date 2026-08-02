import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll<HTMLElement>('[data-animate]').forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  // fade-up כללי לכל אלמנט עם data-animate
  document.querySelectorAll<HTMLElement>('[data-animate="fade-up"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  });

  // stagger לילדים של קונטיינר (כרטיסים, גריד גלריה)
  document.querySelectorAll<HTMLElement>('[data-animate="stagger"]').forEach((container) => {
    const children = Array.from(container.children);
    gsap.fromTo(
      children,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power2.out',
        stagger: 0.09,
        scrollTrigger: { trigger: container, start: 'top 82%', once: true },
      }
    );
    // הקונטיינר עצמו נחשף מיד — הילדים הם שמונפשים
    (container as HTMLElement).style.opacity = '1';
  });

  // parallax עדין לתמונות רקע full-width
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const strength = Number(el.dataset.parallax) || 40;
    gsap.fromTo(
      el,
      { yPercent: 0, y: -strength / 2 },
      {
        y: strength / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  // קו דקורטיבי שמצייר את עצמו
  document.querySelectorAll<HTMLElement>('[data-animate="draw-line"]').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 1, scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });
}
