import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Building2, Calendar, Edit2, Camera, Award, BookOpen, Globe, FileText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../contexts';
import { UserRole, AcademicDegree, UpdateUserDto } from '../../../types/user.types';
import { useUserMutations } from '../../../hooks';
import activityLogsService, { ActivityAction } from '../../../services/activity-logs.service';
import usersService from '../../../services/users.service';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user } = useAuth();
  const { updateUser, loading: updateLoading } = useUserMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    affiliation: '',
    department: '',
    academicDegree: '',
    researchInterests: '',
    orcidId: '',
    googleScholarId: '',
    researchGateId: '',
    yearsOfExperience: '0',
    numberOfPublications: '0',
    bio: '',
    expertiseAreas: '',
    languagesSpoken: '',
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        affiliation: user.affiliation || '',
        department: user.department || '',
        academicDegree: user.academic_degree || '',
        researchInterests: user.research_interests || '',
        orcidId: user.orcid_id || '',
        googleScholarId: user.google_scholar_id || '',
        researchGateId: user.research_gate_id || '',
        yearsOfExperience: String(user.years_of_experience || 0),
        numberOfPublications: String(user.number_of_publications || 0),
        bio: user.bio || '',
        expertiseAreas: user.expertise_areas || '',
        languagesSpoken: user.languages_spoken || '',
      });
    }
  }, [user]);

  if (!user) return null;

  // Check if user is researcher (show academic fields)
  const isResearcher = user.role === UserRole.RESEARCHER;
  // Check if user is editor or reviewer (show expertise fields)
  const isEditorOrReviewer = user.role === UserRole.EDITOR || user.role === UserRole.REVIEWER;
  // Check if user is admin (show all fields)
  const isAdmin = user.role === UserRole.ADMIN;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة صالحة');
        return;
      }

      // Store file for upload
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      // If user has an avatar on Cloudinary, delete it
      if (user.avatar_cloudinary_secure_url || user.avatar_url) {
        await usersService.deleteAvatar(user.id);
        toast.success('تم حذف الصورة بنجاح');
        window.location.reload();
      } else {
        // Just clear preview if no avatar uploaded yet
        setAvatarPreview(null);
        setAvatarFile(null);
      }
    } catch (error) {
      toast.error('فشل حذف الصورة');
      console.error('Error deleting avatar:', error);
    }
  };

  const getAcademicDegreeLabel = (degree: string): string => {
    const labels: { [key: string]: string } = {
      'bachelor': 'بكالوريوس',
      'master': 'ماجستير',
      'phd': 'دكتوراه',
      'assistant-professor': 'أستاذ مساعد',
      'associate-professor': 'أستاذ مشارك',
      'professor': 'أستاذ',
    };
    return labels[degree] || degree || 'غير محدد';
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Upload avatar to Cloudinary if there's a new file
      if (avatarFile) {
        toast.loading('جاري رفع الصورة...', { id: 'avatar-upload' });
        await usersService.uploadAvatar(user.id, avatarFile);
        toast.success('تم رفع الصورة بنجاح!', { id: 'avatar-upload' });
      }

      // Update other user data
      const updateData: UpdateUserDto = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        specialization: formData.specialization || undefined,
        affiliation: formData.affiliation || undefined,
        department: formData.department || undefined,
        academic_degree: formData.academicDegree as AcademicDegree || undefined,
        research_interests: formData.researchInterests || undefined,
        orcid_id: formData.orcidId || undefined,
        google_scholar_id: formData.googleScholarId || undefined,
        research_gate_id: formData.researchGateId || undefined,
        years_of_experience: parseInt(formData.yearsOfExperience) || 0,
        number_of_publications: parseInt(formData.numberOfPublications) || 0,
        bio: formData.bio || undefined,
        expertise_areas: formData.expertiseAreas || undefined,
        languages_spoken: formData.languagesSpoken || undefined,
      };

      await updateUser(user.id, updateData);
      
      // Log activity
      await activityLogsService.logUserAction(
        ActivityAction.USER_UPDATE_PROFILE,
        `تم تحديث الملف الشخصي`,
        { updated_fields: Object.keys(updateData).filter(k => updateData[k as keyof UpdateUserDto] !== undefined) }
      );
      
      toast.success('تم حفظ التغييرات بنجاح!');
      setIsEditing(false);
      setAvatarFile(null);
      
      // Reload page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error('فشل حفظ التغييرات');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0D3B66]/10 rounded-lg">
              <User className="w-7 h-7 text-[#0D3B66]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">المعلومات الشخصية</h1>
          </div>
          <p className="text-gray-600">بياناتك الأساسية والأكاديمية</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A961] to-[#B89851] text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'إلغاء التعديل' : 'تعديل المعلومات'}</span>
        </button>
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#0D3B66] to-[#0D3B66]/80 flex items-center justify-center text-white shadow-xl border-4 border-white overflow-hidden">
                {avatarPreview || user.avatar_cloudinary_secure_url || user.avatar_url ? (
                  <img 
                    src={avatarPreview || user.avatar_cloudinary_secure_url || user.avatar_url || ''} 
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-20 h-20" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-2 p-3 bg-[#C9A961] rounded-full shadow-lg hover:bg-[#B89851] transition-all border-2 border-white cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                </>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <label
                  htmlFor="avatar-upload"
                  className="text-sm text-[#0D3B66] hover:text-[#0D3B66]/80 transition-colors font-medium cursor-pointer"
                >
                  تغيير الصورة
                </label>
                {(avatarPreview || user.avatar_cloudinary_secure_url || user.avatar_url) && (
                  <>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={handleRemoveAvatar}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                    >
                      حذف الصورة
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">الاسم الكامل</label>
                </div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all mb-2 font-medium"
                    />
                    {/* Title field removed - using role instead */}
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 font-semibold mb-1">{formData.name}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </>
                )}
              </div>

              {/* Email */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">البريد الإلكتروني</label>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                  />
                ) : (
                  <p className="text-gray-800">{formData.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">رقم الهاتف</label>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                  />
                ) : (
                  <p className="text-gray-800">{formData.phone}</p>
                )}
              </div>

              {/* Specialization */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">التخصص</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                  />
                ) : (
                  <p className="text-gray-800">{formData.specialization}</p>
                )}
              </div>

              {/* University */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">الجامعة</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                  />
                ) : (
                  <p className="text-gray-800">{formData.affiliation}</p>
                )}
              </div>

              {/* Registration Date */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">تاريخ التسجيل</label>
                </div>
                <p className="text-gray-800">{new Date(user.created_at).toLocaleDateString('ar-SA')}</p>
              </div>

              {/* Department - Show for all academic roles */}
              {(isResearcher || isEditorOrReviewer || isAdmin) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <label className="text-sm font-bold">القسم / الكلية</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                    />
                  ) : (
                    <p className="text-gray-800">{formData.department}</p>
                  )}
                </div>
              )}

              {/* Academic Degree - Show for all academic roles */}
              {(isResearcher || isEditorOrReviewer || isAdmin) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <label className="text-sm font-bold">الدرجة العلمية</label>
                  </div>
                  {isEditing ? (
                    <select
                      value={formData.academicDegree}
                      onChange={(e) => setFormData({ ...formData, academicDegree: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                    >
                      <option value="">اختر الدرجة العلمية</option>
                      <option value="bachelor">بكالوريوس</option>
                      <option value="master">ماجستير</option>
                      <option value="phd">دكتوراه</option>
                      <option value="assistant-professor">أستاذ مساعد</option>
                      <option value="associate-professor">أستاذ مشارك</option>
                      <option value="professor">أستاذ</option>
                    </select>
                  ) : (
                    <p className="text-gray-800">{getAcademicDegreeLabel(formData.academicDegree)}</p>
                  )}
                </div>
              )}

              {/* Country & City fields removed - not in backend schema */}

              {/* Years of Experience - Show for Researchers and Editors/Reviewers */}
              {(isResearcher || isEditorOrReviewer || isAdmin) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <Award className="w-4 h-4" />
                    </div>
                    <label className="text-sm font-bold">سنوات الخبرة</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                    />
                  ) : (
                    <p className="text-gray-800">{formData.yearsOfExperience} سنوات</p>
                  )}
                </div>
              )}

              {/* Number of Publications - Show for Researchers and Editors/Reviewers */}
              {(isResearcher || isEditorOrReviewer || isAdmin) && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-[#0D3B66]/30 transition-all">
                  <div className="flex items-center gap-2 mb-3 text-[#0D3B66]">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <label className="text-sm font-bold">عدد المنشورات</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.numberOfPublications}
                      onChange={(e) => setFormData({ ...formData, numberOfPublications: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                    />
                  ) : (
                    <p className="text-gray-800">{formData.numberOfPublications} منشور</p>
                  )}
                </div>
              )}
            </div>

            {/* Research Interests - Show for Researchers and Editors/Reviewers */}
            {(isResearcher || isEditorOrReviewer || isAdmin) && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-2 mb-4 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <FileText className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">الاهتمامات البحثية</label>
                </div>
                {isEditing ? (
                  <textarea
                    value={formData.researchInterests}
                    onChange={(e) => setFormData({ ...formData, researchInterests: e.target.value })}
                    rows={3}
                    placeholder="مثال: الذكاء الاصطناعي، التعلم الإلكتروني، تصميم المناهج"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{formData.researchInterests}</p>
                )}
              </div>
            )}

            {/* Academic IDs - Show for Researchers and Editors/Reviewers */}
            {(isResearcher || isEditorOrReviewer || isAdmin) && (
              <div className="mt-6 bg-gradient-to-br from-indigo-50 to-indigo-50/50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Globe className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">المعرفات الأكاديمية</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ORCID */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">ORCID ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.orcidId}
                        onChange={(e) => setFormData({ ...formData, orcidId: e.target.value })}
                        placeholder="0000-0002-1234-5678"
                        className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-sm"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm">{formData.orcidId || 'غير محدد'}</p>
                    )}
                  </div>
                  {/* Google Scholar */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Google Scholar ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.googleScholarId}
                        onChange={(e) => setFormData({ ...formData, googleScholarId: e.target.value })}
                        placeholder="معرف Google Scholar"
                        className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-sm"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm">{formData.googleScholarId || 'غير محدد'}</p>
                    )}
                  </div>
                  {/* ResearchGate */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">ResearchGate ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.researchGateId}
                        onChange={(e) => setFormData({ ...formData, researchGateId: e.target.value })}
                        placeholder="معرف ResearchGate"
                        className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-sm"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm">{formData.researchGateId || 'غير محدد'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Expertise Areas (for Editors/Reviewers) */}
            {(user?.role === UserRole.EDITOR || user?.role === UserRole.REVIEWER || user?.role === UserRole.ADMIN) && (
              <div className="mt-6 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl p-6 border border-orange-100">
                <div className="flex items-center gap-2 mb-4 text-[#0D3B66]">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Award className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-bold">مجالات الخبرة (للتحكيم)</label>
                </div>
                {isEditing ? (
                  <textarea
                    value={formData.expertiseAreas}
                    onChange={(e) => setFormData({ ...formData, expertiseAreas: e.target.value })}
                    rows={3}
                    placeholder="مثال: تكنولوجيا التعليم، المناهج وطرق التدريس، التقويم التربوي"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{formData.expertiseAreas}</p>
                )}
              </div>
            )}

            {/* Languages */}
            <div className="mt-6 bg-gradient-to-br from-cyan-50 to-cyan-50/50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-2 mb-4 text-[#0D3B66]">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <Globe className="w-4 h-4" />
                </div>
                <label className="text-sm font-bold">اللغات</label>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.languagesSpoken}
                  onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
                  placeholder="مثال: العربية، الإنجليزية، الفرنسية"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
                />
              ) : (
                <p className="text-gray-700">{formData.languagesSpoken}</p>
              )}
            </div>

            {/* Bio Section */}
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-4 text-[#0D3B66]">
                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <label className="text-sm font-bold">نبذة تعريفية</label>
              </div>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
              )}
            </div>

            {/* Save Button (shown only in edit mode) */}
            {isEditing && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0D3B66] to-[#0D3B66]/90 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
