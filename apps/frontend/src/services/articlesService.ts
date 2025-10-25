import api from './api';

// ============================================
// Types
// ============================================

export type ArticleStatus = 'ready-to-publish' | 'published';

export interface ArticleAuthor {
  name: string;
  affiliation: string;
  email: string;
}

export interface Article {
  id: string;
  research_id: string;
  issue_id: string;
  article_number: string;
  title: string;
  title_en?: string;
  authors: ArticleAuthor[];
  abstract: string;
  abstract_en?: string;
  keywords: string[];
  keywords_en?: string[];
  pages: string;
  doi?: string;
  pdf_url?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  qr_code_url?: string;
  qr_code_public_id?: string;
  status: ArticleStatus;
  views_count: number;
  downloads_count: number;
  citations_count: number;
  published_date?: string;
  created_at: string;
  updated_at: string;
  issue?: {
    id: string;
    issue_number: string;
    title: string;
    publish_date: string;
  };
  research?: {
    id: string;
    research_number: string;
    user_id: string;
    submission_date?: string;
    evaluation_date?: string;
    published_date?: string;
  };
}

export interface CreateArticleDto {
  research_id?: string;
  issue_id: string;
  article_number: string;
  title: string;
  title_en?: string;
  authors: ArticleAuthor[];
  abstract: string;
  abstract_en?: string;
  keywords: string[];
  keywords_en?: string[];
  pages?: string;
  doi?: string;
  pdf_url: string;
  status?: ArticleStatus;
}

export interface UpdateArticleDto {
  issue_id?: string;
  title?: string;
  title_en?: string;
  authors?: ArticleAuthor[];
  abstract?: string;
  abstract_en?: string;
  keywords?: string[];
  keywords_en?: string[];
  pages?: string;
  doi?: string;
  status?: ArticleStatus;
}

export interface ArticleStats {
  totalArticles: number;
  publishedArticles: number;
  readyToPublish: number;
  totalViews: number;
  totalDownloads: number;
  totalCitations: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all articles (Admin/Editor)
 */
export const getAllArticles = async (issueId?: string, status?: ArticleStatus): Promise<Article[]> => {
  const params: any = {};
  if (issueId) params.issueId = issueId;
  if (status) params.status = status;
  const response = await api.get('/articles', { params });
  return response.data;
};

/**
 * Get published articles (Public)
 */
export const getPublishedArticles = async (): Promise<Article[]> => {
  const response = await api.get('/articles/published');
  return response.data;
};

/**
 * Get article by ID
 */
export const getArticleById = async (id: string): Promise<Article> => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

/**
 * Get article by article number
 */
export const getArticleByNumber = async (articleNumber: string): Promise<Article> => {
  const response = await api.get(`/articles/number/${articleNumber}`);
  return response.data;
};

/**
 * Get article by research ID
 */
export const getArticleByResearchId = async (researchId: string): Promise<Article> => {
  const response = await api.get(`/articles/research/${researchId}`);
  return response.data;
};

/**
 * Create article from accepted research
 */
export const createArticle = async (data: CreateArticleDto): Promise<Article> => {
  const response = await api.post('/articles', data);
  return response.data;
};

/**
 * Update article
 */
export const updateArticle = async (id: string, data: UpdateArticleDto): Promise<Article> => {
  const response = await api.patch(`/articles/${id}`, data);
  return response.data;
};

/**
 * Delete article (Admin only)
 */
export const deleteArticle = async (id: string): Promise<void> => {
  await api.delete(`/articles/${id}`);
};

/**
 * Publish article
 */
export const publishArticle = async (id: string): Promise<Article> => {
  const response = await api.patch(`/articles/${id}/publish`);
  return response.data;
};

/**
 * Search articles
 */
export const searchArticles = async (query: string): Promise<Article[]> => {
  const response = await api.get('/articles/search', { params: { q: query } });
  return response.data;
};

/**
 * Get articles statistics
 */
export const getArticlesStats = async (): Promise<ArticleStats> => {
  const response = await api.get('/articles/stats');
  return response.data;
};

/**
 * Get article PDF URL
 */
export const getArticlePdfUrl = (article: Article): string => {
  return article.cloudinary_secure_url || article.pdf_url || '';
};

/**
 * Increment article views
 */
export const incrementArticleViews = async (id: string): Promise<void> => {
  await api.post(`/articles/${id}/view`);
};

/**
 * Verify article by ID (for QR Code)
 */
export const verifyArticle = async (id: string): Promise<Article> => {
  const response = await api.get(`/articles/verify/${id}`);
  return response.data;
};

/**
 * Verify article by DOI
 */
export const verifyArticleByDOI = async (doi: string): Promise<Article> => {
  const response = await api.get(`/articles/verify/doi/${doi}`);
  return response.data;
};

/**
 * Regenerate QR Code for article
 */
export const regenerateArticleQRCode = async (id: string): Promise<Article> => {
  const response = await api.post(`/articles/${id}/regenerate-qr`);
  return response.data;
};

/**
 * Get articles by issue ID
 */
export const getArticlesByIssueId = async (issueId: string): Promise<Article[]> => {
  const response = await api.get(`/articles`, { params: { issueId } });
  return response.data;
};

/**
 * Increment article downloads count
 */
export const incrementArticleDownloads = async (id: string): Promise<void> => {
  await api.post(`/articles/${id}/download`);
};

// Default export
const articlesService = {
  getAllArticles,
  getPublishedArticles,
  getArticleById,
  getArticleByNumber,
  getArticleByResearchId,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  searchArticles,
  getStats: getArticlesStats,
  incrementArticleViews,
  incrementDownloads: incrementArticleDownloads,
  verifyArticle,
  verifyArticleByDOI,
  regenerateArticleQRCode,
  getArticlesByIssueId,
  getArticlePdfUrl,
};

export default articlesService;
