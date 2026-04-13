export interface DevProfile {
  id: string;
  user_id: string;
  handle: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  email_contact: string;
  city_id: number | null;
  zip_code: string | null;
  street: string | null;
  neighborhood: string | null;
  number: string | null;
  complement: string | null;
  work_modes: string[] | null;
  employment_status: string | null;
  salary_min: number | null;
  salary_max: number | null;
  github_username: string | null;
  links: { label: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDevProfilePayload {
  handle: string;
  full_name: string;
  title: string;
  bio: string;
  email_contact: string;
  avatar_url?: string;
  city_id?: number;
  zip_code?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  work_modes?: string[];
  employment_status?: string;
  salary_min?: number;
  salary_max?: number;
  github_username?: string;
  links?: { label: string; url: string }[];
}

export interface UpdateDevProfilePayload extends Partial<CreateDevProfilePayload> {}

export interface HandleCheckResponse {
  data: { available: boolean };
}
