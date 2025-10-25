import { ResearchCard } from '../cards/ResearchCard';

interface ResearchArticle {
  id: number;
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
}

export function ResearchList({ articles, title = 'أحدث الأبحاث' }: ResearchListProps) {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1360px] mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-10 lg:mb-12">
            {title}
          </h2>
          <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6 items-center">
            {articles.map((article) => (
              <ResearchCard key={article.id} article={article} />
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <button className="bg-blue-900 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-blue-800 transition-colors w-full sm:w-auto">
              عرض المزيد
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
