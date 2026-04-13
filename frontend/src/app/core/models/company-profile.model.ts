export interface CompanyProfile {
  id: string;
  user_id: string;
  handle: string;
  company_name: string;
  cnpj: string;
  description: string;
  logo_url: string | null;
  website: string | null;
  industry: string;
  size: string;
  city_id: number | null;
  zip_code: string | null;
  street: string | null;
  neighborhood: string | null;
  number: string | null;
  complement: string | null;
  links: { label: string; url: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyProfilePayload {
  handle: string;
  company_name: string;
  cnpj: string;
  description: string;
  industry: string;
  size: string;
  logo_url?: string;
  website?: string;
  city_id?: number;
  zip_code?: string;
  street?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  links?: { label: string; url: string }[];
}

export interface UpdateCompanyProfilePayload extends Partial<CreateCompanyProfilePayload> {}
