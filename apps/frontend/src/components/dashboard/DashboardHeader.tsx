// Shared Dashboard Header Component
// Used across: EditorDashboard, ReviewerDashboard

import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onNotificationClick?: () => void;
}

export function DashboardHeader({ title, subtitle, onNotificationClick }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      <button 
        onClick={onNotificationClick}
        className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors"
        aria-label="الإشعارات"
      >
        <Bell className="w-6 h-6" />
      </button>
    </div>
  );
}
