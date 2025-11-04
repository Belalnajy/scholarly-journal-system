import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, User, FileText, AlertCircle, Loader2, BookOpen, Mail, Eye, BookMarked } from 'lucide-react';
import articlesService from '../services/articlesService';
import type { Article } from '../services/articlesService';
import { NewsletterSection } from '../components';

export function ArticlePublicPage() {
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
      
      const data = await articlesService.getArticleById(id!);
      setArticle(data);

      // Increment views
      try {
        await articlesService.incrementArticleViews(id!);
      } catch (err) {
        console.error('Failed to increment views:', err);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل تفاصيل المقال');
      console.error('Error loading article:', err);
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

      // Extract file extension from URL
      const getFileExtension = (url: string) => {
        // Try to get extension from URL
        const urlParts = url.split('?')[0].split('.');
        const ext = urlParts[urlParts.length - 1].toLowerCase();
        
        // Common document extensions
        if (['pdf', 'doc', 'docx'].includes(ext)) {
          return ext;
        }
        
        // Default to pdf if can't determine
        return 'pdf';
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
      window.open(article.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[130px] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#093059] mx-auto mb-4 animate-spin" />
          <p className="text-sm sm:text-base text-[#666666]" dir="rtl">جاري تحميل تفاصيل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 pt-[130px]">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#093059] mb-4" dir="rtl">
                فشل في تحميل المقال
              </h1>
              <p className="text-sm sm:text-base text-[#666666] mb-6" dir="rtl">
                {error || 'المقال غير موجود'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format dates helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: '2-digit',
      day: '2-digit'
    });
  };

  const publishedDate = formatDate(article.published_date);
  const acceptanceDate = formatDate(article.research?.evaluation_date);
  const submissionDate = formatDate(article.research?.submission_date);

  return (
    <div className="min-h-screen bg-gray-50 pt-[130px]">
      {/* Article Details */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Main Card with QR Code */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
              {/* QR Code - Top on mobile, Left on desktop */}
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {article.qr_code_url ? (
                  <img 
                    src={article.qr_code_url} 
                    alt="QR Code" 
                    className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 border-2 border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content - Right */}
              <div className="flex-1 w-full">
                {/* Titles */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-right" dir="rtl">
                  {article.title}
                </h1>
                {article.title_en && (
                  <h2 className="text-base sm:text-lg text-gray-500 mb-4 sm:mb-6 text-left" dir="ltr">
                    {article.title_en}
                  </h2>
                )}

                {/* Authors */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {article.authors.map((author, index) => (
                    <div key={index} className="text-right" dir="rtl">
                      <div className="flex items-center justify-start gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm sm:text-base">{author.name}</span>
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-start gap-2 text-xs sm:text-sm text-gray-600 mb-1">
                        <span className="break-all">{author.email}</span>
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-start gap-2 text-xs sm:text-sm text-gray-600">
                        <span>{author.affiliation}</span>
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specialization */}
                {article.research?.specialization && (
                  <div className="mb-4 sm:mb-6 flex items-center justify-start gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 px-4 py-3" dir="rtl">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {article.research.specialization}
                    </span>
                    <BookMarked className="w-5 h-5 text-[#b2823e] flex-shrink-0" />
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-start gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200" dir="rtl">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">{publishedDate}</span>
                    <span className="text-gray-500 hidden sm:inline">:تاريخ النشر</span>
                    <span className="text-gray-500 sm:hidden">:النشر</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>{article.views_count || 0}</span>
                    <span className="text-gray-500">مشاهدة</span>
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>{article.downloads_count || 0}</span>
                    <span className="text-gray-500">تحميل</span>
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span>{article.pages}</span>
                    <span className="text-gray-500">:الصفحات</span>
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </div>
                </div>

                {/* Download Button */}
                {article.pdf_url && (
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#093059] text-white rounded-lg hover:bg-[#0a3d6b] transition-colors font-medium text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span dir="rtl">تحميل البحث (PDF)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Abstract Section */}
          <div dir="rtl" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-right">
              الملخص:
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-right">
              {article.abstract}
            </p>
          </div>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div dir="rtl" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-right">
                الكلمات المفتاحية:
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-start" dir='rtl'>
                {article.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-gray-700 rounded-lg text-xs sm:text-sm border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Publication Info */}
          <div dir="rtl" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-right">
              معلومات النشر:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-x-8 sm:gap-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b sm:border-b-0">
                <span className="text-gray-600">{publishedDate}</span>
                <span className="font-medium text-gray-900">:تاريخ النشر</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b sm:border-b-0">
                <span className="text-gray-600">{acceptanceDate}</span>
                <span className="font-medium text-gray-900">:تاريخ القبول</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b sm:border-b-0">
                <span className="text-gray-600">-</span>
                <span className="font-medium text-gray-900">:تاريخ المراجعة</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b sm:border-b-0">
                <span className="text-gray-600">{submissionDate}</span>
                <span className="font-medium text-gray-900">:تاريخ الاستلام</span>
              </div>
              <div className="flex justify-between items-center py-2 sm:col-span-2">
                <span className="text-gray-600">{article.pages}</span>
                <span className="font-medium text-gray-900">:الصفحات</span>
              </div>
            </div>
          </div>

          {/* References Section */}
          <div dir="rtl" className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-right">
              المراجع:
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700 text-right">
              <p className="leading-relaxed">
                المراجع الكاملة متوفرة في ملف PDF. يمكنك تحميل البحث للاطلاع على قائمة المراجع الكاملة.
              </p>
            </div>
          </div>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
