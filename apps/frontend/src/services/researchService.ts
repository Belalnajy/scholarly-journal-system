import api from './api';
import axios from 'axios';

// ============================================
// Types
// ============================================

export type ResearchStatus =
  | 'pending'
  | 'under-review'
  | 'pending-editor-decision'
  | 'needs-revision'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface Research {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    affiliation?: string;
  };
  research_number: string;
  title: string;
  title_en?: string;
  abstract: string;
  abstract_en?: string;
  keywords?: string[];
  keywords_en?: string[];
  specialization: string;
  status: ResearchStatus;
  file_url?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  file_type?: string;
  file_updated_at?: string;
  file_updated_by?: string;
  acceptance_certificate_url?: string;
  acceptance_certificate_cloudinary_public_id?: string;
  acceptance_certificate_cloudinary_secure_url?: string;
  acceptance_certificate_custom_message?: string;
  published_article_id?: string;
  submission_date: string;
  evaluation_date?: string;
  published_date?: string;
  average_rating?: number;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchFile {
  id: string;
  research_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  file_category: 'main' | 'supplementary' | 'revision';
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  cloudinary_format?: string;
  cloudinary_resource_type?: string;
  uploaded_at: string;
}

export interface ResearchStats {
  total: number;
  under_review: number;
  accepted: number;
  needs_revision: number;
  rejected: number;
  published: number;
}

export interface CreateResearchDto {
  user_id: string;
  research_number: string;
  title: string;
  title_en?: string;
  abstract: string;
  abstract_en?: string;
  keywords?: string[];
  keywords_en?: string[];
  specialization: string;
  status?: ResearchStatus;
}

export interface UpdateResearchDto {
  title?: string;
  title_en?: string;
  abstract?: string;
  abstract_en?: string;
  keywords?: string[];
  keywords_en?: string[];
  specialization?: string;
  status?: ResearchStatus;
  file_url?: string;
}

export interface CreateResearchFileDto {
  research_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  file_category?: 'main' | 'supplementary' | 'revision';
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique research number
 */
function generateResearchNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `RES-${year}-${random}`;
}

