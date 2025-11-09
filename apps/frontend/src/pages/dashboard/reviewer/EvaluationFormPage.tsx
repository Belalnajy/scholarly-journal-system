import {
  Bell,
  FileText,
  Download,
  Send,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Loader2,
  Eye,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService } from '../../../services/reviews.service';
import {
  researchRevisionsService,
  ResearchRevision,
} from '../../../services/research-revisions.service';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import { useAuth } from '../../../contexts';
import {
  downloadResearchPdf,
  downloadRevisionFile,
} from '../../../utils/downloadFile';
import toast, { Toaster } from 'react-hot-toast';
import { PDFViewer } from '../../../components/PDFViewer';
import { isPdfFile } from '../../../utils/fileUtils';

// Types
interface DetailedScore {
  id: string;
  category: string;
  items: {
    id: string;
    title: string;
    score: number;
    maxScore: number;
  }[];
}

// Score Input Component with Quick Buttons
function ScoreInput({
  title,
  score,
  maxScore,
  onChange,
  minScore = 0,
}: {
  title: string;
  score: number;
  maxScore: number;
  onChange: (score: number) => void;
  minScore?: number;
}) {
  // Generate quick score buttons based on maxScore
  const generateQuickScores = () => {
    const scores: number[] = [];

    if (maxScore <= 5) {
      // For small scores (2-5), show all values
      for (let i = 0; i <= maxScore; i += 0.5) {
        scores.push(i);
      }
    } else if (maxScore <= 10) {
      // For medium scores (6-10), show integers and half points
      for (let i = 0; i <= maxScore; i++) {
        scores.push(i);
      }
    } else {
      // For large scores (>10), show key percentages
      scores.push(0); // 0%
      scores.push(Math.round(maxScore * 0.5)); // 50%
      scores.push(Math.round(maxScore * 0.6)); // 60%
      scores.push(Math.round(maxScore * 0.7)); // 70%
      scores.push(Math.round(maxScore * 0.8)); // 80%
      scores.push(Math.round(maxScore * 0.9)); // 90%
      scores.push(maxScore); // 100%
    }

    return scores.filter((s, i, arr) => arr.indexOf(s) === i); // Remove duplicates
  };

  const quickScores = generateQuickScores();

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <h4 className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-2xl font-bold ${
              score >= 0 ? 'text-[#0D3B66]' : 'text-gray-400'
            }`}
          >
            {score >= 0 ? score : '-'}
          </span>
          <span className="text-sm text-gray-500 font-semibold">
            / {maxScore}
          </span>
        </div>
      </div>

      {/* Quick Score Buttons */}
      <div className="flex flex-wrap gap-2">
        {quickScores.map((quickScore) => (
          <button
            key={quickScore}
            type="button"
            onClick={() => onChange(quickScore)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
              score === quickScore
                ? 'bg-[#0D3B66] text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
            }`}
          >
            {quickScore}
          </button>
        ))}

        {/* Custom Input for precise values */}
        <div className="flex items-center gap-1 ml-2">
          <input
            type="number"
            min={minScore}
            max={maxScore}
            step="0.5"
            value={score >= 0 ? score : ''}
            onChange={(e) => {
              const val =
                e.target.value === '' ? 0 : parseFloat(e.target.value);
              if (!isNaN(val) && val >= minScore && val <= maxScore) {
                onChange(val);
              }
            }}
            placeholder="أخرى"
            className="w-16 px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] text-center text-sm font-semibold"
          />
        </div>
      </div>
    </div>
  );
}

