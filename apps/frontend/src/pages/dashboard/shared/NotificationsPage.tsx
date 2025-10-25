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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-[#0D3B66]" />
            <h1 className="text-3xl font-bold text-gray-800">الإشعارات</h1>
          </div>
          <p className="text-gray-600">آخر التحديثات والرسائل</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">تحديث</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm">وضع علامة على الكل كمقروء</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">حذف المقروءة</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats & Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإشعارات</p>
              <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div>
              <p className="text-sm text-gray-600 mb-1">غير مقروءة</p>
              <p className="text-2xl font-bold text-[#0D3B66]">{unreadCount}</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#0D3B66] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-[#0D3B66] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                غير مقروءة ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">جميع الإشعارات</h2>
          <p className="text-sm text-gray-500">تاريخ كامل للإشعارات والتحديثات</p>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">تأكيد الحذف</h3>
            </div>
            <div className="p-6" dir="rtl">
              <p className="text-gray-700 text-lg mb-4">
                هل أنت متأكد من حذف <span className="font-bold">جميع الإشعارات المقروءة</span>؟
              </p>
              <p className="text-gray-600 text-sm">
                لن تتمكن من استرجاع هذه الإشعارات بعد الحذف.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearAll}
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
