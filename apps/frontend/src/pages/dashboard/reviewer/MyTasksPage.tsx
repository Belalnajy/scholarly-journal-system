import { Bell, Search, SlidersHorizontal, FileText, Calendar, Tag, Clock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { reviewerAssignmentsService, ReviewerAssignment } from '../../../services/reviewer-assignments.service';
import { researchService } from '../../../services/researchService';

// Types
type TaskStatus = 'assigned' | 'accepted' | 'declined' | 'completed';

interface TaskWithResearch extends ReviewerAssignment {
  researchTitle?: string;
  researchSpecialization?: string;
  researchNumber?: string;
}

// Task Card Component
interface TaskCardProps {
  assignment: TaskWithResearch;
}

function TaskCard({ assignment }: TaskCardProps) {
  const navigate = useNavigate();
  
  const getStatusConfig = () => {
    switch (assignment.status) {
      case 'assigned':
        return { text: 'مُعيّن', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      case 'accepted':
        return { text: 'قيد المراجعة', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' };
      case 'declined':
        return { text: 'مرفوض', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
      case 'completed':
        return { text: 'مكتمل', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Parse deadline to check if it's urgent
  const isUrgent = assignment.status === 'assigned' && new Date(assignment.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border px-3 py-1 rounded-md text-xs font-semibold`}>
          {statusConfig.text}
        </span>
        {isUrgent && (
          <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            عاجل
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-3">{assignment.researchTitle || 'بحث غير محدد'}</h3>

      {/* Research Number */}
      {assignment.researchNumber && (
        <p className="text-gray-500 text-sm mb-3">رقم البحث: {assignment.researchNumber}</p>
      )}

      {/* Assignment Notes */}
      {assignment.assignment_notes && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4 bg-blue-50 p-3 rounded-lg">
          <span className="font-semibold">ملاحظات:</span> {assignment.assignment_notes}
        </p>
      )}

      {/* Meta Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4" />
          <span className="font-medium">التخصص:</span>
          <span>{assignment.researchSpecialization || 'غير محدد'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-600">الموعد النهائي:</span>
          <span className={isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}>{formatDate(assignment.deadline)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* View Research Button - Always visible for accepted tasks */}
        {assignment.status !== 'declined' && (
          <button 
            onClick={() => navigate(`/dashboard/reviewer-research-view/${assignment.research_id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
          >
            <FileText className="w-4 h-4" />
            <span>عرض البحث</span>
          </button>
        )}
        
        {/* Evaluation Button */}
        {assignment.status !== 'completed' && assignment.status !== 'declined' && (
          <button 
            onClick={() => navigate(`/dashboard/evaluation-form/${assignment.research_id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
          >
            <FileText className="w-4 h-4" />
            <span>بدء التحكيم</span>
          </button>
        )}
        
        {/* View Evaluation Button - For completed tasks */}
        {assignment.status === 'completed' && (
          <button 
            onClick={() => navigate(`/dashboard/evaluation-form/${assignment.research_id}`)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>عرض التقييم</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function MyTasksPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [assignments, setAssignments] = useState<TaskWithResearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get assignments for this reviewer
      const assignmentsData = await reviewerAssignmentsService.getByReviewer(user.id);

      // Load research details for each assignment
      const assignmentsWithResearch = await Promise.all(
        assignmentsData.map(async (assignment) => {
          try {
            const research = await researchService.getById(assignment.research_id);
            return {
              ...assignment,
              researchTitle: research.title,
              researchSpecialization: research.specialization,
              researchNumber: research.research_number,
            };
          } catch (err) {
            return assignment;
          }
        })
      );

      setAssignments(assignmentsWithResearch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المهام');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.researchTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.researchNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Count by status
  const statusCounts = {
    all: assignments.length,
    assigned: assignments.filter((t) => t.status === 'assigned').length,
    accepted: assignments.filter((t) => t.status === 'accepted').length,
    declined: assignments.filter((t) => t.status === 'declined').length,
    completed: assignments.filter((t) => t.status === 'completed').length,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المهام...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={loadAssignments}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مهامي</h1>
          <p className="text-gray-600">الأبحاث المطلوب مراجعتها</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="البحث في المهام..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-[#0D3B66] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('assigned')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'assigned'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            مُعيّن ({statusCounts.assigned})
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'accepted'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            قيد المراجعة ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            مكتملة ({statusCounts.completed})
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((assignment) => (
            <TaskCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">لا توجد مهام تطابق البحث</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="text-[#0D3B66] hover:underline font-medium"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