/**
 * Extract error message from axios error
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (message) {
      return Array.isArray(message) ? message.join(', ') : message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'حدث خطأ غير متوقع';
}

// ============================================
// Research Service
// ============================================

export const researchService = {
  /**
   * Create new research
   */
  async create(data: CreateResearchDto): Promise<Research> {
    try {
      const response = await api.post<Research>('/research', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get all researches with optional filters
   */
  async getAll(filters?: {
    user_id?: string;
    status?: ResearchStatus;
    specialization?: string;
  }): Promise<Research[]> {
    try {
      const response = await api.get<Research[]>('/research', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get research statistics
   */
  async getStats(user_id?: string): Promise<ResearchStats> {
    try {
      const response = await api.get<ResearchStats>('/research/stats', {
        params: user_id ? { user_id } : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get research by ID
   */
  async getById(id: string): Promise<Research> {
    try {
      const response = await api.get<Research>(`/research/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get research by research number
   */
  async getByResearchNumber(research_number: string): Promise<Research> {
    try {
      const response = await api.get<Research>(
        `/research/number/${research_number}`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update research
   */
  async update(id: string, data: UpdateResearchDto): Promise<Research> {
    try {
      const response = await api.patch<Research>(`/research/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update research status
   */
  async updateStatus(
    id: string,
    status: ResearchStatus,
    issueId?: string
  ): Promise<Research> {
    try {
      const response = await api.patch<Research>(`/research/${id}/status`, {
        status,
        issueId,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Accept research and convert to article automatically
  async acceptAndConvertToArticle(
    researchId: string,
    issueId: string
  ): Promise<Research> {
    try {
      const response = await api.patch<Research>(
        `/research/${researchId}/status`,
        {
          status: 'accepted',
          issueId: issueId,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete research
   */
  async delete(id: string, silent = false): Promise<void> {
    try {
      await api.delete(`/research/${id}`, {
        // In silent mode, treat 404 as success
        validateStatus: (status) => {
          if (silent && status === 404) return true;
          return status >= 200 && status < 300;
        },
      });
    } catch (error) {
      // If silent mode and it's a 404, don't throw
      if (silent && (error as any)?.response?.status === 404) {
        return; // Research already deleted, ignore
      }
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Add file to research
   */
  async addFile(data: CreateResearchFileDto): Promise<ResearchFile> {
    try {
      const response = await api.post<ResearchFile>('/research/files', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get files for research
   */
  async getFiles(research_id: string): Promise<ResearchFile[]> {
    try {
      const response = await api.get<ResearchFile[]>(
        `/research/${research_id}/files`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete research file
   */
  async deleteFile(file_id: string): Promise<void> {
    try {
      await api.delete(`/research/files/${file_id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Upload file and create research with file
   * This is a helper method that combines file upload + research creation
   */
  async submitWithFile(data: {
    title: string;
    title_en?: string;
    abstract: string;
    abstract_en?: string;
    keywords: string[];
    keywords_en?: string[];
    specialization: string;
    file: File;
  }): Promise<{ research: Research; file: ResearchFile }> {
    try {
      // Get current user ID
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // Generate research number
      const research_number = generateResearchNumber();

      // Create research
      const research = await this.create({
        user_id: userId,
        research_number,
        title: data.title,
        title_en: data.title_en,
        abstract: data.abstract,
        abstract_en: data.abstract_en,
        keywords: data.keywords,
        keywords_en: data.keywords_en,
        specialization: data.specialization,
        status: 'under-review',
      });

      // TODO: Upload file to storage (S3, Cloudinary, etc.)
      // For now, we'll create a mock file URL
      const mockFileUrl = `https://storage.example.com/research/${research.id}/${data.file.name}`;

      // Add file record
      const file = await this.addFile({
        research_id: research.id,
        file_name: data.file.name,
        file_url: mockFileUrl,
        file_type: data.file.type,
        file_size: data.file.size,
        file_category: 'main',
      });

      return { research, file };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // ============================================
  // Cloudinary Upload Methods
  // ============================================

  /**
   * Upload research PDF to Cloudinary
   * POST /api/research/:id/upload-pdf
   */
  async uploadPDF(research_id: string, file: File): Promise<Research> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<Research>(
        `/research/${research_id}/upload-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // REMOVED: uploadEditedByReviewer - Reviewers can no longer edit files to protect researcher identity

  /**
   * Update research file by admin (with tracking)
   * PATCH /api/research/:id/update-file
   */
  async updateResearchFile(
    research_id: string,
    file: File
  ): Promise<Research> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.patch<Research>(
        `/research/${research_id}/update-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Upload supplementary file to Cloudinary
   * POST /api/research/:id/upload-supplementary
   */
  async uploadSupplementaryFile(
    research_id: string,
    file: File,
    category: 'supplementary' | 'revision'
  ): Promise<ResearchFile> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await api.post<ResearchFile>(
        `/research/${research_id}/upload-supplementary`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get file download URL
   * GET /api/research/files/:file_id/download-url
   */
  async getFileDownloadUrl(file_id: string): Promise<string> {
    try {
      const response = await api.get<{ download_url: string }>(
        `/research/files/${file_id}/download-url`
      );
      return response.data.download_url;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get PDF thumbnail
   * GET /api/research/:id/pdf-thumbnail?page=1
   */
  async getPdfThumbnail(
    research_id: string,
    page: number = 1
  ): Promise<string> {
    try {
      const response = await api.get<{ thumbnail_url: string }>(
        `/research/${research_id}/pdf-thumbnail`,
        {
          params: { page },
        }
      );
      return response.data.thumbnail_url;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get research PDF download URL
   * GET /api/research/:id/pdf-download-url
   */
  async getResearchPdfDownloadUrl(research_id: string): Promise<string> {
    try {
      const response = await api.get<string>(
        `/research/${research_id}/pdf-download-url`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get research PDF view URL (for viewing in browser)
   * GET /api/research/:id/pdf-view-url
   */
  async getResearchPdfViewUrl(research_id: string): Promise<string> {
    try {
      const response = await api.get<string>(
        `/research/${research_id}/pdf-view-url`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // ============================================
  // Acceptance Certificate Methods
  // ============================================

  /**
   * Get acceptance certificate download URL
   * GET /api/research/:id/acceptance-certificate-url
   */
  async getAcceptanceCertificateUrl(research_id: string): Promise<string> {
    try {
      const response = await api.get<string>(
        `/research/${research_id}/acceptance-certificate-url`
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  /**
   * Generate acceptance certificate (admin/editor only)
   * POST /api/research/:id/generate-acceptance-certificate
   */
  async generateAcceptanceCertificate(research_id: string, customMessage?: string): Promise<Research> {
    try {
      const response = await api.post<Research>(
        `/research/${research_id}/generate-acceptance-certificate`,
        { customMessage }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Regenerate acceptance certificate (admin/editor only)
   * POST /api/research/:id/regenerate-acceptance-certificate
   */
  async regenerateAcceptanceCertificate(research_id: string, customMessage?: string): Promise<Research> {
    try {
      const response = await api.post<Research>(
        `/research/${research_id}/regenerate-acceptance-certificate`,
        { customMessage }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

// Export default for backward compatibility
export default researchService;
