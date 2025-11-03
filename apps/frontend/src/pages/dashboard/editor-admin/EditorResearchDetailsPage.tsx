import {
  ArrowRight,
  Download,
  FileText,
  User,
  Calendar,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import {
  reviewerAssignmentsService,
  ReviewerAssignment,
} from '../../../services/reviewer-assignments.service';
import {
  researchRevisionsService,
  ResearchRevision,
} from '../../../services/research-revisions.service';
import {
  downloadResearchPdf,
  downloadRevisionFile,
} from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

export function EditorResearchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [research, setResearch] = useState<Research | null>(null);
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateFileModal, setShowUpdateFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadResearchData(id);
    } else {
      navigate('/dashboard/manage-research');
    }
  }, [id]);

  const loadResearchData = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [researchData, assignmentsData, revisionsData] = await Promise.all([
        researchService.getById(researchId),
        reviewerAssignmentsService.getByResearch(researchId),
        researchRevisionsService.getByResearch(researchId).catch(() => []),
      ]);

      setResearch(researchData);
      setAssignments(assignmentsData);
      setRevisions(revisionsData);
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

  if (!id) {
    navigate('/dashboard/manage-research');
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
          onClick={() => loadResearchData(id)}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const handleAssignReviewer = () => {
    navigate(`/dashboard/assign-reviewer/${id}`);
  };

  const handleBack = () => {
    navigate('/dashboard/manage-research');
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
      await loadResearchData(id);
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader
        title="تفاصيل البحث"
        subtitle="عرض معلومات البحث الكاملة"
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

      {/* Research Header Card */}
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

          {/* Research Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-700">معلومات البحث:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mr-7">
              <div className="flex items-center gap-2 text-sm">
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
          </div>
        </div>

        {/* Action Buttons */}
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
            {/* Allow file update if: under-review OR accepted OR published */}
            {(research.status === 'under-review' ||
              research.status === 'accepted' ||
              research.status === 'published') && (
              <button
                onClick={() => setShowUpdateFileModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {assignments.length === 0 
                    ? 'تحديث ملف البحث (قبل تعيين المحكمين)'
                    : research.status === 'under-review'
                    ? 'تحديث ملف البحث (تعديل أو إزالة معلومات)'
                    : 'تحديث ملف البحث (إضافة الغلاف والتنسيق)'}
                </span>
              </button>
            )}

            {/* Download Latest Revision if exists */}
            {revisions.filter((r) => r.status === 'submitted').length > 0 && (
              <button
                onClick={() =>
                  handleDownloadRevision(
                    revisions
                      .filter((r) => r.status === 'submitted')
                      .sort((a, b) => b.revision_number - a.revision_number)[0]
                  )
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span>تحميل البحث المعدل (PDF)</span>
              </button>
            )}

            {/* Assign Reviewer Button */}
            {research.status === 'under-review' && (
              <button
                onClick={handleAssignReviewer}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                <span>تعيين محكم</span>
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
            <div className="flex flex-wrap gap-3">
              {research.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">الجدول الزمني</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">تاريخ التقديم</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(research.submission_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  تم استلام البحث من الباحث
                </p>
              </div>
            </div>

            {research.evaluation_date && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">
                      تاريخ التقييم
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(research.evaluation_date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    تم الانتهاء من التقييم
                  </p>
                </div>
              </div>
            )}

            {research.published_date && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">تاريخ النشر</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(research.published_date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">تم نشر البحث</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviewers Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">المحكمون المعينون</h2>
        </div>
        <div className="p-6">
          {assignments.length > 0 ? (
            <>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">
                          {assignment.reviewer?.name || 'محكم معين'}
                        </p>
                        {assignment.reviewer?.email && (
                          <p className="text-xs text-gray-500">
                            {assignment.reviewer.email}
                          </p>
                        )}
                        {assignment.reviewer?.specialization && (
                          <p className="text-xs text-blue-600 mt-1">
                            التخصص: {assignment.reviewer.specialization}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${
                          assignment.status === 'completed'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : assignment.status === 'accepted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : assignment.status === 'declined'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}
                      >
                        {assignment.status === 'completed'
                          ? 'مكتمل'
                          : assignment.status === 'accepted'
                          ? 'مقبول'
                          : assignment.status === 'declined'
                          ? 'مرفوض'
                          : 'معين'}
                      </span>
                      {assignment.deadline && (
                        <p className="text-xs text-gray-500 mt-2">
                          الموعد: {formatDate(assignment.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Privacy Protection Notice - Show when reviewers are assigned */}
              {research.status === 'under-review' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2 text-right">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-bold mb-1">🔒 تنبيه: الملف محمي</p>
                      <p>تم تعيين محكمين لهذا البحث. لا يمكن تعديل الملف الآن لحماية هوية الباحث من المحكمين.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">
                لم يتم تعيين محكمين لهذا البحث بعد
              </p>
              
              {/* Privacy Protection Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <div className="flex items-start gap-2 text-right">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-1">⚠️ تنبيه مهم</p>
                    <p>يمكنك تعديل ملف البحث الآن لإزالة معلومات الباحث. بعد تعيين المحكمين، لن يمكن تعديل الملف لحماية هوية الباحث.</p>
                  </div>
                </div>
              </div>

              {research.status === 'under-review' && (
                <button
                  onClick={handleAssignReviewer}
                  className="px-6 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
                >
                  تعيين محكم الآن
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
              <div className={`border-2 rounded-xl p-4 ${
                assignments.length === 0 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : research.status === 'under-review'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    assignments.length === 0 
                      ? 'text-yellow-600' 
                      : research.status === 'under-review'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${
                      assignments.length === 0 
                        ? 'text-yellow-900' 
                        : research.status === 'under-review'
                        ? 'text-red-900'
                        : 'text-blue-900'
                    }`}>
                      معلومات مهمة
                    </h3>
                    <ul className={`text-sm space-y-1 list-disc list-inside ${
                      assignments.length === 0 
                        ? 'text-yellow-800' 
                        : research.status === 'under-review'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      <li>سيتم استبدال الملف الحالي بالملف الجديد</li>
                      {assignments.length === 0 ? (
                        <>
                          <li className="font-bold">يمكنك تعديل الملف الآن لإزالة معلومات الباحث قبل تعيين المحكمين</li>
                          <li className="font-bold text-red-700">⚠️ بعد تعيين المحكمين، لن يمكن تعديل الملف (لحماية هوية الباحث)</li>
                        </>
                      ) : research.status === 'under-review' && assignments.length > 0 ? (
                        <>
                          <li className="font-bold text-red-700">⚠️ تحذير: تم تعيين محكمين لهذا البحث!</li>
                          <li className="font-bold text-red-700">إذا قمت بتحديث الملف، سيتم رفض العملية من الخادم لحماية هوية الباحث.</li>
                          <li>يمكنك المحاولة، لكن سيظهر لك خطأ: "لا يمكن تعديل الملف بعد تعيين المحكمين"</li>
                        </>
                      ) : (
                        <li>يمكنك إضافة الغلاف والتنسيق النهائي للبحث</li>
                      )}
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
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
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
  );
}
