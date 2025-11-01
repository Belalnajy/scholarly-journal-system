import { ArrowRight, Search, Plus, Loader2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader, StatusBadge } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import articlesService from '../../../services/articlesService';
import issuesService from '../../../services/issuesService';
import type { Issue } from '../../../services/issuesService';

export function AddArticleToIssuePage() {
  const navigate = useNavigate();
  const { issueId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResearches, setSelectedResearches] = useState<string[]>([]);
  const [acceptedResearches, setAcceptedResearches] = useState<Research[]>([]);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accepted researches and issue details
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch issue details
      if (issueId) {
        const issueData = await issuesService.getIssueById(issueId);
        setIssue(issueData);
      }
      
      // Fetch accepted researches
      const allResearches = await researchService.getAll();
      // Filter only accepted researches without published_article_id
      const accepted = allResearches.filter(
        (r) => r.status === 'accepted' && !r.published_article_id
      );
      setAcceptedResearches(accepted);
    } catch (err: any) {
      const errorMsg = err.message || 'فشل في تحميل البيانات';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter researches
  const filteredResearches = acceptedResearches.filter((research) => {
    const matchesSearch = 
      research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      research.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      research.research_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedResearches(prev => 
      prev.includes(id) 
        ? prev.filter(researchId => researchId !== id)
        : [...prev, id]
    );
  };

  const handleAddToIssue = async () => {
    if (selectedResearches.length === 0) {
      toast.error('يرجى اختيار مقال واحد على الأقل');
      return;
    }

    if (!issueId) {
      toast.error('معرف العدد غير موجود');
      return;
    }

    // Check max articles limit
    if (issue) {
      const remainingSlots = issue.max_articles - issue.total_articles;
      if (selectedResearches.length > remainingSlots) {
        toast.error(
          `لا يمكن إضافة ${selectedResearches.length} مقال. الحد الأقصى المتبقي: ${remainingSlots} مقال`,
          { duration: 5000 }
        );
        return;
      }
    }

    try {
      setConverting(true);
      setError(null);

      // Convert each selected research to article
      const promises = selectedResearches.map(async (researchId) => {
        const research = acceptedResearches.find((r) => r.id === researchId);
        if (!research) return;

        // Generate article number (you can customize this format)
        const articleNumber = `ART-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Create article from research
        // If issue is published, article should be published too
        const articleStatus = issue?.status === 'published' ? 'published' : 'ready-to-publish';
        
        await articlesService.createArticle({
          research_id: research.id,
          issue_id: issueId,
          article_number: articleNumber,
          title: research.title,
          title_en: research.title_en,
          authors: [
            {
              name: research.user?.name || 'غير معروف',
              affiliation: research.user?.affiliation || 'غير محدد',
              email: research.user?.email || 'no-email@example.com',
            },
          ],
          abstract: research.abstract,
          abstract_en: research.abstract_en,
          keywords: research.keywords || [],
          keywords_en: research.keywords_en || [],
          pages: '1-10', // Default pages, can be edited later
          pdf_url: research.cloudinary_secure_url || research.file_url || '',
          status: articleStatus,
        });
      });

      await Promise.all(promises);

      toast.success(`تم تحويل ${selectedResearches.length} بحث إلى مقالات وإضافتها للعدد بنجاح!`);
      setTimeout(() => navigate('/dashboard/manage-issues'), 1500);
    } catch (err: any) {
      const errorMsg = err.message || 'فشل في إضافة المقالات للعدد';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error converting researches to articles:', err);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" />
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-issues')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <DashboardHeader 
            title="إضافة مقالات للعدد" 
            subtitle="اختر الأبحاث المقبولة لإضافتها للعدد" 
          />
        </div>
      </div>

      {/* Issue Info Card */}
      {issue && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{issue.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span> المقالات الحالية: <span className="font-bold text-gray-800">{issue.total_articles}</span></span>
                <span> الحد الأقصى: <span className="font-bold text-gray-800">{issue.max_articles}</span></span>
                <span> المتبقي: <span className="font-bold text-green-600">{issue.max_articles - issue.total_articles}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في الأبحاث المقبولة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
          />
        </div>
        <div className="mt-3 text-sm text-gray-600">
          تم اختيار <span className="font-bold text-gray-800">{selectedResearches.length}</span> مقال
          {issue && selectedResearches.length > 0 && (
            <span className={`mr-2 ${
              selectedResearches.length > (issue.max_articles - issue.total_articles) 
                ? 'text-red-600 font-bold' 
                : 'text-green-600'
            }`}>
              ({selectedResearches.length > (issue.max_articles - issue.total_articles) 
                ? `⚠️ تجاوز الحد الأقصى بـ ${selectedResearches.length - (issue.max_articles - issue.total_articles)} مقال` 
                : '✓ ضمن الحد المسموح'})
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Accepted Researches List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">الأبحاث المقبولة المتاحة</h2>
          <p className="text-sm text-gray-600 mt-1">الأبحاث التي تم قبولها ولم تُضف لأي عدد بعد</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-[#0D3B66] mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">جاري تحميل الأبحاث المقبولة...</p>
            </div>
          ) : filteredResearches.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold text-lg mb-2">لا توجد أبحاث مقبولة متاحة</p>
              <p className="text-gray-500 text-sm">جميع الأبحاث المقبولة تم إضافتها لأعداد سابقة</p>
              <button
                onClick={() => navigate('/dashboard/manage-research')}
                className="mt-4 px-6 py-2 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
              >
                عرض جميع الأبحاث
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResearches.map((research) => (
                <div
                  key={research.id}
                  onClick={() => handleToggleSelect(research.id)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedResearches.includes(research.id)
                      ? 'border-[#0D3B66] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedResearches.includes(research.id)
                        ? 'border-[#0D3B66] bg-[#0D3B66]'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedResearches.includes(research.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-[#0D3B66]">{research.research_number}</span>
                        <StatusBadge status="accepted" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{research.title}</h3>
                      <p className="text-sm text-gray-600">المؤلف: {research.user?.name || 'غير معروف'}</p>
                      <p className="text-xs text-gray-500 mt-1">تاريخ التقديم: {new Date(research.submission_date).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAddToIssue}
          disabled={selectedResearches.length === 0 || converting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {converting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحويل...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>إضافة للعدد ({selectedResearches.length})</span>
            </>
          )}
        </button>
        <button
          onClick={() => navigate('/dashboard/manage-issues')}
          disabled={converting}
          className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
