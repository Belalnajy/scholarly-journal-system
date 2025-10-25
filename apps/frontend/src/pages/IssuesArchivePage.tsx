import { useState, useEffect } from 'react';
import { BookOpen, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { IssueCard } from '../components/cards/IssueCard';
import { NewsletterSection } from '../components';
import issuesService from '../services/issuesService';
import articlesService from '../services/articlesService';
import type { Issue } from '../services/issuesService';

export function IssuesArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIssues: 0,
    publishedArticles: 0,
    totalDownloads: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publishedIssues, articlesStats] = await Promise.all([
        issuesService.getPublishedIssues(),
        articlesService.getStats(),
      ]);

      setIssues(publishedIssues);
      
      // Calculate stats
      // Sum downloads from all articles in all issues
      const totalDownloads = publishedIssues.reduce((sum, issue) => {
        const issueArticlesDownloads = issue.articles?.reduce((articleSum, article: any) => {
          return articleSum + (article.downloads_count || 0);
        }, 0) || 0;
        return sum + issueArticlesDownloads;
      }, 0);
      
      setStats({
        totalIssues: publishedIssues.length,
        publishedArticles: articlesStats.publishedArticles || 0,
        totalDownloads: totalDownloads,
      });
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on search query
  const filteredIssues = issues.filter((issue) => {
    const query = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(query) ||
      issue.issue_number.toString().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-[130px]">
      {/* Header Section */}
      <div className="bg-[#e8f0f8] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="size-10 text-[#093059]" />
              <h1 className="text-3xl font-bold text-[#093059] md:text-4xl" dir="rtl">
                أرشيف الأعداد
              </h1>
            </div>
            <p className="max-w-2xl text-base text-[#666666]" dir="rtl">
              تصفح جميع الأعداد المنشورة من المجلة واطلع على الأبحاث العلمية المحكمة
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Filter Button */}
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-5 transition-colors hover:bg-gray-50 md:order-1">
            <SlidersHorizontal className="size-5 text-[#093059]" />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 md:order-2">
            <input
              type="text"
              placeholder="ابحث في الأعداد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-white px-12 text-right text-sm text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
              dir="rtl"
            />
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#999999]" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-[#093059]">
              {loading ? '...' : stats.totalIssues}
            </p>
            <p className="text-sm text-[#666666]" dir="rtl">
              الأعداد المنشورة
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-[#093059]">
              {loading ? '...' : stats.publishedArticles}
            </p>
            <p className="text-sm text-[#666666]" dir="rtl">
              الأبحاث المنشورة
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-[#093059]">
              {loading ? '...' : stats.totalDownloads.toLocaleString()}
            </p>
            <p className="text-sm text-[#666666]" dir="rtl">
              إجمالي التحميلات
            </p>
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#093059] mx-auto mb-4 animate-spin" />
              <p className="text-[#666666]" dir="rtl">جاري تحميل الأعداد...</p>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#666666] text-lg" dir="rtl">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أعداد منشورة بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
      <NewsletterSection/>

    </div>

  );
}
