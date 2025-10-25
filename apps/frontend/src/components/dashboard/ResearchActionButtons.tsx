// Research Action Buttons Component
// Used in: ManageResearchPage, EditorDashboard

import { Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StatusType } from './StatusBadge';

interface ResearchActionButtonsProps {
  researchId: string;
  status: StatusType;
  showAssignButton?: boolean;
}

export function ResearchActionButtons({ 
  researchId, 
  status, 
  showAssignButton = true 
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

  return (
    <div className="flex items-center justify-center gap-2">
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
