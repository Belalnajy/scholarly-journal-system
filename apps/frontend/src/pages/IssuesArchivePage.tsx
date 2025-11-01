import { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Loader2,
  X,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IssueCard } from '../components/cards/IssueCard';
import { NewsletterSection } from '../components';
import issuesService from '../services/issuesService';
import articlesService from '../services/articlesService';
import type { Issue } from '../services/issuesService';

type SortOption = 'newest' | 'oldest' | 'most-articles' | 'most-downloads';
type StatusFilter = 'all' | 'published' | 'in-progress';

export function IssuesArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
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
      const [publishedIssues, publishedArticles] = await Promise.all([
        issuesService.getPublishedIssues(),
        articlesService.getPublishedArticles(),
      ]);

      setIssues(publishedIssues);

      // Calculate stats from published data
      const totalDownloads = publishedIssues.reduce((sum, issue) => {
        return sum + (issue.downloads_count || 0);
      }, 0);

      setStats({
        totalIssues: publishedIssues.length,
        publishedArticles: publishedArticles.length,
        totalDownloads: totalDownloads,
      });
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique years from issues
  const availableYears = Array.from(
    new Set(issues.map((issue) => new Date(issue.publish_date).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter and sort issues
  const filteredIssues = issues
    .filter((issue) => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        issue.title.toLowerCase().includes(query) ||
        issue.issue_number.toString().includes(query) ||
        issue.description?.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || issue.status === statusFilter;

      // Year filter
      const issueYear = new Date(issue.publish_date).getFullYear().toString();
      const matchesYear = yearFilter === 'all' || issueYear === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.publish_date).getTime() -
            new Date(a.publish_date).getTime()
          );
        case 'oldest':
          return (
            new Date(a.publish_date).getTime() -
            new Date(b.publish_date).getTime()
          );
        case 'most-articles':
          return (b.total_articles || 0) - (a.total_articles || 0);
        case 'most-downloads':
          return (b.downloads_count || 0) - (a.downloads_count || 0);
        default:
          return 0;
      }
    });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setStatusFilter('all');
    setYearFilter('all');
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery ||
    sortBy !== 'newest' ||
    statusFilter !== 'all' ||
    yearFilter !== 'all';

  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-[130px]" dir="rtl">
      {/* Header Section */}
      <motion.div
        className="bg-[#e8f0f8] py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <BookOpen className="size-10 text-[#093059]" />
              <h1
                className="text-3xl font-bold text-[#093059] md:text-4xl"
                dir="rtl"
              >
                أرشيف الأعداد
              </h1>
            </motion.div>
            <motion.p
              className="max-w-2xl text-base text-[#666666]"
              dir="rtl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              تصفح جميع الأعداد المنشورة من المجلة واطلع على الأبحاث العلمية
              المحكمة
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Filter Button */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 transition-colors md:order-1 ${
              showFilters || hasActiveFilters
                ? 'border-[#093059] bg-[#093059] text-white'
                : 'border-[#e5e5e5] bg-white text-[#093059] hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="size-5" />
            {hasActiveFilters && <span className="text-xs font-bold">•</span>}
          </motion.button>

          {/* Search Bar */}
          <motion.div
            className="relative flex-1 md:order-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <input
              type="text"
              placeholder="ابحث في الأعداد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#e5e5e5] bg-white px-12 text-right text-sm text-[#093059] placeholder:text-[#999999] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
              dir="rtl"
            />
            <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#999999]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#093059]"
              >
                <X className="size-4" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-xl bg-white p-6 shadow-sm border border-[#e5e5e5]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sort By */}
                  <div dir="rtl">
                    <label className="block text-sm font-medium text-[#093059] mb-2">
                      <TrendingUp className="inline size-4 ml-2" />
                      الترتيب حسب
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-right text-sm text-[#093059] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
                    >
                      <option value="newest">الأحدث</option>
                      <option value="oldest">الأقدم</option>
                      <option value="most-articles">الأكثر مقالات</option>
                      <option value="most-downloads">الأكثر تحميلاً</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div dir="rtl">
                    <label className="block text-sm font-medium text-[#093059] mb-2">
                      <BookOpen className="inline size-4 ml-2" />
                      الحالة
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as StatusFilter)
                      }
                      className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-right text-sm text-[#093059] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
                    >
                      <option value="all">الكل</option>
                      <option value="published">منشور</option>
                      <option value="in-progress">قيد التحضير</option>
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div dir="rtl">
                    <label className="block text-sm font-medium text-[#093059] mb-2">
                      <Calendar className="inline size-4 ml-2" />
                      السنة
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-right text-sm text-[#093059] focus:border-[#093059] focus:outline-none focus:ring-1 focus:ring-[#093059]"
                    >
                      <option value="all">كل السنوات</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-2 text-sm text-[#b2823e] hover:text-[#093059] transition-colors"
                    dir="rtl"
                  >
                    <X className="size-4" />
                    مسح جميع الفلاتر
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="container mx-auto px-4 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              value: loading ? '...' : stats.totalIssues,
              label: 'الأعداد المنشورة',
              delay: 0.6,
            },
            {
              value: loading ? '...' : stats.publishedArticles,
              label: 'الأبحاث المنشورة',
              delay: 0.7,
            },
            {
              value: loading ? '...' : stats.totalDownloads.toLocaleString(),
              label: 'إجمالي التحميلات',
              delay: 0.8,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-1 rounded-xl bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <p className="text-3xl font-bold text-[#093059]">{stat.value}</p>
              <p className="text-sm text-[#666666]" dir="rtl">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <motion.div
          className="container mx-auto px-4 pb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-2" dir="rtl">
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093059] text-white text-sm">
                بحث: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-[#b2823e]"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b2823e] text-white text-sm">
                {sortBy === 'oldest'
                  ? 'الأقدم'
                  : sortBy === 'most-articles'
                  ? 'الأكثر مقالات'
                  : 'الأكثر تحميلاً'}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093059] text-white text-sm">
                {statusFilter === 'published' ? 'منشور' : 'قيد التحضير'}
              </span>
            )}
            {yearFilter !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093059] text-white text-sm">
                {yearFilter}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Results Count */}
      {!loading && (
        <motion.div
          className="container mx-auto px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-[#666666]" dir="rtl">
            عرض {filteredIssues.length} من {issues.length} عدد
          </p>
        </motion.div>
      )}

      {/* Issues Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#093059] mx-auto mb-4 animate-spin" />
              <p className="text-[#666666]" dir="rtl">
                جاري تحميل الأعداد...
              </p>
            </div>
          </motion.div>
        ) : filteredIssues.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#666666] text-lg" dir="rtl">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أعداد منشورة بعد'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      <NewsletterSection />
    </div>
  );
}
