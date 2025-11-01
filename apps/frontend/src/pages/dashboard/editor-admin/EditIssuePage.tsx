import {
  ArrowRight,
  Save,
  Loader2,
  AlertTriangle,
  Trash2,
  X,
  RefreshCw,
  Upload,
  FileText,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import {
  getIssueById,
  updateIssue,
  deleteIssue,
  uploadFullIssuePdf,
  Issue,
} from '../../../services/issuesService';
import {
  getArticlesByIssueId,
  deleteArticle,
  updateArticle,
  Article,
} from '../../../services/articlesService';

export function EditIssuePage() {
  const navigate = useNavigate();
  const { issueId } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteArticleModal, setShowDeleteArticleModal] =
    useState<Article | null>(null);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<
    'planned' | 'in-progress' | 'published' | null
  >(null);
  const [showUploadPdfModal, setShowUploadPdfModal] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const [formData, setFormData] = useState({
    issue_number: '',
    title: '',
    description: '',
    publish_date: '',
    max_articles: '',
    status: 'planned' as 'planned' | 'in-progress' | 'published',
  });

  useEffect(() => {
    if (issueId) {
      fetchIssue();
    }
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError(null);
      const [issueData, articlesData] = await Promise.all([
        getIssueById(issueId!),
        getArticlesByIssueId(issueId!),
      ]);

      setIssue(issueData);
      setArticles(articlesData);

      setFormData({
        issue_number: issueData.issue_number,
        title: issueData.title,
        description: issueData.description || '',
        publish_date: issueData.publish_date.split('T')[0],
        max_articles: issueData.max_articles.toString(),
        status: issueData.status,
      });
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات العدد');
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (
    newStatus: 'planned' | 'in-progress' | 'published'
  ) => {
    // Check if status is changing and there are articles
    if (issue && issue.status !== newStatus && articles.length > 0) {
      setPendingStatusChange(newStatus);
      setShowStatusChangeModal(true);
    } else {
      setFormData({ ...formData, status: newStatus });
    }
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    try {
      // Save the new status before updating
      const newStatus = pendingStatusChange;

      // Update all articles status based on issue status
      const newArticleStatus =
        newStatus === 'published' ? 'published' : 'ready-to-publish';

      await Promise.all(
        articles.map((article) =>
          updateArticle(article.id, { status: newArticleStatus })
        )
      );

      setShowStatusChangeModal(false);
      setPendingStatusChange(null);

      toast.success('تم تحديث حالة جميع المقالات بنجاح!', {
        duration: 3000,
        position: 'top-center',
      });

      // Refresh data
      await fetchIssue();

      // Update formData with the new status after fetching
      setFormData((prev) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      console.error('Error updating articles status:', err);
      toast.error('حدث خطأ أثناء تحديث حالة المقالات', {
        duration: 5000,
        position: 'top-center',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate max_articles
    const newMaxArticles = parseInt(formData.max_articles);
    if (issue && newMaxArticles < issue.total_articles) {
      setError(
        `لا يمكن تقليل الحد الأقصى إلى ${newMaxArticles} لأن العدد يحتوي بالفعل على ${issue.total_articles} مقال. يجب أن يكون الحد الأقصى ${issue.total_articles} على الأقل`
      );
      setShowValidationModal(true);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateIssue(issueId!, {
        issue_number: formData.issue_number,
        title: formData.title,
        description: formData.description || undefined,
        publish_date: formData.publish_date,
        max_articles: newMaxArticles,
        status: formData.status,
      });

      toast.success('تم تحديث العدد بنجاح!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ffff',
          color: '#10b981',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });

      setTimeout(() => navigate('/dashboard/manage-issues'), 1000);
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث العدد');
      console.error('Error updating issue:', err);
      toast.error(
        err.message || 'حدث خطأ أثناء تحديث العدد. يرجى المحاولة مرة أخرى.',
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      setDeletingArticle(articleId);
      setError(null);

      await deleteArticle(articleId);

      toast.success('تم حذف المقال من العدد بنجاح!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ffff',
          color: '#10b981',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });

      // Refresh data
      await fetchIssue();
      setShowDeleteArticleModal(null);
    } catch (err: any) {
      setError(err.message || 'فشل في حذف المقال');
      console.error('Error deleting article:', err);
      toast.error(
        err.message || 'حدث خطأ أثناء حذف المقال. يرجى المحاولة مرة أخرى.',
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    } finally {
      setDeletingArticle(null);
    }
  };

  const handleDelete = async () => {
    if (!issueId) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteIssue(issueId);

      toast.success('تم حذف العدد بنجاح!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ffff',
          color: '#10b981',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });

      setTimeout(() => navigate('/dashboard/manage-issues'), 1000);
    } catch (err: any) {
      setError(err.message || 'فشل في حذف العدد');
      console.error('Error deleting issue:', err);
      toast.error(
        err.message || 'حدث خطأ أثناء حذف العدد. يرجى المحاولة مرة أخرى.',
        {
          duration: 5000,
          position: 'top-center',
        }
      );
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('نوع الملف غير مدعوم. يرجى رفع ملف PDF فقط');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت');
      return;
    }

    setSelectedPdfFile(file);
  };

  const handleUploadPdf = async () => {
    if (!selectedPdfFile || !issueId) return;

    try {
      setIsUploadingPdf(true);
      toast.loading('جاري رفع ملف العدد الكامل...', { id: 'upload-pdf' });

      const updatedIssue = await uploadFullIssuePdf(issueId, selectedPdfFile);

      setIssue(updatedIssue);
      toast.success('تم رفع ملف العدد الكامل بنجاح', { id: 'upload-pdf' });
      setShowUploadPdfModal(false);
      setSelectedPdfFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'فشل رفع الملف', {
        id: 'upload-pdf',
      });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل بيانات العدد...</p>
        </div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/manage-issues')}
            className="px-6 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0" dir="rtl">
      <Toaster />

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-issues')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <DashboardHeader
            title="تحرير العدد"
            subtitle="تعديل معلومات وإعدادات العدد"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-red-700 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && issue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowValidationModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                لا يمكن تقليل الحد الأقصى
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-800 text-center leading-relaxed">
                  العدد يحتوي حالياً على{' '}
                  <span className="font-bold text-xl">
                    {issue.total_articles}
                  </span>{' '}
                  مقال منشور
                </p>
              </div>

              <div className="text-center text-gray-700">
                <p className="mb-2">الحد الأقصى الجديد يجب أن يكون:</p>
                <p className="text-3xl font-bold text-[#0D3B66]">
                  {issue.total_articles}
                </p>
                <p className="text-sm text-gray-500 mt-1">على الأقل</p>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setFormData({
                    ...formData,
                    max_articles: issue.total_articles.toString(),
                  });
                }}
                className="w-full px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold"
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            رقم العدد
          </label>
          <input
            type="text"
            value={formData.issue_number}
            onChange={(e) =>
              setFormData({ ...formData, issue_number: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            عنوان العدد
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            وصف العدد
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              تاريخ النشر المخطط
            </label>
            <input
              type="date"
              value={formData.publish_date}
              onChange={(e) =>
                setFormData({ ...formData, publish_date: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 هذا التاريخ للتخطيط فقط. عند النشر، سيتحول تلقائياً لتاريخ
              النشر الفعلي
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الحد الأقصى للمقالات
            </label>
            <input
              type="number"
              value={formData.max_articles}
              onChange={(e) =>
                setFormData({ ...formData, max_articles: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              required
              min={issue?.total_articles || 1}
            />
            <p className="mt-2 text-xs text-gray-500">
              لن يمكن إضافة مقالات تتجاوز هذا العدد
            </p>
            {issue && issue.total_articles > 0 && (
              <p className="mt-1 text-xs text-amber-600 font-medium">
                الحد الأدنى المسموح: {issue.total_articles} (عدد المقالات
                الحالية)
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            حالة العدد
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              handleStatusChange(
                e.target.value as 'planned' | 'in-progress' | 'published'
              )
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
          >
            <option value="planned">مخطط</option>
            <option value="in-progress">قيد التحضير</option>
            <option value="published">منشور</option>
          </select>
          {articles.length > 0 && (
            <p className="mt-2 text-xs text-amber-600 font-medium">
              تغيير الحالة سيؤثر على جميع المقالات في العدد ({articles.length}{' '}
              مقال)
            </p>
          )}
        </div>

        {/* Upload Full Issue PDF Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-md border border-green-200 p-4 sm:p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              ملف العدد الكامل (PDF)
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              قم برفع ملف PDF واحد يحتوي على جميع مقالات العدد مجمعة مع الغلاف
              والفهرس
            </p>
            {issue?.issue_pdf_url && (
              <div className="bg-white rounded-lg p-3 border border-green-300 mb-4">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">تم رفع ملف العدد الكامل ✓</span>
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowUploadPdfModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>
              {issue?.issue_pdf_url ? 'تحديث الملف' : 'رفع ملف العدد'}
            </span>
          </button>
        </div>
        </div>

        {/* Articles in Issue Section */}
        {articles.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            المقالات في هذا العدد ({articles.length})
          </h3>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#0D3B66]">
                      {article.article_number}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {article.status === 'published' ? 'منشور' : 'جاهز للنشر'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">
                    {article.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    المؤلفون: {article.authors.map((a) => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    الصفحات: {article.pages}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteArticleModal(article)}
                  disabled={deletingArticle === article.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="حذف المقال من العدد"
                >
                  {deletingArticle === article.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={saving || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage-issues')}
            disabled={saving || deleting}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={saving || deleting}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>حذف العدد</span>
          </button>
        </div>
      </form>

      {/* Delete Article Confirmation Modal */}
      {showDeleteArticleModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteArticleModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                حذف المقال من العدد
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-red-800 text-center font-bold mb-2">
                  {showDeleteArticleModal.title}
                </p>
                <p className="text-red-700 text-center text-sm">
                  رقم المقال: {showDeleteArticleModal.article_number}
                </p>
              </div>

              <div className="text-center text-gray-700">
                <p className="mb-2">هل أنت متأكد من حذف هذا المقال من العدد؟</p>
                <p className="text-sm text-red-600 font-medium">
                  سيتم حذف المقال نهائياً
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteArticleModal(null)}
                  disabled={deletingArticle !== null}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDeleteArticle(showDeleteArticleModal.id)}
                  disabled={deletingArticle !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingArticle === showDeleteArticleModal.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري الحذف...</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span>تأكيد الحذف</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && issue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                تأكيد حذف العدد
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-red-800 text-center font-bold text-lg mb-2">
                  {issue.title}
                </p>
                <p className="text-red-700 text-center text-sm">
                  رقم العدد: {issue.issue_number}
                </p>
              </div>

              {issue.total_articles > 0 ? (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-800">
                        <span className="font-semibold">تحذير:</span> هذا العدد
                        يحتوي على{' '}
                        <span className="font-bold">
                          {issue.total_articles}
                        </span>{' '}
                        مقال. لا يمكن حذف العدد إلا إذا كان فارغاً.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-700">
                  <p className="mb-2">هل أنت متأكد من حذف هذا العدد؟</p>
                  <p className="text-sm text-red-600 font-medium">
                    هذا الإجراء لا يمكن التراجع عنه
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold disabled:opacity-50"
                >
                  إلغاء
                </button>
                {issue.total_articles === 0 && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الحذف...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>تأكيد الحذف</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusChangeModal && pendingStatusChange && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowStatusChangeModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                تحديث حالة العدد والمقالات
              </h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 text-center font-bold mb-2">
                  تغيير حالة العدد إلى:{' '}
                  {pendingStatusChange === 'published'
                    ? 'منشور'
                    : pendingStatusChange === 'in-progress'
                    ? 'قيد التحضير'
                    : 'مخطط'}
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 mb-2">
                      <span className="font-semibold">تنبيه:</span> سيتم تحديث
                      حالة جميع المقالات ({articles.length} مقال) تلقائياً:
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1 mr-4">
                      {pendingStatusChange === 'published' ? (
                        <li>
                          • جميع المقالات ستصبح{' '}
                          <span className="font-bold">منشورة</span>
                        </li>
                      ) : (
                        <li>
                          • جميع المقالات ستصبح{' '}
                          <span className="font-bold">جاهزة للنشر</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-700">
                <p className="text-sm">هل تريد المتابعة؟</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowStatusChangeModal(false);
                    setPendingStatusChange(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>تأكيد التحديث</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload PDF Modal */}
      {showUploadPdfModal && (
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
                    <h2 className="text-2xl font-bold">رفع ملف العدد الكامل</h2>
                    <p className="text-sm text-white/90 mt-1">
                      ملف PDF واحد يحتوي على جميع مقالات العدد
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUploadPdfModal(false);
                    setSelectedPdfFile(null);
                  }}
                  disabled={isUploadingPdf}
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
                  <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-1">
                      معلومات مهمة
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>اجمع جميع مقالات العدد في ملف PDF واحد</li>
                      <li>أضف الغلاف والفهرس</li>
                      <li>تأكد من ترتيب المقالات بشكل صحيح</li>
                      <li>الحد الأقصى: 50 ميجابايت</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  اختر ملف PDF
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfFileSelect}
                    disabled={isUploadingPdf}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Selected File Preview */}
              {selectedPdfFile && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900">
                        {selectedPdfFile.name}
                      </p>
                      <p className="text-sm text-green-700">
                        {(selectedPdfFile.size / 1024 / 1024).toFixed(2)}{' '}
                        ميجابايت
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowUploadPdfModal(false);
                  setSelectedPdfFile(null);
                }}
                disabled={isUploadingPdf}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                onClick={handleUploadPdf}
                disabled={!selectedPdfFile || isUploadingPdf}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploadingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري الرفع...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>رفع الملف</span>
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
