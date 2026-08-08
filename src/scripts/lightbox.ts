/** Lightbox מינימלי לגלריות — קליק פותח, Esc/רקע סוגר, חצים מנווטים */
export function initLightbox() {
  const groups = document.querySelectorAll<HTMLElement>('[data-lightbox]');
  if (!groups.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'תצוגת תמונה מוגדלת');
  overlay.innerHTML = `
    <button class="lb-close" aria-label="סגירה">×</button>
    <button class="lb-prev" aria-label="התמונה הקודמת">‹</button>
    <img class="lb-img" alt="" />
    <button class="lb-next" aria-label="התמונה הבאה">›</button>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector<HTMLImageElement>('.lb-img')!;
  let current: HTMLImageElement[] = [];
  let idx = 0;

  const show = (i: number) => {
    idx = (i + current.length) % current.length;
    /* בגריד התמונות מוגשות ב-srcset, כך ש-.src מצביע על וריאנט קטן
       (320-640px) שייראה מטושטש במסך מלא. <Img> שומר את הנתיב לגודל
       המלא ב-data-full; הנפילה ל-.src מכסה <img> רגיל בלי המאפיין. */
    const img = current[idx];
    imgEl.src = img.dataset.full || img.src;
    imgEl.alt = img.alt || '';
  };

  const open = (imgs: HTMLImageElement[], i: number) => {
    current = imgs;
    show(i);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  groups.forEach((group) => {
    const imgs = Array.from(group.querySelectorAll<HTMLImageElement>('img'));
    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(imgs, i));
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || (e.target as HTMLElement).classList.contains('lb-close')) close();
  });
  overlay.querySelector('.lb-prev')?.addEventListener('click', () => show(idx - 1));
  overlay.querySelector('.lb-next')?.addEventListener('click', () => show(idx + 1));
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx + 1); // RTL: שמאלה = הבא
    if (e.key === 'ArrowRight') show(idx - 1);
  });
}
