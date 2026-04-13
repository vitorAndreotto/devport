-- =============================================
-- Seed: Árvore de Skills — Dev Port
-- Versão: 2.0 — ~250 skills
-- Referência: PRD.md § 6.3
-- =============================================

TRUNCATE TABLE skill_tree CASCADE;

-- =============================================
-- LANGUAGES (30)
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
  ('a0000000-0000-0000-0000-000000000016', 'Sass/SCSS', 'sass-scss', 'language', 'a0000000-0000-0000-0000-000000000015'),
  ('a0000000-0000-0000-0000-000000000017', 'C', 'c', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000018', 'C++', 'cpp', 'language', 'a0000000-0000-0000-0000-000000000017'),
  ('a0000000-0000-0000-0000-000000000019', 'Elixir', 'elixir', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000020', 'Scala', 'scala', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000021', 'R', 'r', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000022', 'Lua', 'lua', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000023', 'Perl', 'perl', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000024', 'Shell/Bash', 'shell-bash', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000025', 'PowerShell', 'powershell', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000026', 'Objective-C', 'objective-c', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000027', 'Clojure', 'clojure', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000028', 'Haskell', 'haskell', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000029', 'Groovy', 'groovy', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000030', 'YAML', 'yaml', 'language', NULL);

-- =============================================
-- FRAMEWORKS (50)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- JS/TS
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
  ('b0000000-0000-0000-0000-000000000040', 'Spring Security', 'spring-security', 'framework', 'b0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000041', 'Spring Cloud', 'spring-cloud', 'framework', 'b0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000042', 'Quarkus', 'quarkus', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000043', 'Micronaut', 'micronaut', 'framework', NULL),
  -- PHP
  ('b0000000-0000-0000-0000-000000000014', 'Laravel', 'laravel', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000044', 'Symfony', 'symfony', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000045', 'CodeIgniter', 'codeigniter', 'framework', NULL),
  -- Ruby
  ('b0000000-0000-0000-0000-000000000015', 'Ruby on Rails', 'ruby-on-rails', 'framework', NULL),
  -- C#
  ('b0000000-0000-0000-0000-000000000016', '.NET', 'dotnet', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000046', 'Blazor', 'blazor', 'framework', 'b0000000-0000-0000-0000-000000000016'),
  -- Mobile
  ('b0000000-0000-0000-0000-000000000017', 'React Native', 'react-native', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000018', 'Flutter', 'flutter', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000047', 'Ionic', 'ionic', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000048', 'SwiftUI', 'swiftui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000049', 'Jetpack Compose', 'jetpack-compose', 'framework', NULL),
  -- CSS
  ('b0000000-0000-0000-0000-000000000019', 'Tailwind CSS', 'tailwind-css', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000020', 'Bootstrap', 'bootstrap', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000050', 'Material UI', 'material-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000051', 'Chakra UI', 'chakra-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000052', 'Ant Design', 'ant-design', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000053', 'Styled Components', 'styled-components', 'framework', NULL),
  -- Testing
  ('b0000000-0000-0000-0000-000000000054', 'Cypress', 'cypress', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000055', 'Playwright', 'playwright', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000056', 'Selenium', 'selenium', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000057', 'JUnit', 'junit', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000058', 'pytest', 'pytest', 'framework', NULL),
  -- Data
  ('b0000000-0000-0000-0000-000000000059', 'Pandas', 'pandas', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000060', 'NumPy', 'numpy', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000061', 'TensorFlow', 'tensorflow', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000062', 'PyTorch', 'pytorch', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000063', 'scikit-learn', 'scikit-learn', 'framework', NULL),
  -- Elixir
  ('b0000000-0000-0000-0000-000000000064', 'Phoenix', 'phoenix', 'framework', NULL),
  -- Go
  ('b0000000-0000-0000-0000-000000000065', 'Gin', 'gin', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000066', 'Fiber', 'fiber', 'framework', NULL),
  -- Other
  ('b0000000-0000-0000-0000-000000000067', 'Svelte', 'svelte', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000068', 'SvelteKit', 'sveltekit', 'framework', 'b0000000-0000-0000-0000-000000000067'),
  ('b0000000-0000-0000-0000-000000000069', 'Remix', 'remix', 'framework', NULL);

-- =============================================
-- DATABASES (20)
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
  ('c0000000-0000-0000-0000-000000000010', 'Firebase', 'firebase', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000011', 'Cassandra', 'cassandra', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000012', 'Neo4j', 'neo4j', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000013', 'CouchDB', 'couchdb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000014', 'MariaDB', 'mariadb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000015', 'Supabase', 'supabase', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000016', 'InfluxDB', 'influxdb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000017', 'PlanetScale', 'planetscale', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000018', 'Prisma', 'prisma', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000019', 'TypeORM', 'typeorm', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000020', 'Sequelize', 'sequelize', 'database', NULL);

-- =============================================
-- DEVOPS (30)
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
  ('d0000000-0000-0000-0000-000000000012', 'Linux', 'linux', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000013', 'Ansible', 'ansible', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000014', 'Prometheus', 'prometheus', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000015', 'Grafana', 'grafana', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000016', 'Datadog', 'datadog', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000017', 'New Relic', 'new-relic', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000018', 'ArgoCD', 'argocd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000019', 'Helm', 'helm', 'devops', 'd0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000020', 'Pulumi', 'pulumi', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000021', 'Vagrant', 'vagrant', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000022', 'Apache', 'apache', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000023', 'GitLab CI', 'gitlab-ci', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000024', 'CircleCI', 'circleci', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000025', 'AWS Lambda', 'aws-lambda', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000026', 'AWS ECS', 'aws-ecs', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000027', 'AWS S3', 'aws-s3', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000028', 'AWS RDS', 'aws-rds', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000029', 'CloudFormation', 'cloudformation', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000030', 'Vercel', 'vercel', 'devops', NULL);

-- =============================================
-- TOOLS (30)
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
  ('e0000000-0000-0000-0000-000000000012', 'Jest', 'jest', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000013', 'Bitbucket', 'bitbucket', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000014', 'IntelliJ IDEA', 'intellij-idea', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000015', 'Slack', 'slack', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000016', 'Confluence', 'confluence', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000017', 'Notion', 'notion', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000018', 'Trello', 'trello', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000019', 'Linear', 'linear', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000020', 'Insomnia', 'insomnia', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000021', 'Storybook', 'storybook', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000022', 'Turborepo', 'turborepo', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000023', 'pnpm', 'pnpm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000024', 'yarn', 'yarn', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000025', 'ESLint', 'eslint', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000026', 'Prettier', 'prettier', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000027', 'SonarQube', 'sonarqube', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000028', 'Sentry', 'sentry', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000029', 'Miro', 'miro', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000030', 'Adobe XD', 'adobe-xd', 'tool', NULL);

-- =============================================
-- METHODOLOGY (20)
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
  ('f0000000-0000-0000-0000-000000000010', 'SOLID', 'solid', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000011', 'BDD', 'bdd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000012', 'Event-Driven Architecture', 'event-driven-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000013', 'CQRS', 'cqrs', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000014', 'Event Sourcing', 'event-sourcing', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000015', 'Hexagonal Architecture', 'hexagonal-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000016', 'Serverless', 'serverless', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000017', 'SAFe', 'safe', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000018', 'Lean', 'lean', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000019', 'XP', 'extreme-programming', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000020', 'DevSecOps', 'devsecops', 'methodology', NULL);

-- =============================================
-- SOFT SKILLS (20)
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
  ('f1000000-0000-0000-0000-000000000010', 'Inglês técnico', 'ingles-tecnico', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000011', 'Negociação', 'negociacao', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000012', 'Empatia', 'empatia', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000013', 'Criatividade', 'criatividade', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000014', 'Gestão de conflitos', 'gestao-de-conflitos', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000015', 'Apresentação', 'apresentacao', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000016', 'Espanhol técnico', 'espanhol-tecnico', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000017', 'Feedback construtivo', 'feedback-construtivo', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000018', 'Tomada de decisão', 'tomada-de-decisao', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000019', 'Autonomia', 'autonomia', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000020', 'Ownership', 'ownership', 'soft_skill', NULL);

-- =============================================
-- OTHER (30)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  ('f2000000-0000-0000-0000-000000000001', 'Machine Learning', 'machine-learning', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000002', 'Data Science', 'data-science', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000003', 'Segurança da Informação', 'seguranca-da-informacao', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000004', 'UX/UI Design', 'ux-ui-design', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000005', 'SEO', 'seo', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000006', 'WebSockets', 'websockets', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000007', 'RabbitMQ', 'rabbitmq', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000008', 'Kafka', 'kafka', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000009', 'gRPC', 'grpc', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000010', 'OAuth/OpenID', 'oauth-openid', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000011', 'JWT', 'jwt', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000012', 'PWA', 'pwa', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000013', 'Web Accessibility', 'web-accessibility', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000014', 'i18n / l10n', 'i18n-l10n', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000015', 'Stripe/Payments', 'stripe-payments', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000016', 'Twilio/SMS', 'twilio-sms', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000017', 'SendGrid/Email', 'sendgrid-email', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000018', 'Elasticsearch (Search)', 'elasticsearch-search', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000019', 'OpenAI/LLM', 'openai-llm', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000020', 'Computer Vision', 'computer-vision', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000021', 'NLP', 'nlp', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000022', 'Blockchain', 'blockchain', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000023', 'Web3', 'web3', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000024', 'IoT', 'iot', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000025', 'ETL', 'etl', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000026', 'Apache Spark', 'apache-spark', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000027', 'Apache Airflow', 'apache-airflow', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000028', 'dbt', 'dbt', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000029', 'Figma Prototyping', 'figma-prototyping', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000030', 'Design System', 'design-system', 'other', NULL);

-- =============================================
-- Verificação
-- =============================================
-- SELECT category, COUNT(*) FROM skill_tree GROUP BY category ORDER BY category;
-- Total esperado: ~250 skills
