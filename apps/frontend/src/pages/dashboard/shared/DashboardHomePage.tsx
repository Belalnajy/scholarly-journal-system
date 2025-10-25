import { BarChart, FileText, Users, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-r-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export function DashboardHomePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">مرحباً بك في نظام إدارة المجلة العلمية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الأبحاث"
          value="156"
          icon={<FileText className="w-6 h-6" />}
          trend="+12%"
          color="#0D3B66"
        />
        <StatCard
          title="الأبحاث قيد المراجعة"
          value="23"
          icon={<BarChart className="w-6 h-6" />}
          trend="+5%"
          color="#F4D35E"
        />
        <StatCard
          title="الباحثون النشطون"
          value="89"
          icon={<Users className="w-6 h-6" />}
          trend="+8%"
          color="#EE964B"
        />
        <StatCard
          title="الأبحاث المنشورة"
          value="112"
          icon={<FileText className="w-6 h-6" />}
          trend="+15%"
          color="#95B8D1"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">النشاط الأخير</h2>
        <div className="space-y-4">
          {[
            { title: 'بحث جديد تم تقديمه', time: 'منذ ساعتين', type: 'new' },
            { title: 'تم قبول بحث للنشر', time: 'منذ 4 ساعات', type: 'approved' },
            { title: 'مراجعة جديدة تمت إضافتها', time: 'منذ يوم واحد', type: 'review' },
            { title: 'تم نشر عدد جديد', time: 'منذ يومين', type: 'published' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'new' ? 'bg-blue-500' :
                activity.type === 'approved' ? 'bg-green-500' :
                activity.type === 'review' ? 'bg-yellow-500' :
                'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-[#0D3B66] text-[#0D3B66] rounded-lg hover:bg-[#0D3B66] hover:text-white transition-colors font-medium">
            تقديم بحث جديد
          </button>
          <button className="p-4 border-2 border-[#F4D35E] text-[#F4D35E] rounded-lg hover:bg-[#F4D35E] hover:text-[#0D3B66] transition-colors font-medium">
            عرض الإشعارات
          </button>
          <button className="p-4 border-2 border-[#EE964B] text-[#EE964B] rounded-lg hover:bg-[#EE964B] hover:text-white transition-colors font-medium">
            تحديث الملف الشخصي
          </button>
        </div>
      </div>
    </div>
  );
}
