export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[] | null;
  repository_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  source: 'manual' | 'github';
  github_repo_id: number | null;
  github_stars: number | null;
  github_language: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  technologies?: string[];
  repository_url?: string;
  demo_url?: string;
  image_url?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  technologies?: string[];
  repository_url?: string | null;
  demo_url?: string | null;
  image_url?: string | null;
}
