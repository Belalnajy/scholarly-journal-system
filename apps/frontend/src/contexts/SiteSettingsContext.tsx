import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import siteSettingsService, { SiteSettings } from '../services/site-settings.service';

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
      
      // Update favicon
      if (settings.favicon_url) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = settings.favicon_url;
        if (!document.querySelector("link[rel*='icon']")) {
          document.head.appendChild(link);
        }
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
