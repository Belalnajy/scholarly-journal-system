import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, RefreshCw } from 'lucide-react';
import { NotificationCard } from '../../../components/dashboard';
import notificationsService, { Notification } from '../../../services/notifications.service';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const filters = filter === 'all' ? {} : { is_read: filter === 'read' };
      const data = await notificationsService.getAll(filters);
      setNotifications(data);
    } catch (error) {
      toast.error('فشل في تحميل الإشعارات');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    toast.success('تم تحديث الإشعارات');
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Map notification type to card type
  const getCardType = (type: string): 'info' | 'success' | 'warning' | 'error' => {
    if (type.includes('accepted') || type.includes('approved') || type.includes('published')) {
      return 'success';
    }
    if (type.includes('rejected') || type.includes('suspended')) {
      return 'error';
    }
    if (type.includes('reminder') || type.includes('revision')) {
      return 'warning';
    }
    return 'info';
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      // Trigger event to update sidebar counter
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('تم تعليم الإشعار كمقروء');
    } catch (error) {
      toast.error('فشل في تحديث الإشعار');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await notificationsService.delete(id);
      setNotifications(notifications.filter((notif) => notif.id !== id));
      // Trigger event to update sidebar counter
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('تم حذف الإشعار');
    } catch (error) {
      toast.error('فشل في حذف الإشعار');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(
        notifications.map((notif) => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      // Trigger event to update sidebar counter
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('تم تعليم جميع الإشعارات كمقروءة');
    } catch (error) {
      toast.error('فشل في تحديث الإشعارات');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsService.deleteAllRead();
      setNotifications(notifications.filter((notif) => !notif.is_read));
      setShowDeleteModal(false);
      // Trigger event to update sidebar counter
      window.dispatchEvent(new Event('notificationsUpdated'));
      toast.success('تم حذف جميع الإشعارات المقروءة');
    } catch (error) {
      toast.error('فشل في حذف الإشعارات');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-[#0D3B66]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">الإشعارات</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">آخر التحديثات والرسائل</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 text-xs sm:text-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-xs sm:text-sm"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">وضع علامة على الكل كمقروء</span>
              <span className="sm:hidden">قراءة الكل</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">حذف المقروءة</span>
              <span className="sm:hidden">حذف</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats & Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">إجمالي الإشعارات</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{notifications.length}</p>
            </div>
            <div className="w-px h-10 sm:h-12 bg-gray-200" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">غير مقروءة</p>
              <p className="text-xl sm:text-2xl font-bold text-[#0D3B66]">{unreadCount}</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <div className="flex gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#0D3B66] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-[#0D3B66] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">غير مقروءة ({unreadCount})</span>
                <span className="sm:hidden">غ.م. ({unreadCount})</span>
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-1 sm:flex-initial px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-[#0D3B66] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                مقروءة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">جميع الإشعارات</h2>
          <p className="text-xs sm:text-sm text-gray-500">تاريخ كامل للإشعارات والتحديثات</p>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                timestamp={notification.created_at}
                isRead={notification.is_read}
                type={getCardType(notification.type)}
                onRead={() => handleMarkAsRead(notification.id)}
                onDismiss={() => handleDismiss(notification.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'رائع! لقد قرأت جميع الإشعارات'
                : 'سيتم عرض الإشعارات الجديدة هنا'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-red-600 px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-bold text-white">تأكيد الحذف</h3>
            </div>
            <div className="p-4 sm:p-6" dir="rtl">
              <p className="text-gray-700 text-base sm:text-lg mb-3 sm:mb-4">
                هل أنت متأكد من حذف <span className="font-bold">جميع الإشعارات المقروءة</span>؟
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                لن تتمكن من استرجاع هذه الإشعارات بعد الحذف.
              </p>
            </div>
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearAll}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
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
