export interface Education {
  id: string;
  institution: string;
  course: string;
  type: string;
  workload_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  is_ongoing: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEducationPayload {
  institution: string;
  course: string;
  type: string;
  workload_hours?: number;
  start_date?: string;
  end_date?: string;
  is_ongoing?: boolean;
}

export interface UpdateEducationPayload {
  institution?: string;
  course?: string;
  type?: string;
  workload_hours?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_ongoing?: boolean;
}

export const EDUCATION_TYPES = [
  { value: 'graduation', label: 'Graduação' },
  { value: 'master', label: 'Mestrado' },
  { value: 'doctorate', label: 'Doutorado' },
  { value: 'postdoc', label: 'Pós-Doutorado' },
  { value: 'mba', label: 'MBA' },
  { value: 'technical', label: 'Técnico' },
  { value: 'course', label: 'Curso' },
  { value: 'certification', label: 'Certificação' },
];
