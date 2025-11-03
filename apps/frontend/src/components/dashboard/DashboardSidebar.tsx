import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { SidebarNavItem } from '../../types';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

interface DashboardSidebarProps {
  navItems: SidebarNavItem[];
  userInfo?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  navItems,
  userInfo,
  onLogout,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const location = useLocation();
  const { settings } = useSiteSettings();

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[
      iconName as keyof typeof Icons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Use settings for logo and site name
  const displayLogo = settings?.logo_url || '/journal-logo.png';
  const siteName = settings?.site_name || 'مجلة البحوث والدراسات';

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed right-0 top-0 h-screen w-64 bg-[#0D3B66] text-white flex flex-col shadow-lg z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
        `}
        dir="rtl"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center justify-center mb-2">
            <img
              src={displayLogo}
              alt={siteName}
              className="h-20 w-auto object-contain"
              onError={(e) => {
                // Fallback to default logo if image fails to load
                e.currentTarget.src = '/journal-logo.png';
              }}
            />
          </Link>
          <h2 className="text-center text-sm font-semibold text-white/90 mt-2">
            {siteName}
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                  ${
                    isActive(item.path)
                      ? 'border-r-[#b2823e] bg-[#b2823e]/30 border-r-4 text-[#b2823e] font-semibold shadow-md'
                      : 'text-white hover:bg-white/10'
                  }
                `}
                >
                  <span
                    className={
                      isActive(item.path) ? 'text-[#b2823e]' : 'text-white'
                    }
                  >
                    {getIcon(item.icon)}
                  </span>
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 p-4">
          {userInfo && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full bg-[#F4D35E] flex items-center justify-center text-[#0D3B66] font-bold">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{userInfo.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {userInfo.role}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
