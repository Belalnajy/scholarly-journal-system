import { useState, useEffect } from 'react';
import { Bell, ArrowRight, Download, FileText, Loader2, AlertCircle, Award } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { researchService, Research, ResearchFile } from '../../../services/researchService';
import { researchRevisionsService, ResearchRevision } from '../../../services/research-revisions.service';
import { ResearchTimeline } from '../../../components/ResearchTimeline';
import { downloadResearchPdf, downloadSupplementaryFile, downloadRevisionFile, downloadAcceptanceCertificate } from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

export function ViewResearchPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [research, setResearch] = useState<Research | null>(null);
  const [files, setFiles] = useState<ResearchFile[]>([]);
  const [revisions, setRevisions] = useState<ResearchRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResearch();
    }
  }, [id]);

  const loadResearch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) {
        setError('معرف البحث غير صحيح');
        return;
      }

      // Load research, files, and revisions in parallel
      const [researchData, filesData, revisionsData] = await Promise.all([
        researchService.getById(id),
        researchService.getFiles(id).catch(() => []),
        researchRevisionsService.getByResearch(id).catch(() => []),
      ]);

      setResearch(researchData);
      setFiles(filesData);
      setRevisions(revisionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البحث');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Research['status']) => {
    switch (status) {
      case 'under-review':
        return { text: 'تحت المراجعة', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'pending-editor-decision':
        return { text: 'بانتظار قرار المحرر', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      case 'pending':
        return { text: 'قيد الانتظار', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
      case 'accepted':
        return { text: 'مقبول', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'needs-revision':
        return { text: 'يتطلب تعديل', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
      case 'rejected':
        return { text: 'مرفوض', bgColor: 'bg-red-100', textColor: 'text-red-700' };
      case 'published':
        return { text: 'منشور', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      default:
        return { text: 'غير محدد', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Helper function to get file type display name
  const getFileType = (fileType: string | undefined | null): string => {
    if (!fileType) return 'PDF';
    const type = fileType.toLowerCase();
    if (type === 'doc' || type === 'docx') return 'Word';
    return 'PDF';
  };

  const handleDownload = async (file: ResearchFile) => {
    try {
      toast.loading('جاري تحميل الملف...', { id: 'download-file' });
      await downloadSupplementaryFile(file.cloudinary_secure_url, file.file_url, file.file_name);
      toast.success('تم بدء التحميل', { id: 'download-file' });
    } catch (error) {
      toast.error('فشل تحميل الملف', { id: 'download-file' });
      console.error('Error downloading file:', error);
    }
  };

  const handleDownloadMainPDF = async () => {
    if (!research?.cloudinary_secure_url && !research?.file_url) {
      toast.error('لا يوجد ملف للتحميل');
      return;
    }

    try {
      toast.loading('جاري تحميل الملف...', { id: 'download-pdf' });
      await downloadResearchPdf(
        research.cloudinary_secure_url, 
        research.file_url, 
        research.research_number,
        research.file_type
      );
      toast.success('تم بدء التحميل', { id: 'download-pdf' });
    } catch (error) {
      toast.error('فشل تحميل الملف', { id: 'download-pdf' });
      console.error('Error downloading PDF:', error);
    }
  };

  const handleDownloadRevision = async (revision: ResearchRevision) => {
    if (!revision.cloudinary_secure_url && !revision.file_url) {
      toast.error('لا يوجد ملف للتحميل');
      return;
    }

    try {
      toast.loading('جاري تحميل الملف...', { id: 'download-revision' });
      await downloadRevisionFile(
        revision.cloudinary_secure_url, 
        revision.file_url, 
        revision.revision_number,
        revision.file_type
      );
      toast.success('تم بدء التحميل', { id: 'download-revision' });
    } catch (error) {
      toast.error('فشل تحميل ملف التعديل', { id: 'download-revision' });
      console.error('Error downloading revision:', error);
    }
  };

  const handleDownloadOriginalPDF = async () => {
    // Get the first submitted revision to access original_data
    const firstRevision = revisions
      .filter(r => r.status === 'submitted')
      .sort((a, b) => a.revision_number - b.revision_number)[0];

    const originalCloudinaryUrl = firstRevision?.original_data?.cloudinary_secure_url;
    const originalFileUrl = firstRevision?.original_data?.file_url;
    const originalFileType = firstRevision?.original_data?.file_type;

    if (!originalCloudinaryUrl && !originalFileUrl) {
      toast.error('لا يوجد ملف أصلي للتحميل');
      return;
    }

    try {
      toast.loading('جاري تحميل الملف الأصلي...', { id: 'download-original-pdf' });
      await downloadResearchPdf(
        originalCloudinaryUrl, 
        originalFileUrl, 
        research?.research_number || 'original',
        originalFileType
      );
      toast.success('تم بدء التحميل', { id: 'download-original-pdf' });
    } catch (error) {
      toast.error('فشل تحميل الملف الأصلي', { id: 'download-original-pdf' });
      console.error('Error downloading original PDF:', error);
    }
  };

  const handleDownloadAcceptanceCertificate = async () => {
    if (!research?.id) {
      toast.error('معرف البحث غير صحيح');
      return;
    }

    try {
      toast.loading('جاري تحميل شهادة القبول...', { id: 'download-certificate' });
      
      // Get certificate URL from API
      const certificateUrl = await researchService.getAcceptanceCertificateUrl(research.id);
      
      // Download the certificate
      await downloadAcceptanceCertificate(certificateUrl, research.research_number);
      
      toast.success('تم بدء التحميل', { id: 'download-certificate' });
    } catch (error) {
      toast.error('فشل تحميل شهادة القبول', { id: 'download-certificate' });
      console.error('Error downloading acceptance certificate:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البحث...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !research) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error || 'البحث غير موجود'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/my-research')}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          العودة للقائمة
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(research.status);

  // Get submitted revisions and first revision for original data
  const submittedRevisions = revisions.filter(r => r.status === 'submitted');
  const hasSubmittedRevisions = submittedRevisions.length > 0;
  const firstRevision = submittedRevisions.sort((a, b) => a.revision_number - b.revision_number)[0];
  const hasOriginalFile = firstRevision?.original_data && 
    (firstRevision.original_data.cloudinary_secure_url || firstRevision.original_data.file_url);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">عرض البحث</h1>
          <p className="text-gray-600">{research.title}</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/my-research')}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors bg-white rounded-lg border border-gray-200 hover:border-[#0D3B66]"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة للقائمة</span>
      </button>

      {/* Timeline */}
      <ResearchTimeline 
        research={research} 
        revisions={revisions}
      />

      {/* Revision History - Show submitted revisions */}
      {hasSubmittedRevisions && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 overflow-hidden">
          <div className="p-6 border-b border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-1">تعديلاتي على البحث</h2>
            <p className="text-sm text-gray-600">
              التعديلات التي قمت بإجرائها على البحث
            </p>
          </div>
          <div className="p-6 space-y-4">
            {submittedRevisions
              .sort((a, b) => b.revision_number - a.revision_number)
              .map((revision) => (
                <div key={revision.id} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                        المراجعة #{revision.revision_number}
                      </span>
                      {revision.submitted_at && (
                        <span className="text-xs text-gray-500">
                          {formatDate(revision.submitted_at)}
                        </span>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      تم الإرسال
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">ملاحوظاتي حول التعديلات:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                        {revision.revision_notes}
                      </p>
                    </div>
                    
                    {(revision.cloudinary_secure_url || revision.file_url) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>تم رفع ملف جديد</span>
                        </div>
                        <button
                          onClick={() => handleDownloadRevision(revision)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          <span>تحميل التعديل</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Research Title and Status */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex-1">
              {research.title}
            </h2>
            <span className={`${statusConfig.bgColor} ${statusConfig.textColor} px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap`}>
              {statusConfig.text}
            </span>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold">تاريخ التقديم:</span> {formatDate(research.submission_date)}
            </div>
            <div>
              <span className="font-semibold">آخر تحديث:</span> {formatDate(research.updated_at)}
            </div>
            <div>
              <span className="font-semibold">التصنيف:</span> {research.specialization}
            </div>
          </div>
        </div>

        {/* Research Details */}
        <div className="p-8 space-y-8">
          {/* Abstract Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">ملخص البحث</h3>
            <p className="text-gray-700 leading-relaxed">
              {research.abstract}
            </p>
          </div>

          {/* Keywords Section */}
          {research.keywords && research.keywords.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">الكلمات المفتاحية</h3>
              <div className="flex flex-wrap gap-2">
                {research.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Acceptance Certificate Section - Show only if research is accepted or published */}
          {(research.status === 'accepted' || research.status === 'published') && 
           research.acceptance_certificate_cloudinary_public_id && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">شهادة قبول البحث</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-6 border-2 border-green-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-green-400 shadow-sm">
                      <Award className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">شهادة قبول البحث</p>
                      <p className="text-sm text-gray-600">
                        تهانينا! تم قبول بحثك للنشر • {research.research_number}
                      </p>
                      {research.evaluation_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          تاريخ القبول: {formatDate(research.evaluation_date)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadAcceptanceCertificate}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span>تحميل الشهادة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Original PDF Section - Show only if there are submitted revisions */}
          {hasOriginalFile && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">ملف البحث الأصلي (قبل التعديلات)</h3>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                      <FileText className="w-10 h-10 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">الملف الأصلي (PDF)</p>
                      <p className="text-sm text-gray-600">
                        {research.research_number} • النسخة الأولى قبل التعديلات
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadOriginalPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span>تحميل الملف الأصلي</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main PDF Section - Current Version */}
          {(research.cloudinary_secure_url || research.file_url) && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {hasSubmittedRevisions 
                  ? 'ملف البحث الحالي (بعد التعديلات)' 
                  : 'ملف البحث الرئيسي'}
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {hasSubmittedRevisions 
                          ? `الملف الحالي (${getFileType(research.file_type)})` 
                          : `ملف البحث (${getFileType(research.file_type)})`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {research.research_number} • 
                        {hasSubmittedRevisions 
                          ? `النسخة المعدلة (${submittedRevisions.length} تعديل)` 
                          : `${getFileType(research.file_type)} Document`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadMainPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    <span>
                      {hasSubmittedRevisions 
                        ? 'تحميل النسخة الحالية' 
                        : 'تحميل البحث'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Supplementary Files Section */}
          {files.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">الملفات الإضافية</h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <FileText className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{file.file_name}</p>
                          <p className="text-sm text-gray-500">
                            {file.file_type} • {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium shadow-md hover:shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل الملف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
