import { useState, useEffect } from 'react';
import { MessageSquare, Search, RefreshCw, Eye, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import contactSubmissionsService, { ContactSubmission } from '../../../services/contact-submissions.service';

export function ManageContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionsData, statsData] = await Promise.all([
        contactSubmissionsService.getAll(),
        contactSubmissionsService.getStats(),
      ]);
      setSubmissions(submissionsData);
      setStats(statsData);
    } catch (error) {
      toast.error('فشل في تحميل البيانات');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(query) ||
          sub.email.toLowerCase().includes(query) ||
          sub.subject.toLowerCase().includes(query) ||
          sub.message.toLowerCase().includes(query)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await contactSubmissionsService.updateStatus(id, newStatus);
      toast.success('تم تحديث الحالة بنجاح');
      fetchData();
    } catch (error) {
      toast.error('فشل في تحديث الحالة');
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubmission) return;

    try {
      await contactSubmissionsService.delete(selectedSubmission.id);
      toast.success('تم حذف الرسالة بنجاح');
      setDeleteModalOpen(false);
      setSelectedSubmission(null);
      fetchData();
    } catch (error) {
      toast.error('فشل في حذف الرسالة');
      console.error('Error deleting submission:', error);
    }
  };

  const openViewModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setViewModalOpen(true);
  };

  const openDeleteModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setDeleteModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
      resolved: { label: 'تم الحل', color: 'bg-green-100 text-green-700' },
      closed: { label: 'مغلق', color: 'bg-gray-100 text-gray-700' },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0D3B66]/10 rounded-lg">
              <MessageSquare className="w-7 h-7 text-[#0D3B66]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">إدارة رسائل التواصل</h1>
          </div>
          <p className="text-gray-600">عرض وإدارة جميع رسائل التواصل المرسلة</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">إجمالي الرسائل</p>
            <p className="text-3xl font-bold text-[#0D3B66]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-md p-6 border border-yellow-100">
          <div className="text-center">
            <p className="text-sm text-yellow-700 mb-1">قيد الانتظار</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-100">
          <div className="text-center">
            <p className="text-sm text-blue-700 mb-1">قيد المعالجة</p>
            <p className="text-3xl font-bold text-blue-700">{stats.inProgress}</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-md p-6 border border-green-100">
          <div className="text-center">
            <p className="text-sm text-green-700 mb-1">تم الحل</p>
            <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-1">مغلق</p>
            <p className="text-3xl font-bold text-gray-700">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث في الرسائل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">قيد المعالجة</option>
              <option value="resolved">تم الحل</option>
              <option value="closed">مغلق</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تحديث</span>
        </button>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الموضوع</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد رسائل
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{submission.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{submission.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(submission.submitted_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={submission.status}
                        onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(submission.status).color}`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="in_progress">قيد المعالجة</option>
                        <option value="resolved">تم الحل</option>
                        <option value="closed">مغلق</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(submission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض الرسالة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(submission)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-gray-600">
        عرض {filteredSubmissions.length} من {submissions.length} رسالة
      </div>

      {/* View Message Modal */}
      {viewModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-[#0D3B66] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">تفاصيل الرسالة</h3>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]" dir="rtl">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">الاسم:</label>
                  <p className="text-lg text-gray-900 mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">البريد الإلكتروني:</label>
                  <p className="text-lg text-gray-900 mt-1">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">الموضوع:</label>
                  <p className="text-lg text-gray-900 mt-1">{selectedSubmission.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">الرسالة:</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedSubmission.message}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">التاريخ:</label>
                  <p className="text-lg text-gray-900 mt-1">{formatDate(selectedSubmission.submitted_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">الحالة:</label>
                  <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(selectedSubmission.status).color}`}>
                    {getStatusBadge(selectedSubmission.status).label}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">تأكيد الحذف</h3>
            </div>
            <div className="p-6" dir="rtl">
              <p className="text-gray-700 text-lg mb-4">
                هل أنت متأكد من حذف رسالة <span className="font-bold">"{selectedSubmission.name}"</span>؟
              </p>
              <p className="text-gray-600 text-sm">
                لن تتمكن من استرجاع هذه الرسالة بعد الحذف.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedSubmission(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
