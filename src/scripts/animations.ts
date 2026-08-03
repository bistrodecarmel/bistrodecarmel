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

  // חשיפת שורות ההירו נעשית ב-CSS (ראו index.astro) — עמידה גם כשה-rAF מושהה

  // fade-up כללי
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

  // stagger לילדים
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
    container.style.opacity = '1';
  });

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

  // קו שמצייר את עצמו
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

  // מונים בפס הנתונים — data-counter="250" data-counter-format="70–{n}"
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const target = Number(el.dataset.counter);
    const format = el.dataset.counterFormat || '{n}';
    const obj = { n: 0 };
    gsap.to(obj, {
      n: target,
      duration: 1.6,
      ease: 'power2.out',
      snap: { n: 1 },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = format.replace('{n}', String(Math.round(obj.n)));
      },
    });
  });

  // גלריה אופקית נעוצה (דסקטופ בלבד — במובייל scroll-snap רגיל)
  const hTrack = document.querySelector<HTMLElement>('.hscroll-track');
  const hSection = document.querySelector<HTMLElement>('.hscroll');
  if (hTrack && hSection) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const getDistance = () => hTrack.scrollWidth - hSection.clientWidth;
      const tween = gsap.to(hTrack, {
        // RTL: הפריטים הבאים יושבים משמאל, מזיזים את המסילה ימינה
        x: () => getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: hSection,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(hTrack, { clearProps: 'transform' });
      };
    });
  }

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
}
