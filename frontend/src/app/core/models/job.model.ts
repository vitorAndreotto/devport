export interface JobSkill {
  skill: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  min_level: string;
  requirement: string;
}

/** Response leve da listagem */
export interface JobListItem {
  id: string;
  title: string;
  seniority: string;
  contract_model: string;
  work_mode: string;
  required_skills: string[];
  city_name: string | null;
  state_abbr: string | null;
  status: string;
  company?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
  match_score?: number | null;
  created_at: string;
}

/** Response completa do detalhe */
export interface JobDetail {
  id: string;
  title: string;
  description: string;
  seniority: string;
  skills: JobSkill[];
  min_experience_years: number;
  contract_model: string;
  salary_min?: number;
  salary_max?: number;
  benefits: string[] | null;
  work_mode: string;
  location: {
    city: string;
    state: string | null;
    zip_code: string | null;
    street: string | null;
    neighborhood: string | null;
    number: string | null;
    complement: string | null;
  } | null;
  status: string;
  company?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
  application_count: number;
  match_score?: number | null;
  match_detail?: {
    skills: number;
    experience: number;
    modality: number;
    salary: number;
  };
  created_at: string;
}

/** Full Job for company CRUD (owner view) */
export interface Job {
  id: string;
  title: string;
  description: string;
  seniority: string;
  skills: JobSkill[];
  min_experience_years: number;
  contract_model: string;
  salary_min: number;
  salary_max: number;
  show_salary: boolean;
  benefits: string[] | null;
  work_mode: string;
  company_unit_id: string | null;
  city_id: number | null;
  zip_code: string | null;
  street: string | null;
  neighborhood: string | null;
  number: string | null;
  complement: string | null;
  status: string;
  company?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface JobSkillPayload {
  skill_id: string;
  min_level: string;
  requirement?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  seniority: string;
  skills: JobSkillPayload[];
  min_experience_years: number;
  contract_model: string;
  salary_min: number;
  salary_max: number;
  show_salary?: boolean;
  benefits?: string[];
  work_mode: string;
  company_unit_id?: string;
  city_id?: number;
  zip_code?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {}
