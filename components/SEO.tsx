
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, path }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | TubeMaster AI`;

    // Helper to update standard meta tags
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update Open Graph tags
    const updateOg = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update Description
    updateMeta('description', description);
    updateMeta('twitter:description', description);
    updateMeta('twitter:title', `${title} | TubeMaster AI`);
    
    // Update OG
    updateOg('og:title', `${title} | TubeMaster AI`);
    updateOg('og:description', description);
    updateOg('og:url', `https://tubemaster-ai.vercel.app${path}`);
    
    // Canonical Link
    let link = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `https://tubemaster-ai.vercel.app${path}`);

  }, [title, description, path]);

  return null;
};
