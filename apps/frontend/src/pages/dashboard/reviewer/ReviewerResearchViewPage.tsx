import {
  ArrowRight,
  Download,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { researchService, Research } from '../../../services/researchService';
import {
  researchRevisionsService,
  ResearchRevision,
} from '../../../services/research-revisions.service';
import { reviewsService } from '../../../services/reviews.service';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import {
  downloadResearchPdf,
  downloadRevisionFile,
} from '../../../utils/downloadFile';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts';

export function ReviewerResearchViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [research, setResearch] = useState<Research | null>(null);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [myReview, setMyReview] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [researchData, revisionsData, reviewsData, assignmentsData] = await Promise.all([
        researchService.getById(researchId),
        researchRevisionsService.getByResearch(researchId).catch(() => []),
        reviewsService.getByResearch(researchId).catch(() => []),
        reviewerAssignmentsService.getByResearch(researchId).catch(() => []),
      ]);

      setResearch(researchData);
      setRevisions(revisionsData);

      // Find my review
      const myReviewData = reviewsData.find(
        (r: any) => r.status === 'completed' || r.status === 'in-progress'
      );
      setMyReview(myReviewData);

      // Find my assignment
      const myAssignment = assignmentsData.find(
        (a: any) => a.reviewer_id === user?.id
      );
      setAssignment(myAssignment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البحث'
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
      toast.error('فشل تحميل الملف', { id: 'download-revision' });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<
      string,
      { text: string; bgColor: string; textColor: string }
    > = {
      'under-review': {
        text: 'قيد المراجعة',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      'pending-editor-decision': {
        text: 'بانتظار قرار المحرر',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
      },
      'needs-revision': {
        text: 'يحتاج تعديلات',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
      },
      accepted: {
        text: 'مقبول',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
      },
      rejected: {
        text: 'مرفوض',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
      },
      published: {
        text: 'منشور',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
      },
    };
    const config = configs[status] || {
      text: status,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
    };
    return (
      <span
        className={`${config.bgColor} ${config.textColor} px-3 py-1 rounded-full text-sm font-semibold`}
      >
        {config.text}
      </span>
    );
  };

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

  if (error || !research) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'لم يتم العثور على البحث'}</p>
          <button
            onClick={() => navigate('/dashboard/my-tasks')}
            className="mt-4 px-6 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90"
          >
            العودة للمهام
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {research.title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              رقم البحث: {research.research_number}
            </span>
            {getStatusBadge(research.status)}
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/my-tasks')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة للمهام</span>
        </button>
      </div>

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
                    <span className="text-gray-600">{research.user.phone}</span>
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
        <div className={`rounded-xl border p-6 ${
          new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${
                new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}>
                {new Date(assignment.deadline) < new Date()
                  ? '⚠️ تجاوز الموعد النهائي'
                  : new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? '⏰ الموعد النهائي قريب'
                  : '📅 الموعد النهائي للمراجعة'}
              </h3>
              <p className={`${
                new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {formatDate(assignment.deadline)}
                {new Date(assignment.deadline) < new Date() && (
                  <span className="font-bold mr-2">- يرجى إكمال المراجعة في أقرب وقت</span>
                )}
                {new Date(assignment.deadline) >= new Date() && 
                 new Date(assignment.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
                  <span className="font-bold mr-2">- يرجى إكمال المراجعة قبل انتهاء الموعد</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Review Status */}
      {myReview && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">حالة تقييمك</h3>
              <p className="text-sm text-gray-600 mt-1">
                {myReview.status === 'completed' ? (
                  <>
                    تم إرسال التقييم بتاريخ{' '}
                    {myReview.submitted_at
                      ? formatDate(myReview.submitted_at)
                      : 'غير محدد'}
                  </>
                ) : (
                  'التقييم قيد الإنجاز'
                )}
              </p>
            </div>
            <button
              onClick={() =>
                navigate(`/dashboard/evaluation-form/${research.id}`)
              }
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {myReview.status === 'completed'
                ? 'عرض التقييم'
                : 'إكمال التقييم'}
            </button>
          </div>
        </div>
      )}

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

                    {(revision.file_url || revision.cloudinary_secure_url) && (
                      <button
                        onClick={() => handleDownloadRevision(revision)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
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
          <h2 className="text-xl font-bold text-gray-800">الملخص</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{research.abstract}</p>
        </div>
      </div>

      {/* Keywords Section */}
      {research.keywords && research.keywords.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              الكلمات المفتاحية
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {research.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Research Details */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">تفاصيل البحث</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-bold text-gray-700">التخصص:</span>
              <p className="text-gray-600 mt-1">{research.specialization}</p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-700">
                تاريخ التقديم:
              </span>
              <p className="text-gray-600 mt-1">
                {formatDate(research.submission_date)}
              </p>
            </div>
            {(research.file_url || research.cloudinary_secure_url) && (
              <div className="md:col-span-2">
                <span className="text-sm font-bold text-gray-700">
                  ملفات البحث:
                </span>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={handleDownloadOriginal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors w-fit font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل البحث الأصلي </span>
                  </button>

                  {/* Show latest revision download button if exists */}
                  {revisions.filter((r) => r.status === 'submitted').length >
                    0 && (
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
                      className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors w-fit font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل البحث المعدل (PDF)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/dashboard/evaluation-form/${research.id}`)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-bold"
        >
          <FileText className="w-5 h-5" />
          <span>
            {myReview?.status === 'completed' ? 'عرض التقييم' : 'بدء التحكيم'}
          </span>
        </button>
      </div>
    </div>
  );
}
