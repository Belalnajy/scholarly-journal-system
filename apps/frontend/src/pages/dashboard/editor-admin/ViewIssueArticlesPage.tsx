import { ArrowRight, Eye, Trash2, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import { getIssueById, Issue } from '../../../services/issuesService';
import { getAllArticles, deleteArticle, Article } from '../../../services/articlesService';

export function ViewIssueArticlesPage() {
  const navigate = useNavigate();
  const { issueId } = useParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (issueId) {
      fetchData();
    }
  }, [issueId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [issueData, allArticles] = await Promise.all([
        getIssueById(issueId!),
        getAllArticles(),
      ]);
      setIssue(issueData);
      // Filter articles for this issue
      const issueArticles = allArticles.filter(a => a.issue_id === issueId);
      setArticles(issueArticles);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل البيانات');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const handleRemoveArticles = async () => {
    if (selectedArticles.length === 0) {
      alert('يرجى اختيار مقال واحد على الأقل');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedArticles.length} مقال من العدد؟`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      // Delete selected articles
      await Promise.all(selectedArticles.map(id => deleteArticle(id)));

      alert('تم حذف المقالات بنجاح!');
      setSelectedArticles([]);
      fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'فشل في حذف المقالات');
      console.error('Error deleting articles:', err);
      alert('حدث خطأ أثناء حذف المقالات. يرجى المحاولة مرة أخرى.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل مقالات العدد...</p>
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-issues')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="مقالات العدد" 
            subtitle={`${issue?.title || ''} - ${articles.length} مقالات`}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {issue && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم العدد</p>
              <p className="text-lg font-bold text-gray-800">{issue.issue_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ النشر</p>
              <p className="text-lg font-bold text-gray-800">{new Date(issue.publish_date).toLocaleDateString('ar-EG')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد المقالات</p>
              <p className="text-lg font-bold text-gray-800">{issue.total_articles} / {issue.max_articles}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">التقدم</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#0D3B66] h-2 rounded-full"
                    style={{ width: `${issue.progress_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {Math.round(issue.progress_percentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              تم اختيار <span className="font-bold text-gray-800">{selectedArticles.length}</span> مقال
            </p>
            <button
              onClick={handleRemoveArticles}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحذف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>حذف من العدد</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">قائمة المقالات</h2>
        </div>

        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">لا توجد مقالات في هذا العدد</p>
            <button
              onClick={() => navigate(`/dashboard/issues/${issueId}/add-article`)}
              className="mt-4 px-6 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90"
            >
              إضافة مقالات
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedArticles.length === articles.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArticles(articles.map(a => a.id));
                        } else {
                          setSelectedArticles([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">رقم المقال</th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">عنوان المقال</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">المؤلف الأول</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الصفحات</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(article.id)}
                        onChange={() => handleToggleSelect(article.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-bold text-[#0D3B66]">{article.article_number}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm text-gray-800 font-medium">{article.title}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">
                      {article.authors[0]?.name || 'غير محدد'}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{article.pages}</td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={article.status === 'published' ? 'accepted' : 'in-progress'} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/articles/${article.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {article.pdf_url && (
                          <button 
                            onClick={() => window.open(article.pdf_url, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تحميل PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص العدد</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">إجمالي المقالات</p>
            <p className="text-3xl font-bold text-[#0D3B66]">{articles.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">المقالات المنشورة</p>
            <p className="text-3xl font-bold text-green-600">
              {articles.filter(a => a.status === 'published').length}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">جاهز للنشر</p>
            <p className="text-3xl font-bold text-amber-600">
              {articles.filter(a => a.status === 'ready-to-publish').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
