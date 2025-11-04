import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import articlesService, { Article } from "../services/articlesService";
import toast from "react-hot-toast";
import { FileText, Calendar, User, Download, Eye, BookMarked } from "lucide-react";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await articlesService.searchArticles(query);
        setArticles(results);
      } catch (error) {
        console.error("Error searching articles:", error);
        toast.error("حدث خطأ أثناء البحث");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <motion.div 
        className="flex min-h-screen items-center justify-center bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#b2823e]"></div>
          <p className="mt-4 text-lg text-gray-600">جاري البحث...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-[#093059]" dir="rtl">
            نتائج البحث
          </h1>
          {query && (
            <motion.p 
              className="mt-2 text-lg text-gray-600" 
              dir="rtl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              البحث عن: <span className="font-semibold text-[#b2823e]">"{query}"</span>
            </motion.p>
          )}
          <motion.p 
            className="mt-1 text-sm text-gray-500" 
            dir="rtl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {articles.length} نتيجة
          </motion.p>
        </motion.div>

        {/* Results */}
        {articles.length === 0 ? (
          <motion.div 
            className="rounded-lg bg-white p-12 text-center shadow-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FileText className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700" dir="rtl">
              لا توجد نتائج
            </h2>
            <p className="mt-2 text-gray-500" dir="rtl">
              لم يتم العثور على مقالات تطابق بحثك. حاول استخدام كلمات مفتاحية مختلفة.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                className="flex flex-col rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 15px 30px rgba(0,0,0,0.15)' }}
              >
                {/* Article Number Badge */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#b2823e] px-3 py-1 text-sm font-semibold text-white">
                    #{article.article_number}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {article.status === "published" ? "منشور" : "جاهز للنشر"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-3 text-right text-xl font-bold text-[#093059]" dir="rtl">
                  {article.title}
                </h3>

                {/* Abstract */}
                {article.abstract && (
                  <p className="mb-4 line-clamp-3 text-right text-sm text-gray-600" dir="rtl">
                    {article.abstract}
                  </p>
                )}

                {/* Authors */}
                {article.authors && article.authors.length > 0 && (
                  <div className="mb-4 flex items-center justify-end gap-2 text-sm text-gray-500">
                    <span dir="rtl">{article.authors[0].name}</span>
                    {article.authors.length > 1 && (
                      <span dir="rtl">وآخرون ({article.authors.length})</span>
                    )}
                    <User className="h-4 w-4" />
                  </div>
                )}

                {/* Specialization */}
                {article.research?.specialization && (
                  <div className="mb-4 flex items-center justify-end gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-3 py-2">
                    <span className="text-xs font-medium text-gray-700" dir="rtl">
                      {article.research.specialization}
                    </span>
                    <BookMarked className="h-4 w-4 text-[#b2823e]" />
                  </div>
                )}

                {/* Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="mb-4 flex flex-wrap justify-end gap-2">
                    {article.keywords.slice(0, 3).map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        dir="rtl"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="mb-4 flex items-center justify-end gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>{article.downloads_count || 0}</span>
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{article.views_count || 0}</span>
                    <Eye className="h-4 w-4" />
                  </div>
                  {article.pages && (
                    <div className="flex items-center gap-1">
                      <span dir="rtl">{article.pages} صفحة</span>
                      <FileText className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Created Date */}
                {article.created_at && (
                  <div className="mb-4 flex items-center justify-end gap-2 text-xs text-gray-400">
                    <span dir="rtl">
                      {new Date(article.created_at).toLocaleDateString("ar-EG")}
                    </span>
                    <Calendar className="h-4 w-4" />
                  </div>
                )}

                {/* View Details Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/article/${article.id}`}
                    className="mt-auto block rounded-lg bg-[#093059] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#0a4070]"
                    dir="rtl"
                  >
                    عرض التفاصيل
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Back to Home */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="inline-block rounded-lg border-2 border-[#b2823e] px-6 py-2 text-[#b2823e] transition-colors hover:bg-[#b2823e] hover:text-white"
              dir="rtl"
            >
              العودة للصفحة الرئيسية
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
