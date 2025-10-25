import { useState } from 'react';
import { Upload, Send, Bell, Loader2, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { researchService } from '../../../services/researchService';
import toast from 'react-hot-toast';

export function SubmitResearchPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    specialization: '',
    abstract: '',
    abstract_en: '',
    keywords: [] as string[],
    keywords_en: [] as string[],
    file: null as File | null,
  });

  const [fileName, setFileName] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResearchId, setUploadedResearchId] = useState<string | null>(null);

  const specializations = [
    'تكنولوجيا التعليم',
    'المناهج وطرق التدريس',
    'علم النفس التربوي',
    'الإدارة التربوية',
    'التربية الخاصة',
    'أصول التربية',
    'القياس والتقويم',
    'تقنيات التعليم',
  ];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('يرجى اختيار ملف PDF فقط');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    setFormData({ ...formData, file });
    setFileName(file.name);

    // Upload file immediately
    await uploadFileImmediately(file);
  };

  const uploadFileImmediately = async (file: File) => {
    try {
      setIsUploading(true);
      toast.loading('جاري رفع الملف...', { id: 'upload-file' });

      // Get current user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('يجب تسجيل الدخول أولاً', { id: 'upload-file' });
        return;
      }

      // Generate research number
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const research_number = `RES-${year}-${random}`;

      // Create temporary research entry (will be updated when form is submitted)
      const research = await researchService.create({
        user_id: userId,
        research_number,
        title: 'مسودة - في انتظار الإكمال',
        abstract: 'مسودة - سيتم التحديث عند إرسال البحث',
        keywords: ['مسودة'],
        specialization: 'تكنولوجيا التعليم',
        status: 'under-review', // Will be kept as under-review after update
      });

      // Upload PDF to Cloudinary
      await researchService.uploadPDF(research.id, file);
      
      setUploadedResearchId(research.id);
      toast.success('تم رفع الملف بنجاح! أكمل بيانات البحث', { id: 'upload-file' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('فشل رفع الملف', { id: 'upload-file' });
      setFormData({ ...formData, file: null });
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedResearchId) {
      // Just clear the file if not uploaded yet
      setFormData({ ...formData, file: null });
      setFileName('');
      return;
    }

    try {
      toast.loading('جاري حذف الملف...', { id: 'remove-file' });
      
      // Delete the temporary research entry
      await researchService.delete(uploadedResearchId);
      
      // Clear state
      setFormData({ ...formData, file: null });
      setFileName('');
      setUploadedResearchId(null);
      
      toast.success('تم حذف الملف بنجاح', { id: 'remove-file' });
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('فشل حذف الملف', { id: 'remove-file' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان البحث');
      return;
    }

    if (!formData.specialization) {
      toast.error('يرجى اختيار التخصص');
      return;
    }

    if (!formData.abstract.trim()) {
      toast.error('يرجى إدخال ملخص البحث');
      return;
    }

    if (formData.keywords.length === 0) {
      toast.error('يرجى إدخال الكلمات المفتاحية');
      return;
    }

    if (!formData.file) {
      toast.error('يرجى رفع ملف البحث');
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('يجب تسجيل الدخول أولاً');
        setIsSubmitting(false);
        return;
      }

      // Keywords are already arrays
      const keywords = formData.keywords;
      const keywords_en = formData.keywords_en.length > 0 ? formData.keywords_en : undefined;

      toast.loading('جاري إرسال البحث...', { id: 'submit-research' });

      // If file was uploaded, update the existing research
      if (uploadedResearchId) {
        await researchService.update(uploadedResearchId, {
          title: formData.title,
          title_en: formData.title_en || undefined,
          abstract: formData.abstract,
          abstract_en: formData.abstract_en || undefined,
          keywords,
          keywords_en,
          specialization: formData.specialization,
          status: 'under-review',
        });
      } else {
        // Fallback: create new research if file wasn't uploaded
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const research_number = `RES-${year}-${random}`;
        
        const research = await researchService.create({
          user_id: userId,
          research_number,
          title: formData.title,
          title_en: formData.title_en || undefined,
          abstract: formData.abstract,
          abstract_en: formData.abstract_en || undefined,
          keywords,
          keywords_en,
          specialization: formData.specialization,
          status: 'under-review',
        });

        if (formData.file) {
          await researchService.uploadPDF(research.id, formData.file);
        }
      }

      toast.success('تم إرسال البحث بنجاح!', { id: 'submit-research' });

      // Navigate after showing success message
      setTimeout(() => {
        setFormData({
          title: '',
          title_en: '',
          specialization: '',
          abstract: '',
          abstract_en: '',
          keywords: [],
          keywords_en: [],
          file: null,
        });
        setFileName('');
        setKeywordInput('');
        navigate('/dashboard/my-research');
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال البحث', { id: 'submit-research' });
      setIsSubmitting(false); // Re-enable only on error
    }
  };

  const handleCancel = () => {
    if (confirm('هل أنت متأكد من إلغاء تقديم البحث؟ سيتم فقدان جميع البيانات المدخلة.')) {
      navigate('/dashboard/my-research');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تقديم بحث جديد</h1>
          <p className="text-gray-600">إضافة بحث جديد للمراجعة</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {/* Form Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">تقديم بحث جديد</h2>
          <p className="text-sm text-gray-500 mt-1">املأ النموذج التالي لتقديم بحثك للمراجعة</p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title and Specialization Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Research Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                عنوان البحث<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ادخل عنوان البحث..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                التخصص<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all appearance-none bg-white"
                required
              >
                <option value="">اختر التخصص...</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ملخص البحث<span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              placeholder="اكتب ملخصاً شاملاً للبحث..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الكلمات المفتاحية<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              اكتب الكلمة واضغط Enter أو زر "إضافة" (يمكنك استخدام الفواصل والمسافات)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const keyword = keywordInput.trim();
                    if (keyword && !formData.keywords.includes(keyword)) {
                      setFormData({ ...formData, keywords: [...formData.keywords, keyword] });
                      setKeywordInput('');
                    }
                  }
                }}
                placeholder="مثال: ذكاء اصطناعي، تعلم آلي (اضغط Enter لإضافة)"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  const keyword = keywordInput.trim();
                  if (keyword && !formData.keywords.includes(keyword)) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keyword] });
                    setKeywordInput('');
                  }
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium whitespace-nowrap"
              >
                إضافة
              </button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">الكلمات المضافة:</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, keywords: [] })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    مسح الكل
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2 border border-blue-200"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          keywords: formData.keywords.filter((_, i) => i !== index)
                        })}
                        className="text-blue-600 hover:text-red-600 font-bold text-base leading-none"
                        title="حذف"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رفع ملف البحث<span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              fileName ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-[#0D3B66]'
            }`}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={!!fileName || isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="mb-4">
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  )}
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {isUploading ? 'جاري رفع الملف...' : (fileName || 'اسحب وأفلت ملف البحث هنا')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {isUploading ? 'يرجى الانتظار...' : 'أو انقر لاختيار الملف (سيتم الرفع فوراً)'}
                </p>
                {!fileName && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'جاري الرفع...' : 'اختيار ملف (PDF)'}
                  </button>
                )}
              </label>
            </div>
            {fileName && !isUploading && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">تم رفع الملف بنجاح</p>
                    <p className="text-xs text-green-600">{fileName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف الملف ورفع ملف آخر"
                >
                  <X className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            )}
            {isUploading && (
              <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري رفع الملف...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>إرسال البحث للمراجعة</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
