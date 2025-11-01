import { Plus, Calendar, Eye, Edit, FileText, X, Save, CheckCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import issuesService from '../../../services/issuesService';
import articlesService from '../../../services/articlesService';
import type { Issue, CreateIssueDto } from '../../../services/issuesService';
import type { Article } from '../../../services/articlesService';

// Types
interface IssueWithArticles extends Issue {
  articles: Article[];
}

// Create Issue Modal
function CreateIssueModal({ onClose, onSave }: { onClose: () => void; onSave: (data: CreateIssueDto) => void }) {
  const [formData, setFormData] = useState<CreateIssueDto>({
    issue_number: '',
    title: '',
    description: '',
    publish_date: '',
    max_articles: 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">إنشاء عدد جديد</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6" dir="rtl">
        {/* رقم العدد */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
            رقم العدد
          </label>
          <input
            type="text"
            value={formData.issue_number}
            onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })}
            placeholder="ISS-2024-001"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right"
            required
          />
        </div>

          {/* عنوان العدد */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
              عنوان العدد
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="العدد الثالث - يوليو 2024"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right"
              required
            />
          </div>

          {/* وصف العدد */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
              وصف العدد
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر عن محتوى العدد..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none text-right"
              required
            />
          </div>

          {/* تاريخ النشر المخطط + الحد الأقصى للمقالات */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                تاريخ النشر المخطط
              </label>
              <input
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                placeholder="dd/mm/yy"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right"
                required
              />
              <p className="mt-2 text-xs text-gray-500 text-right">
                 للتخطيط فقط. عند النشر يتحول لتاريخ النشر الفعلي
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 text-right">
                الحد الأقصى للمقالات
              </label>
              <input
                type="number"
                value={formData.max_articles}
                onChange={(e) => setFormData({ ...formData, max_articles: parseInt(e.target.value) || 0 })}
                placeholder="12"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all text-right"
                required
              />
              <p className="mt-2 text-xs text-gray-500 text-right">
                 لن يمكن إضافة مقالات تتجاوز هذا العدد
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold text-sm sm:text-base"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>إنشاء العدد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Publish Issue Modal
function PublishIssueModal({ issue, onClose, onPublish }: { issue: IssueWithArticles; onClose: () => void; onPublish: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">نشر العدد</h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            هل أنت متأكد من نشر هذا العدد؟
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4" dir="rtl">
          {/* Issue Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-2">{issue.title}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📅 تاريخ النشر: {new Date(issue.publish_date || '').toLocaleDateString('ar-EG')}</p>
              <p>📄 عدد المقالات: {issue.total_articles} مقال</p>
              <p>📊 التقدم: {issue.progress_percentage}%</p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">ملاحظة:</span> بعد نشر العدد، سيكون متاحاً للقراء على الموقع الإلكتروني ولن يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold text-sm sm:text-base"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => {
                onPublish();
                onClose();
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm sm:text-base"
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>تأكيد النشر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Issue Card Component
function IssueCard({ issue, onPublish, onDelete }: { issue: IssueWithArticles; onPublish: (issueId: string) => void; onDelete: (issueId: string) => void }) {
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">{issue.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            issue.status === 'published' 
              ? 'bg-green-100 text-green-700' 
              : issue.status === 'in-progress'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {issue.status === 'published' ? 'منشور' : issue.status === 'in-progress' ? 'قيد التحضير' : 'مخطط'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{issue.description || 'لا يوجد وصف'}</p>
      </div>

      {/* Progress */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">التقدم</span>
          <span className="text-sm font-bold text-gray-800">{issue.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#0D3B66] h-2 rounded-full transition-all"
            style={{ width: `${issue.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Articles */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-800">المقالات في العدد</h4>
          <button 
            onClick={() => navigate(`/dashboard/issues/${issue.id}/add-article`)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقال</span>
          </button>
        </div>
        <div className="space-y-2">
          {issue.articles.map((article) => (
            <div 
              key={article.id} 
              onClick={() => navigate(`/dashboard/articles/${article.id}`)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{article.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {article.authors.map(a => a.name).join(', ')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                article.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {article.status === 'published' ? 'منشور' : 'جاهز للنشر'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 flex gap-2">
        <button 
          onClick={() => navigate(`/dashboard/issues/${issue.id}/articles`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>عرض المقالات</span>
        </button>
        <button 
          onClick={() => navigate(`/dashboard/issues/${issue.id}/edit`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          <span>تحرير العدد</span>
        </button>
        <button 
          onClick={() => setShowPublishModal(true)}
          disabled={issue.status === 'published'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          <span>{issue.status === 'published' ? 'تم النشر' : 'نشر العدد'}</span>
        </button>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishIssueModal
          issue={issue}
          onClose={() => setShowPublishModal(false)}
          onPublish={() => onPublish(issue.id)}
        />
      )}
    </div>
  );
}

export function ManageIssuesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [issues, setIssues] = useState<IssueWithArticles[]>([]);
  const [stats, setStats] = useState({ published: 0, inProgress: 0, planned: 0 });
  const [loading, setLoading] = useState(true);

  // Load issues on mount
  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const issuesData = await issuesService.getAllIssues();
      
      // Load articles for each issue
      const issuesWithArticles = await Promise.all(
        issuesData.map(async (issue) => {
          const articles = await articlesService.getArticlesByIssueId(issue.id);
          return { ...issue, articles };
        })
      );
      
      setIssues(issuesWithArticles);
      
      // Calculate stats
      const statsData = await issuesService.getStats();
      setStats({
        published: statsData.published,
        inProgress: statsData.inProgress,
        planned: statsData.planned,
      });
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('فشل في تحميل الأعداد');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIssue = async (data: CreateIssueDto) => {
    try {
      await issuesService.createIssue(data);
      toast.success('تم إنشاء العدد بنجاح!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
        icon: '✅',
      });
      loadIssues(); // Reload issues
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast.error(error.response?.data?.message || 'فشل في إنشاء العدد');
    }
  };

  const handlePublishIssue = async (issueId: string) => {
    try {
      await issuesService.publishIssue(issueId);
      toast.success('تم نشر العدد بنجاح! العدد الآن متاح للقراء على الموقع الإلكتروني.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
        },
      
      });
      loadIssues(); // Reload issues
    } catch (error: any) {
      console.error('Error publishing issue:', error);
      toast.error(error.response?.data?.message || 'فشل في نشر العدد');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العدد؟')) return;
    
    try {
      await issuesService.deleteIssue(issueId);
      toast.success('تم حذف العدد بنجاح!');
      loadIssues(); // Reload issues
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      toast.error(error.response?.data?.message || 'فشل في حذف العدد');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Container */}
      <Toaster />
      
      {/* Header */}
      <DashboardHeader title="إدارة الأعداد" subtitle="متابعة إدارة المحتوى والأعداد المنشورة" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">الأعداد المنشورة</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.published}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">قيد التحضير</h3>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <Edit className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.inProgress}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">قيد المخطط</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.planned}</p>
        </div>
      </div>

      {/* Issues Management */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">إدارة أعداد المجلة</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء عدد جديد</span>
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
              <p className="text-gray-600 mt-4">جاري التحميل...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد أعداد حالياً</p>
            </div>
          ) : (
            issues.map((issue) => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                onPublish={handlePublishIssue}
                onDelete={handleDeleteIssue}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Issue Modal */}
      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveIssue}
        />
      )}
    </div>
  );
}
