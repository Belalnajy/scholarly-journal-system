import { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, Eye, Bell, Loader2, AlertCircle, Edit, DollarSign, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { WelcomeCard, StatusBadge } from '../../../components/dashboard';
import type { StatusType } from '../../../components/dashboard';
import { researchService, Research, ResearchStats } from '../../../services/researchService';
import  notificationsService  from '../../../services/notifications.service';
import { downloadAcceptanceCertificate } from '../../../utils/downloadFile';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  bgColor: string;
}

function StatCard({ title, value, icon, subtitle, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-700 text-sm font-semibold">{title}</h3>
        <div className="text-gray-600">{icon}</div>
      </div>
      <p className="text-4xl font-bold text-[#0D3B66] mb-2">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

interface ResearchItemProps {
  research: Research;
  onView: (id: string) => void;
}

function ResearchItem({ research, onView }: ResearchItemProps) {
  const navigate = useNavigate();
  
  const handleDownloadCertificate = async () => {
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
        return 'under-review';
      case 'pending-editor-decision':
        return 'pending-editor-decision';
      case 'pending':
        return 'pending';
      case 'accepted':
      case 'published':
        return 'accepted';
      case 'needs-revision':
        return 'needs-revision';
      case 'rejected':
        return 'rejected';
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 text-right">
        <p className="text-gray-800 font-medium">{research.title}</p>
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <StatusBadge status={mapStatus(research.status)} />
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
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Certificate Download Button */}
          {(research.status === 'accepted' || research.status === 'published') &&
           research.acceptance_certificate_cloudinary_public_id && (
            <button
              onClick={handleDownloadCertificate}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
              title="تحميل شهادة القبول"
            >
              <Award className="w-5 h-5" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                تحميل الشهادة
              </span>
            </button>
          )}
          {research.status === 'needs-revision' ? (
            <button
              onClick={() => navigate(`/dashboard/revise-research/${research.id}`)}
              className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              title="تعديل البحث"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          ) : (
            <button
              onClick={() => onView(research.id)}
              className="text-gray-600 hover:text-[#0D3B66] transition-colors"
              title="عرض التفاصيل"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    created_at: string;
  };
}

function NotificationItem({ notification }: NotificationItemProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays === 1) return 'منذ يوم واحد';
    return `منذ ${diffInDays} أيام`;
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <Bell className="w-5 h-5 text-[#0D3B66] mt-1 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-gray-800 text-sm font-medium">{notification.title}</p>
        <p className="text-gray-700 text-sm leading-relaxed mt-1">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.created_at)}</p>
      </div>
    </div>
  );
}

export function ResearcherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [researches, setResearches] = useState<Research[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const token = localStorage.getItem('token');

      // Load all data in parallel
      const [statsData, researchesData, notificationsData, paymentStatusData] = await Promise.all([
        researchService.getStats(userId),
        researchService.getAll({ user_id: userId }),
        notificationsService.getUserNotifications(userId).catch(() => []),
        axios.get(`${API_URL}/users/${userId}/payment-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { payment_status: 'pending' } })),
      ]);

      setStats(statsData);
      // Get only latest 3 researches
      setResearches(researchesData.slice(0, 3));
      // Get only latest 3 notifications
      setNotifications(notificationsData.slice(0, 3));
      setPaymentStatus(paymentStatusData.data.payment_status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResearch = (id: string) => {
    navigate(`/dashboard/view-research/${id}`);
  };

  const handleViewAllResearches = () => {
    navigate('/dashboard/my-research');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
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
          onClick={loadDashboardData}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'الأبحاث المرسلة',
      value: stats?.total || 0,
      icon: <Send className="w-6 h-6" />,
      subtitle: 'مقدمة للمجلة',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      title: 'تحت المراجعة',
      value: stats?.under_review || 0,
      icon: <Clock className="w-6 h-6" />,
      subtitle: 'قيد المراجعة',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    },
    {
      title: 'يتطلب تعديل',
      value: stats?.needs_revision || 0,
      icon: <AlertCircle className="w-6 h-6" />,
      subtitle: 'محتاج تعديلات',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    },
    {
      title: 'الأبحاث المقبولة',
      value: stats?.accepted || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      subtitle: 'تم قبولها',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">  
      {/* Welcome Header */}
      <WelcomeCard 
        userName={user?.name || 'د. أحمد محمد'}
        subtitle="تابع آخر المستجدات على أبحاثك وأنشطتك الأكاديمية"
      />

      {/* Payment Status Alert */}
      {paymentStatus !== 'verified' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {paymentStatus === 'pending' ? 'يجب دفع رسوم التقديم' : 'في انتظار موافقة الإدارة'}
              </h3>
              <p className="text-gray-700 mb-4">
                {paymentStatus === 'pending' 
                  ? 'لتتمكن من تقديم أبحاثك، يرجى إتمام عملية دفع رسوم التقديم أولاً.'
                  : 'تم إرسال طلب الدفع للإدارة. سيتم مراجعته والموافقة عليه قريباً.'}
              </p>
              {paymentStatus === 'pending' && (
                <button
                  onClick={() => navigate('/dashboard/payment-instructions')}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-md"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>الذهاب لصفحة الدفع</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص الأنشطة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Recent Researches Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">أبحاثي الجديدة</h2>
            <p className="text-sm text-gray-500 mt-1">آخر الأبحاث المقدمة والمحدثة</p>
          </div>
          <button 
            onClick={handleViewAllResearches}
            className="px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm font-medium"
          >
            عرض الكل
          </button>
        </div>

        {researches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">أبحاثي الجديدة</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">الحالة</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">تاريخ التقديم</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">آخر تحديث</th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {researches.map((research) => (
                  <ResearchItem key={research.id} research={research} onView={handleViewResearch} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">لا توجد أبحاث مقدمة بعد</p>
            <button
              onClick={() => navigate('/dashboard/submit-research')}
              className="text-[#0D3B66] hover:underline font-medium"
            >
              قدم بحثك الأول
            </button>
          </div>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">آخر الإشعارات</h2>
          <p className="text-sm text-gray-500 mt-1">تحديثات مهمة حول أبحاثك</p>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">لا توجد إشعارات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
}
