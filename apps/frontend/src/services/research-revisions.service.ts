import api from './api';
import axios from 'axios';

// ============================================
// Types
// ============================================

export type RevisionStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface ResearchRevision {
  id: string;
  research_id: string;
  revision_number: number;
  revision_notes: string;
  file_url: string | null;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  file_type?: string;
  original_data?: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
    cloudinary_public_id?: string;
    cloudinary_secure_url?: string;
    file_type?: string;
  };
  status: RevisionStatus;
  deadline: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface CreateRevisionDto {
  research_id: string;
  revision_notes: string;
  original_data?: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
  };
  deadline?: string;
}

export interface SubmitRevisionDto {
  file_url: string;
}

export interface UpdateRevisionDto {
  revision_notes?: string;
  file_url?: string;
  status?: RevisionStatus;
  submitted_at?: string;
}

// ============================================
// Helper Functions
// ============================================

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
// Research Revisions Service
// ============================================

export const researchRevisionsService = {
  /**
   * Create a new revision request
   */
  async create(data: CreateRevisionDto): Promise<ResearchRevision> {
    try {
      const response = await api.post<ResearchRevision>('/research-revisions', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get all revisions with optional filters
   */
  async getAll(filters?: {
    research_id?: string;
    status?: RevisionStatus;
  }): Promise<ResearchRevision[]> {
    try {
      const response = await api.get<ResearchRevision[]>('/research-revisions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get revision by ID
   */
  async getById(id: string): Promise<ResearchRevision> {
    try {
      const response = await api.get<ResearchRevision>(`/research-revisions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get revisions by research ID
   */
  async getByResearch(research_id: string): Promise<ResearchRevision[]> {
    return this.getAll({ research_id });
  },

  /**
   * Get latest pending revision for a research
   */
  async getLatestPendingRevision(research_id: string): Promise<ResearchRevision | null> {
    try {
      const revisions = await this.getAll({ 
        research_id, 
        status: 'pending' 
      });
      return revisions.length > 0 ? revisions[0] : null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update revision
   */
  async update(id: string, data: UpdateRevisionDto): Promise<ResearchRevision> {
    try {
      const response = await api.put<ResearchRevision>(`/research-revisions/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Submit a revision with file
   */
  async submit(id: string, file_url: string): Promise<ResearchRevision> {
    try {
      const response = await api.put<ResearchRevision>(
        `/research-revisions/${id}/submit`,
        { file_url }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Approve a revision
   */
  async approve(id: string): Promise<ResearchRevision> {
    try {
      const response = await api.put<ResearchRevision>(`/research-revisions/${id}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Reject a revision
   */
  async reject(id: string): Promise<ResearchRevision> {
    try {
      const response = await api.put<ResearchRevision>(`/research-revisions/${id}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete a revision
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/research-revisions/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // ============================================
  // Cloudinary Upload Methods
  // ============================================

  /**
   * Upload revision file to Cloudinary
   * POST /api/research-revisions/:id/upload-file
   */
  async uploadFile(revision_id: string, file: File): Promise<ResearchRevision> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<ResearchRevision>(
        `/research-revisions/${revision_id}/upload-file`,
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
   * Get revision file download URL
   * GET /api/research-revisions/:id/download-url
   */
  async getDownloadUrl(revision_id: string): Promise<string> {
    try {
      const response = await api.get<{ download_url: string }>(
        `/research-revisions/${revision_id}/download-url`
      );
      return response.data.download_url;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default researchRevisionsService;
