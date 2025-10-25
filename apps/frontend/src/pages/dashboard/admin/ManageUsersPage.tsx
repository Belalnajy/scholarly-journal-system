import { useState, useEffect } from 'react';
import { Search, Plus, Edit, RefreshCw, Trash2, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import usersService from '../../../services/users.service';
import activityLogsService, { ActivityAction } from '../../../services/activity-logs.service';
import { UserResponse, UserStats, UserStatus } from '../../../types/user.types';

export function ManageUsersPage() {
  const navigate = useNavigate();
  
  // State Management
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * جلب البيانات من Backend
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and stats in parallel
      const [usersData, statsData] = await Promise.all([
        usersService.getAll(),
        usersService.getStats(),
      ]);
      
      setUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل البيانات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تحديث البيانات
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('تم تحديث البيانات بنجاح');
  };

  /**
   * البحث في المستخدمين
   */
  const searchUsers = (users: UserResponse[], query: string): UserResponse[] => {
    if (!query.trim()) return users;
    
    const lowerQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.affiliation?.toLowerCase().includes(lowerQuery) ||
      user.department?.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredUsers = searchUsers(users, searchQuery);

  /**
   * حذف مستخدم
   */
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${userName}"؟`)) {
      return;
    }

    try {
      await usersService.delete(userId);
      
      // Log activity
      await activityLogsService.logUserAction(
        ActivityAction.USER_DELETE,
        `تم حذف المستخدم: ${userName}`,
        { deleted_user_id: userId, deleted_user_name: userName }
      );
      
      toast.success('تم حذف المستخدم بنجاح');
      fetchData(); // Refresh data
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في حذف المستخدم';
      toast.error(errorMessage);
    }
  };

  /**
   * تغيير حالة المستخدم
   */
  const handleChangeStatus = async (userId: string, userName: string, newStatus: UserStatus) => {
    const statusLabels: Record<string, string> = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق',
    };

    try {
      // Update locally first (optimistic update)
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );

      // Then update in backend
      await usersService.update(userId, { status: newStatus });
      
      // Log activity
      await activityLogsService.logUserAction(
        ActivityAction.USER_STATUS_CHANGE,
        `تم تغيير حالة المستخدم "${userName}" إلى "${statusLabels[newStatus]}"`,
        { 
          target_user_id: userId, 
          target_user_name: userName,
          old_status: users.find(u => u.id === userId)?.status,
          new_status: newStatus 
        }
      );
      
      toast.success(`تم تغيير حالة "${userName}" إلى "${statusLabels[newStatus]}"`);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تغيير الحالة';
      toast.error(errorMessage);
      // Revert on error
      fetchData();
    }
  };

  // Helper functions
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      researcher: 'باحث',
      reviewer: 'محكم',
      editor: 'محرر',
      admin: 'مدير',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      researcher: 'bg-blue-100 text-blue-700',
      reviewer: 'bg-amber-100 text-amber-700',
      editor: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading State
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

  // Error State
  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Container */}
      <Toaster />

      {/* Header */}
      <DashboardHeader 
        title="إدارة المستخدمين" 
        subtitle="إضافة وإدارة حسابات الباحثين والمحكمين والمحررين"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">الباحثين</h3>
            <p className="text-4xl font-bold text-[#0D3B66]">{stats.researchers}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">المحكمين</h3>
            <p className="text-4xl font-bold text-[#0D3B66]">{stats.reviewers}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">المحررين</h3>
            <p className="text-4xl font-bold text-[#0D3B66]">{stats.editors}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">المدراء</h3>
            <p className="text-4xl font-bold text-[#0D3B66]">{stats.admins}</p>
          </div>
        </div>
      )}

      {/* Users Management */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h2>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي المستخدمين: {users.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/manage-users/add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مستخدم جديد</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث بالاسم، البريد الإلكتروني، الجامعة، أو القسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto overflow-y-visible">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">تاريخ الانضمام</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 w-80">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 w-32">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{formatDate(user.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Status Toggle Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleChangeStatus(user.id, user.name, UserStatus.ACTIVE)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700 border-2 border-green-300'
                              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                          title="نشط"
                        >
                          <CheckCircle className="w-3.5 h-3.5 inline-block ml-1" />
                          نشط
                        </button>
                        <button
                          onClick={() => handleChangeStatus(user.id, user.name, UserStatus.INACTIVE)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            user.status === 'inactive'
                              ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                          title="غير نشط"
                        >
                          <XCircle className="w-3.5 h-3.5 inline-block ml-1" />
                          غير نشط
                        </button>
                        <button
                          onClick={() => handleChangeStatus(user.id, user.name, UserStatus.SUSPENDED)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            user.status === 'suspended'
                              ? 'bg-red-100 text-red-700 border-2 border-red-300'
                              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                          title="معلق"
                        >
                          <Ban className="w-3.5 h-3.5 inline-block ml-1" />
                          معلق
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center justify-end">

                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/dashboard/manage-users/${user.id}/edit`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
