// Shared Status Badge Component
// Used across: EditorDashboard, ResearcherDashboard, ReviewerDashboard

export type StatusType = 
  | 'under-review' 
  | 'pending-editor-decision'
  | 'accepted' 
  | 'needs-revision' 
  | 'rejected'
  | 'in-progress'
  | 'completed'
  | 'ready-to-publish'
  | 'published'
  | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  variant?: 'default' | 'compact';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'under-review':
        return { text: 'تحت المراجعة', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'in-progress':
        return { text: 'قيد المراجعة', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'pending':
        return { text: 'قيد الانتظار', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
      case 'pending-editor-decision':
        return { text: 'بانتظار قرار المحرر', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
      case 'accepted':
        return { text: 'مقبول', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'completed':
        return { text: 'تم التقييم', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      case 'needs-revision':
        return { text: 'يتطلب تعديل', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
      case 'rejected':
        return { text: 'مرفوض', bgColor: 'bg-red-100', textColor: 'text-red-700' };
      case 'ready-to-publish':
        return { text: 'جاهز للنشر', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'published':
        return { text: 'منشور', bgColor: 'bg-teal-100', textColor: 'text-teal-700' };
      default:
        return { text: 'غير محدد', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const config = getStatusConfig();
  const sizeClass = variant === 'compact' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span className={`${config.bgColor} ${config.textColor} ${sizeClass} rounded-full font-semibold inline-block`}>
      {config.text}
    </span>
  );
}
