import api from './api';
import {
  TeamSection,
  TeamMember,
  CreateTeamSectionDto,
  UpdateTeamSectionDto,
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from '../types/team.types';

const teamService = {
  // ============================================
  // TEAM SECTIONS
  // ============================================

  /**
   * Get all team sections (public - only active)
   */
  async getAllSections(): Promise<TeamSection[]> {
    const response = await api.get<TeamSection[]>('/team-sections');
    return response.data;
  },

  /**
   * Get all sections for admin (including inactive)
   */
  async getAllSectionsAdmin(): Promise<TeamSection[]> {
    const response = await api.get<TeamSection[]>('/team-sections/admin/all');
    return response.data;
  },

  /**
   * Get a single section by ID
   */
  async getSectionById(id: string): Promise<TeamSection> {
    const response = await api.get<TeamSection>(`/team-sections/${id}`);
    return response.data;
  },

  /**
   * Create a new section (Admin only)
   */
  async createSection(data: CreateTeamSectionDto): Promise<TeamSection> {
    const response = await api.post<TeamSection>('/team-sections', data);
    return response.data;
  },

  /**
   * Update a section (Admin only)
   */
  async updateSection(id: string, data: UpdateTeamSectionDto): Promise<TeamSection> {
    const response = await api.patch<TeamSection>(`/team-sections/${id}`, data);
    return response.data;
  },

  /**
   * Delete a section (Admin only)
   */
  async deleteSection(id: string): Promise<void> {
    await api.delete(`/team-sections/${id}`);
  },

  /**
   * Reorder sections (Admin only)
   */
  async reorderSections(sectionIds: string[]): Promise<void> {
    await api.patch('/team-sections/reorder/sections', { sectionIds });
  },

  // ============================================
  // TEAM MEMBERS
  // ============================================

  /**
   * Get all team members (optionally filter by section)
   */
  async getAllMembers(sectionId?: string): Promise<TeamMember[]> {
    const params = sectionId ? { sectionId } : {};
    const response = await api.get<TeamMember[]>('/team-members', { params });
    return response.data;
  },

  /**
   * Get a single member by ID
   */
  async getMemberById(id: string): Promise<TeamMember> {
    const response = await api.get<TeamMember>(`/team-members/${id}`);
    return response.data;
  },

  /**
   * Create a new member (Admin only)
   */
  async createMember(data: CreateTeamMemberDto): Promise<TeamMember> {
    const response = await api.post<TeamMember>('/team-members', data);
    return response.data;
  },

  /**
   * Update a member (Admin only)
   */
  async updateMember(id: string, data: UpdateTeamMemberDto): Promise<TeamMember> {
    const response = await api.patch<TeamMember>(`/team-members/${id}`, data);
    return response.data;
  },

  /**
   * Delete a member (Admin only)
   */
  async deleteMember(id: string): Promise<void> {
    await api.delete(`/team-members/${id}`);
  },

  /**
   * Reorder members (Admin only)
   */
  async reorderMembers(memberIds: string[]): Promise<void> {
    await api.patch('/team-members/reorder/members', { memberIds });
  },

  /**
   * Upload member image (Admin only)
   */
  async uploadMemberImage(id: string, file: File): Promise<TeamMember> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<TeamMember>(
      `/team-members/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default teamService;
