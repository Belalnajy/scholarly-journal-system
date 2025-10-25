import { Bell, Search, SlidersHorizontal, Download, FileText, User, Calendar, Tag, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { researchService } from '../../../services/researchService';

// Types
type ResearchStatus = 'accepted' | 'needs-revision' | 'rejected';

interface CompletedResearch {
  id: string;
  title: string;
  description: string;
  author: string;
  specialization: string;
  submissionDate: string;
  evaluationDate: string;
  status: ResearchStatus;
}


// Status Badge Component
function StatusBadge({ status }: { status: ResearchStatus }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        return { text: 'مقبول', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' };
      case 'needs-revision':
        return { text: 'تعديلات بسيطة', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' };
      case 'rejected':
        return { text: 'مرفوض', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' };
    }
  };

  const config = getStatusConfig();
  return (
    <span className={`${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1 rounded-md text-xs font-semibold inline-block`}>
      {config.text}
    </span>
  );
}

// Research Card Component
function ResearchCard({ research }: { research: CompletedResearch }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Status Badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={research.status} />
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-xs font-semibold">
            مكتمل
          </span>
        </div>
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-3">{research.title}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{research.description}</p>

      {/* Meta Information */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">المؤلف:</span>
          <span>{research.author}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Tag className="w-4 h-4" />
          <span className="font-medium">التخصص:</span>
          <span>{research.specialization}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">تاريخ الاستلام:</span>
          <span>{research.submissionDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">تاريخ الإنجاز:</span>
          <span>{research.evaluationDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => {
            // TODO: Implement download
            console.log('Download research:', research.id);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          <span>تحميل البحث</span>
        </button>
        <button 
          onClick={() => navigate(`/dashboard/review-details/${research.id}`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-medium"
        >
          <FileText className="w-4 h-4" />
          <span>عرض المراجعة</span>
        </button>
      </div>
    </div>
  );
}

export function CompletedResearchPage() {
  const [researches, setResearches] = useState<CompletedResearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ResearchStatus>('all');

  useEffect(() => {
    loadCompletedResearches();
  }, []);

  const loadCompletedResearches = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all researches
      const allResearches = await researchService.getAll();
      
      // Filter completed researches (accepted, rejected, needs-revision)
      const completed = allResearches
        .filter(r => 
          r.status === 'accepted' || 
          r.status === 'rejected' || 
          r.status === 'needs-revision'
        )
        .map(r => ({
          id: r.id,
          title: r.title,
          description: r.abstract,
          author: 'باحث', // TODO: Add user relation
          specialization: r.specialization,
          submissionDate: new Date(r.submission_date).toLocaleDateString('ar-EG'),
          evaluationDate: r.evaluation_date ? new Date(r.evaluation_date).toLocaleDateString('ar-EG') : 'غير محدد',
          status: r.status as ResearchStatus,
        }));

      setResearches(completed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الأبحاث');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter researches
  const filteredResearches = researches.filter(research => {
    const matchesSearch = research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         research.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || research.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Count by status
  const statusCounts = {
    all: researches.length,
    accepted: researches.filter(r => r.status === 'accepted').length,
    'needs-revision': researches.filter(r => r.status === 'needs-revision').length,
    rejected: researches.filter(r => r.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الأبحاث المكتملة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={loadCompletedResearches}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">الأبحاث المكتملة</h1>
          <p className="text-gray-600">المراجعات السابقة والتقييمات المنجزة</p>
        </div>
        <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="البحث في المراجعات المكتملة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-[#0D3B66] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('accepted')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'accepted'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            مقبول ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setFilterStatus('needs-revision')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'needs-revision'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            تعديلات بسيطة ({statusCounts['needs-revision']})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              filterStatus === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            مرفوض ({statusCounts.rejected})
          </button>
        </div>
      </div>

      {/* Research Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredResearches.length > 0 ? (
          filteredResearches.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">لا توجد أبحاث مكتملة تطابق البحث</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="text-[#0D3B66] hover:underline font-medium"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
