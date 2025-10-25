import { Download, Eye, FileText, Calendar, Building2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { NewsletterSection } from '../components';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { researchService, Research, ResearchFile } from '../services/researchService';

export function ResearchDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [research, setResearch] = useState<Research | null>(null);
  const [files, setFiles] = useState<ResearchFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResearch(id);
    } else {
      setError('معرف البحث غير موجود');
      setIsLoading(false);
    }
  }, [id]);

  const loadResearch = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load research data
      const data = await researchService.getById(researchId);
      setResearch(data);
      
      // Load research files
      const filesData = await researchService.getFiles(researchId);
      setFiles(filesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البحث');
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

  const handleDownload = () => {
    if (files && files.length > 0) {
      const mainFile = files.find((f) => f.file_category === 'main');
      if (mainFile) {
        window.open(mainFile.file_url, '_blank');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[160px]">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#093059] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل البحث...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !research) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[160px]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
                <p className="text-red-700">{error || 'البحث غير موجود'}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => id && loadResearch(id)}
                className="px-6 py-3 bg-[#093059] text-white rounded-lg hover:bg-[#0a3d6b] transition-colors"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>العودة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-[160px]">
      {/* Header Section with QR Code */}
      <div className="container mx-auto px-4">
        <div className="bg-white py-8 shadow-sm w-full max-w-[1360px] mx-auto px-8 rounded-2xl">
          <div className="flex flex-col gap-6">
          {/* Title Section with QR */}
          <div className="flex items-start justify-between gap-6">
            {/* QR Code - على اليسار */}
            <div className="flex items-start justify-start">
              <div className="flex size-20 items-center justify-center rounded-lg border-4 border-[#093059] bg-white p-2">
                <QRCodeSVG 
                  value={window.location.href}
                  size={64}
                  level="H"
                  includeMargin={false}
                  fgColor="#093059"
                />
              </div>
            </div>

            {/* Title and Subtitle - على اليمين */}
            <div className="flex flex-1 flex-col gap-2 text-right">
              <h1 className="text-2xl font-bold text-[#093059]" dir="rtl">
                {research.title}
              </h1>
              {research.title_en && (
                <p className="text-base text-[#999999]" dir="ltr">
                  {research.title_en}
                </p>
              )}
            </div>
          </div>

          {/* Research Info */}
          <div className="flex flex-col gap-4 border-t border-[#e0e0e0] pt-6">
            <div className="flex items-center justify-end gap-2 text-right">
              <span className="text-base font-medium text-[#093059]" dir="rtl">
                {research.specialization}
              </span>
              <Building2 className="size-4 text-[#093059]" />
            </div>
            <div className="flex items-center justify-end gap-2 text-right">
              <span className="text-sm text-[#666666]" dir="rtl">
                رقم البحث: {research.research_number}
              </span>
              <FileText className="size-4 text-[#666666]" />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-between border-t border-[#e0e0e0] pt-4 text-sm text-[#666666]">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span dir="rtl">تاريخ التقديم: {formatDate(research.submission_date)}</span>
            </div>
            {research.views_count !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="size-4" />
                <span dir="rtl">{research.views_count} مشاهدة</span>
              </div>
            )}
            {research.downloads_count !== undefined && (
              <div className="flex items-center gap-2">
                <Download className="size-4" />
                <span dir="rtl">{research.downloads_count} تحميل</span>
              </div>
            )}
          </div>

          {/* Download Button */}
          {files && files.length > 0 && (
            <div className="flex justify-end border-t border-[#e0e0e0] pt-6">
              <button 
                onClick={handleDownload}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#093059] px-8 transition-colors hover:bg-[#0a3d6b]"
              >
                <Download className="size-4 text-white" />
                <span className="text-sm font-medium text-white" dir="rtl">
                  تحميل البحث (PDF)
                </span>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-[1360px] mx-auto">
          <div className="space-y-6">
          {/* Abstract Section */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-right text-xl font-bold text-[#093059]" dir="rtl">
              الملخص:
            </h2>
            <p className="text-right text-base leading-relaxed text-[#666666]" dir="rtl">
              {research.abstract}
            </p>
            {research.abstract_en && (
              <>
                <h2 className="mb-4 mt-6 text-left text-xl font-bold text-[#093059]" dir="ltr">
                  Abstract:
                </h2>
                <p className="text-left text-base leading-relaxed text-[#666666]" dir="ltr">
                  {research.abstract_en}
                </p>
              </>
            )}
          </div>

          {/* Keywords Section */}
          {research.keywords && Array.isArray(research.keywords) && research.keywords.length > 0 && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-right text-xl font-bold text-[#093059]" dir="rtl">
                الكلمات المفتاحية:
              </h2>
              <div className="flex flex-wrap justify-end gap-3">
                {research.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-md bg-[#e8f0f8] px-4 py-2 text-sm text-[#093059]"
                    dir="rtl"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              {research.keywords_en && Array.isArray(research.keywords_en) && research.keywords_en.length > 0 && (
                <>
                  <h2 className="mb-4 mt-6 text-left text-xl font-bold text-[#093059]" dir="ltr">
                    Keywords:
                  </h2>
                  <div className="flex flex-wrap justify-start gap-3">
                    {research.keywords_en.map((keyword, index) => (
                      <span
                        key={index}
                        className="rounded-md bg-[#e8f0f8] px-4 py-2 text-sm text-[#093059]"
                        dir="ltr"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Research Timeline */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-right text-xl font-bold text-[#093059]" dir="rtl">
              معلومات البحث:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] p-4 text-center">
                <p className="text-sm font-medium text-[#093059]" dir="rtl">
                  تاريخ التقديم
                </p>
                <p className="text-xs text-[#666666]" dir="rtl">
                  {formatDate(research.submission_date)}
                </p>
              </div>
              {research.evaluation_date && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] p-4 text-center">
                  <p className="text-sm font-medium text-[#093059]" dir="rtl">
                    تاريخ التقييم
                  </p>
                  <p className="text-xs text-[#666666]" dir="rtl">
                    {formatDate(research.evaluation_date)}
                  </p>
                </div>
              )}
              {research.published_date && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] p-4 text-center">
                  <p className="text-sm font-medium text-[#093059]" dir="rtl">
                    تاريخ النشر
                  </p>
                  <p className="text-xs text-[#666666]" dir="rtl">
                    {formatDate(research.published_date)}
                  </p>
                </div>
              )}
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] bg-[#f9f9f9] p-4 text-center">
                <p className="text-sm font-medium text-[#093059]" dir="rtl">
                  الحالة
                </p>
                <p className="text-xs text-[#666666]" dir="rtl">
                  {research.status === 'published' ? 'منشور' : 
                   research.status === 'accepted' ? 'مقبول' :
                   research.status === 'under-review' ? 'تحت المراجعة' :
                   research.status === 'needs-revision' ? 'يحتاج تعديل' :
                   research.status === 'rejected' ? 'مرفوض' : research.status}
                </p>
              </div>
            </div>
          </div>

          {/* Files Section */}
          {files && files.length > 0 && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-right text-xl font-bold text-[#093059]" dir="rtl">
                الملفات المرفقة:
              </h2>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-[#e0e0e0] rounded-lg hover:bg-[#f9f9f9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-[#093059]" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#093059]" dir="rtl">
                          {file.file_name}
                        </p>
                        <p className="text-xs text-[#666666]" dir="rtl">
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#093059] text-white rounded-lg hover:bg-[#0a3d6b] transition-colors"
                    >
                      <Download className="size-4" />
                      <span className="text-sm" dir="rtl">تحميل</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <NewsletterSection />
    </div>
  );
}
