import { StatCard, DashboardHeader, StatusBadge, ResearchActionButtons } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { researchService, Research } from '../../../services/researchService';
import { Loader2 } from 'lucide-react';

// Types
interface ResearchStats {
  total: number;
  underReview: number;
  pendingEditorDecision: number;
  needsRevision: number;
  rejected: number;
  accepted: number;
}

export function EditorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [researches, setResearches] = useState<Research[]>([]);
  const [stats, setStats] = useState<ResearchStats>({
    total: 0,
    underReview: 0,
    pendingEditorDecision: 0,
    needsRevision: 0,
    rejected: 0,
    accepted: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allResearches = await researchService.getAll();
      setResearches(allResearches.slice(0, 5)); // Latest 5 researches

      // Calculate stats
      const accepted = allResearches.filter(r => r.status === 'accepted').length;
      const published = allResearches.filter(r => r.status === 'published').length;
      
      const statsData = {
        total: allResearches.length,
        underReview: allResearches.filter(r => r.status === 'under-review').length,
        pendingEditorDecision: allResearches.filter(r => r.status === 'pending-editor-decision').length,
        needsRevision: allResearches.filter(r => r.status === 'needs-revision').length,
        rejected: allResearches.filter(r => r.status === 'rejected').length,
        accepted: accepted + published, // مقبولة + منشورة
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي الأبحاث',
      value: stats.total.toString(),
      icon: 'FileText',
      color: 'blue',
    },
    {
      title: 'تحت المراجعة',
      value: stats.underReview.toString(),
      icon: 'Clock',
      color: 'yellow',
    },
    {
      title: 'بانتظار قرار المحرر',
      value: stats.pendingEditorDecision.toString(),
      icon: 'AlertCircle',
      color: 'orange',
    },
    {
      title: 'مقبولة',
      value: stats.accepted.toString(),
      icon: 'CheckCircle',
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader title="لوحة التحكم" />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Two Cards Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Status Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">حالة الأبحاث</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Under Review */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">تحت المراجعة</span>
                <span className="text-sm font-bold text-gray-800">{stats.underReview}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.underReview / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Pending Editor Decision */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">بانتظار قرار المحرر</span>
                <span className="text-sm font-bold text-gray-800">{stats.pendingEditorDecision}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.pendingEditorDecision / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Needs Revision */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">يتطلب تعديل</span>
                <span className="text-sm font-bold text-gray-800">{stats.needsRevision}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.needsRevision / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Rejected */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">مرفوض</span>
                <span className="text-sm font-bold text-gray-800">{stats.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.rejected / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Accepted */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 font-medium">مقبولة</span>
                <span className="text-sm font-bold text-gray-800">{stats.accepted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: stats.total > 0 ? `${(stats.accepted / stats.total) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">إحصائيات سريعة</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">الأبحاث النشطة</span>
              <span className="text-2xl font-bold text-blue-600">{stats.underReview + stats.pendingEditorDecision + stats.needsRevision}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">بانتظار قرار المحرر</span>
              <span className="text-2xl font-bold text-orange-600">{stats.pendingEditorDecision}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">معدل القبول</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">تحتاج متابعة</span>
              <span className="text-2xl font-bold text-amber-600">{stats.needsRevision}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Research Table - Full Width */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">آخر الأبحاث المقدمة</h2>
                <p className="text-sm text-gray-500 mt-1">آخر الأبحاث المقدمة والمعلقة</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/manage-research')}
                className="text-[#0D3B66] hover:underline text-sm font-medium flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <span>←</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">رقم البحث</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">العنوان</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الباحث</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">تاريخ التقديم</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {researches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        لا توجد أبحاث مقدمة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    researches.map((research) => (
                      <tr key={research.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-medium text-gray-800">{research.research_number}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-sm text-gray-800 font-medium">{research.title}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-600">{research.user?.name || 'غير محدد'}</td>
                        <td className="py-4 px-4 text-center">
                          <StatusBadge status={research.status as StatusType} />
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-600">
                          {new Date(research.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <ResearchActionButtons 
                            researchId={research.id} 
                            status={research.status as StatusType} 
                            originalStatus={research.status}
                            hasCertificate={!!research.acceptance_certificate_cloudinary_public_id}
                            showAssignButton={false} 
                            onCertificateGenerated={fetchDashboardData}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
      </div>
    </div>
  );
}
