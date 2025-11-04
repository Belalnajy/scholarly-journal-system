import { ArrowRight, Download, FileText, User, Calendar, Star, AlertCircle, Mail, Building2, Clock, Edit3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService, Review } from '../../../services/reviews.service';
import { usersService } from '../../../services/users.service';
import { researchRevisionsService, ResearchRevision } from '../../../services/research-revisions.service';
import { downloadResearchPdf, downloadRevisionFile } from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

// Star Rating Display Component (Read-only)
function StarRatingDisplay({ rating }: { rating: number }) {
  const numRating = Number(rating) || 0;
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
      <span className="mr-2 text-sm font-semibold text-gray-700">({numRating.toFixed(1)}/5)</span>
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
      <h4 className="text-sm font-bold text-gray-800 mb-3">التقييم التفصيلي:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const score = review.detailed_scores?.[cat.id] || 0;
          const percentage = (score / cat.max) * 100;
          return (
            <div key={cat.id} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                <span className="text-sm font-bold text-[#0D3B66]">
                  {score}/{cat.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentage >= 80 ? 'bg-green-500' :
                    percentage >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
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
            <span className="text-sm font-bold text-gray-800">الدرجة الإجمالية:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0D3B66]">{review.total_score}</span>
              <span className="text-sm text-gray-600">/ 100</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                review.total_score >= 70 ? 'bg-green-100 text-green-700' :
                review.total_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                review.total_score >= 50 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {review.total_score >= 70 ? 'ممتاز' :
                 review.total_score >= 60 ? 'جيد جداً' :
                 review.total_score >= 50 ? 'جيد' :
                 'يحتاج تحسين'}
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
      default:
        return null;
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
              <span className="text-lg font-bold text-[#0D3B66]">{review.total_score}/100</span>
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
        <h4 className="text-sm font-bold text-gray-800 mb-2">التعليقات العامة:</h4>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
          {review.general_comments}
        </p>
      </div>
    </div>
  );
}