export function EvaluationFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [research, setResearch] = useState<Research | null>(null);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [assignment, setAssignment] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [pendingReview, setPendingReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detailed scoring system (out of 100)
  const [detailedScores, setDetailedScores] = useState<DetailedScore[]>([
    {
      id: 'title',
      category: 'العنوان',
      items: [
        {
          id: 'title_score',
          title: 'الصياغة اللغوية والدلالة على المضمون ومناسبته له',
          score: 0,
          maxScore: 3,
        },
      ],
    },
    {
      id: 'abstract',
      category: 'مستخلص البحث',
      items: [
        {
          id: 'abstract_score',
          title: 'شمولية المستخلص ووضوحه',
          score: 0,
          maxScore: 2,
        },
      ],
    },
    {
      id: 'methodology',
      category: 'منهج الرسالة',
      items: [
        {
          id: 'methodology_score',
          title:
            '- مشكلة البحث وأهدافه وأهميته\n- تحليل المعلومات ومناقشتها\n- التناسق الفكري للبحث\n- صحة المعلومات ودقتها',
          score: 0,
          maxScore: 15,
        },
      ],
    },
    {
      id: 'research_background',
      category: 'أدبيات الرسالة',
      items: [
        {
          id: 'background_score',
          title: 'الخلفية العلمية والإطار النظري',
          score: 0,
          maxScore: 15,
        },
      ],
    },
    {
      id: 'results',
      category: 'نتائج البحث وتوصياته',
      items: [
        {
          id: 'results_score',
          title: '- ربط النتائج بالفروض والأهداف\n- التوصيات والمقترحات',
          score: 0,
          maxScore: 15,
        },
      ],
    },
    {
      id: 'documentation',
      category: 'التوثيق العلمي',
      items: [
        {
          id: 'documentation_score',
          title:
            '- تنوع المصادر والمراجع\n- أسلوب التوثيق العلمي\n- الأمانة العلمية',
          score: 0,
          maxScore: 15,
        },
      ],
    },
    {
      id: 'originality',
      category: 'الأصالة والابتكار',
      items: [
        {
          id: 'originality_score',
          title:
            '- أصالة الموضوع والابتكار فيه\n- الإسهام الفاعل في إنماء المعرفة في التخصص',
          score: 0,
          maxScore: 15,
        },
      ],
    },
    {
      id: 'formatting',
      category: 'إخراج البحث',
      items: [
        {
          id: 'formatting_score',
          title: 'إخراج البحث وتنسيقه',
          score: 0,
          maxScore: 2,
        },
      ],
    },
    {
      id: 'research_condition',
      category: 'حالة البحث',
      items: [
        {
          id: 'research_condition_score',
          title: 'الحالة العامة للبحث ومدى جاهزيته للنشر',
          score: 0,
          maxScore: 10,
        },
      ],
    },
    {
      id: 'sources',
      category: 'المصادر والمراجع',
      items: [
        {
          id: 'sources_score',
          title: 'حداثة المصادر وتنوعها وملاءمتها للموضوع',
          score: 0,
          maxScore: 8,
        },
      ],
    },
  ]);

  const [generalComments, setGeneralComments] = useState('');
  const [recommendation, setRecommendation] = useState<
    'accepted' | 'needs-revision' | 'rejected' | ''
  >('');
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  // File upload state removed - reviewers can no longer edit files to protect researcher identity

  const handlePreviewResearch = () => {
    if (!research) return;
    const url = research.cloudinary_secure_url || research.file_url;
    if (url) {
      setPdfUrl(url);
      setShowPDFViewer(true);
    } else {
      toast.error('لا يوجد ملف للمعاينة');
    }
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
      toast.error('فشل في تحميل البحث', { id: 'download-original' });
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
      const [data, revisionsData, assignmentsData] = await Promise.all([
        researchService.getById(researchId),
        researchRevisionsService.getByResearch(researchId),
        reviewerAssignmentsService.getByResearch(researchId).catch(() => []),
      ]);

      setResearch(data);
      setRevisions(revisionsData);

      // Find my assignment
      const myAssignment = assignmentsData.find(
        (a: any) => a.reviewer_id === user?.id
      );
      setAssignment(myAssignment);

      // Check if reviewer already submitted a review for this research
      if (user?.id) {
        try {
          const reviews = await reviewsService.getByResearch(researchId);
          const myReview = reviews.find((r) => r.reviewer_id === user.id);

          // Only block if review is completed (not pending)
          if (myReview && myReview.status === 'completed') {
            setExistingReview(myReview);
            setError(
              'لقد قمت بتقييم هذا البحث مسبقاً. لا يمكن إرسال تقييم آخر.'
            );
          } else if (myReview && myReview.status === 'pending') {
            // Allow re-evaluation for pending reviews (revised research)
            setPendingReview(myReview);
            setExistingReview(null);
          }
        } catch (err) {
          // If error fetching reviews, continue (maybe no reviews yet)
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البحث'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total score from detailed scores
  const calculateTotalScore = () => {
    let total = 0;
    detailedScores.forEach((category) => {
      category.items.forEach((item) => {
        total += item.score;
      });
    });
    return total;
  };

  const totalScore = calculateTotalScore();
  const maxTotalScore = 100;

  // Check if all scores are filled (including zero)
  const allScoresFilled = detailedScores.every((category) =>
    category.items.every(
      (item) =>
        item.score !== undefined && item.score !== null && item.score >= 0
    )
  );

  const isFormComplete =
    allScoresFilled && generalComments.trim() && recommendation;

  const handleScoreChange = (
    categoryId: string,
    itemId: string,
    score: number
  ) => {
    setDetailedScores((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, score } : item
              ),
            }
          : category
      )
    );
  };

  const handleBackToTasks = () => {
    if (confirm('هل أنت متأكد من العودة؟ سيتم فقدان التقدم غير المحفوظ.')) {
      navigate('/dashboard/my-tasks');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete) {
      const msg = 'يرجى إكمال جميع الحقول قبل الإرسال';
      setError(msg);
      toast.error(msg, {
        duration: 4000,
      });
      return;
    }

    if (!user?.id || !research?.id) {
      const msg = 'خطأ في تحديد المستخدم أو البحث';
      setError(msg);
      toast.error(msg, {
        duration: 4000,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Convert detailed scores to the format expected by backend
      const detailedScoresObj: any = {};
      detailedScores.forEach((category) => {
        category.items.forEach((item) => {
          detailedScoresObj[item.id] = item.score;
        });
      });

      // Create criteria_ratings for backward compatibility
      const criteriaRatings: Record<string, number> = {};
      detailedScores.forEach((category) => {
        const categoryTotal = category.items.reduce(
          (sum, item) => sum + item.score,
          0
        );
        criteriaRatings[category.category] = categoryTotal;
      });

      // If there's a pending review, update it. Otherwise, create new one.
      if (pendingReview) {
        // Update existing pending review
        await reviewsService.update(pendingReview.id, {
          criteria_ratings: criteriaRatings,
          general_comments: generalComments,
          recommendation: recommendation as
            | 'accepted'
            | 'needs-revision'
            | 'rejected',
          total_score: totalScore,
          detailed_scores: detailedScoresObj,
          status: 'completed',
        });
      } else {
        // Create new review
        await reviewsService.create({
          research_id: research.id,
          reviewer_id: user.id,
          criteria_ratings: criteriaRatings,
          general_comments: generalComments,
          recommendation: recommendation as
            | 'accepted'
            | 'needs-revision'
            | 'rejected',
          total_score: totalScore,
          detailed_scores: detailedScoresObj,
        });
      }

      // Show success toast with research details
      toast.success(
        `تم إرسال المراجعة بنجاح!\nالبحث: ${research.title}\nالتوصية: ${
          recommendation === 'accepted'
            ? 'قبول'
            : recommendation === 'needs-revision'
            ? 'قبول مع تعديلات'
            : 'رفض'
        }\nالدرجة الإجمالية: ${totalScore}/${maxTotalScore}`,
        {
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '16px',
          },
          icon: '✅',
        }
      );

      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/dashboard/my-tasks');
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال المراجعة';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '16px',
        },
      });
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
              <p className="text-amber-800 font-bold text-lg">
                تم إرسال التقييم مسبقاً
              </p>
              <p className="text-amber-700">
                لقد قمت بتقييم هذا البحث بالفعل ولا يمكن إرسال تقييم آخر.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mt-4">
            <h3 className="font-bold text-gray-800 mb-3">
              ملخص تقييمك السابق:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">التقييم العام:</span>
                <span className="font-semibold text-gray-800">
                  {existingReview.average_rating
                    ? Number(existingReview.average_rating).toFixed(1)
                    : '0.0'}
                  /5
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">التوصية:</span>
                <span
                  className={`font-semibold ${
                    existingReview.recommendation === 'accepted'
                      ? 'text-green-600'
                      : existingReview.recommendation === 'needs-revision'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {existingReview.recommendation === 'accepted'
                    ? 'أوصي بالقبول'
                    : existingReview.recommendation === 'needs-revision'
                    ? 'أوصي بالقبول مع تعديلات'
                    : 'أوصي بالرفض'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإرسال:</span>
                <span className="font-semibold text-gray-800">
                  {existingReview.submitted_at
                    ? new Date(existingReview.submitted_at).toLocaleDateString(
                        'ar-EG'
                      )
                    : 'غير محدد'}
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
      <Toaster position="top-center" reverseOrder={false} />

      {/* IMPORTANT: Research Returned After Revision Banner */}
      {revisions.filter((r) => r.status === 'submitted').length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-xl p-6 shadow-2xl border-4 border-orange-300 animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
              <Edit3 className="w-8 h-8 text-orange-600 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-white">
                  البحث عاد بعد التعديل
                </h2>
                <span className="px-4 py-1.5 bg-white text-orange-600 rounded-full text-sm font-bold shadow-md">
                  مراجعة {revisions.filter((r) => r.status === 'submitted').length}
                </span>
              </div>
              <p className="text-white text-base font-semibold mb-3 leading-relaxed">
                الباحث قام بإجراء التعديلات المطلوبة على البحث بناءً على ملاحظاتك السابقة.
                يرجى مراجعة التعديلات بعناية وتقييم البحث مرة أخرى.
              </p>
              <div className="flex items-center gap-2 text-white text-sm">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">
                  تم استلام {revisions.filter((r) => r.status === 'submitted').length} نسخة معدلة
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            نموذج التحكيم الإلكتروني
            {revisions.filter((r) => r.status === 'submitted').length > 0 && (
              <span className="mr-3 px-3 py-1 bg-orange-500 text-white rounded-lg text-base font-bold animate-pulse">
                بعد التعديل
              </span>
            )}
          </h1>
          <p className="text-gray-600">تقييم شامل للبحث الأكاديمي</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Research Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          نموذج التحكيم الإلكتروني
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          تقييم شامل للبحث الأكاديمي وفق المعايير العلمية
        </p>

        {/* Research Details */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-700">
              معلومات عامة عن البحث
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="flex gap-2">
              <span className="text-gray-600">عنوان البحث:</span>
              <span className="font-medium text-gray-800">
                {research.title}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">رقم البحث:</span>
              <span className="font-medium text-gray-800">
                {research.research_number}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600">التصنيف العلمي:</span>
              <span className="font-medium text-gray-800">
                {research.specialization}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {/* Preview button - only for PDF files */}
            {isPdfFile(research.cloudinary_secure_url || research.file_url) && (
              <button
                onClick={handlePreviewResearch}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium shadow-md hover:shadow-lg"
              >
                <Eye className="w-5 h-5" />
                <span>معاينة البحث</span>
              </button>
            )}
            
            <button
              onClick={handleDownloadOriginal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>تحميل البحث الأصلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Notes */}
      {assignment?.assignment_notes && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                تعليمات خاصة من المحرر
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {assignment.assignment_notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Warning */}
      {assignment?.deadline && (
        <div
          className={`rounded-xl border p-6 ${
            new Date(assignment.deadline) <
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                new Date(assignment.deadline) <
                new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            >
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-bold mb-2 ${
                  new Date(assignment.deadline) <
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}
              >
                {new Date(assignment.deadline) < new Date()
                  ? 'تجاوز الموعد النهائي'
                  : new Date(assignment.deadline) <
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? 'الموعد النهائي قريب'
                  : 'الموعد النهائي للتقييم'}
              </h3>
              <p
                className={`${
                  new Date(assignment.deadline) <
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}
              >
                {new Date(assignment.deadline).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {new Date(assignment.deadline) < new Date() && (
                  <span className="font-bold mr-2">
                    - يرجى إكمال التقييم في أقرب وقت
                  </span>
                )}
                {new Date(assignment.deadline) >= new Date() &&
                  new Date(assignment.deadline) <
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
                    <span className="font-bold mr-2">
                      - يرجى إكمال التقييم قبل انتهاء الموعد
                    </span>
                  )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revision History - Show if there are submitted revisions */}
      {revisions.filter((r) => r.status === 'submitted').length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 overflow-hidden">
          <div className="p-6 border-b border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              تعديلات الباحث
            </h2>
            <p className="text-sm text-gray-600">
              الباحث قام بإجراء تعديلات على البحث بناءً على ملاحظاتك السابقة
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
                          {new Date(revision.submitted_at).toLocaleDateString(
                            'ar-EG'
                          )}
                        </span>
                      )}
                    </div>
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
          {revisions.filter((r) => r.status === 'submitted' && r.original_data)
            .length > 0 && (
            <div className="p-6 bg-white border-t border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                مقارنة البيانات
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Abstract */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-2">
                    الملخص الأصلي
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
                    الملخص المعدل
                  </h4>
                  <p className="text-sm text-gray-700">{research.abstract}</p>
                </div>

                {/* Original Keywords */}
                {revisions.find(
                  (r) => r.status === 'submitted' && r.original_data?.keywords
                )?.original_data?.keywords && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h4 className="text-sm font-bold text-red-800 mb-2">
                      الكلمات المفتاحية الأصلية:
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
                      الكلمات المفتاحية المعدلة:
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

      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Detailed Scoring Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              معايير التحكيم
            </h2>
            <p className="text-sm text-gray-600">
              يرجى تقييم البحث وفقاً للمعايير التالية (الدرجة الإجمالية:{' '}
              {totalScore} من {maxTotalScore})
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-gray-700">
                {((totalScore / maxTotalScore) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {detailedScores.map((category, categoryIndex) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">
                      {categoryIndex + 1}. {category.category}
                    </h3>
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                      {category.items.reduce(
                        (sum, item) => sum + item.score,
                        0
                      )}{' '}
                      /{' '}
                      {category.items.reduce(
                        (sum, item) => sum + item.maxScore,
                        0
                      )}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  {category.items.map((item) => (
                    <ScoreInput
                      key={item.id}
                      title={item.title}
                      score={item.score}
                      maxScore={item.maxScore}
                      onChange={(score) =>
                        handleScoreChange(category.id, item.id, score)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              ثانياً: توصية المحكم
            </h2>
            <p className="text-sm text-gray-500">
              يرجى اختيار توصيتك بشأن البحث
            </p>
            <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">ملاحظة هامة:</span> توصيتك هي
                رأي استشاري. القرار النهائي (قبول أو رفض البحث) سيتخذه المحرر أو
                المدير بناءً على تقييمك وتقييمات المحكمين الآخرين.
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
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      recommendation === 'accepted'
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <CheckCircle
                      className={`w-8 h-8 ${
                        recommendation === 'accepted'
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">
                      أوصي بالقبول
                    </h3>
                    <p className="text-xs text-gray-600">
                      البحث يستوفي المعايير المطلوبة
                    </p>
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
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      recommendation === 'needs-revision'
                        ? 'bg-yellow-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <Edit3
                      className={`w-8 h-8 ${
                        recommendation === 'needs-revision'
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">
                      أوصي بالقبول مع تعديلات
                    </h3>
                    <p className="text-xs text-gray-600">
                      البحث جيد لكن يحتاج تحسينات
                    </p>
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
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      recommendation === 'rejected'
                        ? 'bg-red-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <XCircle
                      className={`w-8 h-8 ${
                        recommendation === 'rejected'
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 mb-1">
                      أوصي بالرفض
                    </h3>
                    <p className="text-xs text-gray-600">
                      البحث لا يستوفي المعايير
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* General Comments Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              ثالثاً: التقييم العام والملاحظات
            </h2>
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
            <span className="text-sm font-medium text-gray-700">
              التقدم في التقييم
            </span>
            <span className="text-sm text-gray-600">
              {allScoresFilled ? '•' : '•'} الدرجات •{' '}
              {recommendation ? '•' : '•'} التوصية •{' '}
              {generalComments.trim() ? '•' : '•'} التعليقات
            </span>
          </div>

          {/* Summary */}
          {recommendation && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">توصيتك:</p>
                  <p
                    className={`text-lg font-bold ${
                      recommendation === 'accepted'
                        ? 'text-green-600'
                        : recommendation === 'needs-revision'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {recommendation === 'accepted'
                      ? 'أوصي بالقبول'
                      : recommendation === 'needs-revision'
                      ? 'أوصي بالقبول مع تعديلات'
                      : 'أوصي بالرفض'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    الدرجة النهائية:
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {totalScore.toFixed(1)}/100
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalScore >= 70
                      ? 'ممتاز'
                      : totalScore >= 60
                      ? 'جيد جداً'
                      : totalScore >= 50
                      ? 'جيد'
                      : 'يحتاج تحسين'}
                  </p>
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

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* PDF Viewer Modal */}
      {showPDFViewer && pdfUrl && (
        <PDFViewer
          pdfUrl={pdfUrl}
          title={`معاينة البحث - ${research?.research_number || ''}`}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
    </div>
  );
}
