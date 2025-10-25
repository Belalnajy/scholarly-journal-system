import {  User } from "lucide-react";
import { Link } from "react-router-dom";

interface ResearchArticle {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  views: number;
  downloads: number;
}

interface ResearchCardProps {
  article: ResearchArticle;
}

export function ResearchCard({ article }: ResearchCardProps) {
  return (
    <div className="flex w-full max-w-[1360px] flex-col-reverse gap-6 rounded-2xl border border-[#858585] p-4 transition-shadow hover:shadow-lg sm:p-5 md:flex-row md:items-stretch md:justify-between md:gap-8 lg:p-6">
      {/* Action Buttons */}
      <div className="flex flex-col justify-between gap-4 md:gap-0">
        <div className="inline-flex h-8 w-fit items-center justify-center rounded-2xl bg-[#a2cbf6] px-4 py-2 sm:h-10 sm:px-6">
          <span className="text-nowrap text-sm text-white sm:text-base">{article.category}</span>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 md:gap-6 lg:gap-8">
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#093059] px-3 py-2 transition-colors hover:bg-[#0a3d6b] sm:h-[54px] sm:w-auto sm:min-w-[160px] lg:w-[180px]">
            <span dir="rtl" className="text-nowrap text-sm text-white sm:text-base">تحميل pdf</span>
          </button>

          <Link 
            to={`/research/${article.id}`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#b2823e] px-3 py-2 transition-colors hover:bg-[#b2823e] sm:h-[54px] sm:w-auto sm:min-w-[160px] lg:w-[180px]"
          >
            <span dir="rtl" className="text-nowrap text-[#b2823e] hover:text-white sm:text-base">عرض التفاصيل</span>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex w-full flex-col items-end gap-6 md:w-auto md:flex-1 lg:gap-8">
        <div className="flex w-full flex-col items-end gap-4 text-right sm:gap-5 lg:gap-6">
          <h3 className="w-full text-lg font-medium text-[#093059] sm:text-xl lg:text-[24px]" dir="auto">
            {article.title}
          </h3>
          <p className="w-full text-base text-[#093059] sm:text-lg lg:text-[24px]" dir="auto">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <p className="text-sm text-[#093059] sm:text-base" dir="auto">
              {article.author}
            </p>
            <User className="size-5 text-[#093059] sm:size-6" />
          </div>
        </div>

        {/* Stats */}
        <p className="w-full text-right text-sm text-[#999999] sm:text-base" dir="auto">
          {article.views} مشاهدة, {article.downloads} تحميل
        </p>
      </div>
    </div>
  );
}
