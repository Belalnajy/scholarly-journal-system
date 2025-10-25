import { Eye, Download, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService } from '../../../services/reviews.service';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';

// Types
interface ReviewReport {
  id: string;
  researchNumber: string;
  researchTitle: string;
  author: string;
  submissionDate: string;
  evaluationDate?: string;
  status: StatusType;
  reviewersCount: number;
  completedReviews: number;
  averageRating: number;
  research?: Research;
}

export function ManageReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // جلب الأبحاث اللي في انتظار قرار المحرر
      const researches = await researchService.getAll({ status: 'pending-editor-decision' });

      // جلب بيانات التقييمات والمحكمين لكل بحث
      const reportsData = await Promise.all(
        researches.map(async (research) => {
          const [reviews, assignments] = await Promise.all([
            reviewsService.getByResearch(research.id),
            reviewerAssignmentsService.getByResearch(research.id),
          ]);

          const completedReviews = reviews.filter(r => r.status === 'completed');
          const avgRating = completedReviews.length > 0
            ? completedReviews.reduce((sum, r) => sum + Number(r.average_rating || 0), 0) / completedReviews.length
            : 0;

          return {
            id: research.id,
            researchNumber: research.research_number,
            researchTitle: research.title,
            author: 'باحث', // TODO: Add user relation to research
            submissionDate: research.submission_date,
            evaluationDate: research.evaluation_date,
            status: 'pending-editor-decision' as StatusType,
            reviewersCount: assignments.length,
            completedReviews: completedReviews.length,
            averageRating: avgRating,
            research,
          };
        })
      );

      setReports(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل التقارير');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalReports: reports.length,
    averageScore: reports.length > 0
      ? reports.reduce((sum, r) => sum + r.averageRating, 0) / reports.length
      : 0,
    pendingDecisions: reports.filter(r => r.status === 'pending-editor-decision').length,
    completedReports: reports.filter(r => r.status === 'accepted' || r.status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <DashboardHeader title="إدارة التقارير" subtitle="متابعة أداء المحكمين والمراجعين" />
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={loadReports}
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
      <DashboardHeader title="إدارة التقارير" subtitle="متابعة أداء المحكمين والمراجعين" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">التقارير المكتملة</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.totalReports}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">متوسط التقييم</h3>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.averageScore.toFixed(1)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">بانتظار قرار المحرر</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-amber-600 text-xl">⏳</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.pendingDecisions}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">تقارير هذا الشهر</h3>
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
              <span className="text-purple-600 text-xl">📈</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.completedReports}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">تقارير المحكمين</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">رقم البحث</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">العنوان</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الباحث</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">متوسط التقييم</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">المحكمون</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-bold text-[#0D3B66]">{report.researchNumber}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="text-sm text-gray-800 font-medium">{report.researchTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(report.submissionDate)}</p>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{report.author}</td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-lg font-bold text-gray-800">{report.averageRating.toFixed(1)}/5</span>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {report.completedReviews}/{report.reviewersCount}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/dashboard/editor-review-details/${report.id}`)}
                        className="px-3 py-2 bg-[#0D3B66] text-white text-xs rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium flex items-center gap-1"
                        title="اتخاذ القرار"
                      >
                        <Eye className="w-4 h-4" />
                        <span>اتخاذ القرار</span>
                      </button>
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تحميل التقرير"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
