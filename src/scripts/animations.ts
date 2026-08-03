import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * שימו לב: חשיפות פשוטות (fade-up/stagger/מונים) עברו ל-reveal.ts
 * (IntersectionObserver) כי ScrollTrigger תלוי בלולאת rAF שיכולה
 * להיתקע ולהשאיר תוכן בלתי-נראה לצמיתות. כאן נשאר רק מה שבאמת
 * דורש מעקב רציף אחרי מיקום גלילה (parallax, פין אופקי) — אלו
 * אפקטים ויזואליים בלבד; אם הם לא רצים, התוכן עדיין גלוי וקריא.
 */

export function initAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // parallax עדין
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const strength = Number(el.dataset.parallax) || 40;
    gsap.fromTo(
      el,
      { y: -strength / 2 },
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

  // כפתורים מגנטיים (עכבר בלבד)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
      const strength = 7;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * strength;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2 * strength;
        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
