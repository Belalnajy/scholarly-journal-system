import { ArrowRight, Download, FileText, User, Calendar, Star, AlertCircle, Mail, Building2, CheckCircle, XCircle, Edit3, Clock } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService } from '../../../services/researchService';
import { researchRevisionsService } from '../../../services/research-revisions.service';

// Types
interface ReviewerComment {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  recommendation: 'accepted' | 'rejected' | 'needs-revision';
}

interface PendingDecisionDetails {
  id: string;
  researchNumber: string;
  title: string;
  titleEn?: string;
  abstract: string;
  author: {
    name: string;
    email: string;
    affiliation: string;
    specialization: string;
  };
  submissionDate: string;
  status: StatusType;
  evaluationDate: string;
  reviewers: ReviewerComment[];
  averageRating: number;
}

// Star Rating Display Component (Read-only)
function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-none text-gray-300'
          }`}
        />
      ))}
      <span className="mr-2 text-sm font-semibold text-gray-700">({rating.toFixed(1)}/5)</span>
    </div>
  );
}

// Reviewer Comment Card
function ReviewerCommentCard({ comment }: { comment: ReviewerComment }) {
  const getRecommendationBadge = () => {
    switch (comment.recommendation) {
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
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
          {getRecommendationBadge()}
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

// Mock data - في الواقع سيأتي من API
const getMockPendingDecisionData = (id: string): PendingDecisionDetails => {
  return {
    id,
    researchNumber: `R2024${id.padStart(3, '0')}`,
    title: 'تطبيقات البلوك تشين في الأنظمة المالية الإسلامية',
    titleEn: 'Blockchain Applications in Islamic Financial Systems',
    abstract: 'يهدف هذا البحث إلى استكشاف إمكانيات تطبيق تقنية البلوك تشين في الأنظمة المالية الإسلامية، مع التركيز على التوافق مع أحكام الشريعة الإسلامية والفوائد المحتملة في تحسين الشفافية والأمان.',
    author: {
      name: 'د. عمر يوسف الشريف',
      email: 'omar.alsharif@finance.edu',
      affiliation: 'جامعة الإمام محمد بن سعود - كلية الاقتصاد',
      specialization: 'الاقتصاد الإسلامي',
    },
    submissionDate: '2024-01-05',
    status: 'pending-editor-decision',
    evaluationDate: '2024-02-20',
    averageRating: 4.0,
    reviewers: [
      {
        reviewerName: 'د. محمد عبدالرحمن الفقيه',
        rating: 4.5,
        date: '2024-02-15',
        recommendation: 'accepted',
        comment: 'البحث ممتاز ويقدم إسهاماً قيماً في مجال التقنية المالية الإسلامية. المنهجية سليمة والنتائج مقنعة. أوصي بقبول البحث للنشر مع بعض التعديلات الطفيفة في التنسيق.',
      },
      {
        reviewerName: 'د. فاطمة أحمد الزهراني',
        rating: 3.5,
        date: '2024-02-18',
        recommendation: 'needs-revision',
        comment: 'البحث جيد ولكن يحتاج إلى تحسينات في الجانب الشرعي. يجب إضافة المزيد من الأدلة الفقهية وتوضيح بعض المسائل المتعلقة بالتوافق مع أحكام الشريعة. أوصي بالقبول بعد إجراء التعديلات المطلوبة.',
      },
    ],
  };
};

export function PendingDecisionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDecision, setSelectedDecision] = useState<'accepted' | 'needs-revision' | 'rejected' | ''>('');
  const [editorNotes, setEditorNotes] = useState('');
  const [showDecisionForm, setShowDecisionForm] = useState(false);

  if (!id) {
    navigate('/dashboard/manage-research');
    return null;
  }

  const research = getMockPendingDecisionData(id);

  const handleBack = () => {
    navigate('/dashboard/manage-research');
  };

  const handleSubmitDecision = async () => {
    if (!selectedDecision) {
      alert('يرجى اختيار القرار النهائي');
      return;
    }

    if (selectedDecision === 'needs-revision' && !editorNotes.trim()) {
      alert('يرجى كتابة التعديلات المطلوبة');
      return;
    }

    try {
      // Map decision to research status
      const statusMap = {
        'accepted': 'accepted' as const,
        'needs-revision': 'needs-revision' as const,
        'rejected': 'rejected' as const,
      };

      // Update research status
      await researchService.updateStatus(id, statusMap[selectedDecision]);

      // If needs revision, create a revision request
      if (selectedDecision === 'needs-revision') {
        // Get current research data to save as original
        const currentResearch = await researchService.getById(id);
        
        await researchRevisionsService.create({
          research_id: id,
          revision_notes: editorNotes,
          original_data: {
            abstract: currentResearch.abstract,
            keywords: currentResearch.keywords,
            file_url: currentResearch.file_url,
          },
          // Optional: set a deadline (e.g., 30 days from now)
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const decisionText = 
        selectedDecision === 'accepted' ? 'قبول البحث' :
        selectedDecision === 'needs-revision' ? 'قبول البحث مع طلب تعديلات' :
        'رفض البحث';

      alert(`تم اتخاذ القرار النهائي: ${decisionText}`);
      navigate('/dashboard/manage-research');
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('حدث خطأ أثناء حفظ القرار. يرجى المحاولة مرة أخرى.');
    }
  };

  // حساب توزيع التوصيات
  const recommendationCounts = {
    accepted: research.reviewers.filter(r => r.recommendation === 'accepted').length,
    needsRevision: research.reviewers.filter(r => r.recommendation === 'needs-revision').length,
    rejected: research.reviewers.filter(r => r.recommendation === 'rejected').length,
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader 
        title="اتخاذ القرار النهائي" 
        subtitle="مراجعة تقييمات المحكمين واتخاذ القرار النهائي"
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
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500 rounded-full">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">في انتظار قرارك النهائي</h3>
            <p className="text-gray-700 mb-3">
              تم استلام تقييمات جميع المحكمين ({research.reviewers.length} محكمين). 
              يرجى مراجعة التقييمات والتوصيات واتخاذ القرار النهائي بشأن البحث.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">يوصي بالقبول:</span>
                <span className="font-bold text-green-600">{recommendationCounts.accepted}</span>
              </div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-gray-700">يوصي بالتعديل:</span>
                <span className="font-bold text-yellow-600">{recommendationCounts.needsRevision}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-gray-700">يوصي بالرفض:</span>
                <span className="font-bold text-red-600">{recommendationCounts.rejected}</span>
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
                <StatusBadge status={research.status} />
                <span className="text-sm text-gray-500">
                  رقم البحث: {research.researchNumber}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{research.title}</h1>
              {research.titleEn && (
                <p className="text-lg text-gray-600 mb-4" dir="ltr">{research.titleEn}</p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">الباحث:</span>
              <span className="text-gray-600">{research.author.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600" dir="ltr">{research.author.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{research.author.affiliation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">تاريخ التقييم:</span>
              <span className="text-gray-600">{research.evaluationDate}</span>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">متوسط التقييم الإجمالي</h3>
                <p className="text-xs text-gray-600">بناءً على تقييمات {research.reviewers.length} محكمين</p>
              </div>
              <StarRatingDisplay rating={research.averageRating} />
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium">
            <Download className="w-4 h-4" />
            <span>تحميل البحث PDF</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <FileText className="w-4 h-4" />
            <span>تحميل المرفقات</span>
          </button>
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
            <h2 className="text-xl font-bold text-gray-800">تقييمات وتوصيات المحكمين</h2>
            <span className="text-sm text-gray-600">
              {research.reviewers.length} محكم
            </span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-800">
              <span className="font-semibold">مهم:</span> هذه التوصيات هي آراء استشارية من المحكمين. القرار النهائي يعود لك بناءً على هذه التقييمات ورؤيتك المهنية.
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {research.reviewers.map((comment, index) => (
            <ReviewerCommentCard key={index} comment={comment} />
          ))}
        </div>
      </div>

      {/* Decision Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">اتخاذ القرار النهائي</h2>
            {!showDecisionForm && (
              <button
                onClick={() => setShowDecisionForm(true)}
                className="px-4 py-2 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium text-sm"
              >
                اتخاذ القرار الآن
              </button>
            )}
          </div>
        </div>

        {showDecisionForm ? (
          <div className="p-6 space-y-6">
            {/* Decision Options */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">اختر القرار النهائي</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Accept Option */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('accepted')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedDecision === 'accepted'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedDecision === 'accepted' ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <CheckCircle className={`w-8 h-8 ${
                        selectedDecision === 'accepted' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">قبول البحث</h3>
                      <p className="text-xs text-gray-600">البحث جاهز للنشر</p>
                    </div>
                  </div>
                </button>

                {/* Accept with Revision Option */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('needs-revision')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedDecision === 'needs-revision'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedDecision === 'needs-revision' ? 'bg-yellow-500' : 'bg-gray-200'
                    }`}>
                      <Edit3 className={`w-8 h-8 ${
                        selectedDecision === 'needs-revision' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">يتطلب تعديل</h3>
                      <p className="text-xs text-gray-600">طلب تعديلات من الباحث</p>
                    </div>
                  </div>
                </button>

                {/* Reject Option */}
                <button
                  type="button"
                  onClick={() => setSelectedDecision('rejected')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedDecision === 'rejected'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      selectedDecision === 'rejected' ? 'bg-red-500' : 'bg-gray-200'
                    }`}>
                      <XCircle className={`w-8 h-8 ${
                        selectedDecision === 'rejected' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 mb-1">رفض البحث</h3>
                      <p className="text-xs text-gray-600">البحث غير مناسب للنشر</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Editor Notes */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                ملاحظات المحرر {selectedDecision === 'needs-revision' && <span className="text-red-500">*</span>}
              </label>
              <p className="text-xs text-gray-600 mb-3">
                {selectedDecision === 'needs-revision' 
                  ? 'يرجى توضيح التعديلات المطلوبة بالتفصيل. سيتم إرسال هذه الملاحظات للباحث.'
                  : 'يمكنك إضافة ملاحظات إضافية (اختياري)'}
              </p>
              <textarea
                value={editorNotes}
                onChange={(e) => setEditorNotes(e.target.value)}
                placeholder={
                  selectedDecision === 'needs-revision'
                    ? 'اكتب التعديلات المطلوبة بالتفصيل...'
                    : 'اكتب ملاحظاتك هنا...'
                }
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
                required={selectedDecision === 'needs-revision'}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmitDecision}
                disabled={!selectedDecision || (selectedDecision === 'needs-revision' && !editorNotes.trim())}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>تأكيد القرار النهائي</span>
              </button>
              <button
                onClick={() => {
                  setShowDecisionForm(false);
                  setSelectedDecision('');
                  setEditorNotes('');
                }}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">
              راجع تقييمات المحكمين أعلاه، ثم اضغط على "اتخاذ القرار الآن" لإصدار القرار النهائي
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
