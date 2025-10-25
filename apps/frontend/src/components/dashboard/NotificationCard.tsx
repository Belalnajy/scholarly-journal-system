import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead?: boolean;
  onRead?: () => void;
  onDismiss?: () => void;
}

export function NotificationCard({
  id,
  title,
  message,
  type,
  timestamp,
  isRead = false,
  onRead,
  onDismiss,
}: NotificationCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
        };
      default: // info
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${
        !isRead ? 'border-r-4' : ''
      } hover:shadow-md transition-shadow relative`}
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 left-2 p-1 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`${config.iconColor} mt-1`}>{config.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-bold ${config.titleColor} ${!isRead ? 'font-extrabold' : ''}`}>
              {title}
            </h4>
            {!isRead && (
              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{message}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{timestamp}</span>
            {onRead && !isRead && (
              <button
                onClick={onRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                وضع علامة كمقروء
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
