import { useState, useEffect } from 'react';
import { 
  HeroSection, 
  ResearchList, 
  FeaturesSection, 
  NewsletterSection 
} from '../components/sections';
import {
  heroContent,
  features,
} from '../data/demoData';
import articlesService, { type Article } from '../services/articlesService';
import issuesService from '../services/issuesService';

export function LandingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    totalArticles: 0,
    totalResearchers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // جلب المقالات المنشورة (أحدث 3 مقالات)
      const publishedArticles = await articlesService.getPublishedArticles();
      setArticles(publishedArticles.slice(0, 3));

      // جلب الأعداد المنشورة
      const publishedIssues = await issuesService.getPublishedIssues();

      // حساب الإحصائيات من البيانات المتاحة
      setStats({
        totalIssues: publishedIssues.length,
        totalArticles: publishedArticles.length,
        totalResearchers: publishedArticles.length, // تقريبي - يمكن تحسينه لاحقاً
      });
    } catch (error) {
      console.error('Error loading landing page data:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحويل البيانات للصيغة المطلوبة في HeroSection
  const heroStats = [
    { value: `${stats.totalIssues}+`, label: 'عدد' },
    { value: `${stats.totalArticles}+`, label: 'بحث' },
    { value: `${stats.totalResearchers}+`, label: 'بحث منشور' },
  ];

  // تحويل المقالات للصيغة المطلوبة في ResearchList
  const researchArticles = articles.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.abstract.substring(0, 150) + '...',
    author: article.authors[0]?.name || 'غير محدد',
    category: article.issue?.title || 'غير محدد',
    views: article.views_count,
    downloads: article.downloads_count,
    pdf_url: article.pdf_url,
    cloudinary_secure_url: article.cloudinary_secure_url,
  }));

  return (
    <>
      <HeroSection content={heroContent} stats={heroStats} />
      <ResearchList articles={researchArticles} loading={loading} />
      <FeaturesSection features={features} />
      <NewsletterSection />
    </>
  );
}
