import { useState, useEffect } from 'react';
import { Upload, Send, Bell, ArrowRight, Loader2, AlertCircle, Star, CheckCircle, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { researchService, Research } from '../../../services/researchService';
import { reviewsService, Review } from '../../../services/reviews.service';
import { reviewerAssignmentsService } from '../../../services/reviewer-assignments.service';
import { researchRevisionsService, ResearchRevision } from '../../../services/research-revisions.service';
import { ResearchTimeline } from '../../../components/ResearchTimeline';
import toast from 'react-hot-toast';

export function ReviseResearchPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [research, setResearch] = useState<Research | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allRevisions, setAllRevisions] = useState<ResearchRevision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<ResearchRevision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedRevisionId, setUploadedRevisionId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [formData, setFormData] = useState({
    abstract: '',
    keywords: [] as string[],
    notes: '',
    file: null as File | null,
  });

  const [fileName, setFileName] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (researchId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [researchData, reviewsData, revisionsData] = await Promise.all([
        researchService.getById(researchId),
        reviewsService.getByResearch(researchId),
        researchRevisionsService.getByResearch(researchId),
      ]);

      setResearch(researchData);
      setReviews(reviewsData);
      setAllRevisions(revisionsData);
      
      // Get latest pending revision
      const pendingRevision = revisionsData.find(r => r.status === 'pending');
      setCurrentRevision(pendingRevision || null);
      
      // Load existing data into form if available
      if (researchData) {
        setFormData(prev => ({
          ...prev,
          abstract: researchData.abstract || '',
          keywords: researchData.keywords || [],
          notes: pendingRevision?.revision_notes || '',
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type (PDF or Word)
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('يرجى اختيار ملف PDF أو Word (doc/docx) فقط');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    setFormData({ ...formData, file });
    setFileName(file.name);

    // Upload file immediately
    await uploadFileImmediately(file);
  };

  const uploadFileImmediately = async (file: File) => {
    if (!research?.id) return;

    try {
      setIsUploading(true);
      toast.loading('جاري رفع الملف...', { id: 'upload-file' });

      let revisionId: string;

      if (currentRevision) {
        // Update existing revision
        await researchRevisionsService.update(currentRevision.id, {
          revision_notes: 'مسودة - في انتظار الإكمال',
        });
        revisionId = currentRevision.id;
      } else {
        // Create new revision request
        const newRevision = await researchRevisionsService.create({
          research_id: research.id,
          revision_notes: 'مسودة - في انتظار الإكمال',
        });
        revisionId = newRevision.id;
        setCurrentRevision(newRevision);
      }

      // Upload file to Cloudinary
      await researchRevisionsService.uploadFile(revisionId, file);

      setUploadedRevisionId(revisionId);
      toast.success('تم رفع الملف بنجاح! أكمل بيانات التعديل', { id: 'upload-file' });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('فشل رفع الملف', { id: 'upload-file' });
      setFormData({ ...formData, file: null });
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!uploadedRevisionId) {
      // Just clear the file if not uploaded yet
      setFormData({ ...formData, file: null });
      setFileName('');
      return;
    }

    try {
      toast.loading('جاري حذف الملف...', { id: 'remove-file' });

      // Delete the revision
      await researchRevisionsService.delete(uploadedRevisionId);

      // Clear state
      setFormData({ ...formData, file: null });
      setFileName('');
      setUploadedRevisionId(null);
      setCurrentRevision(null);

      toast.success('تم حذف الملف بنجاح', { id: 'remove-file' });
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('فشل حذف الملف', { id: 'remove-file' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.notes.trim()) {
      setError('يرجى كتابة ملاحظاتك حول التعديلات');
      return;
    }

    if (!formData.file) {
      setError('يرجى رفع النسخة المعدلة من البحث');
      return;
    }

    if (!research?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      toast.loading('جاري إرسال التعديلات...', { id: 'submit-revision' });

      // If file was uploaded, update the existing revision
      if (uploadedRevisionId) {
        await researchRevisionsService.update(uploadedRevisionId, {
          revision_notes: formData.notes,
        });
      } else {
        // Fallback: create new revision if file wasn't uploaded
        const newRevision = await researchRevisionsService.create({
          research_id: research.id,
          revision_notes: formData.notes,
        });

        if (formData.file) {
          await researchRevisionsService.uploadFile(newRevision.id, formData.file);
        }
      }
      
      // Step 3: Update research with new abstract and keywords
      toast.loading('جاري تحديث بيانات البحث...', { id: 'submit-revision' });
      await researchService.update(research.id, {
        abstract: formData.abstract,
        keywords: formData.keywords,
      });
      
      // Step 4: Get reviewer assignments for this research
      const assignments = await reviewerAssignmentsService.getByResearch(research.id);
      
      // Step 5: Reset completed assignments to accepted (so they appear in reviewer dashboard)
      const completedAssignments = assignments.filter(a => a.status === 'completed');
      await Promise.all(
        completedAssignments.map(assignment => 
          reviewerAssignmentsService.updateStatus(assignment.id, 'accepted')
        )
      );
      
      // Step 6: Reset all completed reviews to pending so reviewers can review again
      const completedReviews = reviews.filter(r => r.status === 'completed');
      await Promise.all(
        completedReviews.map(review => 
          reviewsService.updateStatus(review.id, 'pending')
        )
      );
      
      // Step 7: Update research status back to under-review
      await researchService.updateStatus(research.id, 'under-review');
      
      toast.success('تم إرسال النسخة المعدلة بنجاح!', { id: 'submit-revision' });
      setSuccessMessage('تم إرسال النسخة المعدلة بنجاح! سيتم مراجعتها من قبل نفس المحكمين.');
      
      // Keep button disabled and navigate after showing success message
      setTimeout(() => {
        navigate('/dashboard/my-research');
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال النسخة المعدلة', { id: 'submit-revision' });
      setError('حدث خطأ أثناء إرسال النسخة المعدلة');
      console.error('Error submitting revision:', err);
      setIsSubmitting(false); // Re-enable only on error
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate('/dashboard/my-research');
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

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

  if (error || !research) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-bold text-lg">حدث خطأ</p>
            <p className="text-red-700">{error || 'البحث غير موجود'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/my-research')}
          className="px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
        >
          العودة لأبحاثي
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-green-500 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[400px]">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg">✓ نجح!</p>
              <p className="text-sm opacity-90">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && !isLoading && research && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[400px]">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg">✗ خطأ</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white hover:bg-white/20 rounded-lg px-2 py-1 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeCancelModal}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">تأكيد الإلغاء</h3>
              <p className="text-gray-600 mb-6">هل أنت متأكد من إلغاء التعديل؟ سيتم فقدان جميع التغييرات.</p>
              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  العودة
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  نعم، إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">تعديل البحث</h1>
          <p className="text-gray-600">{research.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة</span>
          </button>
          <button className="p-3 text-gray-600 hover:text-[#0D3B66] transition-colors">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Research Title Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {research.title}
        </h2>
        <p className="text-sm text-gray-600">
          البحث يحتاج إلى تعديلات بناءً على ملاحظات المحكمين أدناه
        </p>
      </div>

      {/* Timeline */}
      <ResearchTimeline 
        research={research} 
        reviews={reviews.filter(r => r.status === 'completed')} 
        revisions={allRevisions} 
      />

      {/* Reviewer Comments Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">ملاحظات المحكمين</h2>
          <p className="text-sm text-gray-500 mt-1">
            راجع هذه الملاحظات قبل إجراء التعديلات
          </p>
        </div>

        <div className="p-6 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد ملاحظات من المحكمين</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {review.reviewer?.name?.charAt(0) || 'م'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{review.reviewer?.name || 'محكم'}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          {Number(review.average_rating || 0).toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {review.general_comments}
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">التوصية:</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        review.recommendation === 'accepted' ? 'bg-green-100 text-green-700' :
                        review.recommendation === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.recommendation === 'accepted' ? 'قبول' :
                         review.recommendation === 'rejected' ? 'رفض' :
                         'يحتاج تعديلات'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revision Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">رفع النسخة المعدلة</h2>
          <p className="text-sm text-gray-500 mt-1">
            ارفع ملف البحث الجديد مع ملاحظاتك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Abstract */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الملخص المعدل<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              يمكنك تعديل ملخص البحث إذا كان ذلك مطلوباً من المحكمين
            </p>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              placeholder="اكتب ملخص البحث المعدل..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
              required
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الكلمات المفتاحية
            </label>
            <p className="text-xs text-gray-500 mb-2">
              اكتب الكلمة واضغط Enter أو زر "إضافة" (يمكنك استخدام الفواصل والمسافات)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const keyword = keywordInput.trim();
                    if (keyword && !formData.keywords.includes(keyword)) {
                      setFormData({ ...formData, keywords: [...formData.keywords, keyword] });
                      setKeywordInput('');
                    }
                  }
                }}
                placeholder="مثال: ذكاء اصطناعي، تعلم آلي (اضغط Enter لإضافة)"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  const keyword = keywordInput.trim();
                  if (keyword && !formData.keywords.includes(keyword)) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keyword] });
                    setKeywordInput('');
                  }
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium whitespace-nowrap"
              >
                إضافة
              </button>
            </div>
            {formData.keywords.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">الكلمات المضافة:</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, keywords: [] })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    مسح الكل
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2 border border-blue-200"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          keywords: formData.keywords.filter((_, i) => i !== index)
                        })}
                        className="text-blue-600 hover:text-red-600 font-bold text-base leading-none"
                        title="حذف"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ملاحظات الباحث<span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              وضح التعديلات التي أجريتها والنقاط التي تمت معالجتها
            </p>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="اكتب ملاحظاتك حول التعديلات المجراة..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] transition-all resize-none"
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رفع النسخة المعدلة<span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              fileName ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50 hover:border-orange-400'
            }`}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
                disabled={!!fileName || isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="mb-4">
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-orange-500 mx-auto" />
                  )}
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  {isUploading ? 'جاري رفع الملف...' : (fileName || 'اسحب وأفلت ملف البحث هنا')}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {isUploading ? 'يرجى الانتظار...' : 'أو انقر لاختيار الملف (سيتم الرفع فوراً)'}
                </p>
                {!fileName && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'جاري الرفع...' : 'اختيار ملف (PDF أو Word)'}
                  </button>
                )}
              </label>
            </div>
            {fileName && !isUploading && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">تم رفع الملف بنجاح</p>
                    <p className="text-xs text-green-600">{fileName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف الملف ورفع ملف آخر"
                >
                  <X className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            )}
            {isUploading && (
              <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري رفع الملف...
              </p>
            )}
          </div>

          {/* Current File Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3">معلومات البحث الأصلي:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">رقم البحث:</span>
                <span className="text-gray-600">{research.research_number}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">العنوان:</span>
                <span className="text-gray-600">{research.title}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">التخصص:</span>
                <span className="text-gray-600">{research.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">تاريخ التقديم:</span>
                <span className="text-gray-600">
                  {new Date(research.submission_date).toLocaleDateString('ar-EG')}
                </span>
              </div>
              {currentRevision && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">رقم المراجعة:</span>
                  <span className="text-gray-600">#{currentRevision.revision_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>إرسال النسخة المعدلة</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}
