// ============================================
// Enums
// ============================================

export enum UserRole {
  RESEARCHER = 'researcher',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  ADMIN = 'admin',
}

export enum AcademicDegree {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  PHD = 'phd',
  ASSISTANT_PROFESSOR = 'assistant-professor',
  ASSOCIATE_PROFESSOR = 'associate-professor',
  PROFESSOR = 'professor',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * DTO for creating a new user
 * Matches backend CreateUserDto
 */
export interface CreateUserDto {
  // Required fields
  email: string;
  password: string;
  name: string;

  // Optional basic fields
  phone?: string;
  role?: UserRole;

  // Profile info
  avatar_url?: string;
  affiliation?: string;
  department?: string;
  specialization?: string;
  academic_degree?: AcademicDegree;

  // Academic IDs
  orcid_id?: string;
  google_scholar_id?: string;
  research_gate_id?: string;

  // Additional info
  research_interests?: string;
  expertise_areas?: string;
  languages_spoken?: string;
  years_of_experience?: number;
  number_of_publications?: number;
  bio?: string;
}

/**
 * DTO for updating an existing user
 * All fields are optional
 */
export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;

  // Profile info
  avatar_url?: string;
  affiliation?: string;
  department?: string;
  specialization?: string;
  academic_degree?: AcademicDegree;

  // Academic IDs
  orcid_id?: string;
  google_scholar_id?: string;
  research_gate_id?: string;

  // Additional info
  research_interests?: string;
  expertise_areas?: string;
  languages_spoken?: string;
  years_of_experience?: number;
  number_of_publications?: number;
  bio?: string;
}

// ============================================
// Response Types
// ============================================

/**
 * Full user object returned from backend
 * Does NOT include password
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;

  // Profile info
  avatar_url: string | null;
  avatar_cloudinary_public_id: string | null;
  avatar_cloudinary_secure_url: string | null;
  affiliation: string | null;
  department: string | null;
  specialization: string | null;
  academic_degree: AcademicDegree | null;

  // Academic IDs
  orcid_id: string | null;
  google_scholar_id: string | null;
  research_gate_id: string | null;

  // Additional info
  research_interests: string | null;
  expertise_areas: string | null;
  languages_spoken: string | null;
  years_of_experience: number;
  number_of_publications: number;
  bio: string | null;

  // Status & timestamps
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

/**
 * User statistics
 */
export interface UserStats {
  total: number;
  researchers: number;
  reviewers: number;
  editors: number;
  admins: number;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

/**
 * @deprecated Use UserResponse instead
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ============================================
// UI Types
// ============================================

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}
