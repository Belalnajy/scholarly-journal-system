import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArticleCard } from '../components/cards';
import { NewsletterSection } from '../components';
import issuesService from '../services/issuesService';
import articlesService from '../services/articlesService';
import type { Issue } from '../services/issuesService';
import type { Article } from '../services/articlesService';

export function IssueDetailsPage() {
  const { id: issueId } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (issueId) {
      loadIssueDetails();
    } else {
      setError('معرف العدد غير موجود');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  const loadIssueDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct fetch to get issue with articles
      try {
        const directUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/issues/${issueId}`;
        const directResponse = await fetch(directUrl);
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          setIssue(directData);
          
          if (directData.articles && Array.isArray(directData.articles)) {
            setArticles(directData.articles);
          }
          
          setLoading(false);
          return;
        }
      } catch (fetchErr) {
        // Fallback to axios
      }
      
      const issueData = await issuesService.getIssueById(issueId!);
      setIssue(issueData);

      // Use articles from issue response if available, otherwise fetch separately
      if (issueData.articles && Array.isArray(issueData.articles)) {
        setArticles(issueData.articles as any);
      } else {
        const issueArticles = await articlesService.getArticlesByIssueId(issueId!);
        setArticles(issueArticles);
      }

      // Increment issue views
      try {
        await issuesService.incrementIssueViews(issueId!);
      } catch (err) {
        console.error('Failed to increment issue views:', err);
      }
    } catch (err: any) {
      let errorMsg = 'فشل في تحميل بيانات العدد';
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMsg = 'فشل الاتصال بالخادم. تأكد من تشغيل Backend على المنفذ 3000';
      } else if (err.response?.status === 404) {
        errorMsg = 'العدد غير موجود';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      console.error('Error loading issue details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[130px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#093059] mx-auto mb-4 animate-spin" />
          <p className="text-[#666666]" dir="rtl">جاري تحميل بيانات العدد...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-[130px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4" dir="rtl">{error || 'العدد غير موجود'}</p>
          <Link
            to="/issues"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#093059] text-white rounded-lg hover:bg-[#0a3d6b]"
          >
            <ArrowRight className="w-5 h-5" />
            <span dir="rtl">العودة للأعداد</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalDownloads = articles.reduce((sum, article) => sum + (article.downloads_count || 0), 0);
  const totalViews = articles.reduce((sum, article) => sum + (article.views_count || 0), 0);
  
  // Calculate total pages from articles
  const totalPages = articles.reduce((sum, article) => {
    if (!article.pages) return sum;
    
    // Handle different page formats: "1-15", "15", "1 - 15", etc.
    const pageStr = article.pages.toString().trim();
    
    // If it contains a dash, it's a range (e.g., "1-15" or "125-156")
    if (pageStr.includes('-')) {
      const [start, end] = pageStr.split('-').map(p => parseInt(p.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        return sum + (end - start + 1);
      }
    }
    
    // If it's just a number, treat it as page count
    const pageNum = parseInt(pageStr);
    if (!isNaN(pageNum)) {
      return sum + pageNum;
    }
    
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-[130px]">{/* Header Section */}
      <motion.div 
        className="bg-[#e8f0f8] py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-6">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/issues"
                className="flex w-fit items-center gap-2 text-[#093059] transition-colors hover:text-[#b2823e]"
              >
                <ArrowRight className="size-5" />
                <span className="text-base font-medium" dir="rtl">
                  العودة إلى الأعداد والأرشيف
                </span>
              </Link>
            </motion.div>

            {/* Title and Info */}
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div 
                className="flex items-center justify-center gap-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <BookOpen className="size-10 text-[#093059]" />
                <h1 className="text-3xl font-bold text-[#093059] md:text-4xl" dir="rtl">
                  الأبحاث المنشورة في هذا العدد
                </h1>
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-[#093059]" dir="rtl">
                  {issue.title}
                </h2>
                <p className="text-base text-[#666666]" dir="rtl">
                  العدد {issue.issue_number} - {new Date(issue.publish_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                </p>
                <p className="max-w-3xl text-base text-[#666666] sm:text-lg" dir="rtl">
                  يحتوي هذا العدد على {articles.length} أبحاث محكمة في مجالات مختلفة
                </p>
                {issue.description && (
                  <p className="max-w-3xl text-sm text-[#666666]" dir="rtl">
                    {issue.description}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { value: articles.length, label: 'أبحاث منشورة', delay: 0.6 },
            { value: totalPages, label: 'إجمالي الصفحات', delay: 0.7 },
            { value: totalDownloads, label: 'إجمالي التحميلات', delay: 0.8 },
            { value: totalViews, label: 'إجمالي المشاهدات', delay: 0.9 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <p className="text-3xl font-bold text-[#093059]">
                {stat.value}
              </p>
              <p className="text-sm text-[#666666]" dir="rtl">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Articles List */}
      <div className="container mx-auto px-4 pb-16">
        {articles.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#666666] text-lg" dir="rtl">
              لا توجد مقالات في هذا العدد بعد
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <ArticleCard article={article} articleNumber={index + 1} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <NewsletterSection />
    </div>
  );
}
