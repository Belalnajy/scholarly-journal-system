import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Calendar, User, FileText, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import articlesService from '../services/articlesService';
import type { Article } from '../services/articlesService';
import { NewsletterSection } from '../components';

export function VerifyArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use verify endpoint to get article and increment views
      const data = await articlesService.verifyArticle(id!);
      setArticle(data);
    } catch (err: any) {
      setError(err.message || 'فشل في التحقق من المقال');
      console.error('Error verifying article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!article?.pdf_url) return;
    
    try {
      // Increment download count
      try {
        await articlesService.incrementDownloads(article.id);
      } catch (err) {
        console.error('Failed to increment downloads:', err);
      }

      // Download the PDF
      const response = await fetch(article.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article.article_number || 'article'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      window.open(article.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[130px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#093059] mx-auto mb-4 animate-spin" />
          <p className="text-[#666666]" dir="rtl">جاري التحقق من المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[130px]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-[#093059] mb-4" dir="rtl">
                فشل التحقق من المقال
              </h1>
              <p className="text-[#666666] mb-6" dir="rtl">
                {error || 'المقال غير موجود أو غير منشور'}
              </p>
              <Link
                to="/issues"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#093059] text-white rounded-lg hover:bg-[#0a3d6b] transition-colors"
              >
                <span dir="rtl">العودة للأعداد</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstAuthor = article.authors && article.authors.length > 0 ? article.authors[0] : null;
  const formattedDate = article.published_date 
    ? new Date(article.published_date).toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      })
    : 'غير محدد';

  return (
    <div className="min-h-screen bg-white pt-[130px]">
      {/* Success Header */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Green Check Circle */}
            <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={3} />
            </div>
            
            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-green-600" dir="rtl">
                تم اعتماد هذا البحث في المجلة العلمية
              </h1>
              <p className="text-lg text-green-600/80" dir="rtl">
                هذا البحث محكّم ومعتمد ومنشور رسمياً في مجلتنا العلمية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center" dir="rtl">
            {article.title}
          </h2>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Right Column */}
            <div className="space-y-4" dir="rtl">
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>{article.issue?.title || 'غير محدد'}</span>
                <BookOpen className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>رقم العدد: {article.issue?.issue_number || 'غير محدد'}</span>
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>تاريخ النشر: {formattedDate}</span>
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
            </div>

            {/* Left Column */}
            <div className="space-y-4" dir="rtl">
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>{firstAuthor?.affiliation || 'غير محدد'}</span>
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>المؤلف / المؤلفون: {firstAuthor?.name || 'غير معروف'}</span>
                <User className="w-5 h-5 text-gray-500" />
              </div>
              {article.doi && (
                <div className="flex items-center justify-end gap-3 text-gray-700">
                  <span className="text-blue-600">DOI: {article.doi}</span>
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex items-center justify-end gap-3 text-gray-700">
                <span>الصفحات: {article.pages}</span>
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Abstract Section */}
          <div dir="rtl" className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              ملخص البحث:
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {article.abstract}
            </p>
          </div>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div dir="rtl" className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                الاهتمامات البحثية
              </h3>
              <div className="flex flex-wrap gap-3 justify-end">
                {article.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => window.location.href = `/issues/${article.issue_id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
            >
              <FileText className="w-5 h-5" />
              <span dir="rtl">عرض التفاصيل الكاملة</span>
            </button>
            {article.pdf_url && (
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#093059] text-white rounded-xl hover:bg-[#0a3d6b] transition-colors font-bold"
              >
                <Download className="w-5 h-5" />
                <span dir="rtl">تحميل المقال (PDF)</span>
              </button>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center text-gray-600 text-sm leading-relaxed" dir="rtl">
            <p>يمكنك التحقق من صحة أي بحث منشور في مجلتنا عن طريق مسح رمز QR المرفق معه</p>
            <p>أو زيارة موقعنا الإلكتروني والبحث عن المقال باستخدام رقم DOI</p>
          </div>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
