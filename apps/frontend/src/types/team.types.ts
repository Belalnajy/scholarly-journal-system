export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  description?: string;
  university?: string;
  country?: string;
  email?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  section_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  display_order: number;
  is_active: boolean;
  is_collapsible: boolean;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface CreateTeamSectionDto {
  title: string;
  icon: string;
  description: string;
  color: string;
  display_order?: number;
  is_active?: boolean;
  is_collapsible?: boolean;
}

export interface UpdateTeamSectionDto {
  title?: string;
  icon?: string;
  description?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  is_collapsible?: boolean;
}

export interface CreateTeamMemberDto {
  name: string;
  title: string;
  role: string;
  description?: string;
  university?: string;
  country?: string;
  email?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  section_id: string;
}

export interface UpdateTeamMemberDto {
  name?: string;
  title?: string;
  role?: string;
  description?: string;
  university?: string;
  country?: string;
  email?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  section_id?: string;
}
