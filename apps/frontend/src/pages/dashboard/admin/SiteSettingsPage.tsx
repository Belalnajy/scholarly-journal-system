import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Upload,
  ImageIcon,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  MessageCircle,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Wrench,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import siteSettingsService, {
  UpdateSiteSettingsDto,
} from '../../../services/site-settings.service';
import notificationsService, {
  NotificationType,
} from '../../../services/notifications.service';
import { useSiteSettings } from '../../../contexts/SiteSettingsContext';

export function SiteSettingsPage() {
  const { refreshSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateSiteSettingsDto>({
    site_name: '',
    site_name_en: '',
    journal_doi: '',
    journal_url: '',
    journal_issn: '',
    university_url: '',
    logo_url: '',
    favicon_url: '',
    about_intro: '',
    mission: '',
    vision: '',
    goals: [],
    contact_info: {
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      fax: '',
      whatsapp_numbers: [],
    },
    social_links: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      telegram: '',
      whatsapp_channel: '',
    },
    is_maintenance_mode: false,
    maintenance_message: '',
    submission_fee: 0,
    submission_fee_currency: 'ريال سعودي',
    payment_instructions: '',
    acceptance_letter_content: '',
  });

  const [newGoal, setNewGoal] = useState('');
  const [newWhatsAppNumber, setNewWhatsAppNumber] = useState({ number: '', label: '' });
  const [editingWhatsAppIndex, setEditingWhatsAppIndex] = useState<number | null>(null);
  const [deleteWhatsAppIndex, setDeleteWhatsAppIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getSettings();
      setFormData({
        site_name: data.site_name || '',
        site_name_en: data.site_name_en || '',
        journal_doi: data.journal_doi || '',
        journal_url: data.journal_url || '',
        journal_issn: data.journal_issn || '',
        university_url: data.university_url || '',
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
        about_intro: data.about_intro || '',
        mission: data.mission || '',
        vision: data.vision || '',
        goals: data.goals || [],
        contact_info: data.contact_info || {
          email: '',
          phone: '',
          whatsapp: '',
          address: '',
          fax: '',
          whatsapp_numbers: [],
        },
        social_links: data.social_links || {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          youtube: '',
          telegram: '',
          whatsapp_channel: '',
        },
        is_maintenance_mode: data.is_maintenance_mode || false,
        maintenance_message: data.maintenance_message || '',
        submission_fee: data.submission_fee || 0,
        submission_fee_currency: data.submission_fee_currency || 'ريال سعودي',
        payment_instructions: data.payment_instructions || '',
        acceptance_letter_content: data.acceptance_letter_content || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'فشل في تحميل الإعدادات' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      await siteSettingsService.updateSettings(formData);

      // Refresh settings context to update everywhere
      await refreshSettings();

      // Refresh local form data
      await fetchSettings();

      setMessage({
        type: 'success',
        text: 'تم حفظ الإعدادات بنجاح وتحديثها في جميع الصفحات!',
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    try {
      const newMode = !formData.is_maintenance_mode;
      await siteSettingsService.toggleMaintenanceMode(newMode);
      setFormData({ ...formData, is_maintenance_mode: newMode });

      // Send notification to all users about maintenance mode
      try {
        if (newMode) {
          // Maintenance mode enabled - notify all users
          await sendMaintenanceNotification(
            'تفعيل وضع الصيانة',
            formData.maintenance_message ||
              'الموقع تحت الصيانة حالياً. نعتذر عن الإزعاج.',
            NotificationType.SYSTEM_MAINTENANCE
          );
        } else {
          // Maintenance mode disabled - notify all users
          await sendMaintenanceNotification(
            'انتهاء الصيانة',
            'تم الانتهاء من أعمال الصيانة. الموقع يعمل بشكل طبيعي الآن.',
            NotificationType.SYSTEM_ANNOUNCEMENT
          );
        }
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
        // Don't fail the whole operation if notifications fail
      }

      setMessage({
        type: 'success',
        text: newMode
          ? 'تم تفعيل وضع الصيانة وإرسال الإشعارات'
          : 'تم تعطيل وضع الصيانة وإرسال الإشعارات',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      setMessage({ type: 'error', text: 'فشل في تغيير وضع الصيانة' });
    }
  };

  // Helper function to send notifications to all users
  const sendMaintenanceNotification = async (
    title: string,
    message: string,
    type: NotificationType
  ) => {
    try {
      await notificationsService.broadcastToAll({ title, message, type });
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      throw error;
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({
        ...formData,
        goals: [...(formData.goals || []), newGoal.trim()],
      });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals?.filter((_, i) => i !== index) || [],
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, GIF, WEBP, SVG)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage(null);
      const result = await siteSettingsService.uploadLogo(file);
      setFormData({ ...formData, logo_url: result.logo_url });

      // Refresh settings context to update logo everywhere
      await refreshSettings();

      setMessage({
        type: 'success',
        text: 'تم رفع الشعار بنجاح وتحديثه في جميع الصفحات!',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'فشل في رفع الشعار',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'نوع الملف غير مدعوم. يرجى رفع أيقونة (ICO, PNG, JPG)',
      });
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'حجم الملف كبير جداً. الحد الأقصى 1 ميجابايت',
      });
      return;
    }

    try {
      setUploadingFavicon(true);
      setMessage(null);
      const result = await siteSettingsService.uploadFavicon(file);
      setFormData({ ...formData, favicon_url: result.favicon_url });

      // Refresh settings context to update favicon everywhere
      await refreshSettings();

      // Update favicon in browser tab
      updateFavicon(result.favicon_url);

      setMessage({
        type: 'success',
        text: 'تم رفع الأيقونة بنجاح وتحديثها في المتصفح!',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error uploading favicon:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'فشل في رفع الأيقونة',
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  // Helper function to update favicon dynamically
  const updateFavicon = (faviconUrl: string) => {
    const link =
      (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = faviconUrl;
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader
        title="إعدادات الموقع"
        subtitle="إدارة معلومات الموقع والإعدادات العامة"
      />

      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Maintenance Mode Toggle */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div
            className={`p-6 transition-all duration-300 ${
              formData.is_maintenance_mode
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200'
                : 'bg-gradient-to-r from-gray-50 to-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    formData.is_maintenance_mode
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                    وضع الصيانة
                    {formData.is_maintenance_mode && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                        مفعّل
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formData.is_maintenance_mode
                      ? 'الموقع حالياً في وضع الصيانة - الزوار لا يمكنهم الدخول'
                      : 'تفعيل وضع الصيانة لإيقاف الموقع مؤقتاً'}
                  </p>
                </div>
              </div>

              {/* Enhanced Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMaintenanceMode}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 shadow-lg ${
                  formData.is_maintenance_mode
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500'
                }`}
              >
                <span
                  className={`inline-flex h-10 w-10 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 m-1 ${
                    formData.is_maintenance_mode
                      ? 'translate-x-[-48px]'
                      : 'translate-x-0'
                  }`}
                >
                  {formData.is_maintenance_mode ? (
                    <span className="text-red-600 text-[10px] font-bold">
                      ON
                    </span>
                  ) : (
                    <span className="text-gray-600 text-[10px] font-bold">
                      OFF
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Maintenance Message Section */}
          {formData.is_maintenance_mode && (
            <div className="p-6 bg-white border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                رسالة الصيانة
              </label>

              {/* Quick Message Templates */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">
                  رسائل جاهزة - اضغط للاستخدام:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'الموقع تحت الصيانة حالياً. نعتذر عن الإزعاج ونعمل على تحسين الخدمة.',
                    'نعمل حالياً على تحديث النظام. سنعود خلال ساعات قليلة.',
                    'صيانة دورية للموقع. نعتذر عن أي إزعاج قد يحدث.',
                    'جاري تحديث قاعدة البيانات. الموقع سيعود للعمل قريباً.',
                    'صيانة طارئة. نعمل على حل المشكلة في أسرع وقت ممكن.',
                    'تحديث أمني مهم. الموقع سيعود للعمل خلال 30 دقيقة.',
                  ].map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          maintenance_message: template,
                        })
                      }
                      className="text-right p-3 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 text-gray-700 hover:text-blue-700"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message Textarea */}
              <textarea
                value={formData.maintenance_message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maintenance_message: e.target.value,
                  })
                }
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                placeholder="أو اكتب رسالة مخصصة..."
              />

              <p className="text-xs text-gray-500 mt-2">
                💡 نصيحة: اكتب رسالة واضحة تشرح سبب الصيانة والوقت المتوقع
                للعودة
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">
              المعلومات الأساسية
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الموقع (عربي) *
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) =>
                  setFormData({ ...formData, site_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الموقع (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.site_name_en}
                onChange={(e) =>
                  setFormData({ ...formData, site_name_en: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم ISSN
              </label>
              <input
                type="text"
                value={formData.journal_issn}
                onChange={(e) =>
                  setFormData({ ...formData, journal_issn: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: 1987-1910"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                رقم التسلسل المعياري الدولي للمجلة
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                موقع الجامعة
              </label>
              <input
                type="url"
                value={formData.university_url}
                onChange={(e) =>
                  setFormData({ ...formData, university_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.edu"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                رابط الموقع الإلكتروني للجامعة التابعة للمجلة
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI المجلة
              </label>
              <input
                type="text"
                value={formData.journal_doi}
                onChange={(e) =>
                  setFormData({ ...formData, journal_doi: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مثال: 10.1234/journal"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط المجلة
              </label>
              <input
                type="url"
                value={formData.journal_url}
                onChange={(e) =>
                  setFormData({ ...formData, journal_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://journal.example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline ml-1" />
                شعار الموقع (Logo)
              </label>

              {/* Logo Preview */}
              {formData.logo_url && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                      uploadingLogo
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-600">
                          جاري الرفع...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          رفع شعار من الجهاز
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>

              {/* URL Input (Optional) */}
              <div className="mt-2">
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="أو أدخل رابط الشعار مباشرة"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                يمكنك رفع صورة من جهازك (JPG, PNG, GIF, WEBP, SVG) - الحد الأقصى
                5MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 inline ml-1" />
                أيقونة الموقع (Favicon)
              </label>

              {/* Favicon Preview */}
              {formData.favicon_url && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    src={formData.favicon_url}
                    alt="Favicon"
                    className="h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                      uploadingFavicon
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {uploadingFavicon ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-blue-600">
                          جاري الرفع...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          رفع أيقونة من الجهاز
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    disabled={uploadingFavicon}
                  />
                </label>
              </div>

              {/* URL Input (Optional) */}
              <div className="mt-2">
                <input
                  type="url"
                  value={formData.favicon_url}
                  onChange={(e) =>
                    setFormData({ ...formData, favicon_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="أو أدخل رابط الأيقونة مباشرة"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                يمكنك رفع أيقونة من جهازك (ICO, PNG, JPG) - الحد الأقصى 1MB
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">عن المجلة</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مقدمة عن المجلة
              </label>
              <textarea
                value={formData.about_intro}
                onChange={(e) =>
                  setFormData({ ...formData, about_intro: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مقدمة موجزة عن المجلة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرسالة
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) =>
                  setFormData({ ...formData, mission: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رسالة المجلة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرؤية
              </label>
              <textarea
                value={formData.vision}
                onChange={(e) =>
                  setFormData({ ...formData, vision: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رؤية المجلة..."
              />
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأهداف
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addGoal())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أضف هدف جديد..."
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة
                </button>
              </div>

              <div className="space-y-2">
                {formData.goals?.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{goal}</span>
                    <button
                      type="button"
                      onClick={() => removeGoal(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">معلومات الاتصال</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline ml-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.contact_info?.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: {
                      ...formData.contact_info,
                      email: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@journal.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline ml-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.contact_info?.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: {
                      ...formData.contact_info,
                      phone: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+966 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الفاكس
              </label>
              <input
                type="tel"
                value={formData.contact_info?.fax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: {
                      ...formData.contact_info,
                      fax: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+966 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline ml-1" />
                العنوان
              </label>
              <input
                type="text"
                value={formData.contact_info?.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact_info: {
                      ...formData.contact_info,
                      address: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="العنوان الكامل..."
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Numbers Management */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">أرقام الواتساب للتواصل</h3>
          </div>

          {/* Existing Numbers */}
          <div className="space-y-3 mb-4">
            {formData.contact_info?.whatsapp_numbers?.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                {editingWhatsAppIndex === index ? (
                  // Edit Mode
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="tel"
                        value={item.number}
                        onChange={(e) => {
                          const newNumbers = [...(formData.contact_info?.whatsapp_numbers || [])];
                          newNumbers[index] = { ...newNumbers[index], number: e.target.value };
                          setFormData({
                            ...formData,
                            contact_info: {
                              ...formData.contact_info,
                              whatsapp_numbers: newNumbers,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+967772171666"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const newNumbers = [...(formData.contact_info?.whatsapp_numbers || [])];
                          newNumbers[index] = { ...newNumbers[index], label: e.target.value };
                          setFormData({
                            ...formData,
                            contact_info: {
                              ...formData.contact_info,
                              whatsapp_numbers: newNumbers,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="واتساب 1 (اليمن)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWhatsAppIndex(null);
                          toast.success('تم حفظ التعديلات بنجاح');
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWhatsAppIndex(null);
                          toast('تم إلغاء التعديل', { icon: 'ℹ️' });
                        }}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.label}</div>
                      <div className="text-sm text-gray-600" dir="ltr">{item.number}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingWhatsAppIndex(index)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteWhatsAppIndex(index)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الواتساب
              </label>
              <input
                type="tel"
                value={newWhatsAppNumber.number}
                onChange={(e) => setNewWhatsAppNumber({ ...newWhatsAppNumber, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+967772171666"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التسمية
              </label>
              <input
                type="text"
                value={newWhatsAppNumber.label}
                onChange={(e) => setNewWhatsAppNumber({ ...newWhatsAppNumber, label: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="واتساب 1 (اليمن)"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  if (newWhatsAppNumber.number && newWhatsAppNumber.label) {
                    const currentNumbers = formData.contact_info?.whatsapp_numbers || [];
                    setFormData({
                      ...formData,
                      contact_info: {
                        ...formData.contact_info,
                        whatsapp_numbers: [...currentNumbers, { ...newWhatsAppNumber }],
                      },
                    });
                    setNewWhatsAppNumber({ number: '', label: '' });
                    toast.success('تمت إضافة الرقم بنجاح');
                  } else {
                    toast.error('يرجى إدخال الرقم والتسمية');
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                إضافة رقم
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            سيتم عرض هذه الأرقام في زر الواتساب العائم وصفحة الدفع
          </p>
        </div>

        {/* Submission Fee Settings */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">
              رسوم تقديم الأبحاث
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قيمة الرسوم
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.submission_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submission_fee: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                اترك القيمة 0 لتعطيل رسوم التقديم
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العملة
              </label>
              <input
                type="text"
                value={formData.submission_fee_currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submission_fee_currency: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ريال سعودي"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تعليمات الدفع
            </label>
            <textarea
              value={formData.payment_instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payment_instructions: e.target.value,
                })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="اكتب تعليمات الدفع هنا...&#10;&#10;مثال:&#10;- رقم الحساب البنكي&#10;- رقم الواتساب للتواصل&#10;- طريقة إرسال إثبات الدفع"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 نصيحة: اكتب تعليمات واضحة تشمل رقم الحساب البنكي أو رقم
              الواتساب للتواصل
            </p>
          </div>
        </div>

        {/* Acceptance Letter Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">
              نص خطاب القبول
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              محتوى خطاب القبول (النص الأساسي)
            </label>
            <textarea
              value={formData.acceptance_letter_content}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptance_letter_content: e.target.value,
                })
              }
              rows={12}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-arabic"
              placeholder="النص الافتراضي (يمكنك تعديله)..."
              dir="rtl"
            />
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-bold text-blue-800 mb-2">📝 النص الافتراضي الحالي:</p>
              <p className="text-xs text-blue-700 leading-relaxed whitespace-pre-line" dir="rtl">
                {formData.acceptance_letter_content || 
                  "قد تم قبوله للنشر في مجلتنا بعد مراجعته من قبل المحكمين المختصين واستيفائه لجميع المعايير العلمية والأكاديمية المطلوبة.\n\nنتقدم لكم بأحر التهاني على هذا الإنجاز العلمي المتميز، ونتطلع إلى المزيد من التعاون العلمي المثمر معكم.\n\nوتفضلوا بقبول فائق الاحترام والتقدير،"}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 نصيحة: هذا النص سيظهر في خطاب القبول بعد عنوان البحث ورقمه. اكتب نصاً رسمياً ومهنياً.
            </p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            روابط التواصل الاجتماعي
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline ml-1" />
                فيسبوك
              </label>
              <input
                type="url"
                value={formData.social_links?.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      facebook: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Twitter className="w-4 h-4 inline ml-1" />
                تويتر
              </label>
              <input
                type="url"
                value={formData.social_links?.twitter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      twitter: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Linkedin className="w-4 h-4 inline ml-1" />
                لينكد إن
              </label>
              <input
                type="url"
                value={formData.social_links?.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline ml-1" />
                إنستغرام
              </label>
              <input
                type="url"
                value={formData.social_links?.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      instagram: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Youtube className="w-4 h-4 inline ml-1" />
                يوتيوب
              </label>
              <input
                type="url"
                value={formData.social_links?.youtube}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      youtube: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Send className="w-4 h-4 inline ml-1" />
                تيليجرام
              </label>
              <input
                type="url"
                value={formData.social_links?.telegram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      telegram: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://t.me/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline ml-1" />
                قناة واتساب
              </label>
              <input
                type="url"
                value={formData.social_links?.whatsapp_channel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_links: {
                      ...formData.social_links,
                      whatsapp_channel: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.whatsapp.com/channel/..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>حفظ الإعدادات</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteWhatsAppIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
                <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذا الرقم؟</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-800">
                    {formData.contact_info?.whatsapp_numbers?.[deleteWhatsAppIndex]?.label}
                  </div>
                  <div className="text-sm text-gray-600" dir="ltr">
                    {formData.contact_info?.whatsapp_numbers?.[deleteWhatsAppIndex]?.number}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const newNumbers = formData.contact_info?.whatsapp_numbers?.filter((_, i) => i !== deleteWhatsAppIndex) || [];
                  setFormData({
                    ...formData,
                    contact_info: {
                      ...formData.contact_info,
                      whatsapp_numbers: newNumbers,
                    },
                  });
                  setDeleteWhatsAppIndex(null);
                  toast.success('تم حذف الرقم بنجاح');
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                نعم، احذف
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteWhatsAppIndex(null);
                  toast('تم إلغاء الحذف', { icon: 'ℹ️' });
                }}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
