import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Save, X, Search, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import teamService from '../../../services/teamService';
import { TeamMember, TeamSection, CreateTeamMemberDto, UpdateTeamMemberDto } from '../../../types/team.types';

export function ManageTeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sections, setSections] = useState<TeamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, sectionsData] = await Promise.all([
        teamService.getAllMembers(),
        teamService.getAllSectionsAdmin(),
      ]);
      setMembers(membersData);
      setSections(sectionsData);
    } catch (error: any) {
      toast.error('فشل في تحميل البيانات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamService.deleteMember(id);
      toast.success('تم حذف العضو بنجاح');
      setDeletingMember(null);
      fetchData();
    } catch (error: any) {
      toast.error('فشل في حذف العضو');
      console.error(error);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSection = filterSection === 'all' || member.section_id === filterSection;
    const matchesSearch =
      searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#093059]"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#093059]">إدارة أعضاء الفريق</h1>
          <p className="mt-2 text-gray-600">إضافة وتعديل أعضاء الفريق الأكاديمي والإداري</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#093059] px-6 py-3 text-white transition-colors hover:bg-[#0a4a7a]"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة عضو جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو المسمى الوظيفي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:border-[#093059] focus:outline-none"
          />
        </div>

        {/* Section Filter */}
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
        >
          <option value="all">جميع الأقسام</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg text-gray-600">
              {searchQuery || filterSection !== 'all'
                ? 'لا توجد نتائج للبحث'
                : 'لا يوجد أعضاء حالياً'}
            </p>
            {!searchQuery && filterSection === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-[#093059] hover:underline"
              >
                إضافة عضو جديد
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Member Image */}
              <div className="relative h-32 bg-gradient-to-br from-[#093059] to-[#0a4a7a]">
                <img
                  src={member.image_url || '/test-profile/image 14.png'}
                  alt={member.name}
                  className="h-full w-full object-cover opacity-20"
                />
                {!member.is_active && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                    غير نشط
                  </span>
                )}
              </div>

              {/* Member Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#093059]">{member.name}</h3>
                <p className="text-sm font-medium text-[#b2823e]">{member.title}</p>
                <p className="mt-1 text-sm text-gray-600">{member.role}</p>

                {member.university && (
                  <p className="mt-2 text-xs text-gray-500">{member.university}</p>
                )}

                {member.email && (
                  <p className="mt-1 text-xs text-gray-500">{member.email}</p>
                )}

                {/* Section Badge */}
                <div className="mt-3">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {sections.find((s) => s.id === member.section_id)?.title || 'غير محدد'}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => setDeletingMember(member)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingMember) && (
          <MemberFormModal
            member={editingMember}
            sections={sections}
            onClose={() => {
              setShowAddModal(false);
              setEditingMember(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditingMember(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMember && (
          <DeleteConfirmationModal
            member={deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirm={() => handleDelete(deletingMember.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Member Form Modal Component
interface MemberFormModalProps {
  member: TeamMember | null;
  sections: TeamSection[];
  onClose: () => void;
  onSuccess: () => void;
}

function MemberFormModal({ member, sections, onClose, onSuccess }: MemberFormModalProps) {
  const [formData, setFormData] = useState<CreateTeamMemberDto>({
    name: member?.name || '',
    title: member?.title || '',
    role: member?.role || '',
    description: member?.description || '',
    university: member?.university || '',
    country: member?.country || '',
    email: member?.email || '',
    image_url: member?.image_url || '',
    display_order: member?.display_order || 0,
    is_active: member?.is_active ?? true,
    section_id: member?.section_id || sections[0]?.id || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(member?.image_url || '');

  // Update formData when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        title: member.title,
        role: member.role,
        description: member.description || '',
        university: member.university || '',
        country: member.country || '',
        email: member.email || '',
        image_url: member.image_url || '',
        display_order: member.display_order,
        is_active: member.is_active,
        section_id: member.section_id,
      });
      setPreviewUrl(member.image_url || '');
    }
  }, [member]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setSelectedImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (memberId: string) => {
    if (!selectedImageFile) return;

    try {
      setUploadingImage(true);
      const updatedMember = await teamService.uploadMemberImage(memberId, selectedImageFile);
      setFormData({ ...formData, image_url: updatedMember.image_url || '' });
      toast.success('تم رفع الصورة بنجاح');
    } catch (error: any) {
      toast.error('فشل في رفع الصورة');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up empty strings for optional fields
      const cleanedData = {
        ...formData,
        description: formData.description?.trim() || undefined,
        university: formData.university?.trim() || undefined,
        country: formData.country?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        image_url: formData.image_url?.trim() || undefined,
      };

      if (member) {
        // Update existing member
        await teamService.updateMember(member.id, cleanedData as UpdateTeamMemberDto);
        
        // Upload image if selected
        if (selectedImageFile) {
          await handleImageUpload(member.id);
        }
        
        toast.success('تم تحديث العضو بنجاح');
      } else {
        // Create new member
        const newMember = await teamService.createMember(cleanedData);
        
        // Upload image if selected
        if (selectedImageFile && newMember.id) {
          await handleImageUpload(newMember.id);
        }
        
        toast.success('تم إضافة العضو بنجاح');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(member ? 'فشل في تحديث العضو' : 'فشل في إضافة العضو');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        dir="rtl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#093059]">
            {member ? 'تعديل العضو' : 'إضافة عضو جديد'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload - Available for both new and existing members */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              صورة العضو {!member && <span className="text-xs text-gray-500">(اختياري)</span>}
            </label>
            <div className="flex items-center gap-4">
              <img
                src={previewUrl || formData.image_url || '/test-profile/image 14.png'}
                alt={formData.name || 'صورة العضو'}
                className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
              />
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50">
                  <Upload className="h-5 w-5" />
                  <span>{selectedImageFile ? 'تغيير الصورة' : 'اختيار صورة'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                {selectedImageFile && (
                  <p className="text-xs text-green-600">
                    ✓ تم اختيار: {selectedImageFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  الحد الأقصى: 5 ميجابايت | الصيغ المدعومة: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                المسمى الوظيفي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              التخصص/الدور <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">الوصف (اختياري)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* University */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                الجامعة/المؤسسة (اختياري)
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                الدولة (اختياري)
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              البريد الإلكتروني (اختياري)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Section */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                القسم <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.section_id}
                onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
                required
              >
                <option value="">اختر القسم</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">ترتيب العرض</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
                min="0"
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#093059] focus:ring-[#093059]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              العضو نشط
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#093059] px-6 py-3 text-white transition-colors hover:bg-[#0a4a7a] disabled:opacity-50"
            >
              {saving || uploadingImage ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>{uploadingImage ? 'جاري رفع الصورة...' : 'جاري الحفظ...'}</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{member ? 'تحديث' : 'إضافة'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploadingImage}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  member: TeamMember;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({ member, onClose, onConfirm }: DeleteConfirmationModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        dir="rtl"
      >
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Content */}
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">تأكيد الحذف</h3>
          <p className="mt-2 text-gray-600">
            هل أنت متأكد من حذف العضو <span className="font-bold text-[#093059]">{member.name}</span>؟
          </p>
          <p className="mt-1 text-sm text-gray-500">
            لن تتمكن من التراجع عن هذا الإجراء
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5" />
                <span>حذف</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
