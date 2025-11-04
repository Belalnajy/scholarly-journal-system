import { ArrowRight, Download, FileText, Calendar, User, BookOpen, Eye, Loader2, BookMarked } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import { getArticleById, Article } from '../../../services/articlesService';

export function ArticleDetailsPage() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getArticleById(articleId!);
      setArticle(data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل تفاصيل المقال');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!article?.pdf_url) {
      alert('الملف غير متوفر لهذا المقال');
      return;
    }

    try {
      // Increment download count
      try {
        const articlesService = await import('../../../services/articlesService');
        await articlesService.default.incrementDownloads(article.id);
        // Refresh article data to show updated count
        await fetchArticle();
      } catch (err) {
        console.error('Failed to increment downloads:', err);
      }

      // Extract file extension from URL
      const getFileExtension = (url: string) => {
        const urlParts = url.split('?')[0].split('.');
        const ext = urlParts[urlParts.length - 1].toLowerCase();
        return ['pdf', 'doc', 'docx'].includes(ext) ? ext : 'pdf';
      };

      // Download the file
      const response = await fetch(article.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = getFileExtension(article.pdf_url);
      link.download = `${article.article_number || 'article'}.${fileExtension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(article.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">جاري تحميل تفاصيل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'المقال غير موجود'}</p>
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
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-articles')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="تفاصيل المقال" 
            subtitle={`رقم المقال: ${article.article_number}`}
          />
        </div>
      </div>

      {/* Article Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{article.title}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <StatusBadge status={article.status === 'published' ? 'accepted' : 'in-progress'} />
              <span className="text-sm text-gray-600">
                {article.issue?.title || 'غير محدد'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">المشاهدات</span>
            </div>
            <p className="text-xl font-bold text-[#0D3B66]">{article.views_count}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">التحميلات</span>
            </div>
            <p className="text-xl font-bold text-[#0D3B66]">{article.downloads_count}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">الصفحات</span>
            </div>
            <p className="text-xl font-bold text-[#0D3B66]">{article.pages}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">تاريخ الإنشاء</span>
            </div>
            <p className="text-sm font-bold text-[#0D3B66]">{new Date(article.created_at).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">الملخص</h2>
            <p className="text-gray-700 leading-relaxed">{article.abstract}</p>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">الكلمات المفتاحية</h2>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Authors */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">المؤلفون</h2>
            <div className="space-y-3">
              {article.authors.map((author, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{author.name}</p>
                    <p className="text-sm text-gray-600">{author.affiliation}</p>
                    <a href={`mailto:${author.email}`} className="text-xs text-blue-600 hover:underline">
                      {author.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialization */}
          {article.research?.specialization && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">التخصص</h2>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg">
                <BookMarked className="w-6 h-6 text-[#b2823e] flex-shrink-0" />
                <p className="text-lg font-semibold text-gray-800">{article.research.specialization}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          {/* Issue Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات العدد</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">رقم العدد</p>
                  <p className="font-bold text-gray-800">{article.issue?.issue_number || 'غير محدد'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">عنوان العدد</p>
                  <p className="font-bold text-gray-800">{article.issue?.title || 'غير محدد'}</p>
                </div>
              </div>
              {article.issue?.publish_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ النشر</p>
                    <p className="font-bold text-gray-800">{new Date(article.issue.publish_date).toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DOI */}
          {article.doi && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">DOI</h3>
              <p className="text-sm text-blue-600 font-mono break-all">{article.doi}</p>
            </div>
          )}

          {/* QR Code */}
          {article.qr_code_url && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">رمز QR للتحقق</h3>
              <div className="flex justify-center">
                <img src={article.qr_code_url} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">امسح الرمز للتحقق من المقال</p>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">الإجراءات</h3>
            <div className="space-y-2">
              <button 
                onClick={handleDownloadPDF}
                disabled={!article.pdf_url}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الملف</span>
              </button>
              <button 
                onClick={() => navigate(`/dashboard/articles/${articleId}/edit`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                <span>تحرير المقال</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
