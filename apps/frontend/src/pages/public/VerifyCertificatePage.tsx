import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Loader2, Award, Calendar, FileText, User } from 'lucide-react';
import { researchService } from '../../services/researchService';
import articlesService from '../../services/articlesService';

export function VerifyCertificatePage() {
  const { researchNumber } = useParams<{ researchNumber?: string }>();
  const navigate = useNavigate();
  
  const [searchNumber, setSearchNumber] = useState(researchNumber || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    research?: any;
    article?: any;
    type?: 'research' | 'article';
    message: string;
  } | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!searchNumber.trim()) {
      setVerificationResult({
        isValid: false,
        message: 'الرجاء إدخال رقم البحث أو المقال'
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const trimmedNumber = searchNumber.trim();
      
      // Try to find as research first (RES-XXXX)
      if (trimmedNumber.startsWith('RES-')) {
        const researches = await researchService.getAll();
        const research = researches.find(r => r.research_number === trimmedNumber);

        if (research) {
          // التحقق من وجود شهادة قبول
          if (!research.acceptance_certificate_cloudinary_public_id) {
            setVerificationResult({
              isValid: false,
              message: 'لم يتم إصدار شهادة قبول لهذا البحث بعد'
            });
            return;
          }

          // التحقق من حالة البحث
          if (research.status !== 'accepted' && research.status !== 'published') {
            setVerificationResult({
              isValid: false,
              message: 'هذا البحث ليس في حالة مقبول أو منشور'
            });
            return;
          }

          // الشهادة صحيحة
          setVerificationResult({
            isValid: true,
            research: research,
            type: 'research',
            message: 'شهادة القبول صحيحة ومعتمدة'
          });
          return;
        }
      }
      
      // Try to find as article (ART-XXXX or any other format)
      try {
        const article = await articlesService.getArticleByNumber(trimmedNumber);
        
        if (article) {
          // التحقق من وجود شهادة قبول للمقال
          if (!article.acceptance_certificate_cloudinary_public_id) {
            // Check if it has a research with certificate
            if (article.research?.acceptance_certificate_cloudinary_public_id) {
              setVerificationResult({
                isValid: true,
                article: article,
                type: 'article',
                message: 'هذا المقال مرتبط ببحث له شهادة قبول معتمدة'
              });
              return;
            }
            
            setVerificationResult({
              isValid: false,
              message: 'لم يتم إصدار شهادة قبول لهذا المقال بعد'
            });
            return;
          }

          // الشهادة صحيحة
          setVerificationResult({
            isValid: true,
            article: article,
            type: 'article',
            message: 'شهادة القبول صحيحة ومعتمدة'
          });
          return;
        }
      } catch (articleError) {
        console.log('Article not found, continuing...');
      }

      // Not found as research or article
      setVerificationResult({
        isValid: false,
        message: 'الرقم غير موجود في قاعدة البيانات'
      });

    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        isValid: false,
        message: 'حدث خطأ أثناء التحقق من الشهادة'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify if research number is in URL
  useEffect(() => {
    if (researchNumber) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0D3B66] to-[#1a5490] text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-12 h-12" />
            <h1 className="text-4xl font-bold">التحقق من شهادة القبول</h1>
          </div>
          <p className="text-center text-blue-100 text-lg">
            تحقق من صحة شهادة قبول النشر الصادرة من المجلة
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 mb-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  رقم البحث أو المقال
                </label>
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    placeholder="أدخل رقم البحث (RES-2025-0001) أو المقال (ART-2025-0001)"
                    className="w-full pr-14 pl-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                    disabled={isVerifying}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  يمكنك العثور على الرقم في شهادة القبول
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !searchNumber.trim()}
                className="w-full py-4 bg-gradient-to-r from-[#0D3B66] to-[#1a5490] text-white text-lg font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>التحقق من الشهادة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`rounded-2xl shadow-xl border-2 p-8 animate-fadeIn ${
                verificationResult.isValid
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                {verificationResult.isValid ? (
                  <CheckCircle className="w-16 h-16 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {verificationResult.isValid ? 'شهادة صحيحة' : 'شهادة غير صحيحة'}
                  </h2>
                  <p
                    className={`text-lg ${
                      verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Research/Article Details */}
              {verificationResult.isValid && (verificationResult.research || verificationResult.article) && (
                <div className="bg-white rounded-xl p-6 border-2 border-green-200 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#0D3B66]" />
                    {verificationResult.type === 'research' ? 'تفاصيل البحث' : 'تفاصيل المقال'}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {verificationResult.type === 'research' ? 'عنوان البحث' : 'عنوان المقال'}
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {verificationResult.research?.title || verificationResult.article?.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {verificationResult.type === 'research' ? 'الباحث' : 'المؤلفون'}
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {verificationResult.research?.user?.name || 
                           verificationResult.article?.authors?.map((a: any) => a.name).join(', ') || 
                           'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {verificationResult.type === 'research' ? 'تاريخ القبول' : 'تاريخ النشر'}
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {verificationResult.research?.evaluation_date
                            ? formatDate(verificationResult.research.evaluation_date)
                            : verificationResult.article?.published_date
                            ? formatDate(verificationResult.article.published_date)
                            : 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium">الحالة</p>
                        <p className="text-lg font-bold text-green-600">
                          {verificationResult.research?.status === 'published' || verificationResult.article?.status === 'published'
                            ? 'منشور'
                            : 'مقبول للنشر'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Download */}
                  {(verificationResult.research?.acceptance_certificate_cloudinary_secure_url || 
                    verificationResult.article?.acceptance_certificate_cloudinary_secure_url) && (
                    <div className="mt-6 pt-6 border-t-2 border-green-200">
                      <a
                        href={verificationResult.research?.acceptance_certificate_cloudinary_secure_url || 
                              verificationResult.article?.acceptance_certificate_cloudinary_secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1a5490] text-white font-bold rounded-lg hover:shadow-lg transition-all"
                      >
                        <Award className="w-5 h-5" />
                        <span>عرض الشهادة الأصلية</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">معلومات مهمة</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>يمكن التحقق من صحة أي شهادة قبول صادرة من المجلة (أبحاث ومقالات)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>رقم البحث يبدأ بـ RES- ورقم المقال يبدأ بـ ART-</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>الرقم موجود في أعلى شهادة القبول</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>يمكن مسح QR Code الموجود في الشهادة للتحقق السريع</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#0D3B66] hover:underline font-medium text-lg"
            >
              ← العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
