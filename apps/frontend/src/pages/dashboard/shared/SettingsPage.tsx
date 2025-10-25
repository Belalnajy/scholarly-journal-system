import { useState } from 'react';
import { Settings, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '../../../contexts';
import { useUserMutations } from '../../../hooks';
import { usersService } from '../../../services/users.service';
import activityLogsService, { ActivityAction } from '../../../services/activity-logs.service';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user } = useAuth();
  const { updateUser, loading } = useUserMutations();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!user) return null;

  const handlePasswordSave = async () => {
    // Validate current password
    if (!passwordData.currentPassword) {
      toast.error('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    // Validate new password
    if (!passwordData.newPassword) {
      toast.error('يرجى إدخال كلمة المرور الجديدة');
      return;
    }

    // Validate confirm password
    if (!passwordData.confirmPassword) {
      toast.error('يرجى تأكيد كلمة المرور الجديدة');
      return;
    }

    // Check if new password matches confirm
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين');
      return;
    }

    // Check minimum length
    if (passwordData.newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    // Check if new password is same as current
    if (passwordData.newPassword === passwordData.currentPassword) {
      toast.error('كلمة المرور الجديدة يجب أن تختلف عن الحالية');
      return;
    }

    // Check password strength (optional)
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error('كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام', {
        duration: 4000,
      });
      return;
    }

    try {
      // Verify current password first
      try {
        await usersService.verifyPassword(user.id, passwordData.currentPassword);
      } catch (verifyError: any) {
        // If password verification fails, show error and stop
        if (verifyError.response?.status === 401) {
          toast.error('كلمة المرور الحالية غير صحيحة');
        } else if (verifyError.response?.status === 404) {
          toast.error('المستخدم غير موجود');
        } else {
          toast.error('فشل التحقق من كلمة المرور');
        }
        return; // Stop execution - DO NOT UPDATE PASSWORD
      }
      
      // If current password is correct, update to new password
      await updateUser(user.id, { password: passwordData.newPassword });
      
      // Log activity
      await activityLogsService.logUserAction(
        ActivityAction.SETTINGS_UPDATE,
        'تم تغيير كلمة المرور',
        { action: 'password_change' }
      );
      
      toast.success('تم تغيير كلمة المرور بنجاح!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      // Handle update errors
      if (error.response?.status === 400) {
        toast.error('البيانات المدخلة غير صحيحة');
      } else {
        toast.error('فشل تغيير كلمة المرور');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0D3B66]/10 rounded-lg">
              <Settings className="w-7 h-7 text-[#0D3B66]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
          </div>
          <p className="text-gray-600">إدارة الحساب والتفضيلات</p>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#0D3B66]/90 p-6">
          <h2 className="text-xl font-bold text-white">إعدادات الحساب</h2>
          <p className="text-sm text-white/80 mt-1">إدارة تفضيلاتك وإعدادات الأمان</p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {/* Change Password Section */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Lock className="w-6 h-6 text-[#0D3B66]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">تغيير كلمة المرور</h3>
                <p className="text-sm text-gray-600">قم بتحديث كلمة المرور لحسابك</p>
              </div>
            </div>

            <div className="space-y-4" dir="rtl">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D3B66] transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D3B66] transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D3B66] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePasswordSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
