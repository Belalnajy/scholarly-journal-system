import { Bell, ArrowRight, Download, FileText, User, Calendar, Star, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService, Review } from '../../../services/reviews.service';
import { researchRevisionsService, ResearchRevision } from '../../../services/research-revisions.service';

// Types
interface ReviewerComment {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ActivityLog {
  id: string;
  action: string;
  date: string;
  icon: 'send' | 'start' | 'complete-1' | 'complete-2';
}

// Star Rating Display Component (Read-only)
function StarRatingDisplay({ rating }: { rating: number | string | null | undefined }) {
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
      <span className="mr-2 text-sm font-semibold text-gray-700">({numRating.toFixed(1)}/5)</span>
    </div>
  );
}

// Reviewer Comment Card
function ReviewerCommentCard({ comment }: { comment: ReviewerComment }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{comment.reviewerName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">{comment.date}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-semibold">
            مقبول
          </span>
          <StarRatingDisplay rating={comment.rating} />
        </div>
      </div>

      {/* Comment */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-700 leading-relaxed text-sm">{comment.comment}</p>
      </div>
    </div>
  );
}

// Activity Timeline Item
function ActivityTimelineItem({ activity }: { activity: ActivityLog }) {
  const getIcon = () => {
    switch (activity.icon) {
      case 'send':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'start':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'complete-1':
      case 'complete-2':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 min-w-[120px]">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{activity.date}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <div className="p-2 bg-gray-100 rounded-lg">
          {getIcon()}
        </div>
        <span className="text-gray-800">{activity.action}</span>
      </div>
    </div>
  );
}

export function ReviewDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [research, setResearch] = useState<Research | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    } else {
      navigate('/dashboard/completed-research');
    }
  }, [id]);

  const loadData = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [researchData, reviewsData, revisionsData] = await Promise.all([
        researchService.getById(researchId),
        reviewsService.getByResearch(researchId),
        researchRevisionsService.getByResearch(researchId),
      ]);

      setResearch(researchData);
      setReviews(reviewsData);
      setRevisions(revisionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
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

  if (!id) {
    navigate('/dashboard/completed-research');
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
          onClick={() => loadData(id)}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تفاصيل المراجعة</h1>
          <p className="text-gray-600">عرض معلومات البحث والتقييمات المراجعين</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/completed-research')}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors bg-white rounded-lg border border-gray-200 hover:border-[#0D3B66]"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة للقائمة</span>
      </button>

      {/* Research Info Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {research.status === 'accepted' && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-semibold">
                    مقبول
                  </span>
                )}
                {research.status === 'needs-revision' && (
                  <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-md text-xs font-semibold">
                    تعديلات بسيطة
                  </span>
                )}
                {research.status === 'rejected' && (
                  <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-semibold">
                    مرفوض
                  </span>
                )}
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-xs font-semibold">
                  {research.research_number}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{research.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{research.abstract}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">التخصص:</span>
              <span className="text-gray-600">{research.specialization}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">تاريخ التقديم:</span>
              <span className="text-gray-600">{formatDate(research.submission_date)}</span>
            </div>
            {research.evaluation_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">تاريخ التقييم:</span>
                <span className="text-gray-600">{formatDate(research.evaluation_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium">
            <Download className="w-4 h-4" />
            <span>تحميل البحث PDF</span>
          </button>
          {research.status === 'needs-revision' && (
            <button 
              onClick={() => navigate(`/dashboard/evaluation-form/${research.id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <span>إضافة مراجعة بعد التعديل</span>
            </button>
          )}
        </div>
      </div>

      {/* Revision History */}
      {revisions.filter(r => r.status === 'submitted').length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 overflow-hidden">
          <div className="p-6 border-b border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">تعديلات الباحث</h2>
            <p className="text-sm text-gray-600">
              الباحث قام بإجراء تعديلات على البحث
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
                          {formatDate(revision.submitted_at)}
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
                    
                    {revision.file_url && (
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" />
                        <span>تحميل الملف المعدل (PDF)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {/* Show current data */}
          <div className="p-6 bg-white border-t border-orange-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">البيانات الحالية</h3>
            <div className="space-y-4">
              {/* Current Abstract */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-bold text-green-800 mb-2">✔ الملخص الحالي</h4>
                <p className="text-sm text-gray-700">
                  {research.abstract}
                </p>
              </div>
              
              {/* Keywords */}
              {research.keywords && research.keywords.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">الكلمات المفتاحية:</h4>
                  <div className="flex flex-wrap gap-2">
                    {research.keywords.map((keyword, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Comments Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">تعليقات المراجعين ({reviews.length})</h2>
        </div>
        <div className="p-6 space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
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
                          {review.submitted_at ? formatDate(review.submitted_at) : 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      review.recommendation === 'accepted' ? 'bg-green-50 text-green-700 border border-green-200' :
                      review.recommendation === 'needs-revision' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {review.recommendation === 'accepted' ? 'مقبول' :
                       review.recommendation === 'needs-revision' ? 'يحتاج تعديل' : 'مرفوض'}
                    </span>
                    {review.average_rating && <StarRatingDisplay rating={review.average_rating} />}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-sm">{review.general_comments}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد مراجعات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
