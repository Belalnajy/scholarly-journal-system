import { useState, useEffect } from 'react';
import {
  DollarSign,
  CheckCircle,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Mail,
  X,
} from 'lucide-react';
import { DashboardHeader } from '../../../components/dashboard';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Researcher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  payment_status: string;
  updated_at: string;
  created_at: string;
}

export function ManagePaymentsPage() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'paid' | 'verified'
  >('all');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadResearchers();
  }, []);

  const loadResearchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // جلب كل الباحثين فقط
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // فلترة الباحثين فقط
      const researchersOnly = response.data.filter(
        (user: any) => user.role === 'researcher'
      );
      setResearchers(researchersOnly);
    } catch (error) {
      console.error('Error loading researchers:', error);
      toast.error('فشل في تحميل قائمة الباحثين');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (userId: string) => {
    try {
      setVerifying(userId);
      const token = localStorage.getItem('token');

      await axios.patch(
        `${API_URL}/users/${userId}/verify-payment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('تم تفعيل الحساب بنجاح');

      // Reload list
      await loadResearchers();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('فشل في تفعيل الحساب');
    } finally {
      setVerifying(null);
    }
  };

  const handleDeactivateClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedUserId) return;

    try {
      setVerifying(selectedUserId);
      setShowDeactivateModal(false);
      const token = localStorage.getItem('token');

      // استخدام endpoint مخصص لإلغاء التفعيل
      await axios.patch(
        `${API_URL}/users/${selectedUserId}/deactivate-payment`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('تم إلغاء تفعيل الحساب بنجاح');

      // Reload list
      await loadResearchers();
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('فشل في إلغاء التفعيل');
    } finally {
      setVerifying(null);
      setSelectedUserId(null);
    }
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
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Filter researchers based on selected status
  const filteredResearchers =
    filterStatus === 'all'
      ? researchers
      : researchers.filter((r) => r.payment_status === filterStatus);

  const pendingCount = researchers.filter(
    (r) => r.payment_status === 'pending'
  ).length;
  const paidCount = researchers.filter(
    (r) => r.payment_status === 'paid'
  ).length;
  const verifiedCount = researchers.filter(
    (r) => r.payment_status === 'verified'
  ).length;

  return (
    <div className="space-y-6" dir="rtl">
      <DashboardHeader
        title="إدارة حسابات الباحثين"
        subtitle="تفعيل حسابات الباحثين للسماح لهم بتقديم الأبحاث"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {researchers.length}
              </h3>
              <p className="text-sm text-gray-600">إجمالي الباحثين</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-yellow-800">
                {pendingCount}
              </h3>
              <p className="text-sm text-yellow-700">لم يدفعوا</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-800">{paidCount}</h3>
              <p className="text-sm text-blue-700">في انتظار الموافقة</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-800">
                {verifiedCount}
              </h3>
              <p className="text-sm text-green-700">مفعّلين</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            الكل ({researchers.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            لم يدفعوا ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'paid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            في انتظار الموافقة ({paidCount})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'verified'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            مفعّلين ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Researchers List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">قائمة الباحثين</h2>
          <p className="text-sm text-gray-500 mt-1">
            يمكنك تفعيل حسابات الباحثين للسماح لهم بتقديم الأبحاث
          </p>
        </div>

        {filteredResearchers.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              لا توجد دفعات معلقة
            </h3>
            <p className="text-gray-600">
              جميع الدفعات تم مراجعتها والموافقة عليها
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-right text-sm font-bold text-gray-700">
                    الباحث
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                    البريد الإلكتروني
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                    رقم الهاتف
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                    تاريخ الطلب
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-bold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResearchers.map((researcher) => (
                  <tr
                    key={researcher.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            researcher.payment_status === 'verified'
                              ? 'bg-green-100'
                              : researcher.payment_status === 'paid'
                              ? 'bg-blue-100'
                              : 'bg-yellow-100'
                          }`}
                        >
                          <User
                            className={`w-5 h-5 ${
                              researcher.payment_status === 'verified'
                                ? 'text-green-600'
                                : researcher.payment_status === 'paid'
                                ? 'text-blue-600'
                                : 'text-yellow-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {researcher.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            معرف: {researcher.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {researcher.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-gray-700">
                        {researcher.phone || 'غير متوفر'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(researcher.updated_at)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {researcher.payment_status === 'verified' ? (
                          <>
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                              <CheckCircle className="w-4 h-4" />
                              <span>مفعّل</span>
                            </span>
                            <button
                              onClick={() => handleDeactivateClick(researcher.id)}
                              disabled={verifying === researcher.id}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="إلغاء التفعيل"
                            >
                              {verifying === researcher.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleVerifyPayment(researcher.id)}
                            disabled={verifying === researcher.id}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {verifying === researcher.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>جاري التفعيل...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>تفعيل الحساب</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">
              💡 كيفية العمل
            </h4>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">1.</span>
                <span>الباحث يتواصل معك عبر الواتساب ويقوم بالدفع</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">2.</span>
                <span>بعد التأكد من الدفع، اضغط زر "تفعيل الحساب" ✅</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">3.</span>
                <span>سيتمكن الباحث فوراً من تقديم أبحاثه بعد التفعيل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">4.</span>
                <span>يمكنك إلغاء التفعيل بالضغط على زر ❌ بجانب "مفعّل"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">5.</span>
                <span>يتم إرسال إشعار تلقائي للباحث عند تفعيل حسابه</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1 font-bold">⚠️</span>
                <span className="font-bold">
                  بعد تقديم الباحث لبحثه، سيتم إلغاء تفعيل حسابه تلقائياً (رسوم لبحث واحد فقط)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">تأكيد إلغاء التفعيل</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إلغاء تفعيل هذا الحساب؟ لن يتمكن الباحث من تقديم الأبحاث بعد إلغاء التفعيل.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDeactivate}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                نعم، إلغاء التفعيل
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedUserId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
