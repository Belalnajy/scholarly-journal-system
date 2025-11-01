import { ArrowRight, Calendar, BookOpen, CheckCircle, Search, FileText, Loader2, AlertCircle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReviewerCard } from '../../../components/dashboard';
import type { Reviewer } from '../../../components/dashboard';
import { researchService, Research } from '../../../services/researchService';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import { usersService } from '../../../services/users.service';
import { useAuth } from '../../../contexts';
import toast, { Toaster } from 'react-hot-toast';


export function AssignReviewerPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [researches, setResearches] = useState<Research[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedResearchId, setSelectedResearchId] = useState<string>(id || '');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showResearchList, setShowResearchList] = useState(!id);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [currentReviewerPage, setCurrentReviewerPage] = useState(1);
  const [currentResearchPage, setCurrentResearchPage] = useState(1);
  const itemsPerPage = 6;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (id) {
      setSelectedResearchId(id);
      setShowResearchList(false);
      loadCurrentAssignments(id);
    }
  }, [id]);

  const loadCurrentAssignments = async (researchId: string) => {
    try {
      const assignments = await reviewerAssignmentsService.getByResearch(researchId);
      setCurrentAssignments(assignments);
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load researches that need reviewer assignment (under-review status)
      const researchesData = await researchService.getAll({ status: 'under-review' });
      
      // Show all researches - allow assigning additional reviewers
      setResearches(researchesData);

      // Load reviewers (users with role 'reviewer')
      const usersData = await usersService.getAll();
      const reviewersData = usersData
        .filter((u) => u.role === 'reviewer' && u.status === 'active')
        .map((u) => ({
          id: u.id,
          name: u.name,
          specialization: u.specialization || 'غير محدد',
          completedReviews: 0, // TODO: Get from reviews API
          availability: 'available' as const,
        }));
      setReviewers(reviewersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedResearch = researches.find((r) => r.id === selectedResearchId);

  const filteredResearches = researches.filter(
    (research) =>
      research.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      research.research_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReviewers = reviewers.filter(
    (reviewer) =>
      specializationFilter === 'all' || reviewer.specialization === specializationFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSelectReviewer = (reviewerId: string) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        return prev.filter(id => id !== reviewerId);
      }
      return [...prev, reviewerId];
    });
  };

  const handleSelectResearch = async (researchId: string) => {
    setSelectedResearchId(researchId);
    setShowResearchList(false);
    setSelectedReviewers([]);
    await loadCurrentAssignments(researchId);
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('هل أنت متأكد من إزالة هذا المحكم؟')) return;
    
    try {
      await reviewerAssignmentsService.delete(assignmentId);
      await loadCurrentAssignments(selectedResearchId);
      toast.success('تم إزالة المحكم بنجاح', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (err) {
      toast.error('حدث خطأ أثناء إزالة المحكم', {
        icon: '❌',
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedResearchId) {
      const msg = 'يرجى اختيار البحث أولاً';
      setError(msg);
      toast.error(msg, { icon: '⚠️' });
      return;
    }
    if (selectedReviewers.length === 0) {
      const msg = 'يرجى اختيار محكم واحد على الأقل';
      setError(msg);
      toast.error(msg, { icon: '⚠️' });
      return;
    }
    if (!deadline) {
      const msg = 'يرجى تحديد الموعد النهائي للمراجعة';
      setError(msg);
      toast.error(msg, { icon: '⚠️' });
      return;
    }
    if (!user?.id) {
      const msg = 'خطأ في تحديد المستخدم';
      setError(msg);
      toast.error(msg, { icon: '❌' });
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create reviewer assignments for each selected reviewer
      const assignments = selectedReviewers.map((reviewerId) =>
        reviewerAssignmentsService.create({
          research_id: selectedResearchId,
          reviewer_id: reviewerId,
          assigned_by: user.id,
          assignment_notes: notes || undefined,
          deadline,
        })
      );

      await Promise.all(assignments);

      // Get research title for the toast message
      const selectedResearch = researches.find(r => r.id === selectedResearchId);
      const researchTitle = selectedResearch?.title || 'البحث';
      
      // Get reviewer names
      const assignedReviewerNames = reviewers
        .filter(r => selectedReviewers.includes(r.id))
        .map(r => r.name)
        .join('، ');

      // Show success toast
      toast.success(
        `تم تعيين ${selectedReviewers.length} محكم بنجاح!\n${assignedReviewerNames}\nللبحث: ${researchTitle}`,
        {
          duration: 5000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '16px',
          },
          icon: '✅',
        }
      );

      // Navigate back after a short delay to show the toast
      setTimeout(() => {
        navigate('/dashboard/manage-research');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تعيين المحكمين';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '16px',
        },
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0D3B66] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
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
          onClick={loadData}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate('/dashboard/manage-research')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">تعيين محكم للبحث</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            اختر البحث العلمي ثم اختر المحكمين المناسبين حسب التخصص والخبرة
          </p>
        </div>
      </div>

      {/* Research Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">اختيار البحث</h3>
          {selectedResearch && (
            <button
              onClick={() => setShowResearchList(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              تغيير البحث
            </button>
          )}
        </div>
        
        {/* Show Research List or Selected Research */}
        {showResearchList ? (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن بحث برقم البحث، العنوان، أو اسم الباحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
            </div>

            {/* Research List */}
            <div className="space-y-3">
              {filteredResearches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد أبحاث متاحة</p>
                </div>
              ) : (
                filteredResearches
                  .slice((currentResearchPage - 1) * itemsPerPage, currentResearchPage * itemsPerPage)
                  .map((research) => (
                    <button
                      key={research.id}
                      onClick={() => handleSelectResearch(research.id)}
                      className="w-full text-right p-4 border-2 border-gray-200 rounded-lg hover:border-[#0D3B66] hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base font-bold text-gray-800">{research.title}</h4>
                        <span className="text-xs font-medium text-[#0D3B66] bg-blue-50 px-2 py-1 rounded">
                          {research.research_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{research.specialization}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(research.submission_date)}</span>
                        </div>
                      </div>
                    </button>
                  ))
              )}
            </div>

            {/* Pagination for Researches */}
            {filteredResearches.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentResearchPage(p => Math.max(1, p - 1))}
                  disabled={currentResearchPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  السابق
                </button>
                <span className="text-sm text-gray-600">
                  صفحة {currentResearchPage} من {Math.ceil(filteredResearches.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentResearchPage(p => Math.min(Math.ceil(filteredResearches.length / itemsPerPage), p + 1))}
                  disabled={currentResearchPage === Math.ceil(filteredResearches.length / itemsPerPage)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        ) : selectedResearch ? (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">التفاصيل:</span>
                <span className="text-sm font-bold text-[#0D3B66]">{selectedResearch.research_number}</span>
              </div>

              <h4 className="text-lg font-bold text-gray-800 mb-4">{selectedResearch.title}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">تاريخ التقديم:</span>
                  <span className="text-gray-800 font-medium">{formatDate(selectedResearch.submission_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">التخصص:</span>
                  <span className="text-gray-800 font-medium">{selectedResearch.specialization}</span>
                </div>
              </div>

              {selectedResearch.keywords && Array.isArray(selectedResearch.keywords) && selectedResearch.keywords.length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {selectedResearch.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>يرجى اختيار بحث من القائمة</p>
          </div>
        )}
      </div>

      {/* Current Assignments */}
      {currentAssignments.length > 0 && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">المحكمون المعينون حالياً</h3>
          <div className="space-y-3">
            {currentAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{assignment.reviewer?.name || 'محكم'}</p>
                    <p className="text-sm text-gray-600">{assignment.reviewer?.specialization || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 mr-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">معين</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  إزالة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviewers Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">اختيار محكمين إضافيين</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600">تصنيف حسب التخصص</span>
            <select 
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">جميع التخصصات</option>
              {Array.from(new Set(reviewers.map(r => r.specialization))).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredReviewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد محكمين متاحين</p>
            </div>
          ) : (
            filteredReviewers
              .slice((currentReviewerPage - 1) * itemsPerPage, currentReviewerPage * itemsPerPage)
              .map((reviewer) => (
                <ReviewerCard
                  key={reviewer.id}
                  reviewer={reviewer}
                  isSelected={selectedReviewers.includes(reviewer.id)}
                  onSelect={() => handleSelectReviewer(reviewer.id)}
                />
              ))
          )}
        </div>

        {/* Pagination for Reviewers */}
        {filteredReviewers.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentReviewerPage(p => Math.max(1, p - 1))}
              disabled={currentReviewerPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              السابق
            </button>
            <span className="text-sm text-gray-600">
              صفحة {currentReviewerPage} من {Math.ceil(filteredReviewers.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentReviewerPage(p => Math.min(Math.ceil(filteredReviewers.length / itemsPerPage), p + 1))}
              disabled={currentReviewerPage === Math.ceil(filteredReviewers.length / itemsPerPage)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Assignment Details */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">تفاصيل التعيين</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reviewer Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموعد النهائي للمراجعة
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
            />
          </div>

          {/* Selected Reviewers Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد المحكمين المختارين
            </label>
            <input
              type="text"
              value={`${selectedReviewers.length}`}
              readOnly
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تعليمات خاصة للمحكمين
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل أي تعليمات أو ملاحظات خاصة للمحكمين..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedResearchId || selectedReviewers.length === 0 || !deadline || isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#C9A961] text-white rounded-lg hover:bg-[#B89851] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التعيين...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>تعيين المحكمين</span>
            </>
          )}
        </button>
        <button
          onClick={() => navigate('/dashboard/manage-research')}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
        >
          إلغاء التعيين
        </button>
      </div>
    </div>
  );
}
