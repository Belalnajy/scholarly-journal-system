import { Eye, Edit, Trash2, Download, QrCode, CheckCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import articlesService from '../../../services/articlesService';
import issuesService from '../../../services/issuesService';
import type { Article, ArticleStats } from '../../../services/articlesService';
import type { Issue } from '../../../services/issuesService';

export function ManageArticlesPage() {
  const navigate = useNavigate();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    totalArticles: 0,
    publishedArticles: 0,
    readyToPublish: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalCitations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIssue, setFilterIssue] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterIssue]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load articles with filters
      const statusFilter = filterStatus !== 'all' ? (filterStatus as 'ready-to-publish' | 'published') : undefined;
      const issueFilter = filterIssue !== 'all' ? filterIssue : undefined;
      
      const [articlesData, statsData, issuesData] = await Promise.all([
        articlesService.getAllArticles(issueFilter, statusFilter),
        articlesService.getStats(),
        issuesService.getAllIssues(),
      ]);
      
      setArticles(articlesData);
      setStats(statsData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('فشل في تحميل المقالات');
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

  const handleDeleteArticles = async () => {
    if (selectedArticles.length === 0) {
      toast.error('يرجى اختيار مقال واحد على الأقل');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedArticles.length} مقال؟`)) return;

    try {
      await Promise.all(selectedArticles.map(id => articlesService.deleteArticle(id)));
      toast.success('تم حذف المقالات بنجاح!');
      setSelectedArticles([]);
      loadData();
    } catch (error: any) {
      console.error('Error deleting articles:', error);
      toast.error(error.response?.data?.message || 'فشل في حذف المقالات');
    }
  };

  const handlePublishArticle = async (id: string) => {
    try {
      await articlesService.publishArticle(id);
      toast.success('تم نشر المقال بنجاح!');
      loadData();
    } catch (error: any) {
      console.error('Error publishing article:', error);
      toast.error(error.response?.data?.message || 'فشل في نشر المقال');
    }
  };

  const handleDownloadPDF = (article: Article) => {
    const pdfUrl = articlesService.getArticlePdfUrl(article);
    window.open(pdfUrl, '_blank');
  };

  const getIssueTitle = (issueId: string): string => {
    const issue = issues.find(i => i.id === issueId);
    return issue?.title || 'لم يتم التعيين';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster />
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader title="إدارة المقالات" subtitle="عرض وتحرير المقالات المنشورة" />
        <button
          onClick={() => navigate('/dashboard/create-manual-article')}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء مقال يدوياً</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تصفية حسب الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
            >
              <option value="all">جميع الحالات</option>
              <option value="ready-to-publish">جاهز للنشر</option>
              <option value="published">منشور</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تصفية حسب العدد</label>
            <select
              value={filterIssue}
              onChange={(e) => setFilterIssue(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
            >
              <option value="all">جميع الأعداد</option>
              {issues.map(issue => (
                <option key={issue.id} value={issue.id}>{issue.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">إجمالي المقالات</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📄</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.totalArticles}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المقالات المنشورة</h3>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.publishedArticles}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المقبولة للنشر</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-amber-600 text-xl">⏳</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.readyToPublish}</p>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              تم اختيار <span className="font-bold text-gray-800">{selectedArticles.length}</span> مقال
            </p>
            <button
              onClick={handleDeleteArticles}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف المقالات</span>
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري التحميل...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد مقالات</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">قائمة المقالات</h2>
            </div>

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
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">المؤلف</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">تاريخ النشر</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">العدد</th>
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
                    {article.authors.map(a => a.name).join(', ')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={article.status === 'published' ? 'published' : 'ready-to-publish'} />
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {article.published_date ? new Date(article.published_date).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{getIssueTitle(article.issue_id)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/dashboard/articles/${article.id}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/dashboard/articles/${article.id}/edit`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تحرير"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {article.status === 'ready-to-publish' && (
                        <button 
                          onClick={() => handlePublishArticle(article.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="نشر المقال"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {article.qr_code_url && (
                        <button 
                          onClick={() => window.open(article.qr_code_url, '_blank')}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="عرض QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownloadPDF(article)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="تحميل PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
                            try {
                              await articlesService.deleteArticle(article.id);
                              toast.success('تم حذف المقال بنجاح!');
                              loadData();
                            } catch (error: any) {
                              toast.error(error.response?.data?.message || 'فشل في حذف المقال');
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
