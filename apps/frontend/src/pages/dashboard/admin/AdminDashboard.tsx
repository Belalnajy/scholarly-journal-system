import { FileText, Users, Clock, Bell, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardHeader } from '../../../components/dashboard';

// Demo data
const stats = {
  totalResearch: 156,
  activeResearchers: 89,
  averageReviewTime: 9, // days
};

// Monthly submissions data (last 6 months)
const monthlySubmissions = [
  { month: 'يناير', submitted: 18, published: 12 },
  { month: 'فبراير', submitted: 25, published: 15 },
  { month: 'مارس', submitted: 32, published: 20 },
  { month: 'أبريل', submitted: 28, published: 18 },
  { month: 'مايو', submitted: 22, published: 16 },
  { month: 'يونيو', submitted: 31, published: 19 },
];

// Research status distribution for Pie Chart
const researchDistribution = [
  { name: 'قيد المراجعة', value: 45, color: '#3b82f6' },
  { name: 'تعديلات مطلوبة', value: 28, color: '#eab308' },
  { name: 'مرفوض', value: 18, color: '#ef4444' },
  { name: 'مقبول', value: 65, color: '#22c55e' },
];

// Recent activities
const recentActivities = [
  {
    id: '1',
    icon: 'FileText',
    title: 'تم تقديم بحث جديد بعنوان "تطبيقات الذكاء الاصطناعي في التعليم"',
    author: 'د. سارة أحمد',
    time: 'منذ ساعتين',
    color: 'blue',
  },
  {
    id: '2',
    icon: 'Users',
    title: 'انضم محكم جديد إلى فريق المراجعة - تخصص الهندسة',
    author: 'د. أحمد سالم',
    time: 'منذ 4 ساعات',
    color: 'green',
  },
  {
    id: '3',
    icon: 'Bell',
    title: 'تم نشر العدد الجديد من المجلة (العدد 3 - 2024)',
    author: 'بشرى مشتبر',
    time: 'منذ يوم واحد',
    color: 'purple',
  },
];

export function AdminDashboard() {
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
            <span>زيادة 12% عن الشهر الماضي</span>
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
            <span>5 باحثين جدد هذا الشهر</span>
          </div>
        </div>

        {/* متوسط وقت المراجعة */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">متوسط وقت المراجعة</h3>
            <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.averageReviewTime} أيام</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <AlertCircle className="w-3 h-3" />
            <span>تحسن بنسبة 15% عن الشهر الماضي</span>
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
          {recentActivities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 ${getActivityBgColor(activity.color)} hover:shadow-md transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-full ${getActivityBgColor(activity.color)} flex items-center justify-center flex-shrink-0`}>
                {getActivityIcon(activity.icon, activity.color)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 mb-1">{activity.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{activity.author}</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
