import { TrendingUp, TrendingDown, Clock, CheckCircle, FileText, Download } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardHeader } from '../../../components/dashboard';

// Demo data
const stats = {
  acceptanceRate: 73, // معدل القبول
  rejectionRate: 18, // معدل الرفض
  averageReviewTime: 9, // متوسط وقت المراجعة (أيام)
  totalSubmissions: 318, // إجمالي التقديمات
  publishedResearch: 232, // الأبحاث المنشورة
};

// Monthly review time data (last 6 months)
const monthlyReviewTime = [
  { month: 'يناير', days: 12 },
  { month: 'فبراير', days: 11 },
  { month: 'مارس', days: 8 },
  { month: 'أبريل', days: 10 },
  { month: 'مايو', days: 14 },
  { month: 'يونيو', days: 9 },
];

// Monthly productivity data (last 6 months)
const monthlyProductivity = [
  { month: 'يناير', value: 45 },
  { month: 'فبراير', value: 52 },
  { month: 'مارس', value: 38 },
  { month: 'أبريل', value: 65 },
  { month: 'مايو', value: 48 },
  { month: 'يونيو', value: 70 },
];

export function ReportsStatisticsPage() {
  const handleExportReport = () => {
    // TODO: Implement export functionality
    alert('سيتم تصدير التقرير قريباً...');
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].name === 'days' ? 'الأيام' : 'القيمة'}: <span className="font-bold text-[#14b8a6]">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <DashboardHeader 
        title="التقارير والإحصاءات" 
        subtitle="تحليل شامل لأداء النظام والإحصائيات التفصيلية"
      />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* معدل القبول */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">معدل القبول</h3>
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
              <span className="text-green-600 text-lg">?</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.acceptanceRate}%</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>5% تحسن</span>
          </div>
        </div>

        {/* معدل الرفض */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">معدل الرفض</h3>
            <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center">
              <span className="text-rose-600 text-lg">✕</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.rejectionRate}%</p>
          <div className="flex items-center gap-1 text-xs text-rose-600">
            <TrendingDown className="w-3 h-3" />
            <span>3% تحسن</span>
          </div>
        </div>

        {/* متوسط وقت المراجعة */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">متوسط وقت المراجعة</h3>
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.averageReviewTime} أيام</p>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <TrendingDown className="w-3 h-3" />
            <span>2 أيام تحسن</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تطور وقت المراجعة */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">تطور وقت المراجعة</h3>
          <p className="text-sm text-gray-600 mb-6">متوسط الوقت بالأيام شهرياً</p>
          
          {/* Area Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyReviewTime}>
              <defs>
                <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5eead4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#5eead4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="days" 
                stroke="#14b8a6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDays)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* إنتاجية النشر */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">إنتاجية النشر</h3>
          <p className="text-sm text-gray-600 mb-6">الأبحاث المقدمة والمنشورة شهرياً</p>
          
          {/* Line Chart */}
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyProductivity}>
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
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#14b8a6" 
                strokeWidth={3}
                dot={{ fill: '#14b8a6', strokeWidth: 2, r: 5, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* تقرير الأداء الشامل */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">تقرير الأداء الشامل</h3>
            <p className="text-sm text-gray-600">ملخص إحصائي مفصل للفترة الحالية</p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            <span>تصدير التقرير</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* إجمالي التقديمات */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">إجمالي التقديمات</h4>
                <p className="text-3xl font-bold text-[#0D3B66] mb-1">{stats.totalSubmissions}</p>
                <p className="text-xs text-gray-600">هذا العام</p>
              </div>
            </div>
          </div>

          {/* الأبحاث المنشورة */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">الأبحاث المنشورة</h4>
                <p className="text-3xl font-bold text-[#0D3B66] mb-1">{stats.publishedResearch}</p>
                <p className="text-xs text-gray-600">معدل قبول {stats.acceptanceRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
