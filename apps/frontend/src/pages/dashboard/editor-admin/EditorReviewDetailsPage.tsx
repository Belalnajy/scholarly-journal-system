import {
  ArrowRight,
  Download,
  FileText,
  User,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService, Review } from '../../../services/reviews.service';
import {
  researchRevisionsService,
  ResearchRevision,
} from '../../../services/research-revisions.service';
import {
  downloadResearchPdf,
  downloadRevisionFile,
} from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

// Star Rating Display Component (Read-only)
function StarRatingDisplay({
  rating,
}: {
  rating: number | string | null | undefined;
}) {
  const numRating = rating ? Number(rating) : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= numRating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-none text-gray-300'
          }`}
        />
      ))}
      <span className="mr-2 text-sm font-semibold text-gray-700">
        ({numRating.toFixed(1)}/5)
      </span>
    </div>
  );
}

// Detailed Scores Display Component
function DetailedScoresDisplay({ review }: { review: Review }) {
  if (!review.detailed_scores) return null;

  const categories = [
    { id: 'title_score', name: 'العنوان', max: 3 },
    { id: 'abstract_score', name: 'مستخلص البحث', max: 2 },
    { id: 'methodology_score', name: 'منهج الرسالة', max: 15 },
    { id: 'background_score', name: 'أدبيات الرسالة', max: 15 },
    { id: 'results_score', name: 'نتائج البحث وتوصياته', max: 15 },
    { id: 'documentation_score', name: 'التوثيق العلمي', max: 15 },
    { id: 'originality_score', name: 'الأصالة والابتكار', max: 15 },
    { id: 'formatting_score', name: 'إخراج البحث', max: 2 },
    { id: 'research_condition_score', name: 'حالة البحث', max: 10 },
    { id: 'sources_score', name: 'المصادر والمراجع', max: 8 },
  ];

  return (
    <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 className="text-sm font-bold text-gray-800 mb-3">
        التقييم التفصيلي:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const score = review.detailed_scores?.[cat.id] || 0;
          const percentage = (score / cat.max) * 100;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">
                  {cat.name}
                </span>
                <span className="text-sm font-bold text-[#0D3B66]">
                  {score}/{cat.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentage >= 80
                      ? 'bg-green-500'
                      : percentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      {review.total_score && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">
              الدرجة الإجمالية:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0D3B66]">
                {review.total_score}
              </span>
              <span className="text-sm text-gray-600">/ 100</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  review.total_score >= 70
                    ? 'bg-green-100 text-green-700'
                    : review.total_score >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : review.total_score >= 50
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {review.total_score >= 70
                  ? 'ممتاز'
                  : review.total_score >= 60
                  ? 'جيد جداً'
                  : review.total_score >= 50
                  ? 'جيد'
                  : 'يحتاج تحسين'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reviewer Comment Card
function ReviewerCommentCard({ review }: { review: Review }) {
  const getRecommendationBadge = () => {
    switch (review.recommendation) {
      case 'accepted':
        return (
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-semibold">
            يوصي بالقبول
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-semibold">
            يوصي بالرفض
          </span>
        );
      case 'needs-revision':
        return (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-md text-xs font-semibold">
            يوصي بالقبول مع تعديلات
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              {review.reviewer?.name || 'محكم'}
            </h3>
            {review.reviewer?.email && (
              <p className="text-xs text-gray-500">{review.reviewer.email}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {review.submitted_at
                  ? formatDate(review.submitted_at)
                  : 'غير محدد'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getRecommendationBadge()}
          {review.total_score ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
              <span className="text-xs font-medium text-gray-600">الدرجة:</span>
              <span className="text-lg font-bold text-[#0D3B66]">
                {review.total_score}/100
              </span>
            </div>
          ) : review.average_rating ? (
            <StarRatingDisplay rating={review.average_rating} />
          ) : null}
        </div>
      </div>

      {/* Detailed Scores */}
      <DetailedScoresDisplay review={review} />

      {/* Comment */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
        <h4 className="text-sm font-bold text-gray-800 mb-2">
          التعليقات العامة:
        </h4>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
          {review.general_comments}
        </p>
      </div>
    </div>
  );
}

export function EditorReviewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [research, setResearch] = useState<Research | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<
    'accepted' | 'needs-revision' | 'rejected' | null
  >(null);
  const [showUpdateFileModal, setShowUpdateFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    } else {
      navigate('/dashboard/manage-research');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [researchData, reviewsData, revisionsData] = await Promise.all([
        researchService.getById(researchId),
        reviewsService.getByResearch(researchId),
        researchRevisionsService.getByResearch(researchId).catch(() => []),
      ]);

      setResearch(researchData);
      setReviews(reviewsData);
      setRevisions(revisionsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const mapStatus = (status: string): StatusType => {
    const statusMap: Record<string, StatusType> = {
      'under-review': 'under-review',
      'pending-editor-decision': 'pending-editor-decision',
      pending: 'pending',
      'needs-revision': 'needs-revision',
      accepted: 'accepted',
      rejected: 'rejected',
      published: 'published',
    };
    return statusMap[status] || 'under-review';
  };

  const calculateAverageRating = () => {
    const completedReviews = reviews.filter((r) => r.average_rating);
    if (completedReviews.length === 0) return 0;
    const sum = completedReviews.reduce(
      (acc, r) => acc + Number(r.average_rating || 0),
      0
    );
    return sum / completedReviews.length;
  };

  // Calculate average detailed scores across all reviewers
  const calculateAverageDetailedScores = () => {
    const reviewsWithScores = reviews.filter(
      (r) => r.detailed_scores && r.total_score
    );
    if (reviewsWithScores.length === 0) return null;

    const categories = [
      { id: 'title_score', name: 'العنوان', max: 3 },
      { id: 'abstract_score', name: 'مستخلص البحث', max: 2 },
      { id: 'methodology_score', name: 'منهج الرسالة', max: 15 },
      { id: 'background_score', name: 'أدبيات الرسالة', max: 15 },
      { id: 'results_score', name: 'نتائج البحث وتوصياته', max: 15 },
      { id: 'documentation_score', name: 'التوثيق العلمي', max: 15 },
      { id: 'originality_score', name: 'الأصالة والابتكار', max: 15 },
      { id: 'formatting_score', name: 'إخراج البحث', max: 2 },
      { id: 'research_condition_score', name: 'حالة البحث', max: 10 },
      { id: 'sources_score', name: 'المصادر والمراجع', max: 8 },
    ];

    const averages: Record<string, number> = {};
    let totalScoreSum = 0;

    categories.forEach((cat) => {
      const scores = reviewsWithScores
        .map((r) => r.detailed_scores?.[cat.id] || 0)
        .filter((s) => s > 0);

      if (scores.length > 0) {
        averages[cat.id] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    reviewsWithScores.forEach((r) => {
      totalScoreSum += r.total_score || 0;
    });

    const avgTotalScore = totalScoreSum / reviewsWithScores.length;

    return {
      categories,
      averages,
      totalScore: avgTotalScore,
      reviewersCount: reviewsWithScores.length,
    };
  };

  if (!id) {
    navigate('/dashboard/manage-research');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error || !research) {
    return (
      <div className="space-y-6" dir="rtl">
        <DashboardHeader
          title="تفاصيل المراجعة"
          subtitle="عرض تقييمات المحكمين ونتائج المراجعة"
        />
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error || 'البحث غير موجود'}</p>
            {!error && (
              <p className="text-red-600 text-sm mt-2">
                قد يكون البحث قد تم حذفه أو أن الرابط غير صحيح
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => id && loadData(id)}
            className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate('/dashboard/manage-reports')}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            العودة إلى التقارير
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/dashboard/manage-research');
  };

  const handleDecision = (
    decision: 'accepted' | 'needs-revision' | 'rejected'
  ) => {
    setPendingDecision(decision);
    setShowConfirmModal(true);
  };

  const confirmDecision = async () => {
    if (!research?.id || !pendingDecision) return;

    try {
      setIsLoading(true);
      setShowConfirmModal(false);
      await researchService.updateStatus(research.id, pendingDecision);

      // Reload data to show updated status
      await loadData(research.id);

      setSuccessMessage('تم اتخاذ القرار بنجاح!');
      setPendingDecision(null);
      setTimeout(() => {
        navigate('/dashboard/manage-reports');
      }, 2000);
    } catch (err) {
      setError('حدث خطأ أثناء اتخاذ القرار. يرجى المحاولة مرة أخرى.');
      console.error('Error making decision:', err);
      setPendingDecision(null);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDecision = () => {
    setShowConfirmModal(false);
    setPendingDecision(null);
  };

  const getConfirmMessage = () => {
    if (!pendingDecision) return '';
    return pendingDecision === 'accepted'
      ? 'هل أنت متأكد من قبول هذا البحث؟'
      : pendingDecision === 'rejected'
      ? 'هل أنت متأكد من رفض هذا البحث؟'
      : 'هل أنت متأكد من طلب تعديلات على هذا البحث؟';
  };

  const handleDownloadOriginal = async () => {
    if (!research) return;
    try {
      toast.loading('جاري تحميل البحث الأصلي...', { id: 'download-original' });
      await downloadResearchPdf(
        research.cloudinary_secure_url,
        research.file_url,
        research.research_number
      );
      toast.success('تم بدء التحميل', { id: 'download-original' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل تحميل الملف', { id: 'download-original' });
    }
  };

  const handleDownloadRevision = async (revision: ResearchRevision) => {
    try {
      toast.loading('جاري تحميل النسخة المعدلة...', {
        id: 'download-revision',
      });
      await downloadRevisionFile(
        revision.cloudinary_secure_url,
        revision.file_url,
        revision.revision_number
      );
      toast.success('تم بدء التحميل', { id: 'download-revision' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل تحميل الملف', { id: 'download-revision' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('نوع الملف غير مدعوم. يرجى رفع ملف PDF أو Word فقط');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpdateFile = async () => {
    if (!selectedFile || !id) return;

    try {
      setIsUploading(true);
      toast.loading('جاري رفع الملف المعدل...', { id: 'update-file' });

      await researchService.updateResearchFile(id, selectedFile);

      toast.success('تم تحديث ملف البحث بنجاح', { id: 'update-file' });
      setShowUpdateFileModal(false);
      setSelectedFile(null);

      // Reload research data
      await loadData(id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'فشل تحديث الملف', {
        id: 'update-file',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-500 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[400px]">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg">✓ {successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[400px]">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg">✗ خطأ</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={cancelDecision}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                تأكيد القرار
              </h3>
              <p className="text-gray-600 mb-6">{getConfirmMessage()}</p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDecision}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDecision}
                  className="flex-1 px-6 py-3 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <DashboardHeader
          title="تفاصيل المراجعة"
          subtitle="عرض تقييمات المحكمين ونتائج المراجعة"
        />

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors bg-white rounded-lg border border-gray-200 hover:border-[#0D3B66]"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة لإدارة الأبحاث</span>
        </button>

        {/* Researcher Info Card */}
        {research.user && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  معلومات الباحث
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">الاسم:</span>
                    <span className="text-gray-600">{research.user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                      البريد الإلكتروني:
                    </span>
                    <span className="text-gray-600">{research.user.email}</span>
                  </div>
                  {research.user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">الهاتف:</span>
                      <span className="text-gray-600">
                        {research.user.phone}
                      </span>
                    </div>
                  )}
                  {research.user.affiliation && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">الجهة:</span>
                      <span className="text-gray-600">
                        {research.user.affiliation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <StatusBadge status={mapStatus(research.status)} />
                  <span className="text-sm text-gray-500">
                    رقم البحث: {research.research_number}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {research.title}
                </h1>
                {research.title_en && (
                  <p className="text-lg text-gray-600 mb-4" dir="ltr">
                    {research.title_en}
                  </p>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">التخصص:</span>
                <span className="text-gray-600">{research.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">
                  تاريخ التقديم:
                </span>
                <span className="text-gray-600">
                  {formatDate(research.submission_date)}
                </span>
              </div>
              {research.evaluation_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    تاريخ التقييم:
                  </span>
                  <span className="text-gray-600">
                    {formatDate(research.evaluation_date)}
                  </span>
                </div>
              )}
            </div>

            {/* Average Detailed Scores */}
            {(() => {
              const avgScores = calculateAverageDetailedScores();
              if (avgScores && avgScores.reviewersCount > 1) {
                return (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-800 mb-1">
                          متوسط التقييمات التفصيلية
                        </h3>
                        <p className="text-xs text-gray-600">
                          بناءً على تقييمات {avgScores.reviewersCount} محكمين
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-purple-300">
                        <span className="text-xs font-medium text-gray-600">
                          المتوسط الإجمالي:
                        </span>
                        <span className="text-2xl font-bold text-[#0D3B66]">
                          {avgScores.totalScore.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600">/ 100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {avgScores.categories.map((cat) => {
                        const score = avgScores.averages[cat.id] || 0;
                        const percentage = (score / cat.max) * 100;
                        return (
                          <div
                            key={cat.id}
                            className="bg-white rounded-lg p-3 border border-purple-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-700">
                                {cat.name}
                              </span>
                              <span className="text-sm font-bold text-[#0D3B66]">
                                {score.toFixed(1)}/{cat.max}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  percentage >= 80
                                    ? 'bg-green-500'
                                    : percentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Average Rating (Old System) */}
            {reviews.length > 0 &&
              calculateAverageRating() > 0 &&
              !calculateAverageDetailedScores() && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-1">
                        التقييم الإجمالي
                      </h3>
                      <p className="text-xs text-gray-600">
                        بناءً على تقييمات {reviews.length} محكمين
                      </p>
                    </div>
                    <StarRatingDisplay rating={calculateAverageRating()} />
                  </div>
                </div>
              )}
          </div>

          {/* Download Buttons */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-2">
              {/* Download Original Research */}
              {(research.file_url || research.cloudinary_secure_url) && (
                <button
                  onClick={handleDownloadOriginal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل البحث الأصلي </span>
                </button>
              )}

              {/* Update Research File Button (Admin/Editor only) */}
              {(research.status === 'accepted' ||
                research.status === 'published') && (
                <button
                  onClick={() => setShowUpdateFileModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span>تحديث ملف البحث (إضافة الغلاف والتنسيق)</span>
                </button>
              )}

              {/* Download Latest Revision if exists */}
              {revisions.filter((r) => r.status === 'submitted').length > 0 && (
                <button
                  onClick={() =>
                    handleDownloadRevision(
                      revisions
                        .filter((r) => r.status === 'submitted')
                        .sort(
                          (a, b) => b.revision_number - a.revision_number
                        )[0]
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل البحث المعدل (PDF)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Revision History */}
        {revisions.filter((r) => r.status === 'submitted').length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 overflow-hidden">
            <div className="p-6 border-b border-orange-200">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                تعديلات الباحث
              </h2>
              <p className="text-sm text-gray-600">
                الباحث قام بإجراء تعديلات على البحث
              </p>
            </div>
            <div className="p-6 space-y-4">
              {revisions
                .filter((r) => r.status === 'submitted')
                .sort((a, b) => b.revision_number - a.revision_number)
                .map((revision) => (
                  <div
                    key={revision.id}
                    className="bg-white rounded-lg p-4 border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                          المراجعة #{revision.revision_number}
                        </span>
                        {revision.submitted_at && (
                          <span className="text-xs text-gray-500">
                            {formatDate(revision.submitted_at)}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        تم الإرسال
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-1">
                          ملاحظات الباحث حول التعديلات:
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                          {revision.revision_notes}
                        </p>
                      </div>

                      {(revision.file_url ||
                        revision.cloudinary_secure_url) && (
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
            {revisions.filter(
              (r) => r.status === 'submitted' && r.original_data
            ).length > 0 && (
              <div className="p-6 bg-white border-t border-orange-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  مقارنة البيانات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Abstract */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="text-sm font-bold text-red-800 mb-2">
                      ✖ الملخص الأصلي
                    </h4>
                    <p className="text-sm text-gray-700 line-through opacity-75">
                      {revisions.find(
                        (r) => r.status === 'submitted' && r.original_data
                      )?.original_data?.abstract || '[غير متوفر]'}
                    </p>
                  </div>

                  {/* Current Abstract */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="text-sm font-bold text-green-800 mb-2">
                      ✔ الملخص المعدل
                    </h4>
                    <p className="text-sm text-gray-700">{research.abstract}</p>
                  </div>

                  {/* Original Keywords */}
                  {revisions.find(
                    (r) => r.status === 'submitted' && r.original_data?.keywords
                  )?.original_data?.keywords && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="text-sm font-bold text-red-800 mb-2">
                        ✖ الكلمات المفتاحية الأصلية:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {revisions
                          .find(
                            (r) =>
                              r.status === 'submitted' &&
                              r.original_data?.keywords
                          )
                          ?.original_data?.keywords?.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium line-through opacity-75"
                            >
                              {keyword}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Current Keywords */}
                  {research.keywords && research.keywords.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="text-sm font-bold text-green-800 mb-2">
                        ✔ الكلمات المفتاحية المعدلة:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {research.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
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

        {/* Abstract Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">ملخص البحث</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">{research.abstract}</p>
          </div>
        </div>

        {/* Reviewer Comments Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-800">
                تقييمات المحكمين
              </h2>
              <span className="text-sm text-gray-600">
                {reviews.length} محكم
              </span>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">ملاحظة للمحرر:</span> التوصيات
                المعروضة أدناه هي آراء استشارية من المحكمين. القرار النهائي
                بقبول أو رفض البحث يعود لك بناءً على هذه التقييمات.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewerCommentCard key={review.id} review={review} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد مراجعات بعد</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">تاريخ النشاط</h2>
            <p className="text-sm text-gray-500 mt-1">
              سجل كامل لجميع الأحداث والتعديلات
            </p>
          </div>
          <div className="p-6">
            <div className="relative space-y-4">
              {/* Timeline Line */}
              <div className="absolute right-[21px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Initial Submission */}
              <div className="flex items-start gap-3 relative">
                <div className="p-2 bg-blue-100 rounded-lg relative z-10">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">
                      تم إرسال البحث
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(research.submission_date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    تم استلام البحث من الباحث
                  </p>
                </div>
              </div>

              {/* Reviews and Revisions Timeline */}
              {(() => {
                // Combine reviews and revisions and sort by date
                const timeline: Array<{
                  type: 'review' | 'revision-request' | 'revision-submitted';
                  date: string;
                  data: any;
                }> = [];

                // Add reviews
                reviews.forEach((review) => {
                  if (review.submitted_at) {
                    timeline.push({
                      type: 'review',
                      date: review.submitted_at,
                      data: review,
                    });
                  }
                });

                // Add revisions
                revisions.forEach((revision) => {
                  // Revision request (created)
                  timeline.push({
                    type: 'revision-request',
                    date: revision.created_at,
                    data: revision,
                  });

                  // Revision submitted
                  if (revision.submitted_at) {
                    timeline.push({
                      type: 'revision-submitted',
                      date: revision.submitted_at,
                      data: revision,
                    });
                  }
                });

                // Sort by date
                timeline.sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                return timeline.map((item, index) => {
                  if (item.type === 'review') {
                    return (
                      <div
                        key={`review-${item.data.id}`}
                        className="flex items-start gap-3 relative"
                      >
                        <div className="p-2 bg-green-100 rounded-lg relative z-10">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              تقييم من محكم
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.data.reviewer?.name || 'محكم'} - تم إضافة
                            التقييم والملاحظات
                          </p>
                        </div>
                      </div>
                    );
                  } else if (item.type === 'revision-request') {
                    return (
                      <div
                        key={`revision-req-${item.data.id}`}
                        className="flex items-start gap-3 relative"
                      >
                        <div className="p-2 bg-yellow-100 rounded-lg relative z-10">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              طلب تعديلات
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </span>
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                              المراجعة #{item.data.revision_number}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            تم طلب تعديلات من الباحث
                          </p>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`revision-sub-${item.data.id}`}
                        className="flex items-start gap-3 relative"
                      >
                        <div className="p-2 bg-orange-100 rounded-lg relative z-10">
                          <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">
                              إرسال التعديلات
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(item.date)}
                            </span>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                              المراجعة #{item.data.revision_number}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            الباحث قام بإرسال النسخة المعدلة
                          </p>
                        </div>
                      </div>
                    );
                  }
                });
              })()}

              {research.evaluation_date && (
                <div className="flex items-start gap-3 relative">
                  <div className="p-2 bg-green-100 rounded-lg relative z-10">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">
                        اكتمال المراجعة
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(research.evaluation_date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      تم الانتهاء من جميع التقييمات
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Decision Section */}
        {research.status === 'pending-editor-decision' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
              <h2 className="text-xl font-bold text-gray-800">
                اتخاذ القرار النهائي
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                بناءً على تقييمات المحكمين أعلاه، يرجى اتخاذ القرار المناسب بشأن
                هذا البحث
              </p>
            </div>

            <div className="p-6">
              {/* Decision Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 mb-2">
                      <span className="font-semibold">ملخص التقييمات:</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700">عدد المحكمين: </span>
                        <span className="font-bold text-blue-900">
                          {reviews.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">متوسط التقييم: </span>
                        <span className="font-bold text-blue-900">
                          {calculateAverageRating().toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Accept */}
                <button
                  onClick={() => handleDecision('accepted')}
                  className="p-6 rounded-xl border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">
                        قبول البحث
                      </h3>
                      <p className="text-xs text-gray-600">البحث مقبول للنشر</p>
                    </div>
                  </div>
                </button>

                {/* Needs Revision */}
                <button
                  onClick={() => handleDecision('needs-revision')}
                  className="p-6 rounded-xl border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">
                        طلب تعديلات
                      </h3>
                      <p className="text-xs text-gray-600">
                        البحث يحتاج تعديلات
                      </p>
                    </div>
                  </div>
                </button>

                {/* Reject */}
                <button
                  onClick={() => handleDecision('rejected')}
                  className="p-6 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-all group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">
                        رفض البحث
                      </h3>
                      <p className="text-xs text-gray-600">البحث غير مقبول</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update File Modal */}
        {showUpdateFileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">تحديث ملف البحث</h2>
                      <p className="text-sm text-white/90 mt-1">
                        رفع النسخة المعدلة مع الغلاف والتنسيق النهائي
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUpdateFileModal(false);
                      setSelectedFile(null);
                    }}
                    disabled={isUploading}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6" dir="rtl">
                {/* Info Alert */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-1">
                        معلومات مهمة
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>سيتم استبدال الملف الحالي بالملف الجديد</li>
                        <li>يمكنك إضافة الغلاف والتنسيق النهائي للبحث</li>
                        <li>سيتم إرسال إشعار للباحث بتحديث الملف</li>
                        <li>الملف المدعوم: PDF أو Word (حتى 10 ميجابايت)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">
                    اختر الملف المعدل
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Selected File Preview */}
                {selectedFile && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-green-700">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)}{' '}
                          ميجابايت
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Update Info */}
                {research.file_updated_at && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-2">
                      آخر تحديث للملف
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(research.file_updated_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowUpdateFileModal(false);
                    setSelectedFile(null);
                  }}
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateFile}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>تحديث الملف</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
