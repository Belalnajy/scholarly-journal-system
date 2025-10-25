import axiosInstance from './api';

export interface ReviewerAssignment {
  id: string;
  research_id: string;
  reviewer_id: string;
  assigned_by: string;
  assignment_notes?: string;
  deadline: string;
  status: 'assigned' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
  research?: {
    id: string;
    title: string;
    research_number: string;
    specialization: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
    specialization: string;
  };
}

export interface CreateReviewerAssignmentDto {
  research_id: string;
  reviewer_id: string;
  assigned_by: string;
  assignment_notes?: string;
  deadline: string;
  status?: 'assigned' | 'accepted' | 'declined' | 'completed';
}

export interface UpdateReviewerAssignmentDto {
  assignment_notes?: string;
  deadline?: string;
  status?: 'assigned' | 'accepted' | 'declined' | 'completed';
}

export interface ReviewerStats {
  total: number;
  assigned: number;
  accepted: number;
  completed: number;
}

class ReviewerAssignmentsService {
  private readonly baseUrl = '/reviewer-assignments';

  /**
   * Create a new reviewer assignment
   * إنشاء تعيين محكم جديد
   */
  async create(data: CreateReviewerAssignmentDto): Promise<ReviewerAssignment> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Get all reviewer assignments with optional filters
   * الحصول على جميع تعيينات المحكمين مع فلاتر اختيارية
   */
  async getAll(filters?: {
    research_id?: string;
    reviewer_id?: string;
    status?: string;
  }): Promise<ReviewerAssignment[]> {
    const response = await axiosInstance.get(this.baseUrl, { params: filters });
    return response.data;
  }

  /**
   * Get reviewer assignments for a specific research
   * الحصول على تعيينات المحكمين لبحث معين
   */
  async getByResearch(research_id: string): Promise<ReviewerAssignment[]> {
    return this.getAll({ research_id });
  }

  /**
   * Get reviewer assignments for a specific reviewer
   * الحصول على تعيينات محكم معين
   */
  async getByReviewer(reviewer_id: string): Promise<ReviewerAssignment[]> {
    return this.getAll({ reviewer_id });
  }

  /**
   * Get reviewer statistics
   * الحصول على إحصائيات المحكم
   */
  async getReviewerStats(reviewer_id: string): Promise<ReviewerStats> {
    const response = await axiosInstance.get(`${this.baseUrl}/stats/${reviewer_id}`);
    return response.data;
  }

  /**
   * Get a single reviewer assignment by ID
   * الحصول على تعيين محكم واحد
   */
  async getOne(id: string): Promise<ReviewerAssignment> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update a reviewer assignment
   * تحديث تعيين محكم
   */
  async update(id: string, data: UpdateReviewerAssignmentDto): Promise<ReviewerAssignment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Update reviewer assignment status
   * تحديث حالة تعيين المحكم
   */
  async updateStatus(
    id: string,
    status: 'assigned' | 'accepted' | 'declined' | 'completed'
  ): Promise<ReviewerAssignment> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }

  /**
   * Delete a reviewer assignment
   * حذف تعيين محكم
   */
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const reviewerAssignmentsService = new ReviewerAssignmentsService();
export default reviewerAssignmentsService;
