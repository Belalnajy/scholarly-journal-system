import * as Icons from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, trend, color = '#0D3B66', subtitle }: StatCardProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-6 h-6" /> : null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 hover:shadow-lg transition-shadow" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{getIcon(icon)}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <Icons.TrendingUp className="w-4 h-4" />
            ) : (
              <Icons.TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
