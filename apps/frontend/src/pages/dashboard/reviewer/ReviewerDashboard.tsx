import { useState, useEffect } from 'react';
import { Eye, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { StatCard, DashboardHeader, WelcomeCard, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import { researchRevisionsService } from '../../../services/research-revisions.service';

// Types
type ReviewTaskStatus = StatusType;
type AssignmentStatus = 'assigned' | 'accepted' | 'declined' | 'completed';
interface ResearchWithAssignment extends Research {
  assignmentStatus: AssignmentStatus;
  hasRevisions: boolean;
  revisionCount: number;
}

// Action Button Component
function ActionButton({ status, researchId }: { status: ReviewTaskStatus; researchId: string }) {
  const navigate = useNavigate();

  const handleEvaluate = () => {
    navigate(`/dashboard/evaluation-form/${researchId}`);
  };

  const handleViewDetails = () => {
    navigate(`/dashboard/reviewer-research-view/${researchId}`);
  };

  if (status === 'pending' || status === 'needs-revision') {
    return (
      <button 
        onClick={handleEvaluate}
        className="px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm font-medium"
      >
        تقييم البحث
      </button>
    );
  }
  return (
    <button 
      onClick={handleViewDetails}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
      title="عرض التفاصيل"
    >
      <Eye className="w-5 h-5" />
    </button>
  );
}

export function ReviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [researches, setResearches] = useState<ResearchWithAssignment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviewerData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadReviewerData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadReviewerData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get assignments for this reviewer
      const assignmentsData = await reviewerAssignmentsService.getByReviewer(user.id);

      // Filter active assignments (accepted or assigned)
      const activeAssignments = assignmentsData.filter(
        (a) => a.status === 'assigned' || a.status === 'accepted'
      );

      // Load research details for active assignments with their assignment status
      const researchPromises = activeAssignments.slice(0, 5).map(async (assignment) => {
        try {
          const research = await researchService.getById(assignment.research_id);
          // Only show if research is still under review
          if (research.status === 'under-review' || research.status === 'needs-revision') {
            // Check if research has revisions
            const revisions = await researchRevisionsService.getByResearch(assignment.research_id).catch(() => []);
            const submittedRevisions = revisions.filter((r) => r.status === 'submitted');
            
            return { 
              ...research, 
              assignmentStatus: assignment.status as AssignmentStatus,
              hasRevisions: submittedRevisions.length > 0,
              revisionCount: submittedRevisions.length
            } as ResearchWithAssignment;
          }
          return null;
        } catch (err) {
          return null;
        }
      });

      const researchesData = (await Promise.all(researchPromises)).filter(
        (r): r is ResearchWithAssignment => r !== null
      );

      setResearches(researchesData);

      // Calculate stats correctly
      const totalAssignments = assignmentsData.length;
      const assignedCount = assignmentsData.filter((a) => a.status === 'assigned').length; // مُعيّن (لم يبدأ)
      const inProgressCount = assignmentsData.filter((a) => a.status === 'accepted').length; // قيد المراجعة (بدأ)
      const completedCount = assignmentsData.filter((a) => a.status === 'completed').length; // تم التقييم

      setStats({
        total: totalAssignments,
        pending: assignedCount, // قيد الانتظار (مُعيّن)
        inProgress: inProgressCount, // جاري العمل عليها
        completed: completedCount, // تم التقييم
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAllTasks = () => {
    navigate('/dashboard/my-tasks');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
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
          onClick={loadReviewerData}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'إجمالي الأبحاث',
      value: stats.total,
      icon: '',
      color: 'blue',
      trend: undefined,
    },
    {
      title: 'قيد المراجعة',
      value: stats.pending,
      icon: '',
      color: 'yellow',
      trend: undefined,
    },
    {
      title: 'تم التقييم',
      value: stats.completed,
      icon: '',
      color: 'green',
      trend: undefined,
    },
    {
      title: 'جاري العمل عليها',
      value: stats.inProgress,
      icon: '',
      color: 'purple',
      trend: undefined,
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader 
        title="لوحة التحكم" 
        subtitle="نظرة عامة على الأنشطة الأكاديمية" 
      />

      {/* Welcome Card */}
      <WelcomeCard 
        userName={user?.name || 'د. عبد الرحمن خالد'}
        subtitle="تابع الأبحاث المكلف بمراجعتها ومتابعة حالة التقييمات"
      />

      {/* Stats Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص الأنشطة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>
      </div>

      {/* Recent Research Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">الأبحاث الحديثة</h2>
            <p className="text-sm text-gray-500 mt-1">آخر الأبحاث المكلف بمراجعتها</p>
          </div>
          <button 
            onClick={handleViewAllTasks}
            className="px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span>عرض الكل</span>
          </button>
        </div>

        {researches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">عنوان البحث</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">رقم البحث</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">التخصص</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">تاريخ التقديم</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">الحالة</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {researches.map((research) => {
                  // Map assignment status to display status
                  const displayStatus: ReviewTaskStatus = 
                    research.assignmentStatus === 'assigned' ? 'pending' :
                    research.assignmentStatus === 'accepted' ? 'in-progress' :
                    'completed';
                  
                  return (
                    <tr key={research.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 font-medium">{research.title}</p>
                          {research.hasRevisions && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-bold shadow-md animate-pulse">
                              <Edit3 className="w-3 h-3" />
                              <span>بعد التعديل</span>
                              {research.revisionCount > 1 && (
                                <span className="mr-1 px-1.5 py-0.5 bg-white text-orange-600 rounded-full text-xs">
                                  {research.revisionCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 text-sm">{research.research_number}</td>
                      <td className="py-4 px-4 text-center text-gray-600 text-sm">{research.specialization}</td>
                      <td className="py-4 px-4 text-center text-gray-600 text-sm">{formatDate(research.submission_date)}</td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ActionButton status={displayStatus} researchId={research.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">لا توجد أبحاث للمراجعة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
