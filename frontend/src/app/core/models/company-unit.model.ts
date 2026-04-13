export interface CompanyUnit {
  id: string;
  name: string;
  city_id: number;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  complement: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyUnitPayload {
  name: string;
  city_id: number;
  zip_code: string;
  street: string;
  neighborhood: string;
  number: string;
  complement?: string;
}

export interface UpdateCompanyUnitPayload extends Partial<CreateCompanyUnitPayload> {}
