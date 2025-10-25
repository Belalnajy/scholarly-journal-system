import { Mail, Phone, MapPin } from 'lucide-react';
import { UserRole } from '../../types';

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  isActive?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function UserCard({
  id,
  name,
  email,
  role,
  avatar,
  phone,
  location,
  joinDate,
  isActive = true,
  onEdit,
  onDelete,
  onView,
}: UserCardProps) {
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.RESEARCHER:
        return 'باحث';
      case UserRole.EDITOR:
        return 'محرر';
      case UserRole.REVIEWER:
        return 'محكم';
      case UserRole.ADMIN:
        return 'مدير';
      default:
        return 'مستخدم';
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.RESEARCHER:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case UserRole.EDITOR:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case UserRole.REVIEWER:
        return 'bg-green-100 text-green-800 border-green-300';
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#0D3B66] flex items-center justify-center text-white font-bold text-lg">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{name.charAt(0)}</span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${getRoleColor(role)}`}>
              {getRoleLabel(role)}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-600">{isActive ? 'نشط' : 'غير نشط'}</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="truncate">{email}</span>
        </div>
        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Join Date */}
      {joinDate && (
        <p className="text-xs text-gray-500 mb-4">انضم في: {joinDate}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 bg-[#0D3B66] text-white text-sm rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
          >
            عرض
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            تعديل
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
          >
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
