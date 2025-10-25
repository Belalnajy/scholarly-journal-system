import { ArrowRight, Save, UserCog, Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import usersService from '../../../services/users.service';
import activityLogsService, { ActivityAction } from '../../../services/activity-logs.service';
import { UserRole, AcademicDegree, UserStatus } from '../../../types/user.types';

export function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'researcher' as string,
    status: 'active' as string,
    affiliation: '',
    phone: '',
    specialization: '',
    department: '',
    academic_degree: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    if (!id) {
      toast.error('معرف المستخدم غير موجود');
      navigate('/dashboard/manage-users');
      return;
    }

    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = await usersService.getById(id!);
      
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        affiliation: user.affiliation || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        department: user.department || '',
        academic_degree: user.academic_degree || '',
        avatar_url: user.avatar_url || '',
      });

      // Set avatar preview if exists
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحميل بيانات المستخدم';
      toast.error(errorMessage);
      navigate('/dashboard/manage-users');
    } finally {
      setLoading(false);
    }
  };

  /**
   * معالجة رفع الصورة
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة فقط');
      return;
    }

    // التحقق من حجم الملف (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    // قراءة الصورة وتحويلها لـ Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      setFormData({ ...formData, avatar_url: base64String });
    };
    reader.readAsDataURL(file);
  };

  /**
   * حذف الصورة
   */
  const handleRemoveImage = () => {
    setAvatarPreview(null);
    setFormData({ ...formData, avatar_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Prepare data for backend
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
        status: formData.status as UserStatus,
        affiliation: formData.affiliation || undefined,
        phone: formData.phone || undefined,
        specialization: formData.specialization || undefined,
        department: formData.department || undefined,
        academic_degree: (formData.academic_degree as AcademicDegree) || undefined,
        avatar_url: formData.avatar_url || undefined,
      };

      // Send to backend
      await usersService.update(id!, userData);
      
      // Log activity
      await activityLogsService.logUserAction(
        ActivityAction.USER_UPDATE,
        `تم تحديث بيانات المستخدم: ${formData.name}`,
        { 
          target_user_id: id,
          target_user_name: formData.name,
          updated_fields: Object.keys(userData)
        }
      );
      
      toast.success('تم تحديث بيانات المستخدم بنجاح!');

      // Navigate back after short delay
      setTimeout(() => {
        navigate('/dashboard/manage-users');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تحديث بيانات المستخدم';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Container */}
      <Toaster />

      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-users')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="تعديل بيانات المستخدم" 
            subtitle="تحديث معلومات المستخدم في النظام"
          />
        </div>
      </div>

      {/* Edit User Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">المعلومات الأساسية</h2>
          </div>
          
          <div className="space-y-6">
                      {/* صورة الملف الشخصي */}
                      <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                صورة الملف الشخصي
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="حذف الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <UserCog className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-300 w-fit">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">اختر صورة</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    الحد الأقصى: 2 ميجابايت • الصيغ المدعومة: JPG, PNG, GIF
                  </p>
                </div>
              </div>
            </div>
            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="د. أحمد محمد السالم"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ahmed.mohamed@university.edu"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                required
              />
            </div>

            {/* الدور والحالة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* الدور */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الدور <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
                  required
                >
                  <option value="researcher">باحث</option>
                  <option value="reviewer">محكم</option>
                  <option value="editor">محرر</option>
                  <option value="admin">مدير</option>
                </select>
              </div>

              {/* الحالة */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الحالة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
                  required
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">معلق</option>
                </select>
              </div>
            </div>

  
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">معلومات إضافية</h2>
          
          <div className="space-y-6">
            {/* الانتماء المؤسسي */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الانتماء المؤسسي
              </label>
              <input
                type="text"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                placeholder="جامعة الملك سعود"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966 50 123 4567"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            {/* القسم */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                القسم
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="قسم علوم الحاسب"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            {/* التخصص */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                التخصص
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="الذكاء الاصطناعي، التعلم الآلي"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            {/* الدرجة العلمية */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الدرجة العلمية
              </label>
              <select
                value={formData.academic_degree}
                onChange={(e) => setFormData({ ...formData, academic_degree: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all bg-white"
              >
                <option value="">اختر الدرجة العلمية</option>
                <option value="bachelor">بكالوريوس</option>
                <option value="master">ماجستير</option>
                <option value="phd">دكتوراه</option>
                <option value="assistant-professor">أستاذ مساعد</option>
                <option value="associate-professor">أستاذ مشارك</option>
                <option value="professor">أستاذ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/manage-users')}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
