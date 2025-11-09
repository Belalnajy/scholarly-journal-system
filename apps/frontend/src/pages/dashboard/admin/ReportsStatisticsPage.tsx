import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardHeader } from '../../../components/dashboard';
import dashboardService, { ReportsData } from '../../../services/dashboard.service';
import { toast } from 'react-hot-toast';

export function ReportsStatisticsPage() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports data on mount
  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAllReportsData();
      setReportsData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في تحميل بيانات التقارير';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    try {
      if (!reportsData) {
        toast.error('لا توجد بيانات للتصدير');
        return;
      }

      // Prepare report data
      const reportContent = `
تقرير الأداء الشامل
=====================

الإحصائيات العامة:
- إجمالي التقديمات: ${stats.totalSubmissions}
- الأبحاث المنشورة: ${stats.publishedResearch}
- معدل القبول: ${stats.acceptanceRate}%
- معدل الرفض: ${stats.rejectionRate}%
- قيد المراجعة: ${stats.pendingReview}

تطور وقت المراجعة الشهري:
${monthlyReviewTime.map(item => `- ${item.month}: ${item.days} يوم`).join('\n')}

إنتاجية النشر الشهرية:
${monthlyProductivity.map(item => `- ${item.month}: ${item.value} بحث`).join('\n')}

تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
      `.trim();

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-الأداء-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      toast.error('فشل في تصدير التقرير');
      console.error('Export error:', error);
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل بيانات التقارير...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !reportsData) {
    return (
      <div className="space-y-6" dir="rtl">
        <DashboardHeader title="التقارير والإحصاءات" subtitle="تحليل شامل لأداء النظام والإحصائيات التفصيلية" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">فشل في تحميل البيانات</h3>
          <p className="text-red-600 mb-4">{error || 'حدث خطأ غير متوقع'}</p>
          <button
            onClick={fetchReportsData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { stats, monthlyReviewTime, monthlyProductivity } = reportsData;

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
            <CheckCircle className="w-3 h-3" />
            <span>من {stats.totalSubmissions} بحث</span>
          </div>
        </div>

        {/* معدل الرفض */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">معدل الرفض</h3>
            <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
              <span className="text-orange-600 text-lg">✕</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.rejectionRate}%</p>
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <AlertCircle className="w-3 h-3" />
            <span>قيد المراجعة: {stats.pendingReview}</span>
          </div>
        </div>

        {/* الأبحاث المنشورة */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">الأبحاث المنشورة</h3>
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66] mb-1">{stats.publishedResearch}</p>
          <div className="flex items-center gap-1 text-xs text-purple-600">
            <FileText className="w-3 h-3" />
            <span>إجمالي: {stats.totalSubmissions}</span>
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
