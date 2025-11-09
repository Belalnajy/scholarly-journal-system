import { ArrowRight, Save, Loader2, Plus, Trash2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import { getArticleById, updateArticle, Article, ArticleAuthor } from '../../../services/articlesService';
import { getAllIssues, Issue } from '../../../services/issuesService';
import { researchService, Research } from '../../../services/researchService';

export function EditArticlePage() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [research, setResearch] = useState<Research | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    abstract: '',
    abstract_en: '',
    keywords: '',
    keywords_en: '',
    issue_id: '',
    pages: '',
    doi: '',
    status: 'ready-to-publish' as 'ready-to-publish' | 'published',
    authors: [] as ArticleAuthor[],
  });

  useEffect(() => {
    if (articleId) {
      fetchData();
    }
  }, [articleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [articleData, issuesData] = await Promise.all([
        getArticleById(articleId!),
        getAllIssues(),
      ]);
      setArticle(articleData);
      setIssues(issuesData);
      
      // Fetch research data if research_id exists
      let researchData: Research | null = null;
      if (articleData.research_id) {
        try {
          researchData = await researchService.getById(articleData.research_id);
          setResearch(researchData);
        } catch (err) {
          console.error('Failed to fetch research:', err);
        }
      }
      
      // If authors array is empty or has default data, fill from research
      let authors = articleData.authors;
      if (researchData && researchData.user && (!authors || authors.length === 0 || authors[0]?.name === 'غير معروف')) {
        authors = [{
          name: researchData.user.name || 'غير معروف',
          affiliation: researchData.user.affiliation || 'غير محدد',
          email: researchData.user.email || 'no-email@example.com',
        }];
      }
      
      setFormData({
        title: articleData.title,
        title_en: articleData.title_en || '',
        abstract: articleData.abstract,
        abstract_en: articleData.abstract_en || '',
        keywords: articleData.keywords.join(', '),
        keywords_en: articleData.keywords_en?.join(', ') || '',
        issue_id: articleData.issue_id,
        pages: articleData.pages,
        doi: articleData.doi || '',
        status: articleData.status,
        authors: authors,
      });
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات المقال');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      await updateArticle(articleId!, {
        title: formData.title,
        title_en: formData.title_en || undefined,
        abstract: formData.abstract,
        abstract_en: formData.abstract_en || undefined,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        keywords_en: formData.keywords_en ? formData.keywords_en.split(',').map(k => k.trim()).filter(k => k) : undefined,
        issue_id: formData.issue_id,
        pages: formData.pages,
        doi: formData.doi || undefined,
        status: formData.status,
        authors: formData.authors,
      });

      toast.success('تم تحديث المقال بنجاح!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      });
      
      setTimeout(() => navigate(`/dashboard/articles/${articleId}`), 1000);
    } catch (err: any) {
      setError(err.message || 'فشل في تحديث المقال');
      console.error('Error updating article:', err);
      toast.error(err.message || 'حدث خطأ أثناء تحديث المقال. يرجى المحاولة مرة أخرى.', {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAuthorChange = (index: number, field: keyof ArticleAuthor, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setFormData({ ...formData, authors: newAuthors });
  };

  const addAuthor = () => {
    setFormData({
      ...formData,
      authors: [...formData.authors, { name: '', affiliation: '', email: '' }],
    });
  };

  const removeAuthor = (index: number) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل بيانات المقال...</p>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Toaster />
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/manage-articles')}
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
          onClick={() => navigate(`/dashboard/articles/${articleId}`)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="تحرير المقال" 
            subtitle={`رقم المقال: ${article?.article_number || ''}`}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Research Info Card */}
      {research && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">معلومات البحث الأصلي</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">رقم البحث:</span>
              <span className="mr-2 text-gray-600">{research.research_number}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">الباحث:</span>
              <span className="mr-2 text-gray-600">{research.user?.name || 'غير معروف'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">البريد الإلكتروني:</span>
              <span className="mr-2 text-gray-600">{research.user?.email || 'غير محدد'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">الانتماء المؤسسي:</span>
              <span className="mr-2 text-gray-600">{research.user?.affiliation || 'غير محدد'}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">المعلومات الأساسية</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم المقال</label>
              <input
                type="text"
                value={article?.article_number || ''}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المقال (عربي)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان المقال (إنجليزي)</label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الملخص (عربي)</label>
              <textarea
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الملخص (إنجليزي)</label>
              <textarea
                value={formData.abstract_en}
                onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الكلمات المفتاحية (عربي)
                <span className="text-xs text-gray-500 font-normal mr-2">(افصل بفاصلة)</span>
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="الذكاء الاصطناعي, التعليم العالي, ..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الكلمات المفتاحية (إنجليزي)
                <span className="text-xs text-gray-500 font-normal mr-2">(افصل بفاصلة)</span>
              </label>
              <input
                type="text"
                value={formData.keywords_en}
                onChange={(e) => setFormData({ ...formData, keywords_en: e.target.value })}
                placeholder="AI, Higher Education, ..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">المؤلفون</h2>
            <button
              type="button"
              onClick={addAuthor}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مؤلف</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.authors.map((author, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700">مؤلف {index + 1}</h3>
                  {formData.authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
                    <input
                      type="text"
                      value={author.name}
                      onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الانتماء المؤسسي</label>
                    <input
                      type="text"
                      value={author.affiliation}
                      onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={author.email}
                      onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">معلومات النشر</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">العدد</label>
              <select
                value={formData.issue_id}
                onChange={(e) => setFormData({ ...formData, issue_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
                required
              >
                <option value="">اختر العدد</option>
                {issues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title} - {issue.issue_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الصفحات</label>
              <input
                type="text"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                placeholder="1-25"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">DOI</label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                placeholder="10.12345/journal.2024.001"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ready-to-publish' | 'published' })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
              >
                <option value="ready-to-publish">جاهز للنشر</option>
                <option value="published">منشور</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
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
            onClick={() => navigate(`/dashboard/articles/${articleId}`)}
            disabled={saving}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
