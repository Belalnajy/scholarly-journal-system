import { Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedBy?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  status,
  assignedBy,
  onAction,
  actionLabel = 'بدء العمل',
}: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عاجل';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'عادي';
      default:
        return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in-progress':
        return 'قيد العمل';
      case 'pending':
        return 'قيد الانتظار';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border-r-4 border-[#0D3B66]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {getStatusIcon(status)}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(priority)}`}>
          {getPriorityLabel(priority)}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>موعد التسليم: {dueDate}</span>
        </div>
        {assignedBy && (
          <div className="flex items-center gap-2">
            <span>من: {assignedBy}</span>
          </div>
        )}
      </div>

      {/* Action */}
      {onAction && status !== 'completed' && (
        <button
          onClick={onAction}
          className="w-full px-4 py-2 bg-[#0D3B66] text-white text-sm rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
