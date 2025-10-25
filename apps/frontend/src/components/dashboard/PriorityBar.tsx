// Priority Bar Component
// Used in: EditorDashboard

export type PriorityLevel = 'high' | 'medium' | 'low';

interface PriorityBarProps {
  priority: PriorityLevel;
  showLabel?: boolean;
}

export function PriorityBar({ priority, showLabel = true }: PriorityBarProps) {
  const getConfig = () => {
    switch (priority) {
      case 'high':
        return { width: '100%', color: 'bg-red-500', text: 'عالية' };
      case 'medium':
        return { width: '60%', color: 'bg-yellow-500', text: 'متوسطة' };
      case 'low':
        return { width: '30%', color: 'bg-green-500', text: 'منخفضة' };
    }
  };

  const config = getConfig();

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">{config.text}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${config.color} h-2 rounded-full transition-all`} 
          style={{ width: config.width }}
        />
      </div>
    </div>
  );
}
