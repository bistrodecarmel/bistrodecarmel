// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

/* כל הכתובות המוחלטות באתר — canonical, og:image, og:url, ה-sitemap ו-
   LocalBusinessSchema — נגזרות מ-`site`. כשהיה כתוב כאן דומיין קבוע, האתר
   שרץ על bistrodecarmel.netlify.app הפנה את og:image ל-bistrodecarmel.co.il,
   שעדיין מריץ וורדפרס ומחזיר 404 — כלומר שיתוף קישור בוואטסאפ יצא בלי
   תמונת תצוגה מקדימה.
   נטליפיי מזריקה בזמן בנייה משתנה URL עם הכתובת הראשית של האתר. לכן זה
   מסתדר לבד: היום הוא netlify.app, וברגע שתחבר את הדומיין האמיתי הוא הופך
   ל-bistrodecarmel.co.il בלי שנצטרך לזכור לשנות כאן כלום.
   `URL` הוא שם גנרי מדי מכדי לסמוך עליו בכל סביבה, לכן קוראים אותו רק
   כשבאמת רצים על נטליפיי (`NETLIFY=true` מוגדר שם). בכל מקרה אחר — בנייה
   מקומית, CI אחר — נופלים חזרה לדומיין הקבוע, כלומר להתנהגות הקודמת. */
const site = (process.env.NETLIFY && process.env.URL) || 'https://bistrodecarmel.co.il';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you-page/'),
    }),
    react(),
  ]
});