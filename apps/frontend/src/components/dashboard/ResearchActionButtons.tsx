// Research Action Buttons Component
// Used in: ManageResearchPage, EditorDashboard

import { Eye, Send, Award, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { researchService } from '../../services/researchService';
import toast from 'react-hot-toast';
import type { StatusType } from './StatusBadge';
import { useState } from 'react';
import { PDFViewer } from '../PDFViewer';
import { CustomizeCertificateModal } from './CustomizeCertificateModal';

interface ResearchActionButtonsProps {
  researchId: string;
  status: StatusType;
  showAssignButton?: boolean;
  hasCertificate?: boolean;
  onCertificateGenerated?: () => void;
  originalStatus?: string; // Original research status for certificate logic
  certificateUrl?: string; // URL for acceptance certificate
  researchTitle?: string; // For customize modal
  researcherName?: string; // For customize modal
  currentCertificateMessage?: string; // Current certificate message for editing
}

export function ResearchActionButtons({ 
  researchId, 
  status, 
  showAssignButton = true,
  hasCertificate = false,
  onCertificateGenerated,
  originalStatus,
  certificateUrl,
  researchTitle = '',
  researcherName = '',
  currentCertificateMessage = ''
}: ResearchActionButtonsProps) {
  const navigate = useNavigate();
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleViewDetails = () => {
    // للمحرر: عرض تفاصيل البحث حسب الحالة
    if (status === 'pending') {
      // البحث في انتظار القرار النهائي - صفحة اتخاذ القرار
      navigate(`/dashboard/pending-decision/${researchId}`);
    } else if (status === 'needs-revision') {
      // البحث يتطلب تعديل - صفحة خاصة
      navigate(`/dashboard/pending-revision/${researchId}`);
    } else if (status === 'accepted' || status === 'rejected') {
      // البحث مقبول أو مرفوض - صفحة تفاصيل المراجعة
      navigate(`/dashboard/review-details/${researchId}`);
    } else {
      // إذا كان تحت المراجعة (لم يُقيّم بعد)، اعرض تفاصيل البحث
      navigate(`/dashboard/research-details/${researchId}`);
    }
  };

  const getButtonTitle = () => {
    if (status === 'accepted' || status === 'rejected' || status === 'needs-revision' || status === 'pending') {
      return 'عرض تفاصيل المراجعة';
    }
    return 'عرض تفاصيل البحث';
  };

  const handleGenerateCertificate = async (customMessage?: string) => {
    try {
      setIsGenerating(true);
      setShowCustomizeModal(false);
      toast.loading('جاري توليد شهادة القبول...', { id: 'gen-cert' });
      
      await researchService.generateAcceptanceCertificate(researchId, customMessage);
      
      toast.success('تم توليد الشهادة بنجاح', { id: 'gen-cert' });
      
      // Notify parent to refresh data
      if (onCertificateGenerated) {
        onCertificateGenerated();
      }
    } catch (error) {
      toast.error('فشل توليد الشهادة', { id: 'gen-cert' });
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenCustomizeModal = () => {
    setShowCustomizeModal(true);
  };

  // Check if certificate button should be shown
  const shouldShowCertificateButton = !hasCertificate && (
    status === 'accepted' || 
    originalStatus === 'accepted' || 
    originalStatus === 'published'
  );

  const handleViewCertificate = () => {
    if (certificateUrl) {
      setShowPDFViewer(true);
    } else {
      toast.error('لا يوجد خطاب قبول للمعاينة');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {/* Certificate Status Indicator - Show if certificate exists */}
        {hasCertificate && (status === 'accepted' || originalStatus === 'accepted' || originalStatus === 'published') && (
          <>
            <button
              onClick={handleViewCertificate}
              className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group relative"
              title="معاينة خطاب القبول"
            >
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">معاينة</span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                معاينة خطاب القبول
              </span>
            </button>
            
            {/* Regenerate Button - Allow editing and regenerating certificate */}
            <button
              onClick={handleOpenCustomizeModal}
              className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors group relative"
              title="إعادة توليد خطاب القبول"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">تعديل</span>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                تعديل وإعادة توليد الخطاب
              </span>
            </button>
          </>
        )}
      
      {/* Generate Certificate Button - Show for accepted/published without certificate */}
      {shouldShowCertificateButton && (
        <button 
          onClick={handleOpenCustomizeModal}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
          title="توليد شهادة القبول"
        >
          <Award className="w-5 h-5" />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            توليد الشهادة
          </span>
        </button>
      )}
      <button 
        onClick={handleViewDetails}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title={getButtonTitle()}
      >
        <Eye className="w-5 h-5" />
      </button>
      {showAssignButton && status === 'under-review' && (
        <button 
          onClick={() => navigate(`/dashboard/assign-reviewer/${researchId}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="تعيين محكم للبحث"
        >
          <Send className="w-5 h-5" />
        </button>
      )}
      </div>

      {/* PDF Viewer Modal */}
      {showPDFViewer && certificateUrl && (
        <PDFViewer
          pdfUrl={certificateUrl}
          title="معاينة خطاب القبول"
          onClose={() => setShowPDFViewer(false)}
        />
      )}

      {/* Customize Certificate Modal */}
      {showCustomizeModal && (
        <CustomizeCertificateModal
          researchTitle={researchTitle}
          researcherName={researcherName}
          onClose={() => setShowCustomizeModal(false)}
          onGenerate={handleGenerateCertificate}
          isGenerating={isGenerating}
          isRegenerate={hasCertificate}
          currentMessage={currentCertificateMessage}
        />
      )}
    </>
  );
}
