import { ResearchCard } from '../cards/ResearchCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ResearchArticle {
  id: string | number;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  views: number;
  downloads: number;
}

interface ResearchListProps {
  articles: ResearchArticle[];
  title?: string;
  loading?: boolean;
}

export function ResearchList({ articles, title = 'أحدث الأبحاث', loading = false }: ResearchListProps) {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1360px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-10 lg:mb-12"
          >
            {title}
          </motion.h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">لا توجد أبحاث منشورة حالياً</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 items-center">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full"
                  >
                    <ResearchCard article={article} />
                  </motion.div>
                ))}
              </div>

              {/* View More Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center mt-8 sm:mt-10 lg:mt-12"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                  to="/issues"
                  className="inline-block bg-blue-900 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-blue-800 transition-colors"
                  >
                    عرض المزيد
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
