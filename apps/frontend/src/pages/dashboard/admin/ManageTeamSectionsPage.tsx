import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import teamService from '../../../services/teamService';
import { TeamSection, CreateTeamSectionDto, UpdateTeamSectionDto } from '../../../types/team.types';

export function ManageTeamSectionsPage() {
  const [sections, setSections] = useState<TeamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<TeamSection | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const data = await teamService.getAllSectionsAdmin();
      setSections(data);
    } catch (error: any) {
      toast.error('فشل في تحميل الأقسام');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأعضاء المرتبطين به.')) {
      return;
    }

    try {
      await teamService.deleteSection(id);
      toast.success('تم حذف القسم بنجاح');
      fetchSections();
    } catch (error: any) {
      toast.error('فشل في حذف القسم');
      console.error(error);
    }
  };

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
          <h1 className="text-3xl font-bold text-[#093059]">إدارة أقسام الفريق</h1>
          <p className="mt-2 text-gray-600">إضافة وتعديل أقسام الفريق الأكاديمي والإداري</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#093059] px-6 py-3 text-white transition-colors hover:bg-[#0a4a7a]"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-lg text-gray-600">لا توجد أقسام حالياً</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-[#093059] hover:underline"
            >
              إضافة قسم جديد
            </button>
          </div>
        ) : (
          sections.map((section) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <GripVertical className="mt-1 h-5 w-5 cursor-move text-gray-400" />
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-[#093059]">{section.title}</h3>
                      {!section.is_active && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                          غير نشط
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-600">{section.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>الأيقونة: {section.icon}</span>
                      <span>الترتيب: {section.display_order}</span>
                      <span>عدد الأعضاء: {section.members?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSection(section)}
                    className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingSection) && (
          <SectionFormModal
            section={editingSection}
            onClose={() => {
              setShowAddModal(false);
              setEditingSection(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditingSection(null);
              fetchSections();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Section Form Modal Component
interface SectionFormModalProps {
  section: TeamSection | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SectionFormModal({ section, onClose, onSuccess }: SectionFormModalProps) {
  const [formData, setFormData] = useState<CreateTeamSectionDto>({
    title: section?.title || '',
    icon: section?.icon || 'Users',
    description: section?.description || '',
    color: section?.color || 'from-[#093059] to-[#0a4a7a]',
    display_order: section?.display_order || 0,
    is_active: section?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const iconOptions = ['Users', 'UserCog', 'Briefcase', 'HeartHandshake'];
  const colorOptions = [
    { label: 'أزرق داكن', value: 'from-[#093059] to-[#0a4a7a]' },
    { label: 'ذهبي', value: 'from-[#b2823e] to-[#9a6f35]' },
    { label: 'رمادي', value: 'from-gray-600 to-gray-800' },
    { label: 'أخضر', value: 'from-green-600 to-green-800' },
    { label: 'بنفسجي', value: 'from-purple-600 to-purple-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (section) {
        await teamService.updateSection(section.id, formData as UpdateTeamSectionDto);
        toast.success('تم تحديث القسم بنجاح');
      } else {
        await teamService.createSection(formData);
        toast.success('تم إضافة القسم بنجاح');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(section ? 'فشل في تحديث القسم' : 'فشل في إضافة القسم');
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
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
        dir="rtl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#093059]">
            {section ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              عنوان القسم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              الوصف <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              rows={3}
              required
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              الأيقونة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              required
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              اللون <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              required
            >
              {colorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </div>

          {/* Display Order */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              ترتيب العرض
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#093059] focus:outline-none"
              min="0"
            />
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
              القسم نشط
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#093059] px-6 py-3 text-white transition-colors hover:bg-[#0a4a7a] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{section ? 'تحديث' : 'إضافة'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
