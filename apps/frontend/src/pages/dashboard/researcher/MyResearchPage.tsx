import { useState, useEffect } from 'react';
import { Eye, Edit, Bell, Plus, Loader2, AlertCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  researchService,
  Research,
  ResearchStats,
} from '../../../services/researchService';
import { downloadAcceptanceCertificate } from '../../../utils/downloadFile';
import toast from 'react-hot-toast';

export function MyResearchPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | Research['status']>('all');
  const [researches, setResearches] = useState<Research[]>([]);
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load researches on mount
  useEffect(() => {
    loadResearches();
  }, []);

  const loadResearches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      // Load researches and stats
      const [researchesData, statsData] = await Promise.all([
        researchService.getAll({ user_id: userId }),
        researchService.getStats(userId),
      ]);

      // Sort researches: prioritize submission_date, fallback to updated_at
      const sortedResearches = researchesData.sort((a, b) => {
        const dateA = a.submission_date
          ? new Date(a.submission_date).getTime()
          : new Date(a.updated_at).getTime();
        const dateB = b.submission_date
          ? new Date(b.submission_date).getTime()
          : new Date(b.updated_at).getTime();
        return dateB - dateA;
      });

      setResearches(sortedResearches);
      setStats(statsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الأبحاث'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Research['status']) => {
    switch (status) {
      case 'pending':
        return {
          text: 'مسودة',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        };
      case 'under-review':
        return {
          text: 'تحت المراجعة',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
        };
      case 'pending-editor-decision':
        return {
          text: 'بانتظار قرار المحرر',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
        };
      case 'accepted':
        return {
          text: 'مقبول',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
        };
      case 'needs-revision':
        return {
          text: 'يتطلب تعديل',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
        };
      case 'rejected':
        return {
          text: 'مرفوض',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
        };
      case 'published':
        return {
          text: 'منشور',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
        };
      default:
        return {
          text: 'غير محدد',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredResearches =
    filter === 'all'
      ? researches
      : researches.filter((r) => r.status === filter);

  const handleView = (id: string) => {
    navigate(`/dashboard/view-research/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/revise-research/${id}`);
  };

  const handleDownloadCertificate = async (research: Research) => {
    try {
      toast.loading('جاري تحميل شهادة القبول...', { id: 'download-cert' });
      
      const certificateUrl = await researchService.getAcceptanceCertificateUrl(research.id);
      await downloadAcceptanceCertificate(certificateUrl, research.research_number);
      
      toast.success('تم بدء التحميل', { id: 'download-cert' });
    } catch (error) {
      toast.error('فشل تحميل الشهادة', { id: 'download-cert' });
      console.error('Error downloading certificate:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الأبحاث...</p>
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
          onClick={loadResearches}
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">أبحاثي</h1>
          <p className="text-gray-600">جميع الأبحاث المقدمة ومتابعتها</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">جميع أبحاثي</h2>
            <p className="text-sm text-gray-500 mt-1">
              إدارة ومتابعة جميع الأبحاث المقدمة
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/submit-research')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة بحث جديد</span>
          </button>
        </div>

        {/* Filters - Tabs Style */}
        <div className="bg-gray-100 px-6 py-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            الكل ({stats?.total || 0})
          </button>
          <button
            onClick={() => setFilter('under-review')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filter === 'under-review'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            تحت المراجعة ({stats?.under_review || 0})
          </button>
          <button
            onClick={() => setFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filter === 'accepted'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            مقبول ({stats?.accepted || 0})
          </button>
          <button
            onClick={() => setFilter('needs-revision')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filter === 'needs-revision'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            يتطلب تعديل ({stats?.needs_revision || 0})
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">
                  عنوان البحث
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  الحالة
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  تاريخ التقديم
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  آخر تحديث
                </th>
                <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResearches.map((research) => {
                const statusConfig = getStatusConfig(research.status);
                return (
                  <tr
                    key={research.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-right">
                      <p className="text-gray-800 font-medium">
                        {research.title}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1 rounded-full text-xs font-semibold`}
                        >
                          {statusConfig.text}
                        </span>
                        {/* Certificate Badge */}
                        {(research.status === 'accepted' || research.status === 'published') &&
                         research.acceptance_certificate_cloudinary_public_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200" title="شهادة القبول متاحة">
                            <Award className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 text-sm">
                      {formatDate(research.submission_date)}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600 text-sm">
                      {formatDate(research.updated_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Certificate Download Button - Show for accepted/published research */}
                        {(research.status === 'accepted' || research.status === 'published') &&
                         research.acceptance_certificate_cloudinary_public_id && (
                          <button
                            onClick={() => handleDownloadCertificate(research)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
                            title="تحميل شهادة القبول"
                          >
                            <Award className="w-5 h-5" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              تحميل الشهادة
                            </span>
                          </button>
                        )}
                        {research.status === 'needs-revision' && (
                          <button
                            onClick={() => handleEdit(research.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="تعديل البحث"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleView(research.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredResearches.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">لا توجد أبحاث في هذه الفئة</p>
            <button
              onClick={() => setFilter('all')}
              className="text-[#0D3B66] hover:underline font-medium"
            >
              عرض جميع الأبحاث
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
