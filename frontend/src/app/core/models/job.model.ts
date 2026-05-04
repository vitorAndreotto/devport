export interface JobSkill {
  skill: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  min_level: string;
  requirement: string;
  /** Set quando o user logado for dev — nivel atual do dev nessa skill (null se nao tem) */
  dev_level?: string | null;
  /** Set quando o user logado for dev — true se nivel do dev atende o min exigido */
  dev_meets_min?: boolean;
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
  salary_clt_min?: number;
  salary_clt_max?: number;
  salary_pj_min?: number;
  salary_pj_max?: number;
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
  salary_clt_min: number | null;
  salary_clt_max: number | null;
  salary_pj_min: number | null;
  salary_pj_max: number | null;
  show_salary: boolean;
  max_radius_km: number | null;
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
  salary_clt_min?: number;
  salary_clt_max?: number;
  salary_pj_min?: number;
  salary_pj_max?: number;
  show_salary?: boolean;
  max_radius_km?: number;
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
