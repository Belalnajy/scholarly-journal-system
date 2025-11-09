import { Eye, Edit, Trash2, Download, QrCode, CheckCircle, Plus, Award, MoreVertical, FileText, RefreshCw, FileCheck, BookOpen, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import { CustomizeCertificateModal } from '../../../components/dashboard/CustomizeCertificateModal';
import { PDFViewer } from '../../../components/PDFViewer';
import articlesService from '../../../services/articlesService';
import issuesService from '../../../services/issuesService';
import type { Article, ArticleStats } from '../../../services/articlesService';
import type { Issue } from '../../../services/issuesService';

export function ManageArticlesPage() {
  const navigate = useNavigate();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    totalArticles: 0,
    publishedArticles: 0,
    readyToPublish: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalCitations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterIssue, setFilterIssue] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedArticleForCert, setSelectedArticleForCert] = useState<Article | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterIssue]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load articles with filters
      const statusFilter = filterStatus !== 'all' ? (filterStatus as 'ready-to-publish' | 'published') : undefined;
      const issueFilter = filterIssue !== 'all' ? filterIssue : undefined;
      
      const [articlesData, statsData, issuesData] = await Promise.all([
        articlesService.getAllArticles(issueFilter, statusFilter),
        articlesService.getStats(),
        issuesService.getAllIssues(),
      ]);
      
      setArticles(articlesData);
      setStats(statsData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('فشل في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteArticles = async () => {
    if (selectedArticles.length === 0) {
      toast.error('يرجى اختيار مقال واحد على الأقل');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف ${selectedArticles.length} مقال؟`)) return;

    try {
      await Promise.all(selectedArticles.map(id => articlesService.deleteArticle(id)));
      toast.success('تم حذف المقالات بنجاح!');
      setSelectedArticles([]);
      loadData();
    } catch (error: any) {
      console.error('Error deleting articles:', error);
      toast.error(error.response?.data?.message || 'فشل في حذف المقالات');
    }
  };

  const handlePublishArticle = async (id: string) => {
    try {
      await articlesService.publishArticle(id);
      toast.success('تم نشر المقال بنجاح!');
      loadData();
    } catch (error: any) {
      console.error('Error publishing article:', error);
      toast.error(error.response?.data?.message || 'فشل في نشر المقال');
    }
  };

  const handleDownloadPDF = (article: Article) => {
    const pdfUrl = articlesService.getArticlePdfUrl(article);
    window.open(pdfUrl, '_blank');
  };

  const handleOpenCustomizeModal = (article: Article) => {
    setSelectedArticleForCert(article);
    setShowCustomizeModal(true);
  };

  const handleGenerateCertificate = async (customMessage?: string) => {
    if (!selectedArticleForCert) return;
    
    const toastId = `article-cert-${selectedArticleForCert.id}`;
    
    try {
      setIsGenerating(true);
      setShowCustomizeModal(false);
      toast.loading('جاري توليد شهادة القبول...', { id: toastId });
      
      const hasCertificate = !!selectedArticleForCert.acceptance_certificate_cloudinary_public_id;
      
      if (hasCertificate) {
        await articlesService.regenerateAcceptanceCertificate(selectedArticleForCert.id, customMessage);
      } else {
        await articlesService.generateAcceptanceCertificate(selectedArticleForCert.id, customMessage);
      }
      
      toast.success('تم توليد الشهادة بنجاح!', { id: toastId });
      setSelectedArticleForCert(null);
      loadData(); // استدعاء بدون await لتجنب التكرار
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast.error(error.response?.data?.message || 'فشل في توليد الشهادة', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewCertificate = (article: Article) => {
    const url = article.acceptance_certificate_cloudinary_secure_url || article.acceptance_certificate_url;
    if (url) {
      setPdfUrl(url);
      setShowPDFViewer(true);
    } else {
      toast.error('لا يوجد خطاب قبول للمعاينة');
    }
  };

  const getIssueTitle = (issueId: string): string => {
    const issue = issues.find(i => i.id === issueId);
    return issue?.title || 'لم يتم التعيين';
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardHeader title="إدارة المقالات" subtitle="عرض وتحرير المقالات المنشورة" />
        <button
          onClick={() => navigate('/dashboard/create-manual-article')}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء مقال يدوياً</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تصفية حسب الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
            >
              <option value="all">جميع الحالات</option>
              <option value="ready-to-publish">جاهز للنشر</option>
              <option value="published">منشور</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">تصفية حسب العدد</label>
            <select
              value={filterIssue}
              onChange={(e) => setFilterIssue(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
            >
              <option value="all">جميع الأعداد</option>
              {issues.map(issue => (
                <option key={issue.id} value={issue.id}>{issue.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">إجمالي المقالات</h3>
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.totalArticles}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المقالات المنشورة</h3>
            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.publishedArticles}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">المقبولة للنشر</h3>
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-[#0D3B66]">{stats.readyToPublish}</p>
        </div>
      </div>

      {/* Actions Bar */}
      {selectedArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              تم اختيار <span className="font-bold text-gray-800">{selectedArticles.length}</span> مقال
            </p>
            <button
              onClick={handleDeleteArticles}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف المقالات</span>
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto"></div>
            <p className="text-gray-600 mt-4">جاري التحميل...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد مقالات</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">قائمة المقالات</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 w-12">
                      <input
                        type="checkbox"
                        checked={selectedArticles.length === articles.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedArticles(articles.map(a => a.id));
                          } else {
                            setSelectedArticles([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">رقم المقال</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-700">عنوان المقال</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">المؤلف</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الحالة</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">تاريخ النشر</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">العدد</th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleToggleSelect(article.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-bold text-[#0D3B66]">{article.article_number}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="text-sm text-gray-800 font-medium">{article.title}</p>
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {article.authors.map(a => a.name).join(', ')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <StatusBadge status={article.status === 'published' ? 'published' : 'ready-to-publish'} />
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">
                    {article.published_date ? new Date(article.published_date).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{getIssueTitle(article.issue_id)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Primary Actions */}
                      <button 
                        onClick={() => navigate(`/dashboard/articles/${article.id}`)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="عرض"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleDownloadPDF(article)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="تحميل PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Certificate Actions */}
                      {!article.acceptance_certificate_cloudinary_public_id && 
                       (!article.research || !article.research.acceptance_certificate_cloudinary_public_id) && (
                        <button 
                          onClick={() => handleOpenCustomizeModal(article)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="توليد شهادة"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      )}
                      
                      {article.acceptance_certificate_cloudinary_public_id && (
                        <>
                          <button 
                            onClick={() => handleViewCertificate(article)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="معاينة الشهادة"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenCustomizeModal(article)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="تعديل وإعادة توليد"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* More Actions Menu */}
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="المزيد"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {openMenuId === article.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  navigate(`/dashboard/articles/${article.id}/edit`);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>تحرير</span>
                              </button>
                              
                              {article.status === 'ready-to-publish' && (
                                <button
                                  onClick={() => {
                                    handlePublishArticle(article.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-right text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>نشر المقال</span>
                                </button>
                              )}
                              
                              {article.qr_code_url && (
                                <button
                                  onClick={() => {
                                    window.open(article.qr_code_url, '_blank');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-right text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                                >
                                  <QrCode className="w-4 h-4" />
                                  <span>عرض QR Code</span>
                                </button>
                              )}
                              
                              <div className="border-t border-gray-200 my-1" />
                              
                              <button
                                onClick={async () => {
                                  setOpenMenuId(null);
                                  if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
                                    try {
                                      await articlesService.deleteArticle(article.id);
                                      toast.success('تم حذف المقال بنجاح!');
                                      loadData();
                                    } catch (error: any) {
                                      toast.error(error.response?.data?.message || 'فشل في حذف المقال');
                                    }
                                  }
                                }}
                                className="w-full px-4 py-2 text-right text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>

      {/* Customize Certificate Modal */}
      {showCustomizeModal && selectedArticleForCert && (
        <CustomizeCertificateModal
          researchTitle={selectedArticleForCert.title}
          researcherName={selectedArticleForCert.authors?.[0]?.name || 'المؤلف'}
          onClose={() => {
            setShowCustomizeModal(false);
            setSelectedArticleForCert(null);
          }}
          onGenerate={handleGenerateCertificate}
          isGenerating={isGenerating}
          isRegenerate={!!selectedArticleForCert.acceptance_certificate_cloudinary_public_id}
          currentMessage={selectedArticleForCert.acceptance_certificate_custom_message}
        />
      )}

      {/* PDF Viewer Modal */}
      {showPDFViewer && pdfUrl && (
        <PDFViewer
          pdfUrl={pdfUrl}
          title="معاينة خطاب القبول"
          onClose={() => setShowPDFViewer(false)}
        />
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default ManageArticlesPage;
