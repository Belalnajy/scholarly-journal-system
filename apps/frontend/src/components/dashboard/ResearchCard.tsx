import { FileText, Calendar, User, Eye, Download } from 'lucide-react';

interface ResearchCardProps {
  id: string;
  title: string;
  author: string;
  submittedDate: string;
  status: 'pending' | 'under-review' | 'accepted' | 'rejected' | 'published';
  views?: number;
  downloads?: number;
  category?: string;
  onView?: () => void;
}

export function ResearchCard({
  id,
  title,
  author,
  submittedDate,
  status,
  views,
  downloads,
  category,
  onView,
}: ResearchCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'published':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'under-review':
        return 'قيد المراجعة';
      case 'accepted':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      case 'published':
        return 'منشور';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-[#0D3B66]/10 rounded-lg text-[#0D3B66] mt-1">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{title}</h3>
            {category && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md mb-2">
                {category}
              </span>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span>{author}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{submittedDate}</span>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {views !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
          )}
          {downloads !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Download className="w-4 h-4" />
              <span>{downloads}</span>
            </div>
          )}
        </div>
        {onView && (
          <button
            onClick={onView}
            className="px-4 py-2 bg-[#0D3B66] text-white text-sm rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
          >
            عرض التفاصيل
          </button>
        )}
      </div>
    </div>
  );
}
