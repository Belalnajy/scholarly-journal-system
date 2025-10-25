import { ReactNode } from 'react';
import * as Icons from 'lucide-react';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function DashboardCard({ title, children, icon, action, className = '' }: DashboardCardProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-[#0D3B66]/10 rounded-lg text-[#0D3B66]">
                {getIcon(icon)}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm text-[#0D3B66] hover:text-[#0D3B66]/80 font-medium transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
