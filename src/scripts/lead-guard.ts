/**
 * רשת ביטחון לפניות מהאתר.
 *
 * הבעיה: טופס רגיל שולח פעם אחת. נופלת הרשת, קורס השרת, יש באג — הפנייה
 * נעלמת, והמתעניין לרוב לא מנסה שוב. באוגוסט 2026 שני באגים בנטליפיי
 * גרמו בדיוק לזה, אחד מהם בלי שום סימן חיצוני.
 *
 * הפתרון כאן: הפרטים נכתבים לאחסון המקומי של הדפדפן *לפני* שנוגעים ברשת,
 * ונמחקים רק אחרי אישור הצלחה מהשרת. נכשלה השליחה — הפנייה נשארת בתור
 * ונשלחת לבד: כשהחיבור חוזר, או בביקור הבא באתר.
 *
 * שדרוג הדרגתי: הטופס נשאר טופס HTML תקין ששולח לנטליפיי גם בלי
 * JavaScript. הקוד הזה מוסיף שכבה מעל — הוא לא תנאי לכך שהטופס יעבוד.
 */

const QUEUE_KEY = 'bdc_lead_queue';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // חודש — אחרי זה הפנייה כבר לא רלוונטית
const MAX_ATTEMPTS = 25;

interface QueuedLead {
  id: string;
  ts: number;
  /** גוף הבקשה מקודד מראש, כדי שלא נהיה תלויים במבנה הטופס בזמן השליחה החוזרת */
  body: string;
  attempts: number;
}

const readQueue = (): QueuedLead[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedLead[]) : [];
  } catch {
    return []; // אחסון חסום או JSON פגום — לא מפילים את הטופס בגלל זה
  }
};

const writeQueue = (q: QueuedLead[]) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch {
    /* מצב פרטי / אחסון מלא — ממשיכים בלי התור */
  }
};

const send = async (body: string): Promise<boolean> => {
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    return res.ok;
  } catch {
    return false; // אין רשת
  }
};

/** מנסה לשלוח את כל מה שממתין. רץ בשקט — המתעניין כבר עזב את הטופס. */
const flush = async () => {
  let queue = readQueue();
  if (!queue.length) return;

  const now = Date.now();
  queue = queue.filter((l) => now - l.ts < MAX_AGE_MS && l.attempts < MAX_ATTEMPTS);

  const remaining: QueuedLead[] = [];
  for (const lead of queue) {
    lead.attempts += 1;
    const ok = await send(lead.body);
    if (!ok) remaining.push(lead);
  }
  writeQueue(remaining);
};

export function initLeadGuard() {
  const forms = document.querySelectorAll<HTMLFormElement>('form.lead-form');
  if (!forms.length) {
    /* גם בעמוד בלי טופס — למשל עמוד התודה — שווה לנסות לפנות את התור,
       כי ייתכן שנשארה שם פנייה מביקור קודם שנכשל. */
    void flush();
    return;
  }

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      /* אם הדפדפן חוסם את השליחה בגלל שדה חסר, לא נוגעים בכלום */
      if (!form.checkValidity()) return;

      e.preventDefault();

      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const lead: QueuedLead = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ts: Date.now(),
        body,
        attempts: 0,
      };

      /* נכנס לתור לפני קריאת הרשת — זו כל הנקודה. מכאן והלאה, גם אם
         הדפדפן ייסגר באמצע, הפנייה לא אבודה. */
      writeQueue([...readQueue(), lead]);

      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const originalLabel = submit?.innerHTML;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'שולח…';
      }

      lead.attempts = 1;
      const ok = await send(body);

      if (ok) {
        writeQueue(readQueue().filter((l) => l.id !== lead.id));
        window.location.href = form.getAttribute('action') || '/thank-you-page/';
        return;
      }

      /* נכשל. הפנייה שמורה ותישלח לבד — אומרים את זה למתעניין במקום
         להשאיר אותו מול כפתור שלא קרה ממנו כלום. */
      writeQueue(readQueue().map((l) => (l.id === lead.id ? lead : l)));
      if (submit) {
        submit.disabled = false;
        if (originalLabel) submit.innerHTML = originalLabel;
      }

      let note = form.querySelector<HTMLElement>('.lead-form-retry');
      if (!note) {
        note = document.createElement('p');
        note.className = 'lead-form-retry';
        note.setAttribute('role', 'status');
        submit?.insertAdjacentElement('afterend', note);
      }
      note.textContent =
        'הפרטים נשמרו אצלכם בדפדפן ויישלחו אוטומטית ברגע שהחיבור יחזור. ' +
        'רוצים לא לחכות? חייגו 055-4316261.';
    });
  });

  /* ניסיונות חוזרים: בטעינת עמוד, וברגע שהדפדפן מדווח שהרשת חזרה */
  void flush();
  window.addEventListener('online', () => void flush());
}
