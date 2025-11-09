import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { DashboardHeader, StatusBadge, ResearchActionButtons } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';

export function ManageResearchPage() {
  const [researches, setResearches] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Research['status']>('all');

  useEffect(() => {
    loadResearches();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadResearches(true); // Silent refresh
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadResearches = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Load all researches (Admin view)
      const data = await researchService.getAll();
      setResearches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الأبحاث');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadResearches();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const mapStatus = (status: Research['status']): StatusType => {
    switch (status) {
      case 'under-review':
      case 'pending':
      case 'pending-editor-decision':
        return status as StatusType;
      case 'accepted':
      case 'published':
        return 'accepted';
      case 'needs-revision':
        return 'needs-revision';
      case 'rejected':
        return 'rejected';
    }
  };

  // Filter researches
  const filteredResearches = researches.filter((research) => {
    const matchesSearch = 
      research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      research.research_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || research.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
          onClick={handleRefresh}
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
        <DashboardHeader title="إدارة الأبحاث" subtitle="مراجعة ومتابعة الأبحاث المقدمة" />
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">تحديث</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الأبحاث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | Research['status'])}
              className="appearance-none pr-10 pl-8 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white cursor-pointer min-w-[200px]"
            >
              <option value="all">جميع الحالات</option>
              <option value="under-review">تحت المراجعة</option>
              <option value="pending-editor-decision">بانتظار قرار المحرر ⭐</option>
              <option value="needs-revision">يتطلب تعديل</option>
              <option value="accepted">مقبول</option>
              <option value="rejected">مرفوض</option>
              <option value="published">منشور</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          عرض <span className="font-bold text-gray-800">{filteredResearches.length}</span> من أصل{' '}
          <span className="font-bold text-gray-800">{researches.length}</span> بحث
        </div>
      </div>

      {/* Research Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">إدارة الأبحاث المقدمة</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">رقم البحث</th>
                <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">العنوان</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">التخصص</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">تاريخ التقديم</th>
                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredResearches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-12 h-12 text-gray-300" />
                    <p>لا توجد نتائج</p>
                  </div>
                </td>
              </tr>
              ) : (
                filteredResearches.map((research) => (
                  <tr key={research.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-medium text-gray-800">{research.research_number}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-sm text-gray-800 font-medium">{research.title}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{research.specialization}</td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={mapStatus(research.status)} />
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600">{formatDate(research.submission_date)}</td>
                    <td className="py-4 px-4">
                      <ResearchActionButtons 
                        researchId={research.id} 
                        status={mapStatus(research.status)}
                        originalStatus={research.status}
                        hasCertificate={!!research.acceptance_certificate_cloudinary_public_id}
                        certificateUrl={research.acceptance_certificate_cloudinary_secure_url || research.acceptance_certificate_url}
                        researchTitle={research.title}
                        researcherName={research.user?.name || 'الباحث'}
                        currentCertificateMessage={research.acceptance_certificate_custom_message}
                        onCertificateGenerated={loadResearches}
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
