import { User, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ResearchArticle {
  id: string | number;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  views: number;
  downloads: number;
  pdf_url?: string;
  cloudinary_secure_url?: string;
}

interface ResearchCardProps {
  article: ResearchArticle;
}

export function ResearchCard({ article }: ResearchCardProps) {
  // Get PDF URL
  const pdfUrl = article.cloudinary_secure_url || article.pdf_url;
  
  // Handle download
  const handleDownload = async () => {
    if (!pdfUrl) {
      alert('ملف PDF غير متوفر');
      return;
    }
    
    try {
      // Download PDF directly
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `article-${article.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Increment download counter
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/articles/${article.id}/download`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: open in new tab if download fails
      window.open(pdfUrl, '_blank');
    }
  };
  
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-[1360px] flex-col-reverse gap-6 rounded-2xl border border-[#858585] p-4 transition-shadow hover:shadow-lg sm:p-5 md:flex-row md:items-stretch md:justify-between md:gap-8 lg:p-6"
    >
      {/* Action Buttons */}
      <div className="flex flex-col justify-between gap-4 md:gap-0">
        <div className="inline-flex h-8 w-fit items-center justify-center rounded-2xl bg-[#a2cbf6] px-4 py-2 sm:h-10 sm:px-6">
          <span className="text-nowrap text-sm text-white sm:text-base">{article.category}</span>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 md:gap-6 lg:gap-8">
          <motion.button
            onClick={handleDownload}
            disabled={!pdfUrl}
            whileHover={{ scale: pdfUrl ? 1.02 : 1 }}
            whileTap={{ scale: pdfUrl ? 0.98 : 1 }}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-3 py-2 transition-colors sm:h-[54px] sm:w-auto sm:min-w-[160px] lg:w-[180px] ${
              pdfUrl 
                ? 'bg-[#093059] hover:bg-[#0a3d6b] cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="size-4 text-white" />
            <span dir="rtl" className="text-nowrap text-sm text-white sm:text-base">تحميل PDF</span>
          </motion.button>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              to={`/article/${article.id}`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#b2823e] px-3 py-2 text-[#b2823e] transition-colors hover:bg-[#b2823e] hover:text-white sm:h-[54px] sm:w-auto sm:min-w-[160px] lg:w-[180px]"
            >
              <span dir="rtl" className="text-nowrap text-sm sm:text-base">عرض التفاصيل</span>
            </Link>
          </motion.div>
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
    </motion.div>
  );
}
