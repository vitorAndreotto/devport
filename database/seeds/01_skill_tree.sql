-- =============================================
-- Seed: Árvore de Skills — Dev Port
-- Versão: 1.0
-- Referência: PRD.md § 6.3
-- =============================================

-- Limpa tabela antes de inserir (idempotente)
TRUNCATE TABLE skill_tree CASCADE;

-- =============================================
-- LANGUAGES
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'JavaScript', 'javascript', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000002', 'TypeScript', 'typescript', 'language', 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', 'Python', 'python', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000004', 'Java', 'java', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000005', 'C#', 'csharp', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000006', 'PHP', 'php', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000007', 'Go', 'go', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000008', 'Rust', 'rust', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000009', 'Ruby', 'ruby', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000010', 'Swift', 'swift', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000011', 'Kotlin', 'kotlin', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000012', 'Dart', 'dart', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000013', 'SQL', 'sql', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000014', 'HTML', 'html', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000015', 'CSS', 'css', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000016', 'Sass/SCSS', 'sass-scss', 'language', 'a0000000-0000-0000-0000-000000000015');

-- =============================================
-- FRAMEWORKS
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- JavaScript / TypeScript
  ('b0000000-0000-0000-0000-000000000001', 'Angular', 'angular', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Angular Material', 'angular-material', 'framework', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'React', 'react', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'Next.js', 'nextjs', 'framework', 'b0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000005', 'Vue.js', 'vuejs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000006', 'Nuxt.js', 'nuxtjs', 'framework', 'b0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000007', 'NestJS', 'nestjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000008', 'Express.js', 'expressjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000009', 'Fastify', 'fastify', 'framework', NULL),
  -- Python
  ('b0000000-0000-0000-0000-000000000010', 'Django', 'django', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000011', 'Flask', 'flask', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000012', 'FastAPI', 'fastapi', 'framework', NULL),
  -- Java
  ('b0000000-0000-0000-0000-000000000013', 'Spring Boot', 'spring-boot', 'framework', NULL),
  -- PHP
  ('b0000000-0000-0000-0000-000000000014', 'Laravel', 'laravel', 'framework', NULL),
  -- Ruby
  ('b0000000-0000-0000-0000-000000000015', 'Ruby on Rails', 'ruby-on-rails', 'framework', NULL),
  -- C#
  ('b0000000-0000-0000-0000-000000000016', '.NET', 'dotnet', 'framework', NULL),
  -- Mobile
  ('b0000000-0000-0000-0000-000000000017', 'React Native', 'react-native', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000018', 'Flutter', 'flutter', 'framework', NULL),
  -- CSS
  ('b0000000-0000-0000-0000-000000000019', 'Tailwind CSS', 'tailwind-css', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000020', 'Bootstrap', 'bootstrap', 'framework', NULL);

-- =============================================
-- DATABASES
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'PostgreSQL', 'postgresql', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000002', 'MySQL', 'mysql', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000003', 'MongoDB', 'mongodb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000004', 'Redis', 'redis', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000005', 'SQLite', 'sqlite', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000006', 'SQL Server', 'sql-server', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000007', 'Oracle', 'oracle', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000008', 'DynamoDB', 'dynamodb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000009', 'Elasticsearch', 'elasticsearch', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000010', 'Firebase', 'firebase', 'database', NULL);

-- =============================================
-- DEVOPS
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Docker', 'docker', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000002', 'Docker Compose', 'docker-compose', 'devops', 'd0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'Kubernetes', 'kubernetes', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000004', 'AWS', 'aws', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000005', 'Azure', 'azure', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000006', 'GCP', 'gcp', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000007', 'CI/CD', 'ci-cd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000008', 'GitHub Actions', 'github-actions', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000009', 'Jenkins', 'jenkins', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000010', 'Terraform', 'terraform', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000011', 'Nginx', 'nginx', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000012', 'Linux', 'linux', 'devops', NULL);

-- =============================================
-- TOOLS
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Git', 'git', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000002', 'GitHub', 'github', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'GitLab', 'gitlab', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'VS Code', 'vs-code', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000005', 'Postman', 'postman', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000006', 'Figma', 'figma', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000007', 'Jira', 'jira', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000008', 'Swagger/OpenAPI', 'swagger-openapi', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000009', 'npm', 'npm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000010', 'Webpack', 'webpack', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000011', 'Vite', 'vite', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000012', 'Jest', 'jest', 'tool', NULL);

-- =============================================
-- METHODOLOGY
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Scrum', 'scrum', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000002', 'Kanban', 'kanban', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000003', 'TDD', 'tdd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000004', 'Clean Architecture', 'clean-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000005', 'Design Patterns', 'design-patterns', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000006', 'REST API', 'rest-api', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000007', 'GraphQL', 'graphql', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000008', 'Microservices', 'microservices', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000009', 'DDD', 'ddd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000010', 'SOLID', 'solid', 'methodology', NULL);

-- =============================================
-- SOFT SKILLS
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Comunicação', 'comunicacao', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000002', 'Trabalho em equipe', 'trabalho-em-equipe', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000003', 'Liderança', 'lideranca', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000004', 'Resolução de problemas', 'resolucao-de-problemas', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000005', 'Pensamento crítico', 'pensamento-critico', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000006', 'Gestão de tempo', 'gestao-de-tempo', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000007', 'Adaptabilidade', 'adaptabilidade', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000008', 'Proatividade', 'proatividade', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000009', 'Mentoria', 'mentoria', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000010', 'Inglês técnico', 'ingles-tecnico', 'soft_skill', NULL);

-- =============================================
-- OTHER
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('f2000000-0000-0000-0000-000000000001', 'Machine Learning', 'machine-learning', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000002', 'Data Science', 'data-science', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000003', 'Segurança da Informação', 'seguranca-da-informacao', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000004', 'UX/UI Design', 'ux-ui-design', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000005', 'SEO', 'seo', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000006', 'WebSockets', 'websockets', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000007', 'RabbitMQ', 'rabbitmq', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000008', 'Kafka', 'kafka', 'other', NULL);

-- =============================================
-- Verificação
-- =============================================
-- SELECT category, COUNT(*) FROM skill_tree GROUP BY category ORDER BY category;
-- Total esperado: ~100 skills
