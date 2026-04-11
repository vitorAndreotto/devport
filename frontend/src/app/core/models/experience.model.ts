export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateExperiencePayload {
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
}

export interface UpdateExperiencePayload {
  company?: string;
  position?: string;
  description?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
}
