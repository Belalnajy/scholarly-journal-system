import { Calendar, User, Download, Eye, FileText, BookMarked } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import type { Article } from '../../services/articlesService';

interface ArticleCardProps {
  article: Article;
  articleNumber: number;
}

export function ArticleCard({ article, articleNumber }: ArticleCardProps) {
  // Generate verification URL for QR code
  const verificationUrl = `${window.location.origin}/verify-article/${article.id}`;

  // Get first author
  const firstAuthor =
    article.authors && article.authors.length > 0 ? article.authors[0] : null;

  // Format date
  const formattedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
      })
    : 'غير محدد';

  // Download file using blob to force download
  const handleDownload = async () => {
    if (!article.pdf_url) {
      alert('الملف غير متوفر لهذا المقال');
      return;
    }

    // Increment download count in background
    (async () => {
      try {
        const articlesService = await import('../../services/articlesService');
        await articlesService.default.incrementDownloads(article.id);
      } catch (err) {
        console.error('Failed to increment downloads:', err);
      }
    })();

    try {
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

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-sm transition-all hover:shadow-lg">
      {/* Header with Article Number, Date and QR Code */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#f5f7fa] px-5 py-3">
        {/* QR Code - Left Side */}
        <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-[#093059] bg-white p-3">
          <QRCodeSVG
            value={verificationUrl}
            size={120}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Center - Date */}
        <div className="flex items-center gap-2 text-sm text-[#666666]">
          <Calendar className="size-4" />
          <span dir="rtl">{formattedDate}</span>
        </div>

        {/* Right - Article Number */}
        <div className="rounded-lg bg-[#093059] px-4 py-1.5">
          <span className="text-sm font-bold text-white" dir="rtl">
            البحث رقم {articleNumber}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {/* Title */}
        <h3
          className="mb-4 text-right text-xl font-bold text-[#093059] sm:text-2xl"
          dir="rtl"
        >
          {article.title}
        </h3>

        {/* Author Info */}
        <div className="mb-4 flex flex-col items-end gap-2 text-right">
          {firstAuthor && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#093059] sm:text-lg">
                  {firstAuthor.name}
                </span>
                <User className="size-5 text-[#b2823e]" />
              </div>
              <span className="text-sm text-[#666666] sm:text-base">
                {firstAuthor.affiliation}
              </span>
            </>
          )}
        </div>

        {/* Specialization */}
        {article.research?.specialization && (
          <div className="mb-4 flex items-center justify-end gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2">
            <span className="text-sm font-medium text-[#093059] sm:text-base" dir="rtl">
              {article.research.specialization}
            </span>
            <BookMarked className="size-5 text-[#b2823e]" />
          </div>
        )}

        {/* Abstract */}
        <div className="mb-4">
          <h4 className="mb-2 text-right text-base font-bold text-[#093059] sm:text-lg">
            الملخص:
          </h4>
          <p className="text-right text-sm leading-relaxed text-[#666666] sm:text-base">
            {article.abstract}
          </p>
        </div>

        {/* Keywords */}
        <div className="mb-6">
          <h4 className="mb-2 text-right text-base font-bold text-[#093059] sm:text-lg">
            الكلمات المفتاحية:
          </h4>
          <div className="flex flex-wrap justify-end gap-2">
            {article.keywords.map((keyword, index) => (
              <span
                key={index}
                className="rounded-lg bg-[#e8f0f8] px-3 py-1 text-sm text-[#093059]"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-4 border-t border-[#e5e5e5] pt-4 text-sm text-[#666666]">
          <div className="flex items-center gap-1.5">
            <span dir="rtl">{article.pages || 'غير محدد'}</span>
            <FileText className="size-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span dir="rtl">{article.downloads_count || 0} تحميل</span>
            <Download className="size-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span dir="rtl">{article.views_count || 0} مشاهدة</span>
            <Eye className="size-4" />
          </div>
        </div>

        {/* DOI */}
        <div className="mb-6 text-right">
          <span className="text-sm text-[#666666]">DOI: {article.doi}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {article.pdf_url && (
            <button
              onClick={handleDownload}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#093059] px-4 py-2 transition-colors hover:bg-[#0a4a7a]"
            >
              <span className="text-sm font-bold text-white sm:text-base">
                تحميل البحث
              </span>
              <Download className="size-5 text-white" />
            </button>
          )}
          <Link
            to={`/article/${article.id}`}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#b2823e] px-4 py-2 transition-colors hover:bg-[#b2823e] group"
          >
            <span className="text-sm font-bold text-[#b2823e] transition-colors group-hover:text-white sm:text-base">
              قراءة التفاصيل
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
