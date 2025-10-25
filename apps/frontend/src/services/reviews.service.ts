import axiosInstance from './api';

export interface Review {
  id: string;
  research_id: string;
  reviewer_id: string;
  criteria_ratings: Record<string, number>;
  general_comments: string;
  recommendation: 'accepted' | 'needs-revision' | 'rejected';
  average_rating?: number;
  status: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  research?: {
    id: string;
    title: string;
    research_number: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateReviewDto {
  research_id: string;
  reviewer_id: string;
  criteria_ratings: Record<string, number>;
  general_comments: string;
  recommendation: 'accepted' | 'needs-revision' | 'rejected';
  average_rating?: number;
  status?: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
}

export interface UpdateReviewDto {
  criteria_ratings?: Record<string, number>;
  general_comments?: string;
  recommendation?: 'accepted' | 'needs-revision' | 'rejected';
  average_rating?: number;
  status?: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
}

export interface ResearchReviewsStats {
  total: number;
  completed: number;
  pending: number;
  average_rating: number;
}

class ReviewsService {
  private readonly baseUrl = '/reviews';

  /**
   * Create a new review
   * إنشاء مراجعة جديدة
   */
  async create(data: CreateReviewDto): Promise<Review> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Get all reviews with optional filters
   * الحصول على جميع المراجعات مع فلاتر اختيارية
   */
  async getAll(filters?: {
    research_id?: string;
    reviewer_id?: string;
    status?: string;
  }): Promise<Review[]> {
    const response = await axiosInstance.get(this.baseUrl, { params: filters });
    return response.data;
  }

  /**
   * Get reviews for a specific research
   * الحصول على مراجعات بحث معين
   */
  async getByResearch(research_id: string): Promise<Review[]> {
    return this.getAll({ research_id });
  }

  /**
   * Get reviews by a specific reviewer
   * الحصول على مراجعات محكم معين
   */
  async getByReviewer(reviewer_id: string): Promise<Review[]> {
    return this.getAll({ reviewer_id });
  }

  /**
   * Get research reviews statistics
   * الحصول على إحصائيات مراجعات البحث
   */
  async getResearchStats(research_id: string): Promise<ResearchReviewsStats> {
    const response = await axiosInstance.get(`${this.baseUrl}/stats/${research_id}`);
    return response.data;
  }

  /**
   * Get a single review by ID
   * الحصول على مراجعة واحدة
   */
  async getOne(id: string): Promise<Review> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Update a review
   * تحديث مراجعة
   */
  async update(id: string, data: UpdateReviewDto): Promise<Review> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Update review status
   * تحديث حالة المراجعة
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ): Promise<Review> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }

  /**
   * Delete a review
   * حذف مراجعة
   */
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
