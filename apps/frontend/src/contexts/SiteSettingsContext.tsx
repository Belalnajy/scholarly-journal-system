import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SiteSettings } from '../services/site-settings.service';
import siteSettingsService from '../services/site-settings.service';

interface SiteSettingsContextType {
  settings: Partial<SiteSettings> | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getPublicSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch site settings:', error);
      // Set default settings on error
      setSettings({
        site_name: 'مجلة الدراسات والبحوث',
        site_name_en: 'Journal of Studies and Research',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update favicon and title when settings change
  useEffect(() => {
    if (settings) {
      // Update page title
      if (settings.site_name) {
        document.title = settings.site_name;
      }
      
      // Update favicon - remove all existing favicons and add the new one
      if (settings.favicon_url) {
        // Remove all existing favicon links
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => link.remove());
        
        // Add new favicon with multiple sizes for better compatibility
        const sizes = ['16x16', '32x32', '192x192', '512x512'];
        sizes.forEach(size => {
          const link = document.createElement('link');
          link.type = 'image/png';
          link.rel = 'icon';
          link.sizes = size;
          link.href = settings.favicon_url!;
          document.head.appendChild(link);
        });
        
        // Add shortcut icon
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.href = settings.favicon_url;
        document.head.appendChild(shortcutLink);
        
        // Add apple touch icon
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.sizes = '180x180';
        appleLink.href = settings.favicon_url;
        document.head.appendChild(appleLink);
      }
      
      // Update Open Graph image
      if (settings.logo_url) {
        let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.head.appendChild(ogImage);
        }
        ogImage.content = settings.logo_url;
      }
    }
  }, [settings]);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
