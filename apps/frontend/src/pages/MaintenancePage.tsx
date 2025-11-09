import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, Mail } from 'lucide-react';
import { useSiteSettings } from '../contexts';
import { useAuth } from '../contexts';
import { UserRole } from '../types/user.types';

export function MaintenancePage() {
  const { settings, loading } = useSiteSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if maintenance mode is still active
  useEffect(() => {
    if (!loading) {
      const isMaintenanceMode = settings?.is_maintenance_mode || false;
      const isAdmin = user?.role === UserRole.ADMIN;

      // If maintenance mode is off, redirect to home
      if (!isMaintenanceMode) {
        navigate('/', { replace: true });
      }
      // If user is admin, redirect to home (admins can access the site)
      else if (isAdmin) {
        navigate('/', { replace: true });
      }
    }
  }, [settings, loading, user, navigate]);

  // Show loading while checking
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#05192e] to-[#093059]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const maintenanceMessage = settings?.maintenance_message || 
    'الموقع تحت الصيانة حالياً. نعتذر عن الإزعاج ونعمل على تحسين الخدمة.';
  
  const contactEmail = settings?.contact_info?.email || 'info@journal.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05192e] to-[#093059] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        {settings?.logo_url && (
          <div className="flex justify-center mb-8">
            <img 
              src={settings.logo_url} 
              alt={settings.site_name || 'Logo'} 
              className="h-24 w-auto object-contain"
            />
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#b2823e] opacity-20 rounded-full blur-xl"></div>
              <div className="relative bg-[#b2823e] p-6 rounded-full">
                <Wrench className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#093059] mb-4">
            الموقع تحت الصيانة
          </h1>

          {/* Message */}
          <div className="bg-[#f8f3ec] rounded-xl p-6 mb-6">
            <p className="text-lg text-[#093059] leading-relaxed">
              {maintenanceMessage}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Time Card */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#093059] p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600">الوقت المتوقع</p>
                <p className="text-base font-bold text-[#093059]">قريباً جداً</p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-[#b2823e] p-3 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-600">للاستفسار</p>
                <a 
                  href={`mailto:${contactEmail}`}
                  className="text-base font-bold text-[#b2823e] hover:underline"
                >
                  راسلنا
                </a>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600">
              نشكركم على صبركم وتفهمكم. سنعود قريباً بخدمة أفضل!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8">
          <p className="text-white text-sm opacity-80">
            © 2024 {settings?.site_name || 'مجلة البحوث والدراسات'}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
