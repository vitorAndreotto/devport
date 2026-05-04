export interface SkillTree {
  id: string;
  name: string;
  slug: string;
  category: string;
  parentId: string | null;
  children: SkillTree[];
}

export interface DevSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  level: string;
  years_experience: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDevSkillPayload {
  skill_id: string;
  level: string;
  years_experience?: number;
}

export interface UpdateDevSkillPayload {
  skill_id?: string;
  level?: string;
  years_experience?: number;
}

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'expert', label: 'Especialista' },
];

export const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  expert: 'Especialista',
};

export const REQUIREMENT_LABELS: Record<string, string> = {
  required: 'Obrigatória',
  expected: 'Esperada',
  differential: 'Diferencial',
};

export const SKILL_CATEGORIES: Record<string, string> = {
  language: 'Linguagens',
  framework: 'Frameworks',
  database: 'Bancos de dados',
  devops: 'DevOps',
  tool: 'Ferramentas',
  methodology: 'Metodologias',
  soft_skill: 'Soft Skills',
  other: 'Outros',
};
