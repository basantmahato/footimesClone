# Footimes SEO Implementation Checklist (Client2)

This document outlines the SEO strategies and tasks implemented or required for the Footimes Next.js application.

## ✅ Completed Tasks
- **Dynamic Sitemap**: Implemented `app/sitemap.ts` to automatically generate URLs for all tournaments and news articles.
- **SEO-Friendly URLs**: Using `slugify` to create readable URLs (e.g., `/tournament/champions-league--ID`).
- **Basic Robots.txt**: Configured `public/robots.txt` to allow search engines to crawl public pages.
- **Dynamic Metadata**: implemented `generateMetadata` for tournament detail pages to provide unique titles and descriptions.

## 🚀 Priority SEO Tasks

### 1. Metadata & Social Sharing
- [ ] **Global Metadata**: Define default metadata in `app/layout.tsx` (site name, default description, favicon).
- [ ] **OpenGraph (OG) Images**: Ensure every news and tournament page has a proper OG image for social media previews.
- [ ] **Twitter Cards**: Add `twitter:card`, `twitter:site`, and `twitter:title` tags in dynamic metadata.
- [ ] **Canonical Tags**: Add canonical URLs to avoid duplicate content issues (especially important for paginated lists).

### 2. Semantic HTML & Content
- [ ] **Heading Hierarchy**: Ensure every page has exactly one `<h1>` tag and follows a logical `<h2>`, `<h3>` structure.
- [ ] **Image Alt Text**: Ensure all `next/image` components have descriptive `alt` tags. Avoid empty alt tags.
- [ ] **Structured Data (JSON-LD)**: 
    - [ ] Add **Article** schema for news pages.
    - [ ] Add **Event/SportsEvent** schema for match details.
    - [ ] Add **BreadcrumbList** schema for easier navigation in search results.

### 3. Performance (Core Web Vitals)
- [ ] **Image Optimization**: Continue using `next/image` but ensure `sizes` prop is used to prevent layout shifts (CLS).
- [ ] **Font Optimization**: Use `next/font` to load Google Fonts efficiently without layout shifts.
- [ ] **LCP Optimization**: Preload critical images (like tournament logos or top news thumbnails) using the `priority` prop in `next/image`.

### 4. Indexing & Connectivity
- [ ] **Robots.txt Refinement**: 
    - [ ] Explicitly disallow `/admin/*` and `/api/*` routes.
    - [ ] Ensure the sitemap URL is correctly linked at the bottom of `robots.txt`.
- [ ] **Google Search Console**: Submit the `sitemap.xml` to Google Search Console once deployed.
- [ ] **404 Page Customization**: Create a custom `app/not-found.tsx` to keep users on the site if they hit a broken link.

## 🛠 Useful SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Lighthouse (Chrome DevTools)](https://developer.chrome.com/docs/lighthouse/overview/)
- [Ahrefs/SEMRush for keyword tracking](https://ahrefs.com/)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

## 🌍 SSR vs CSR & Deployment Strategy

### Which is best for Footimes?
For a news and sports application, **Server-Side Rendering (SSR)** or **Incremental Static Regeneration (ISR)** is significantly better than Client-Side Rendering (CSR).

| Feature | CSR (`'use client'`) | SSR / Server Components |
| :--- | :--- | :--- |
| **SEO** | ❌ Harder for bots to index content | ✅ Excellent; bots see full HTML |
| **Speed** | ❌ Slow "initial" load (blank screen) | ✅ Fast initial paint (FCP) |
| **Usage** | Best for interactive Admin panels | **Best for public News/Tournaments** |

**In your case:** Your dynamic pages (News details, Tournament details) should ideally fetch data in **Server Components** (removing `'use client'` where possible) so that Next.js can serve pre-rendered HTML. This ensures search engines see your scores and news immediately.

### Detailed SSR Deployment Steps

#### Option A: Vercel (Fastest & Easiest)
1. **Push to GitHub/GitLab**: Push your code to a remote repository.
2. **Import to Vercel**: Log in to Vercel, click "Add New Project", and import your repo.
3. **Configure Environment Variables**: Add your `API_URL` and any other secrets in the Vercel project settings.
4. **Deploy**: Vercel automatically runs `npm run build` and starts the server. Your pages will be SSR/ISR by default.

#### Option B: VPS (Ubuntu + Nginx + PM2)
Use this if you are hosting on your own server (DigitalOcean, AWS, etc.):
1. **Prepare Server**: Install Node.js, Nginx, and PM2 on your VPS.
2. **Clone & Build**:
   ```bash
   git clone <your-repo-url>
   cd client2
   npm install
   # Ensure your environment variables are set in a .env.production file
   npm run build
   ```
3. **Start with PM2**:
   ```bash
   pm2 start npm --name "footimes-client" -- start
   ```
4. **Configure Nginx**: Set up a reverse proxy in your Nginx config to point to `localhost:3000`:
   ```nginx
   location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```
5. **Auto-Restart**: Run `pm2 save` and `pm2 startup` to ensure the server starts automatically after a reboot.

### Critical Requirement for SSR
To actually see the benefit of SSR, you **must not** rely solely on `useEffect` to fetch data on public pages.
- **Incorrect (CSR)**: Loading spinner -> `useEffect` fetches data -> Data renders (Bots see the spinner).
- **Correct (SSR)**: `async` Server Component fetches data -> Server generates HTML -> User/Bot sees content instantly.
