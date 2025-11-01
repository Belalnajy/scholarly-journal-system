import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { DashboardHeader } from '../../../components/dashboard';
import siteSettingsService from '../../../services/site-settings.service';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function PaymentInstructionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [submissionFee, setSubmissionFee] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('ريال سعودي');
  const [instructions, setInstructions] = useState('');
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setLoading(false);
        setTimeout(() => navigate('/login'), 0);
        return;
      }

      // Load site settings and payment status in parallel
      const [settings, paymentStatusData] = await Promise.all([
        siteSettingsService.getPublicSettings(),
        axios.get(`${API_URL}/users/${userId}/payment-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSubmissionFee(settings.submission_fee || 0);
      setCurrency(settings.submission_fee_currency || 'ریال سعودي');
      setInstructions(settings.payment_instructions || '');
      setPaymentStatus(paymentStatusData.data.payment_status);

      // تحميل أرقام الواتساب من الإعدادات
      if (
        settings.contact_info?.whatsapp_numbers &&
        settings.contact_info.whatsapp_numbers.length > 0
      ) {
        setWhatsappNumbers(settings.contact_info.whatsapp_numbers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({
        type: 'error',
        text: 'فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setLoading(false);
    }
  };

  // قائمة أرقام الواتساب من الإعدادات أو القيم الافتراضية
  const [whatsappNumbers, setWhatsappNumbers] = useState<
    Array<{ number: string; label: string }>
  >([
    { number: '+967772171666', label: 'واتساب 1 (اليمن)' },
    { number: '+22396901310', label: 'واتساب 2 (مالي)' },
  ]);

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    const messageText = encodeURIComponent(
      `مرحباً، أرغب في دفع رسوم تقديم البحث (${submissionFee} ${currency})`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${messageText}`, '_blank');
    setShowWhatsAppMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If no submission fee, show message and redirect
  if (submissionFee === 0) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                لا توجد رسوم تقديم
              </h3>
              <p className="text-gray-700 mt-1">
                يمكنك تقديم بحثك مباشرة دون دفع رسوم.
              </p>
              <button
                onClick={() => navigate('/dashboard/submit-research')}
                className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                تقديم بحث الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader
        title="رسوم تقديم الأبحاث"
        subtitle="يرجى إتمام عملية الدفع لتتمكن من تقديم بحثك"
      />

      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Payment Status Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                رسوم التقديم المطلوبة
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                يجب دفع الرسوم قبل تقديم البحث
              </p>
            </div>
          </div>
          <div className="text-right sm:text-left w-full sm:w-auto">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {submissionFee}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">{currency}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          {paymentStatus === 'verified' ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
              <span className="text-sm sm:text-base text-green-800 font-medium">
                ✅ تم تفعيل حسابك - يمكنك تقديم بحثك الآن
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-5 h-5 flex-shrink-0 text-yellow-600" />
              <span className="text-sm sm:text-base text-yellow-800 font-medium">
                ⏳ في انتظار تفعيل الحساب من الإدارة
              </span>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
            تعليمات الدفع
          </h4>
          <div
            className="prose prose-sm max-w-none text-sm sm:text-base text-gray-700 whitespace-pre-wrap"
            style={{ lineHeight: '1.8' }}
          >
            {instructions || 'لا توجد تعليمات دفع متاحة حالياً.'}
          </div>
        </div>

        {/* WhatsApp Button with Menu */}
        {paymentStatus !== 'verified' && (
          <div className="mb-6 relative">
            {/* القائمة المنسدلة */}
            {showWhatsAppMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                <div className="bg-green-500 text-white px-4 py-3 font-bold text-center">
                  اختر رقم الواتساب للتواصل
                </div>
                {whatsappNumbers.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => openWhatsApp(item.number)}
                    className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <div className="text-right flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500" dir="ltr">
                        {item.number}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* الزر الرئيسي */}
            <button
              onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base font-bold">
                تواصل عبر الواتساب لإتمام الدفع
              </span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              اضغط لاختيار رقم الواتساب المناسب
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          {paymentStatus === 'verified' ? (
            <button
              onClick={() => navigate('/dashboard/submit-research')}
              className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm sm:text-base"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>تقديم بحث الآن</span>
            </button>
          ) : (
            <div className="flex-1 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs sm:text-sm text-yellow-800 text-center font-medium">
                بعد إتمام الدفع، سيقوم الأدمن بتفعيل حسابك خلال 24 ساعة
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
            <span>العودة للوحة التحكم</span>
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-bold text-blue-900 mb-3">
          💡 ملاحظات مهمة
        </h4>
        <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
            <span>
              بعد إتمام الدفع، اضغط على زر "لقد قمت بالدفع" لإشعار الإدارة
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
            <span>
              ستقوم الإدارة بمراجعة دفعتك والموافقة عليها خلال 24 ساعة
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
            <span>بعد الموافقة، ستتمكن من الوصول إلى صفحة تقديم الأبحاث</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
            <span>في حالة وجود أي استفسارات، يمكنك التواصل عبر الواتساب</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 mt-1 font-bold flex-shrink-0">
              ⚠️
            </span>
            <span className="font-bold text-red-700">
              رسوم التقديم صالحة لبحث واحد فقط. بعد تقديم البحث، ستحتاج إلى دفع
              رسوم جديدة لتقديم بحث آخر.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
