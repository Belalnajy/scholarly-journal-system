import { useState, useEffect } from 'react';
import { FileText, Users, Bell, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardHeader } from '../../../components/dashboard';
import dashboardService, { DashboardData } from '../../../services/dashboard.service';
import { toast } from 'react-hot-toast';

export function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAllDashboardData();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل بيانات لوحة التحكم';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">{payload[0].payload.month || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name === 'submitted' ? 'مقدم' : entry.name === 'published' ? 'منشور' : entry.name}: 
              <span className="font-bold" style={{ color: entry.color }}> {entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getActivityIcon = (iconName: string, color: string) => {
    const iconClass = `w-5 h-5 text-${color}-600`;
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'Users':
        return <Users className={iconClass} />;
      case 'Bell':
        return <Bell className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getActivityBgColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      case 'purple':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  // Helper function to map activity action to icon and color
  const getActivityDisplay = (actionType: string) => {
    if (actionType.includes('research') || actionType.includes('submit')) {
      return { icon: 'FileText', color: 'blue' };
    }
    if (actionType.includes('user') || actionType.includes('register')) {
      return { icon: 'Users', color: 'green' };
    }
    if (actionType.includes('publish') || actionType.includes('article')) {
      return { icon: 'Bell', color: 'purple' };
    }
    return { icon: 'AlertCircle', color: 'gray' };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل بيانات لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <div className="space-y-6" dir="rtl">
        <DashboardHeader title="لوحة التحكم" subtitle="نظرة عامة شاملة على النظام" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">فشل في تحميل البيانات</h3>
          <p className="text-red-600 mb-4">{error || 'حدث خطأ غير متوقع'}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { stats, monthlySubmissions, researchDistribution, recentActivities } = dashboardData;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader 
        title="لوحة التحكم" 
        subtitle="نظرة عامة شاملة على النظام"
      />

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك في لوحة تحكم الإدارة</h2>
        <p className="text-gray-600">إحصائيات شاملة وإدارة متقدمة لنظام المجلة العلمية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* إجمالي الأبحاث */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">إجمالي الأبحاث</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.totalResearch}</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3" />
            <span>قيد المراجعة: {stats.underReview}</span>
          </div>
        </div>

        {/* الباحثين المسجلين */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">الباحثين المسجلين</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.activeResearchers}</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3" />
            <span>إجمالي المستخدمين: {stats.totalUsers}</span>
          </div>
        </div>

        {/* المقالات المنشورة */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المقالات المنشورة</h3>
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.publishedArticles}</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3" />
            <span>جاهز للنشر: {stats.readyToPublish}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إحصائيات التقديم الشهرية */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">إحصائيات التقديم الشهرية</h3>
          <p className="text-sm text-gray-600 mb-6">عدد الأبحاث المقدمة والمنشورة</p>
          
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySubmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => value === 'submitted' ? 'مقدم' : 'منشور'}
              />
              <Bar dataKey="submitted" fill="#0D3B66" radius={[8, 8, 0, 0]} />
              <Bar dataKey="published" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع حالات الأبحاث */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">توزيع حالات الأبحاث</h3>
          <p className="text-sm text-gray-600 mb-6">النسب المئوية لحالات الأبحاث</p>
          
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={researchDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={false}
              >
                {researchDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {researchDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">النشاطات الحديثة</h3>
        <p className="text-sm text-gray-600 mb-6">آخر الأحداث والتحديثات في النظام</p>
        
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>لا توجد نشاطات حديثة</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const display = getActivityDisplay(activity.action_type);
              return (
                <div 
                  key={activity.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 ${getActivityBgColor(display.color)} hover:shadow-md transition-shadow`}
                >
                  <div className={`w-10 h-10 rounded-full ${getActivityBgColor(display.color)} flex items-center justify-center flex-shrink-0`}>
                    {getActivityIcon(display.icon, display.color)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 mb-1">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{activity.user?.name || 'مستخدم'}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
