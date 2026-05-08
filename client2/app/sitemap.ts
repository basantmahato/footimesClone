import { MetadataRoute } from 'next';
import axios from 'axios';
import { slugify } from '@/utils/slugify';

const BASE_URL = 'https://footimes.com';
const API_URL = 'https://api.footimes.com/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    '',
    '/tournament',
    '/news',
    '/about',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/contact',
    '/notification',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Dynamic Tournament routes
    const tournamentsRes = await axios.get(`${API_URL}/tournaments`);
    const tournamentRoutes = tournamentsRes.data.map((t: any) => ({
      url: `${BASE_URL}/tournament/${slugify(t.name)}--${t._id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Dynamic News routes
    const newsRes = await axios.get(`${API_URL}/news`);
    const newsRoutes = newsRes.data.map((n: any) => ({
      url: `${BASE_URL}/news/${n.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...tournamentRoutes, ...newsRoutes];
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return staticRoutes;
  }
}