export function PendingRevisionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [research, setResearch] = useState<Research | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    } else {
      navigate('/dashboard/manage-research');
    }
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
      setReviews(reviewsData.filter(r => r.status === 'completed'));
      setRevisions(revisionsData);

      // Load author data
      if (researchData.user_id) {
        const userData = await usersService.getById(researchData.user_id);
        setAuthor(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
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
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error || 'البحث غير موجود'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/manage-research')}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          العودة لإدارة الأبحاث
        </button>
      </div>
    );
  }

  // Calculate average score (new system) or rating (old system)
  const calculateAverageScore = () => {
    const reviewsWithScores = reviews.filter((r) => r.total_score);
    if (reviewsWithScores.length > 0) {
      const sum = reviewsWithScores.reduce((acc, r) => acc + (r.total_score || 0), 0);
      return { type: 'score', value: sum / reviewsWithScores.length };
    }
    
    const reviewsWithRatings = reviews.filter((r) => r.average_rating);
    if (reviewsWithRatings.length > 0) {
      const sum = reviewsWithRatings.reduce((acc, r) => acc + (r.average_rating || 0), 0);
      return { type: 'rating', value: sum / reviewsWithRatings.length };
    }
    
    return { type: 'none', value: 0 };
  };

  const avgScore = calculateAverageScore();

  const handleBack = () => {
    navigate('/dashboard/manage-research');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader 
        title="تفاصيل البحث - يتطلب تعديل" 
        subtitle="البحث في انتظار التعديلات من الباحث"
      />

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors bg-white rounded-lg border border-gray-200 hover:border-[#0D3B66]"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة لإدارة الأبحاث</span>
      </button>

      {/* Status Alert */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-500 rounded-full">
            <Edit3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">البحث يتطلب تعديلات</h3>
            <p className="text-gray-700 mb-3">
              تم تقييم البحث من قبل المحكمين وتم طلب إجراء تعديلات قبل قبوله للنشر. 
              تم إرسال الملاحظات والتعديلات المطلوبة للباحث.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-gray-700">الحالة:</span>
                <span className="font-bold text-yellow-600">
                  يحتاج تعديلات
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-gray-700">تاريخ التقديم:</span>
                <span className="font-bold text-gray-800">
                  {new Date(research.submission_date).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Info Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={research.status as StatusType} />
                <span className="text-sm text-gray-500">
                  رقم البحث: {research.research_number}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{research.title}</h1>
              {research.title_en && (
                <p className="text-lg text-gray-600 mb-4" dir="ltr">{research.title_en}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">الباحث:</span>
              <span className="text-gray-600">{author?.name || 'غير متوفر'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600" dir="ltr">{author?.email || ''}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{research.specialization}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">تاريخ التقييم:</span>
              <span className="text-gray-600">
                {research.evaluation_date ? new Date(research.evaluation_date).toLocaleDateString('ar-EG') : 'غير متوفر'}
              </span>
            </div>
          </div>

          {/* Average Score/Rating */}
          {avgScore.type !== 'none' && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">التقييم الإجمالي من المحكمين</h3>
                  <p className="text-xs text-gray-600">بناءً على تقييمات {reviews.length} محكمين</p>
                </div>
                {avgScore.type === 'score' ? (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-yellow-300">
                    <span className="text-2xl font-bold text-[#0D3B66]">{avgScore.value.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">/ 100</span>
                  </div>
                ) : (
                  <StarRatingDisplay rating={avgScore.value} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Download Buttons */}
        <div className="p-6 bg-gray-50 flex gap-3">
          {/* Download Original */}
          <button
            onClick={async () => {
              try {
                await downloadResearchPdf(
                  research.cloudinary_secure_url,
                  research.file_url,
                  research.research_number,
                  research.file_type
                );
                toast.success('تم بدء التحميل');
              } catch (error) {
                toast.error('فشل تحميل الملف');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>تحميل النسخة الأصلية</span>
          </button>
          
          {/* Download Revised Version (if exists) */}
          {(() => {
            const latestRevision = revisions
              .filter(r => r.status === 'submitted' && r.file_url)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            
            if (latestRevision) {
              return (
                <button
                  onClick={async () => {
                    try {
                      await downloadRevisionFile(
                        latestRevision.cloudinary_secure_url,
                        latestRevision.file_url,
                        latestRevision.revision_number,
                        latestRevision.file_type
                      );
                      toast.success('تم بدء التحميل');
                    } catch (error) {
                      toast.error('فشل تحميل الملف');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span>تحميل النسخة المعدلة</span>
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>

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
            <h2 className="text-xl font-bold text-gray-800">ملاحظات المحكمين والتعديلات المطلوبة</h2>
            <span className="text-sm text-gray-600">
              {reviews.length} محكم
            </span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">للمحرر:</span> هذه هي الملاحظات والتعديلات المطلوبة من المحكمين. تم إرسالها للباحث لإجراء التعديلات اللازمة. بعد استلام النسخة المعدلة، يمكنك مراجعتها واتخاذ القرار النهائي.
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {reviews.map((review) => (
            <ReviewerCommentCard 
              key={review.id} 
              review={review}
            />
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">الخطوات التالية</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {research.status === 'needs-revision' ? (
              <>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="p-2 bg-blue-500 rounded-full">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">في انتظار التعديلات من الباحث</h3>
                    <p className="text-sm text-gray-600">
                      تم إرسال الملاحظات والتعديلات المطلوبة للباحث. سيتم إشعارك عند استلام النسخة المعدلة.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="p-2 bg-gray-400 rounded-full">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">مراجعة النسخة المعدلة</h3>
                    <p className="text-sm text-gray-600">
                      بعد استلام النسخة المعدلة، ستتمكن من مراجعتها واتخاذ القرار النهائي (قبول أو رفض).
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-2 bg-green-500 rounded-full">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">تم استلام النسخة المعدلة</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      قام الباحث بإرسال النسخة المعدلة. يمكنك الآن مراجعتها واتخاذ القرار النهائي.
                    </p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">
                      مراجعة النسخة المعدلة
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
