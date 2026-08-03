/**
 * חשיפות בגלילה (fade-up / stagger / מונים) — מבוסס IntersectionObserver.
 *
 * למה לא GSAP ScrollTrigger: ScrollTrigger מזהה מיקום גלילה דרך לולאת
 * requestAnimationFrame. בתנאים מסוימים (טאב שנפתח ברקע, throttling של
 * הדפדפן, מצב חיסכון בסוללה) הלולאה הזו נתקעת — ואז אלמנטים עם
 * opacity:0 התחלתי נשארים בלתי-נראים לצמיתות, גם אחרי שהמשתמש גלל
 * הרבה מעבר לנקודת ההפעלה. זו הייתה הסיבה בפועל לכך שקטע ההמלצות
 * (ועוד כותרות באתר) לא הופיעו אצל חלק מהמשתמשים.
 * IntersectionObserver הוא API דפדפן טבעי שלא תלוי ב-rAF ולכן אמין
 * הרבה יותר לחשיפות "פשוטות" מהסוג הזה.
 *
 * עיצוב הבטיחות: ה-CSS ש-מסתיר את [data-animate] מותנה במחלקה
 * `reveal-ready` שרק הפונקציה הזו מוסיפה, ורק אחרי שה-observer כבר
 * "תפס" את כל האלמנטים. אם קורה כאן חריגה כלשהי, ה-catch חושף הכל
 * מיד. כך JS שנכשל אף פעם לא משאיר תוכן חבוי.
 */

export function initReveal() {
  const revealEls = document.querySelectorAll<HTMLElement>('[data-animate]');
  if (!revealEls.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return; // נשאר גלוי כברירת מחדל

  try {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;

          if (el.dataset.animate === 'stagger') {
            Array.from(el.children).forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 90}ms`;
              child.classList.add('is-visible');
            });
          }

          el.classList.add('is-visible');
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));

    // רק עכשיו, אחרי שכל האלמנטים כבר במעקב, מפעילים את ה-CSS שמסתיר אותם
    document.documentElement.classList.add('reveal-ready');
  } catch {
    // כל תקלה — לא מסתירים כלום
    document.documentElement.classList.remove('reveal-ready');
  }

  initCounters();
}

function initCounters() {
  const counters = document.querySelectorAll<HTMLElement>('[data-counter]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = Number(el.dataset.counter);
        const format = el.dataset.counterFormat || '{n}';
        const duration = 1400;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - progress) * (1 - progress); // easeOutQuad
          el.textContent = format.replace('{n}', String(Math.round(eased * target)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => counterObserver.observe(el));
}
