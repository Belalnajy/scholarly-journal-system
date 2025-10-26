import { ReactNode, useEffect, useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { SidebarNavItem } from '../../types';
import notificationsService from '../../services/notifications.service';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: SidebarNavItem[];
  userInfo?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function DashboardLayout({ children, navItems, userInfo, onLogout }: DashboardLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 10 seconds for new notifications (faster polling)
    const interval = setInterval(fetchUnreadCount, 10000);

    // Listen for manual updates from notifications page
    const handleNotificationsUpdate = () => {
      fetchUnreadCount();
    };
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
    };
  }, []);

  // Add badge to notifications nav item
  const navItemsWithBadge = navItems.map((item) => {
    if (item.id === 'notifications' && unreadCount > 0) {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar 
        navItems={navItemsWithBadge} 
        userInfo={userInfo} 
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 right-4 z-30 lg:hidden p-3 bg-[#0D3B66] text-white rounded-lg shadow-lg hover:bg-[#0D3B66]/90 transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      {/* Main Content */}
      <main className="lg:mr-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
