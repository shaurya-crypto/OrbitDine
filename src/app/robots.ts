import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://orbitdine.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/api/', 
        '/login', 
        '/signup', 
        '/scan/', 
        '/bill/',
        '/orders/',
        '/onboarding/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
