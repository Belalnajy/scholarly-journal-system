import { Bell, FileText, Download, Send, ArrowRight, AlertCircle, HelpCircle, CheckCircle, XCircle, Edit3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService } from '../../../services/reviews.service';
import { researchRevisionsService, ResearchRevision } from '../../../services/research-revisions.service';
import { useAuth } from '../../../contexts';
import { downloadResearchPdf, downloadRevisionFile } from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

// Types
interface EvaluationCriteria {
  id: string;
  title: string;
  rating: number;
}

// Star Rating Component
function StarRating({ rating, onChange, readonly = false }: { rating: number; onChange?: (rating: number) => void; readonly?: boolean }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <svg
            className={`w-6 h-6 ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      <span className="mr-2 text-sm text-gray-500">({rating > 0 ? rating : 'غير محدد'})</span>
    </div>
  );
}

// Criteria Row Component
function CriteriaRow({ 
  title, 
  rating, 
  onChange 
}: { 
  title: string; 
  rating: number; 
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
      <h3 className="text-gray-800 font-medium">{title}</h3>
      <StarRating rating={rating} onChange={onChange} />
    </div>
  );
}

export function EvaluationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [research, setResearch] = useState<Research | null>(null);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [pendingReview, setPendingReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluation criteria
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([
    { id: '1', title: 'وضوح العنوان', rating: 0 },
    { id: '2', title: 'جودة المنهجية', rating: 0 },
    { id: '3', title: 'أصالة الفكرة', rating: 0 },
    { id: '4', title: 'سلامة اللغة', rating: 0 },
    { id: '5', title: 'المراجع المستخدمة', rating: 0 },
    { id: '6', title: 'جودة العرض العام', rating: 0 },
  ]);

  const [generalComments, setGeneralComments] = useState('');
  const [recommendation, setRecommendation] = useState<'accepted' | 'needs-revision' | 'rejected' | ''>('');

  const handleDownloadOriginal = async () => {
    if (!research) return;
    try {
      toast.loading('جاري تحميل البحث الأصلي...', { id: 'download-original' });
      await downloadResearchPdf(research.cloudinary_secure_url, research.file_url, research.research_number);
      toast.success('تم بدء التحميل', { id: 'download-original' });
    } catch (error) {
      toast.error('فشل تحميل الملف', { id: 'download-original' });
    }
  };

  const handleDownloadRevision = async (revision: ResearchRevision) => {
    try {
      toast.loading('جاري تحميل النسخة المعدلة...', { id: 'download-revision' });
      await downloadRevisionFile(revision.cloudinary_secure_url, revision.file_url, revision.revision_number);
      toast.success('تم بدء التحميل', { id: 'download-revision' });
    } catch (error) {
      toast.error('فشل تحميل الملف', { id: 'download-revision' });
    }
  };

  useEffect(() => {
    if (id) {
      loadResearch(id);
    } else {
      navigate('/dashboard/my-tasks');
    }
  }, [id]);

  const loadResearch = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load research data and revisions
      const [data, revisionsData] = await Promise.all([
        researchService.getById(researchId),
        researchRevisionsService.getByResearch(researchId),
      ]);
      
      setResearch(data);
      setRevisions(revisionsData);
      
      // Check if reviewer already submitted a review for this research
      if (user?.id) {
        try {
          const reviews = await reviewsService.getByResearch(researchId);
          const myReview = reviews.find(r => r.reviewer_id === user.id);
          
          // Only block if review is completed (not pending)
          if (myReview && myReview.status === 'completed') {
            setExistingReview(myReview);
            setError('لقد قمت بتقييم هذا البحث مسبقاً. لا يمكن إرسال تقييم آخر.');
          } else if (myReview && myReview.status === 'pending') {
            // Allow re-evaluation for pending reviews (revised research)
            setPendingReview(myReview);
            setExistingReview(null);
          }
        } catch (err) {
          // If error fetching reviews, continue (maybe no reviews yet)
          console.log('No existing review found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البحث');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average rating
  const averageRating = criteria.reduce((sum, c) => sum + c.rating, 0) / criteria.length;
  const ratedCount = criteria.filter(c => c.rating > 0).length;
  const isFormComplete = ratedCount === criteria.length && generalComments.trim() && recommendation;

  const handleCriteriaChange = (id: string, rating: number) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, rating } : c));
  };

  const handleBackToTasks = () => {
    if (confirm('هل أنت متأكد من العودة؟ سيتم فقدان التقدم غير المحفوظ.')) {
      navigate('/dashboard/my-tasks');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete) {
      setError('يرجى إكمال جميع الحقول قبل الإرسال');
      return;
    }

    if (!user?.id || !research?.id) {
      setError('خطأ في تحديد المستخدم أو البحث');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert criteria to ratings object
      const criteriaRatings: Record<string, number> = {};
      criteria.forEach(c => {
        criteriaRatings[c.title] = c.rating;
      });

      // If there's a pending review, update it. Otherwise, create new one.
      if (pendingReview) {
        // Update existing pending review
        await reviewsService.update(pendingReview.id, {
          criteria_ratings: criteriaRatings,
          general_comments: generalComments,
          recommendation: recommendation as 'accepted' | 'needs-revision' | 'rejected',
          average_rating: averageRating,
          status: 'completed',
        });
      } else {
        // Create new review
        await reviewsService.create({
          research_id: research.id,
          reviewer_id: user.id,
          criteria_ratings: criteriaRatings,
          general_comments: generalComments,
          recommendation: recommendation as 'accepted' | 'needs-revision' | 'rejected',
          average_rating: averageRating,
        });
      }

      navigate('/dashboard/my-tasks', {
        state: {
          message: 'تم إرسال المراجعة بنجاح!',
          type: 'success'
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال المراجعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    navigate('/dashboard/my-tasks');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البحث...</p>
        </div>
      </div>
    );
  }

  // If there's an existing review, show message
  if (existingReview) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-bold text-lg">تم إرسال التقييم مسبقاً</p>
              <p className="text-amber-700">لقد قمت بتقييم هذا البحث بالفعل ولا يمكن إرسال تقييم آخر.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mt-4">
            <h3 className="font-bold text-gray-800 mb-3">ملخص تقييمك السابق:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">التقييم العام:</span>
                <span className="font-semibold text-gray-800">
                  {existingReview.average_rating ? Number(existingReview.average_rating).toFixed(1) : '0.0'}/5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">التوصية:</span>
                <span className={`font-semibold ${
                  existingReview.recommendation === 'accepted' ? 'text-green-600' :
                  existingReview.recommendation === 'needs-revision' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {existingReview.recommendation === 'accepted' ? 'أوصي بالقبول' :
                   existingReview.recommendation === 'needs-revision' ? 'أوصي بالقبول مع تعديلات' :
                   'أوصي بالرفض'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإرسال:</span>
                <span className="font-semibold text-gray-800">
                  {existingReview.submitted_at ? new Date(existingReview.submitted_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/dashboard/my-tasks')}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة إلى المهام</span>
        </button>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error || 'البحث غير موجود'}</p>
          </div>
        </div>
        <button
          onClick={() => loadResearch(id)}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">نموذج التحكيم الإلكتروني</h1>
          <p className="text-gray-600">تقييم شامل للبحث الأكاديمي</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Research Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">نموذج التحكيم الإلكتروني</h2>
        <p className="text-sm text-gray-600 mb-4">
          تقييم شامل للبحث الأكاديمي وفق المعايير العلمية
        </p>

        {/* Research Details */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-700">معلومات عامة عن البحث</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="flex gap-2">
              <span className="text-gray-600">عنوان البحث:</span>
              <span className="font-medium text-gray-800">{research.title}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">رقم البحث:</span>
              <span className="font-medium text-gray-800">{research.research_number}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">التصنيف العلمي:</span>
              <span className="font-medium text-gray-800">{research.specialization}</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="mt-4 space-y-2">
            <button 
              onClick={handleDownloadOriginal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>تحميل البحث الأصلي (PDF)</span>
            </button>
       
          </div>
        </div>
      </div>

      {/* Revision History - Show if there are submitted revisions */}
      {revisions.filter(r => r.status === 'submitted').length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 overflow-hidden">
          <div className="p-6 border-b border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">تعديلات الباحث</h2>
            <p className="text-sm text-gray-600">
              الباحث قام بإجراء تعديلات على البحث بناءً على ملاحظاتك السابقة
            </p>
          </div>
          <div className="p-6 space-y-4">
            {revisions
              .filter(r => r.status === 'submitted')
              .sort((a, b) => b.revision_number - a.revision_number)
              .map((revision) => (
                <div key={revision.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                        المراجعة #{revision.revision_number}
                      </span>
                      {revision.submitted_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(revision.submitted_at).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">ملاحظات الباحث حول التعديلات:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                        {revision.revision_notes}
                      </p>
                    </div>
                    
                    {(revision.file_url || revision.cloudinary_secure_url) && (
                      <button 
                        onClick={() => handleDownloadRevision(revision)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل النسخة المعدلة (PDF)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {/* Show current vs original data - Only if original data exists */}
          {revisions.filter(r => r.status === 'submitted' && r.original_data).length > 0 && (
            <div className="p-6 bg-white border-t border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">مقارنة البيانات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Abstract */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-2">✖ الملخص الأصلي</h4>
                  <p className="text-sm text-gray-700 line-through opacity-75">
                    {revisions.find(r => r.status === 'submitted' && r.original_data)?.original_data?.abstract || '[غير متوفر]'}
                  </p>
                </div>
                
                {/* Current Abstract */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-bold text-green-800 mb-2">✔ الملخص المعدل</h4>
                  <p className="text-sm text-gray-700">
                    {research.abstract}
                  </p>
                </div>
                
                {/* Original Keywords */}
                {revisions.find(r => r.status === 'submitted' && r.original_data?.keywords)?.original_data?.keywords && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="text-sm font-bold text-red-800 mb-2">✖ الكلمات المفتاحية الأصلية:</h4>
                    <div className="flex flex-wrap gap-2">
                      {revisions.find(r => r.status === 'submitted' && r.original_data?.keywords)?.original_data?.keywords?.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium line-through opacity-75">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Current Keywords */}
                {research.keywords && research.keywords.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="text-sm font-bold text-green-800 mb-2">✔ الكلمات المفتاحية المعدلة:</h4>
                    <div className="flex flex-wrap gap-2">
                      {research.keywords.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Criteria Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">نموذج تقييم المحكم</h2>
            <p className="text-sm text-gray-500">أولاً: تقييم جوانب البحث</p>
            <p className="text-xs text-gray-500 mt-2">
              يرجى التقييم لكل جانب من الجوانب التالية على مقياس من 1 إلى 5 (حيث 1 ضعيف و 5 ممتاز)
            </p>
          </div>

          <div className="p-6">
            {criteria.map((criterion) => (
              <CriteriaRow
                key={criterion.id}
                title={criterion.title}
                rating={criterion.rating}
                onChange={(rating) => handleCriteriaChange(criterion.id, rating)}
              />
            ))}
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">ثانياً: توصية المحكم</h2>
            <p className="text-sm text-gray-500">
              يرجى اختيار توصيتك بشأن البحث
            </p>
            <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">ملاحظة هامة:</span> توصيتك هي رأي استشاري. القرار النهائي (قبول أو رفض البحث) سيتخذه المحرر أو المدير بناءً على تقييمك وتقييمات المحكمين الآخرين.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Accept Option */}
              <button
                type="button"
                onClick={() => setRecommendation('accepted')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recommendation === 'accepted'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    recommendation === 'accepted' ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <CheckCircle className={`w-8 h-8 ${
                      recommendation === 'accepted' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">أوصي بالقبول</h3>
                    <p className="text-xs text-gray-600">البحث يستوفي المعايير المطلوبة</p>
                  </div>
                </div>
              </button>

              {/* Accept with Revision Option */}
              <button
                type="button"
                onClick={() => setRecommendation('needs-revision')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recommendation === 'needs-revision'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    recommendation === 'needs-revision' ? 'bg-yellow-500' : 'bg-gray-200'
                  }`}>
                    <Edit3 className={`w-8 h-8 ${
                      recommendation === 'needs-revision' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">أوصي بالقبول مع تعديلات</h3>
                    <p className="text-xs text-gray-600">البحث جيد لكن يحتاج تحسينات</p>
                  </div>
                </div>
              </button>

              {/* Reject Option */}
              <button
                type="button"
                onClick={() => setRecommendation('rejected')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recommendation === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    recommendation === 'rejected' ? 'bg-red-500' : 'bg-gray-200'
                  }`}>
                    <XCircle className={`w-8 h-8 ${
                      recommendation === 'rejected' ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">أوصي بالرفض</h3>
                    <p className="text-xs text-gray-600">البحث لا يستوفي المعايير</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* General Comments Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">ثالثاً: التقييم العام والملاحظات</h2>
            <p className="text-sm text-gray-500">
              يرجى كتابة تقييمكم الشامل وملاحظاتكم التفصيلية على البحث
            </p>
          </div>

          <div className="p-6">
            <textarea
              value={generalComments}
              onChange={(e) => setGeneralComments(e.target.value)}
              placeholder="اكتب تعليقاتك العامة وملاحظاتك التفصيلية على البحث هنا...\n\nإذا اخترت 'القبول مع تعديلات' أو 'الرفض'، يرجى توضيح الأسباب والتعديلات المطلوبة بالتفصيل."
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
              required
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">التقدم في التقييم</span>
            <span className="text-sm text-gray-600">
              {ratedCount}/{criteria.length} معايير • {recommendation ? '✓' : '✗'} توصية • {generalComments.trim() ? '✓' : '✗'} تعليقات
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(ratedCount / criteria.length) * 100}%` }}
            ></div>
          </div>

          {/* Summary */}
          {recommendation && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">توصيتك:</p>
                  <p className={`text-lg font-bold ${
                    recommendation === 'accepted' ? 'text-green-600' :
                    recommendation === 'needs-revision' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {recommendation === 'accepted' ? '✓ أوصي بالقبول' :
                     recommendation === 'needs-revision' ? '⚠ أوصي بالقبول مع تعديلات' :
                     '✗ أوصي بالرفض'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">متوسط التقييم:</p>
                  <p className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)}/5</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!isFormComplete || isSubmitting}
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
                <span>إرسال المراجعة النهائية</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBackToTasks}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة للمهام</span>
          </button>
        </div>

        {/* Footer Notes */}
        <div className="text-center space-y-2 text-xs text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            ملاحظة: لن يتم الإرسال إلا بعد إكمال جميع الحقول المطلوبة
          </p>
          <p className="flex items-center justify-center gap-1">
            <HelpCircle className="w-4 h-4" />
            في حالة وجود أي استفسارات، يرجى التواصل مع إدارة المجلة
          </p>
        </div>
      </form>
    </div>
  );
}
