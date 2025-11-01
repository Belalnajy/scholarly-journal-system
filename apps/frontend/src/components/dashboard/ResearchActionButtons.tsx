// Research Action Buttons Component
// Used in: ManageResearchPage, EditorDashboard

import { Eye, Send, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { researchService } from '../../services/researchService';
import toast from 'react-hot-toast';
import type { StatusType } from './StatusBadge';

interface ResearchActionButtonsProps {
  researchId: string;
  status: StatusType;
  showAssignButton?: boolean;
  hasCertificate?: boolean;
  onCertificateGenerated?: () => void;
}

export function ResearchActionButtons({ 
  researchId, 
  status, 
  showAssignButton = true,
  hasCertificate = false,
  onCertificateGenerated
}: ResearchActionButtonsProps) {
  const navigate = useNavigate();

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

  const handleGenerateCertificate = async () => {
    try {
      toast.loading('جاري توليد شهادة القبول...', { id: 'gen-cert' });
      
      await researchService.generateAcceptanceCertificate(researchId);
      
      toast.success('تم توليد الشهادة بنجاح', { id: 'gen-cert' });
      
      // Notify parent to refresh data
      if (onCertificateGenerated) {
        onCertificateGenerated();
      }
    } catch (error) {
      toast.error('فشل توليد الشهادة', { id: 'gen-cert' });
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Generate Certificate Button - Show for accepted/published without certificate */}
      {(status === 'accepted') && !hasCertificate && (
        <button 
          onClick={handleGenerateCertificate}
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
  );
}
