import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import articlesService, { Article } from "../../services/articlesService";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NewsletterSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setLoading(true);
          const results = await articlesService.searchArticles(searchQuery.trim());
          setSuggestions(results.slice(0, 5)); // Show only top 5
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (article: Article) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/article/${article.id}`);
  };

  return (
    <section className="bg-[#093059] py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center justify-center gap-6 sm:gap-7 lg:gap-8">
          {/* Heading */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex w-full max-w-md flex-col items-center gap-2 text-center text-[#f8f3ec] px-4"
          >
            <h2 className="text-xl font-bold sm:text-2xl lg:text-[24px]" dir="auto">
              ابحث في الأبحاث / أرشيف المجلة
            </h2>
            <p className="text-base font-medium sm:text-lg lg:text-[20px]" dir="auto">
              احصل على آخر المقالات المنشورة
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            ref={searchRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-xl"
          >
            <form onSubmit={handleSearch} className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
              <div className="relative order-1 w-full sm:order-2 sm:flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن اخر الابحاث...."
                  className="flex h-12 w-full items-center justify-end rounded-2xl bg-white p-3 text-right text-sm text-[#666666] placeholder:text-[#666666] sm:h-[49px] sm:text-base"
                  dir="rtl"
                  autoComplete="off"
                />
                
                {/* Loading Indicator */}
                {loading && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#b2813e] border-t-transparent"></div>
                  </div>
                )}
              </div>

              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="order-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b2813e] transition-colors hover:bg-[#976e35] sm:order-1 sm:h-[49px] sm:w-auto sm:min-w-[100px] sm:px-6"
              >
                <span className="text-nowrap text-right text-sm text-[#f2f2f2] sm:text-base" dir="auto">
                  بحث
                </span>
              </motion.button>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white shadow-2xl sm:right-auto sm:left-0 sm:w-[calc(100%-120px)]"
                >
                  {suggestions.map((article, index) => (
                    <motion.button
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(article)}
                      className="flex w-full items-start gap-3 border-b border-gray-100 p-4 text-right transition-colors hover:bg-gray-50 last:border-b-0"
                    >
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-[#093059]" dir="rtl">
                        {article.title}
                      </h4>
                      {article.abstract && (
                        <p className="mb-2 line-clamp-2 text-xs text-gray-600" dir="rtl">
                          {article.abstract}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-400">
                          #{article.article_number}
                        </span>
                        {article.authors && article.authors.length > 0 && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500" dir="rtl">
                              {article.authors[0].name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Search className="mt-1 h-4 w-4 flex-shrink-0 text-[#b2813e]" />
                    </motion.button>
                  ))}
                  
                  {/* View All Results */}
                  <button
                  onClick={handleSearch}
                  className="w-full border-t border-gray-200 bg-gray-50 p-3 text-center text-sm font-medium text-[#b2813e] transition-colors hover:bg-gray-100"
                  dir="rtl"
                >
                    عرض جميع النتائج ({suggestions.length > 5 ? "المزيد" : suggestions.length})
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results Message */}
            <AnimatePresence>
              {showSuggestions && !loading && searchQuery.trim().length >= 2 && suggestions.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl bg-white p-4 text-center shadow-2xl sm:right-auto sm:left-0 sm:w-[calc(100%-120px)]"
                >
                  <p className="text-sm text-gray-500" dir="rtl">
                    لا توجد نتائج مطابقة
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
