import { ArrowRight, Save, Loader2, AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import { getIssueById, updateIssue, deleteIssue, Issue } from '../../../services/issuesService';
import { getArticlesByIssueId, deleteArticle, updateArticle, Article } from '../../../services/articlesService';

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
  const [showDeleteArticleModal, setShowDeleteArticleModal] = useState<Article | null>(null);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<'planned' | 'in-progress' | 'published' | null>(null);

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
        getArticlesByIssueId(issueId!)
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

  const handleStatusChange = (newStatus: 'planned' | 'in-progress' | 'published') => {
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
      const newArticleStatus = newStatus === 'published' ? 'published' : 'ready-to-publish';
      
      await Promise.all(
        articles.map(article => 
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
      setFormData(prev => ({ ...prev, status: newStatus }));
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
      toast.error(err.message || 'حدث خطأ أثناء تحديث العدد. يرجى المحاولة مرة أخرى.', {
        duration: 5000,
        position: 'top-center',
      });
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
      toast.error(err.message || 'حدث خطأ أثناء حذف المقال. يرجى المحاولة مرة أخرى.', {
        duration: 5000,
        position: 'top-center',
      });
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
      toast.error(err.message || 'حدث خطأ أثناء حذف العدد. يرجى المحاولة مرة أخرى.', {
        duration: 5000,
        position: 'top-center',
      });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
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
    <div className="space-y-6" dir="rtl">
      <Toaster />
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-issues')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="تحرير العدد" 
            subtitle="تعديل معلومات وإعدادات العدد" 
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && issue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowValidationModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">لا يمكن تقليل الحد الأقصى</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-amber-800 text-center leading-relaxed">
                  العدد يحتوي حالياً على <span className="font-bold text-xl">{issue.total_articles}</span> مقال منشور
                </p>
              </div>

              <div className="text-center text-gray-700">
                <p className="mb-2">الحد الأقصى الجديد يجب أن يكون:</p>
                <p className="text-3xl font-bold text-[#0D3B66]">{issue.total_articles}</p>
                <p className="text-sm text-gray-500 mt-1">على الأقل</p>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setFormData({ ...formData, max_articles: issue.total_articles.toString() });
                }}
                className="w-full px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold"
              >
                فهمت
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رقم العدد</label>
          <input
            type="text"
            value={formData.issue_number}
            onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">عنوان العدد</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">وصف العدد</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ النشر المخطط</label>
            <input
              type="date"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              💡 هذا التاريخ للتخطيط فقط. عند النشر، سيتحول تلقائياً لتاريخ النشر الفعلي
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأقصى للمقالات</label>
            <input
              type="number"
              value={formData.max_articles}
              onChange={(e) => setFormData({ ...formData, max_articles: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              required
              min={issue?.total_articles || 1}
            />
            <p className="mt-2 text-xs text-gray-500">
               لن يمكن إضافة مقالات تتجاوز هذا العدد
            </p>
            {issue && issue.total_articles > 0 && (
              <p className="mt-1 text-xs text-amber-600 font-medium">
                 الحد الأدنى المسموح: {issue.total_articles} (عدد المقالات الحالية)
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">حالة العدد</label>
          <select
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value as 'planned' | 'in-progress' | 'published')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
          >
            <option value="planned">مخطط</option>
            <option value="in-progress">قيد التحضير</option>
            <option value="published">منشور</option>
          </select>
          {articles.length > 0 && (
            <p className="mt-2 text-xs text-amber-600 font-medium">
               تغيير الحالة سيؤثر على جميع المقالات في العدد ({articles.length} مقال)
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={saving || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={saving || deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>حذف العدد</span>
          </button>
        </div>
      </form>

      {/* Articles in Issue Section */}
      {articles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">المقالات في هذا العدد ({articles.length})</h3>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#0D3B66]">{article.article_number}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {article.status === 'published' ? 'منشور' : 'جاهز للنشر'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{article.title}</h4>
                  <p className="text-sm text-gray-600">
                    المؤلفون: {article.authors.map(a => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">الصفحات: {article.pages}</p>
                </div>
                <button
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

      {/* Delete Article Confirmation Modal */}
      {showDeleteArticleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteArticleModal(null)}>
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
              <h2 className="text-2xl font-bold text-gray-800 text-center">حذف المقال من العدد</h2>
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
                <p className="text-sm text-red-600 font-medium">سيتم حذف المقال نهائياً</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
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
              <h2 className="text-2xl font-bold text-gray-800 text-center">تأكيد حذف العدد</h2>
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
                        <span className="font-semibold">تحذير:</span> هذا العدد يحتوي على <span className="font-bold">{issue.total_articles}</span> مقال. لا يمكن حذف العدد إلا إذا كان فارغاً.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-700">
                  <p className="mb-2">هل أنت متأكد من حذف هذا العدد؟</p>
                  <p className="text-sm text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowStatusChangeModal(false)}>
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
              <h2 className="text-2xl font-bold text-gray-800 text-center">تحديث حالة العدد والمقالات</h2>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 text-center font-bold mb-2">
                  تغيير حالة العدد إلى: {
                    pendingStatusChange === 'published' ? 'منشور' :
                    pendingStatusChange === 'in-progress' ? 'قيد التحضير' :
                    'مخطط'
                  }
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 mb-2">
                      <span className="font-semibold">تنبيه:</span> سيتم تحديث حالة جميع المقالات ({articles.length} مقال) تلقائياً:
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1 mr-4">
                      {pendingStatusChange === 'published' ? (
                        <li>• جميع المقالات ستصبح <span className="font-bold">منشورة</span></li>
                      ) : (
                        <li>• جميع المقالات ستصبح <span className="font-bold">جاهزة للنشر</span></li>
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
    </div>
  );
}
