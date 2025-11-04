import {
  ArrowRight,
  Upload,
  Plus,
  X,
  Save,
  FileText,
  Calendar,
  Hash,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { DashboardHeader } from '../../../components/dashboard';
import articlesService from '../../../services/articlesService';
import issuesService from '../../../services/issuesService';
import type { Issue } from '../../../services/issuesService';

interface Author {
  name: string;
  affiliation: string;
  email: string;
}

export function CreateManualArticlePage() {
  const navigate = useNavigate();

  // Form state
  const [issueId, setIssueId] = useState('');
  const [articleNumber, setArticleNumber] = useState('');
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [authors, setAuthors] = useState<Author[]>([
    { name: '', affiliation: '', email: '' },
  ]);
  const [abstract, setAbstract] = useState('');
  const [abstractEn, setAbstractEn] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [keywordsEn, setKeywordsEn] = useState<string[]>(['']);
  const [specialization, setSpecialization] = useState('');
  const [showCustomSpecialization, setShowCustomSpecialization] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [articleDate, setArticleDate] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'ready-to-publish' | 'published'>('ready-to-publish');

  // Other state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializations = [
    'تكنولوجيا التعليم',
    'المناهج وطرق التدريس',
    'علم النفس التربوي',
    'الإدارة التربوية',
    'التربية الخاصة',
    'أصول التربية',
    'القياس والتقويم',
    'تقنيات التعليم',
    'أخرى (اكتب التخصص)',
  ];

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const issuesData = await issuesService.getAllIssues();
      setIssues(issuesData);
    } catch (error) {
      console.error('Error loading issues:', error);
      toast.error('فشل في تحميل الأعداد');
    }
  };

  const handleSpecializationChange = (value: string) => {
    if (value === 'أخرى (اكتب التخصص)') {
      setShowCustomSpecialization(true);
      setSpecialization('');
      setCustomSpecialization('');
    } else {
      setShowCustomSpecialization(false);
      setSpecialization(value);
      setCustomSpecialization('');
    }
  };

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '', email: '' }]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const handleAuthorChange = (
    index: number,
    field: keyof Author,
    value: string
  ) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handleAddKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const handleRemoveKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = keywords[index].trim();
      if (value) {
        // Add new empty field
        setKeywords([...keywords, '']);
        // Focus on the new field after a short delay
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder^="كلمة مفتاحية"]');
          const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
          lastInput?.focus();
        }, 0);
      }
    }
  };

  const handleAddKeywordEn = () => {
    setKeywordsEn([...keywordsEn, '']);
  };

  const handleRemoveKeywordEn = (index: number) => {
    if (keywordsEn.length > 1) {
      setKeywordsEn(keywordsEn.filter((_, i) => i !== index));
    }
  };

  const handleKeywordEnChange = (index: number, value: string) => {
    const newKeywordsEn = [...keywordsEn];
    newKeywordsEn[index] = value;
    setKeywordsEn(newKeywordsEn);
  };

  const handleKeywordEnKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = keywordsEn[index].trim();
      if (value) {
        // Add new empty field
        setKeywordsEn([...keywordsEn, '']);
        // Focus on the new field after a short delay
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder^="Keyword"]');
          const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
          lastInput?.focus();
        }, 0);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('يرجى رفع ملف PDF فقط');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    // Simulate upload progress for better UX
    setIsUploadingFile(true);
    setUploadProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Set file after a short delay
    setTimeout(() => {
      setPdfFile(file);
      setUploadProgress(100);
      setIsUploadingFile(false);
      toast.success('تم تحميل الملف بنجاح!');
    }, 1000);
  };

  const validateForm = (): boolean => {
    if (!issueId) {
      toast.error('يرجى اختيار العدد');
      return false;
    }
    if (!articleNumber.trim()) {
      toast.error('يرجى إدخال رقم المقال');
      return false;
    }
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المقال');
      return false;
    }
    if (
      authors.some(
        (a) => !a.name.trim() || !a.affiliation.trim() || !a.email.trim()
      )
    ) {
      toast.error('يرجى إكمال بيانات جميع المؤلفين');
      return false;
    }
    if (!abstract.trim()) {
      toast.error('يرجى إدخال الملخص');
      return false;
    }
    if (!pdfFile) {
      toast.error('يرجى رفع ملف PDF للمقال');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Filter empty keywords
      const filteredKeywords = keywords.filter((k) => k.trim());
      const filteredKeywordsEn = keywordsEn.filter((k) => k.trim());

      // Get final specialization
      const finalSpecialization = showCustomSpecialization 
        ? customSpecialization.trim() 
        : specialization;

      // Create article data
      const articleData = {
        issue_id: issueId,
        article_number: articleNumber,
        title,
        title_en: titleEn || undefined,
        authors,
        abstract,
        abstract_en: abstractEn || undefined,
        keywords: filteredKeywords.length > 0 ? filteredKeywords : undefined,
        keywords_en:
          filteredKeywordsEn.length > 0 ? filteredKeywordsEn : undefined,
        specialization: finalSpecialization || undefined,
        pages: pages || undefined,
        doi: doi || undefined,
        status,
        published_date: status === 'published' && publishedDate ? publishedDate : undefined,
      };

      // Create article with PDF
      await articlesService.createManualArticle(
        articleData,
        pdfFile!
      );

      toast.success('تم إنشاء المقال بنجاح!');
      setTimeout(() => {
        navigate('/dashboard/manage-articles');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast.error(error.response?.data?.message || 'فشل في إنشاء المقال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Toaster position="top-center" />

      {/* Header */}
      <DashboardHeader
        title="إنشاء مقال يدوياً"
        subtitle="إضافة مقال جديد مباشرة إلى العدد"
      />

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/manage-articles')}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#0D3B66] transition-colors bg-white rounded-lg border border-gray-200 hover:border-[#0D3B66]"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة لإدارة المقالات</span>
      </button>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              المعلومات الأساسية
              {issueId && articleNumber && title && (
                <span className="mr-auto text-green-600 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  مكتمل
                </span>
              )}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Issue Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العدد <span className="text-red-500">*</span>
              </label>
              <select
                value={issueId}
                onChange={(e) => setIssueId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                required
              >
                <option value="">اختر العدد</option>
                {issues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title} - العدد {issue.issue_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Article Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم المقال <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                  placeholder="مثال: ART-2024-001"
                  className="w-full pr-10 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                  required
                />
              </div>
            </div>

            {/* Title (Arabic) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                عنوان المقال (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المقال بالعربية"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                required
              />
            </div>

            {/* Title (English) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                عنوان المقال (إنجليزي)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter article title in English"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                dir="ltr"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                التخصص
              </label>
              <select
                value={showCustomSpecialization ? 'أخرى (اكتب التخصص)' : specialization}
                onChange={(e) => handleSpecializationChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
              >
                <option value="">اختر التخصص...</option>
                {specializations.map((spec, index) => (
                  <option key={index} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
              
              {/* Custom Specialization Input */}
              {showCustomSpecialization && (
                <div className="mt-3 animate-fadeIn">
                  <input
                    type="text"
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                    placeholder="اكتب التخصص الخاص بك..."
                    className="w-full px-4 py-3 border-2 border-[#C9A961] rounded-lg focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all bg-amber-50"
                    autoFocus
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    💡 اكتب التخصص الدقيق للمقال
                  </p>
                </div>
              )}
            </div>

            {/* Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الصفحات
                </label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="مثال: 1-15"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  DOI
                </label>
                <input
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="10.1234/example"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Authors Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                المؤلفون
                {authors.every(a => a.name && a.affiliation && a.email) && (
                  <span className="text-green-600 text-sm flex items-center gap-1 mr-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    مكتمل
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={handleAddAuthor}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة مؤلف
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {authors.map((author, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-700">
                    المؤلف {index + 1}
                  </h3>
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={author.name}
                    onChange={(e) =>
                      handleAuthorChange(index, 'name', e.target.value)
                    }
                    placeholder="الاسم *"
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                    required
                  />
                  <input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) =>
                      handleAuthorChange(index, 'affiliation', e.target.value)
                    }
                    placeholder="الانتماء *"
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                    required
                  />
                  <input
                    type="email"
                    value={author.email}
                    onChange={(e) =>
                      handleAuthorChange(index, 'email', e.target.value)
                    }
                    placeholder="البريد الإلكتروني *"
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              الملخص
              {abstract.trim() && (
                <span className="mr-auto text-green-600 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  مكتمل
                </span>
              )}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Abstract (Arabic) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الملخص (عربي) <span className="text-red-500">*</span>
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="أدخل ملخص المقال بالعربية"
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] resize-none"
                required
              />
            </div>

            {/* Abstract (English) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الملخص (إنجليزي)
              </label>
              <textarea
                value={abstractEn}
                onChange={(e) => setAbstractEn(e.target.value)}
                placeholder="Enter article abstract in English"
                rows={6}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66] resize-none"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Keywords Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
            <h2 className="text-xl font-bold text-gray-800">
              الكلمات المفتاحية
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Keywords (Arabic) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-700">
                  الكلمات المفتاحية (عربي)
                </label>
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  إضافة
                </button>
              </div>
              <div className="space-y-2">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) =>
                        handleKeywordChange(index, e.target.value)
                      }
                      onKeyPress={(e) => handleKeywordKeyPress(e, index)}
                      placeholder={`كلمة مفتاحية ${index + 1} (اضغط Enter للإضافة)`}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                    />
                    {keywords.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords (English) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-700">
                  الكلمات المفتاحية (إنجليزي)
                </label>
                <button
                  type="button"
                  onClick={handleAddKeywordEn}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  إضافة
                </button>
              </div>
              <div className="space-y-2">
                {keywordsEn.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) =>
                        handleKeywordEnChange(index, e.target.value)
                      }
                      onKeyPress={(e) => handleKeywordEnKeyPress(e, index)}
                      placeholder={`Keyword ${index + 1} (Press Enter to add)`}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                      dir="ltr"
                    />
                    {keywordsEn.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveKeywordEn(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PDF Upload & Publishing Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              الملف والنشر
              {pdfFile && (
                <span className="mr-auto text-green-600 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  مكتمل
                </span>
              )}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ملف PDF <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0D3B66] transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploadingFile}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${isUploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingFile ? (
                    <>
                      <div className="w-12 h-12 border-4 border-[#0D3B66] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-600 font-semibold">
                        جاري رفع الملف... {uploadProgress}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {pdfFile ? (
                          <span className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {pdfFile.name}
                          </span>
                        ) : (
                          'اضغط لرفع ملف PDF'
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        الحد الأقصى: 10 ميجابايت
                      </span>
                    </>
                  )}
                </label>
                
                {/* Progress Bar */}
                {isUploadingFile && (
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#0D3B66] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Article Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                تاريخ المقال
              </label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={articleDate}
                  onChange={(e) => setArticleDate(e.target.value)}
                  className="w-full pr-10 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تاريخ كتابة أو إعداد المقال (اختياري)
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'ready-to-publish' | 'published')
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
              >
                <option value="ready-to-publish">جاهز للنشر</option>
                <option value="published">منشور</option>
              </select>
            </div>

            {/* Published Date (only if status is published) */}
            {status === 'published' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تاريخ النشر
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="w-full pr-10 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0D3B66] focus:border-[#0D3B66]"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  اترك فارغاً لاستخدام التاريخ الحالي
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingFile}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#0D3B66] text-white rounded-lg hover:bg-[#0D3B66]/90 transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>إنشاء المقال</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/manage-articles')}
            disabled={isSubmitting}
            className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
        </div>
        
        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>نصائح:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 mr-6">
            <li>• اضغط Enter بعد كتابة كل كلمة مفتاحية لإضافة حقل جديد تلقائياً</li>
            <li>• يمكنك إضافة عدة مؤلفين بالضغط على زر "إضافة مؤلف"</li>
            <li>• تأكد من رفع ملف PDF بحجم لا يتجاوز 10 ميجابايت</li>
            <li>• حدد تاريخ المقال إذا كان مختلفاً عن تاريخ النشر</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
