import api from './api';

// ============================================
// Types
// ============================================

export type IssueStatus = 'planned' | 'in-progress' | 'published';

export interface Issue {
  id: string;
  issue_number: string;
  title: string;
  description?: string;
  publish_date: string;
  max_articles: number;
  cover_image_url?: string;
  cover_image_public_id?: string;
  issue_pdf_url?: string;
  issue_pdf_public_id?: string;
  status: IssueStatus;
  total_articles: number;
  total_pages: number;
  downloads_count: number;
  views_count: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  articles?: any[]; // Articles array when fetched with relations
}

export interface CreateIssueDto {
  issue_number: string;
  title: string;
  description?: string;
  publish_date: string;
  max_articles: number;
  cover_image_url?: string;
  status?: IssueStatus;
}

export interface UpdateIssueDto {
  issue_number?: string;
  title?: string;
  description?: string;
  publish_date?: string;
  max_articles?: number;
  cover_image_url?: string;
  status?: IssueStatus;
}

export interface IssueStats {
  total: number;
  planned: number;
  inProgress: number;
  published: number;
  totalArticles: number;
  totalDownloads: number;
  totalViews: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all issues (Admin/Editor)
 */
export const getAllIssues = async (): Promise<Issue[]> => {
  const response = await api.get('/issues');
  return response.data;
};

/**
 * Get published issues (Public)
 */
export const getPublishedIssues = async (): Promise<Issue[]> => {
  const response = await api.get('/issues/published');
  return response.data;
};

/**
 * Get latest published issue (Public)
 */
export const getLatestIssue = async (): Promise<Issue> => {
  const response = await api.get('/issues/latest');
  return response.data;
};

/**
 * Get issue by ID
 */
export const getIssueById = async (id: string): Promise<Issue> => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

/**
 * Get issue by issue number
 */
export const getIssueByNumber = async (issueNumber: string): Promise<Issue> => {
  const response = await api.get(`/issues/number/${issueNumber}`);
  return response.data;
};

/**
 * Create issue
 */
export const createIssue = async (data: CreateIssueDto): Promise<Issue> => {
  const response = await api.post('/issues', data);
  return response.data;
};

/**
 * Update issue
 */
export const updateIssue = async (id: string, data: UpdateIssueDto): Promise<Issue> => {
  const response = await api.patch(`/issues/${id}`, data);
  return response.data;
};

/**
 * Delete issue (Admin only)
 */
export const deleteIssue = async (id: string): Promise<void> => {
  await api.delete(`/issues/${id}`);
};

/**
 * Publish issue
 */
export const publishIssue = async (id: string): Promise<Issue> => {
  const response = await api.patch(`/issues/${id}/publish`);
  return response.data;
};

/**
 * Increment issue views
 */
export const incrementIssueViews = async (id: string): Promise<void> => {
  await api.post(`/issues/${id}/view`);
};

/**
 * Increment issue downloads
 */
export const incrementIssueDownloads = async (id: string): Promise<void> => {
  await api.post(`/issues/${id}/download`);
};

/**
 * Get issue statistics (calculated from issues list)
 */
export const getIssuesStats = async (): Promise<IssueStats> => {
  const issues = await getAllIssues();
  
  const stats: IssueStats = {
    total: issues.length,
    planned: issues.filter(i => i.status === 'planned').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    published: issues.filter(i => i.status === 'published').length,
    totalArticles: issues.reduce((sum, i) => sum + i.total_articles, 0),
    totalDownloads: issues.reduce((sum, i) => sum + i.downloads_count, 0),
    totalViews: issues.reduce((sum, i) => sum + i.views_count, 0),
  };
  
  return stats;
};

// Default export
const issuesService = {
  getAllIssues,
  getPublishedIssues,
  getLatestIssue,
  getIssueById,
  getIssueByNumber,
  createIssue,
  updateIssue,
  deleteIssue,
  publishIssue,
  incrementIssueViews,
  incrementIssueDownloads,
  getStats: getIssuesStats,
};

export default issuesService;
