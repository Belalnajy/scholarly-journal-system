import { X, Award, Save } from 'lucide-react';
import { useState } from 'react';

interface CustomizeCertificateModalProps {
  researchTitle: string;
  researcherName: string;
  onClose: () => void;
  onGenerate: (customMessage?: string) => void;
  isGenerating: boolean;
  isRegenerate?: boolean; // True if regenerating existing certificate
  currentMessage?: string; // Current certificate message if regenerating
}

export function CustomizeCertificateModal({
  researchTitle,
  researcherName,
  onClose,
  onGenerate,
  isGenerating,
  isRegenerate = false,
  currentMessage = '',
}: CustomizeCertificateModalProps) {
  const defaultMessage = `قد تم قبوله للنشر في مجلتنا بعد مراجعته من قبل المحكمين المختصين واستيفائه لجميع المعايير العلمية والأكاديمية المطلوبة.\n\nنتقدم لكم بأحر التهاني على هذا الإنجاز العلمي المتميز، ونتطلع إلى المزيد من التعاون العلمي المثمر معكم.\n\nوتفضلوا بقبول فائق الاحترام والتقدير،`;

  // If regenerating and has current message, use it; otherwise use default
  const initialMessage =
    isRegenerate && currentMessage ? currentMessage : defaultMessage;

  const [customMessage, setCustomMessage] = useState(initialMessage);
  const [useCustomMessage, setUseCustomMessage] = useState(isRegenerate); // Auto-enable for regenerate

  const handleGenerate = () => {
    // نرسل فقط المحتوى الرئيسي - التحية والمقدمة موجودة في الـ template
    if (useCustomMessage || isRegenerate) {
      onGenerate(customMessage.trim());
    } else {
      onGenerate(undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isRegenerate
                    ? 'تعديل وإعادة توليد خطاب القبول'
                    : 'تخصيص خطاب القبول'}
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  {isRegenerate
                    ? 'يمكنك تعديل محتوى الخطاب وإعادة توليده بمحتوى جديد'
                    : 'يمكنك تخصيص محتوى خطاب القبول لهذا البحث'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6" dir="rtl">
          {/* Research Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 mb-2">معلومات البحث:</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">الباحث:</span> {researcherName}
              </p>
              <p>
                <span className="font-medium">عنوان البحث:</span>{' '}
                {researchTitle}
              </p>
            </div>
          </div>

          {/* Custom Message Toggle - Only show for first generation */}
          {!isRegenerate && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="useCustomMessage"
                checked={useCustomMessage}
                onChange={(e) => setUseCustomMessage(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <label
                htmlFor="useCustomMessage"
                className="flex-1 cursor-pointer"
              >
                <span className="font-bold text-gray-800">
                  استخدام رسالة مخصصة
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  قم بتفعيل هذا الخيار لكتابة رسالة مخصصة لهذا الباحث
                </p>
              </label>
            </div>
          )}

          {/* Default Message Preview */}
          {!useCustomMessage && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                الرسالة الافتراضية (سيتم استخدامها):
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {defaultMessage}
                </p>
              </div>
            </div>
          )}

          {/* Custom Message Input */}
          {(useCustomMessage || isRegenerate) && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                {isRegenerate ? 'محتوى خطاب القبول:' : 'الرسالة المخصصة:'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-blue-800">
                  <strong>ملاحظة:</strong> التحية والمقدمة ثابتة في التصميم. هنا
                  تكتب فقط محتوى الرسالة الأساسي (ما يأتي بعد عنوان البحث
                  ورقمه).
                </p>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="مثال: قد تم قبوله للنشر في مجلتنا بعد مراجعته من قبل المحكمين المختصين..."
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all resize-none font-arabic leading-relaxed"
                dir="rtl"
              />
              <p className="text-xs text-gray-500">
                {' '}
                {isRegenerate
                  ? 'يمكنك تعديل المحتوى أعلاه كما تشاء. التعديلات ستظهر في الخطاب الجديد'
                  : 'نصيحة: اكتب رسالة شخصية ومشجعة للباحث تعبر عن تقديرك لجهوده البحثية'}
              </p>
            </div>
          )}

          {/* Info Alert */}
          <div
            className={`border rounded-xl p-4 ${
              isRegenerate
                ? 'bg-orange-50 border-orange-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <Award
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isRegenerate ? 'text-orange-600' : 'text-amber-600'
                }`}
              />
              <div
                className={`text-sm ${
                  isRegenerate ? 'text-orange-800' : 'text-amber-800'
                }`}
              >
                <p className="font-bold mb-1">
                  {isRegenerate ? ' تحذير - إعادة التوليد:' : 'ملاحظة مهمة:'}
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {isRegenerate ? (
                    <>
                      <li className="font-bold">
                        سيتم حذف خطاب القبول الحالي واستبداله بالجديد
                      </li>
                      <li>الخطاب الجديد سيحتوي على المحتوى المحدد</li>
                      <li>يمكنك إعادة هذه العملية في أي وقت</li>
                    </>
                  ) : (
                    <>
                      <li>سيتم توليد خطاب القبول بالمحتوى المحدد</li>
                      <li>يمكنك إعادة توليد الخطاب لاحقاً بمحتوى مختلف</li>
                      <li>الرسالة المخصصة ستظهر في خطاب القبول النهائي</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating || (useCustomMessage && !customMessage.trim())
            }
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري التوليد...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>
                  {isRegenerate ? 'إعادة توليد الخطاب' : 'توليد خطاب القبول'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
