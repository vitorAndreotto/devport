-- =============================================
-- Seed: Árvore de Skills — Dev Port
-- Versão: 3.0 — ~500 skills mapeadas
-- Referência: PRD.md § 6.3
-- =============================================

TRUNCATE TABLE skill_tree CASCADE;

-- =============================================
-- LANGUAGES (50)
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
  ('a0000000-0000-0000-0000-000000000030', 'YAML', 'yaml', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000031', 'F#', 'fsharp', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000032', 'Erlang', 'erlang', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000033', 'OCaml', 'ocaml', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000034', 'Julia', 'julia', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000035', 'MATLAB', 'matlab', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000036', 'Solidity', 'solidity', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000037', 'Crystal', 'crystal', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000038', 'Nim', 'nim', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000039', 'Zig', 'zig', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000040', 'Visual Basic', 'visual-basic', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000041', 'COBOL', 'cobol', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000042', 'Fortran', 'fortran', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000043', 'Pascal', 'pascal', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000044', 'Assembly', 'assembly', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000045', 'GraphQL Schema', 'graphql-schema', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000046', 'Markdown', 'markdown', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000047', 'JSON', 'json', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000048', 'XML', 'xml', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000049', 'TOML', 'toml', 'language', NULL),
  ('a0000000-0000-0000-0000-000000000050', 'ABAP', 'abap', 'language', NULL);

-- =============================================
-- FRAMEWORKS (160)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- Frontend Web
  ('b0000000-0000-0000-0000-000000000001', 'Angular', 'angular', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Angular Material', 'angular-material', 'framework', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'React', 'react', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000004', 'Next.js', 'nextjs', 'framework', 'b0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000005', 'Vue.js', 'vuejs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000006', 'Nuxt.js', 'nuxtjs', 'framework', 'b0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000067', 'Svelte', 'svelte', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000068', 'SvelteKit', 'sveltekit', 'framework', 'b0000000-0000-0000-0000-000000000067'),
  ('b0000000-0000-0000-0000-000000000069', 'Remix', 'remix', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000070', 'Solid.js', 'solidjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000071', 'Qwik', 'qwik', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000072', 'Astro', 'astro', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000073', 'Gatsby', 'gatsby', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000074', 'Ember.js', 'emberjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000075', 'Alpine.js', 'alpinejs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000076', 'Lit', 'lit', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000077', 'jQuery', 'jquery', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000078', 'Preact', 'preact', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000079', 'Stencil', 'stencil', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000080', 'Hugo', 'hugo', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000081', 'Jekyll', 'jekyll', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000082', 'Eleventy', 'eleventy', 'framework', NULL),

  -- Mobile
  ('b0000000-0000-0000-0000-000000000017', 'React Native', 'react-native', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000018', 'Flutter', 'flutter', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000047', 'Ionic', 'ionic', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000048', 'SwiftUI', 'swiftui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000049', 'Jetpack Compose', 'jetpack-compose', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000083', 'Expo', 'expo', 'framework', 'b0000000-0000-0000-0000-000000000017'),
  ('b0000000-0000-0000-0000-000000000084', 'Capacitor', 'capacitor', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000085', 'Cordova', 'cordova', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000086', 'Xamarin', 'xamarin', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000087', 'NativeScript', 'nativescript', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000088', 'Kotlin Multiplatform', 'kotlin-multiplatform', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000089', '.NET MAUI', 'dotnet-maui', 'framework', NULL),

  -- Backend Node.js
  ('b0000000-0000-0000-0000-000000000007', 'NestJS', 'nestjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000008', 'Express.js', 'expressjs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000009', 'Fastify', 'fastify', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000090', 'Koa', 'koa', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000091', 'Hapi', 'hapi', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000092', 'AdonisJS', 'adonisjs', 'framework', NULL),

  -- Backend Python
  ('b0000000-0000-0000-0000-000000000010', 'Django', 'django', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000011', 'Flask', 'flask', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000012', 'FastAPI', 'fastapi', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000093', 'Pyramid', 'pyramid', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000094', 'Tornado', 'tornado', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000095', 'Starlette', 'starlette', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000096', 'Sanic', 'sanic', 'framework', NULL),

  -- Backend Java
  ('b0000000-0000-0000-0000-000000000013', 'Spring Boot', 'spring-boot', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000040', 'Spring Security', 'spring-security', 'framework', 'b0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000041', 'Spring Cloud', 'spring-cloud', 'framework', 'b0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000042', 'Quarkus', 'quarkus', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000043', 'Micronaut', 'micronaut', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000097', 'Spring Data', 'spring-data', 'framework', 'b0000000-0000-0000-0000-000000000013'),
  ('b0000000-0000-0000-0000-000000000098', 'Vert.x', 'vertx', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000099', 'Hibernate', 'hibernate', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000100', 'Jakarta EE', 'jakarta-ee', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000101', 'Play Framework', 'play-framework', 'framework', NULL),

  -- Backend PHP
  ('b0000000-0000-0000-0000-000000000014', 'Laravel', 'laravel', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000044', 'Symfony', 'symfony', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000045', 'CodeIgniter', 'codeigniter', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000102', 'Yii', 'yii', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000103', 'CakePHP', 'cakephp', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000104', 'Slim', 'slim', 'framework', NULL),

  -- Backend Ruby
  ('b0000000-0000-0000-0000-000000000015', 'Ruby on Rails', 'ruby-on-rails', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000105', 'Sinatra', 'sinatra', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000106', 'Hanami', 'hanami', 'framework', NULL),

  -- Backend C#/.NET
  ('b0000000-0000-0000-0000-000000000016', '.NET', 'dotnet', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000046', 'Blazor', 'blazor', 'framework', 'b0000000-0000-0000-0000-000000000016'),
  ('b0000000-0000-0000-0000-000000000107', 'ASP.NET Core', 'aspnet-core', 'framework', 'b0000000-0000-0000-0000-000000000016'),
  ('b0000000-0000-0000-0000-000000000108', 'Entity Framework', 'entity-framework', 'framework', 'b0000000-0000-0000-0000-000000000016'),
  ('b0000000-0000-0000-0000-000000000109', 'WPF', 'wpf', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000110', 'WinForms', 'winforms', 'framework', NULL),

  -- Backend Go
  ('b0000000-0000-0000-0000-000000000065', 'Gin', 'gin', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000066', 'Fiber', 'fiber', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000111', 'Echo', 'echo-go', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000112', 'Beego', 'beego', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000113', 'Chi', 'chi-go', 'framework', NULL),

  -- Backend Rust
  ('b0000000-0000-0000-0000-000000000114', 'Actix', 'actix', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000115', 'Rocket', 'rocket-rs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000116', 'Axum', 'axum', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000117', 'Tokio', 'tokio', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000118', 'Warp', 'warp-rs', 'framework', NULL),

  -- Elixir
  ('b0000000-0000-0000-0000-000000000064', 'Phoenix', 'phoenix', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000119', 'Phoenix LiveView', 'phoenix-liveview', 'framework', 'b0000000-0000-0000-0000-000000000064'),

  -- CSS / UI
  ('b0000000-0000-0000-0000-000000000019', 'Tailwind CSS', 'tailwind-css', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000020', 'Bootstrap', 'bootstrap', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000050', 'Material UI', 'material-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000051', 'Chakra UI', 'chakra-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000052', 'Ant Design', 'ant-design', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000053', 'Styled Components', 'styled-components', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000120', 'shadcn/ui', 'shadcn-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000121', 'PrimeNG', 'primeng', 'framework', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000122', 'Radix UI', 'radix-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000123', 'Headless UI', 'headless-ui', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000124', 'Bulma', 'bulma', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000125', 'Foundation', 'foundation', 'framework', NULL),

  -- Testing
  ('b0000000-0000-0000-0000-000000000054', 'Cypress', 'cypress', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000055', 'Playwright', 'playwright', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000056', 'Selenium', 'selenium', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000057', 'JUnit', 'junit', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000058', 'pytest', 'pytest', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000126', 'Vitest', 'vitest', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000127', 'Mocha', 'mocha', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000128', 'Jasmine', 'jasmine', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000129', 'TestNG', 'testng', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000130', 'Mockito', 'mockito', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000131', 'RSpec', 'rspec', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000132', 'Cucumber', 'cucumber', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000133', 'Puppeteer', 'puppeteer', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000134', 'JMeter', 'jmeter', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000135', 'k6', 'k6', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000136', 'Gatling', 'gatling', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000137', 'Locust', 'locust', 'framework', NULL),

  -- Data / ML
  ('b0000000-0000-0000-0000-000000000059', 'Pandas', 'pandas', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000060', 'NumPy', 'numpy', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000061', 'TensorFlow', 'tensorflow', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000062', 'PyTorch', 'pytorch', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000063', 'scikit-learn', 'scikit-learn', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000138', 'Keras', 'keras', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000139', 'SciPy', 'scipy', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000140', 'Matplotlib', 'matplotlib', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000141', 'Seaborn', 'seaborn', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000142', 'Plotly', 'plotly', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000143', 'Hugging Face', 'hugging-face', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000144', 'LangChain', 'langchain', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000145', 'LlamaIndex', 'llamaindex', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000146', 'OpenCV', 'opencv', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000147', 'JAX', 'jax', 'framework', NULL),

  -- State Management
  ('b0000000-0000-0000-0000-000000000148', 'Redux', 'redux', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000149', 'MobX', 'mobx', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000150', 'Zustand', 'zustand', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000151', 'Jotai', 'jotai', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000152', 'NgRx', 'ngrx', 'framework', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000153', 'Pinia', 'pinia', 'framework', 'b0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000154', 'Vuex', 'vuex', 'framework', 'b0000000-0000-0000-0000-000000000005'),
  ('b0000000-0000-0000-0000-000000000155', 'RxJS', 'rxjs', 'framework', NULL),

  -- Game / 3D
  ('b0000000-0000-0000-0000-000000000156', 'Unity', 'unity', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000157', 'Unreal Engine', 'unreal-engine', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000158', 'Godot', 'godot', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000159', 'Three.js', 'threejs', 'framework', NULL),
  ('b0000000-0000-0000-0000-000000000160', 'D3.js', 'd3js', 'framework', NULL);

-- =============================================
-- DATABASES (40)
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
  ('c0000000-0000-0000-0000-000000000020', 'Sequelize', 'sequelize', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000021', 'Memcached', 'memcached', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000022', 'ScyllaDB', 'scylladb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000023', 'Couchbase', 'couchbase', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000024', 'Firestore', 'firestore', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000025', 'OpenSearch', 'opensearch', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000026', 'Algolia', 'algolia', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000027', 'Solr', 'solr', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000028', 'ArangoDB', 'arangodb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000029', 'TimescaleDB', 'timescaledb', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000030', 'ClickHouse', 'clickhouse', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000031', 'BigQuery', 'bigquery', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000032', 'Snowflake', 'snowflake', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000033', 'Redshift', 'redshift', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000034', 'Athena', 'athena', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000035', 'Trino/Presto', 'trino-presto', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000036', 'IBM Db2', 'ibm-db2', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000037', 'Sybase', 'sybase', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000038', 'JanusGraph', 'janusgraph', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000039', 'Druid', 'druid', 'database', NULL),
  ('c0000000-0000-0000-0000-000000000040', 'Cosmos DB', 'cosmos-db', 'database', NULL);

-- =============================================
-- DEVOPS (90)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- Containers / Orquestracao
  ('d0000000-0000-0000-0000-000000000001', 'Docker', 'docker', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000002', 'Docker Compose', 'docker-compose', 'devops', 'd0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'Kubernetes', 'kubernetes', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000019', 'Helm', 'helm', 'devops', 'd0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000031', 'Podman', 'podman', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000032', 'Containerd', 'containerd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000033', 'Kustomize', 'kustomize', 'devops', 'd0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000034', 'OpenShift', 'openshift', 'devops', 'd0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000035', 'Rancher', 'rancher', 'devops', 'd0000000-0000-0000-0000-000000000003'),

  -- Cloud — AWS
  ('d0000000-0000-0000-0000-000000000004', 'AWS', 'aws', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000025', 'AWS Lambda', 'aws-lambda', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000026', 'AWS ECS', 'aws-ecs', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000027', 'AWS S3', 'aws-s3', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000028', 'AWS RDS', 'aws-rds', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000029', 'CloudFormation', 'cloudformation', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000036', 'AWS EKS', 'aws-eks', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000037', 'AWS EC2', 'aws-ec2', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000038', 'AWS CloudWatch', 'aws-cloudwatch', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000039', 'AWS IAM', 'aws-iam', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000040', 'AWS API Gateway', 'aws-api-gateway', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000041', 'AWS SQS', 'aws-sqs', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000042', 'AWS SNS', 'aws-sns', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000043', 'AWS DynamoDB', 'aws-dynamodb', 'devops', 'd0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000044', 'AWS CloudFront', 'aws-cloudfront', 'devops', 'd0000000-0000-0000-0000-000000000004'),

  -- Cloud — Azure
  ('d0000000-0000-0000-0000-000000000005', 'Azure', 'azure', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000045', 'Azure AKS', 'azure-aks', 'devops', 'd0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000046', 'Azure Functions', 'azure-functions', 'devops', 'd0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000047', 'Azure DevOps', 'azure-devops', 'devops', 'd0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000048', 'Azure App Service', 'azure-app-service', 'devops', 'd0000000-0000-0000-0000-000000000005'),
  ('d0000000-0000-0000-0000-000000000049', 'Azure AD', 'azure-ad', 'devops', 'd0000000-0000-0000-0000-000000000005'),

  -- Cloud — GCP
  ('d0000000-0000-0000-0000-000000000006', 'GCP', 'gcp', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000050', 'GCP GKE', 'gcp-gke', 'devops', 'd0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000051', 'Cloud Run', 'cloud-run', 'devops', 'd0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000052', 'Cloud Functions', 'cloud-functions', 'devops', 'd0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000053', 'Cloud Storage', 'cloud-storage', 'devops', 'd0000000-0000-0000-0000-000000000006'),
  ('d0000000-0000-0000-0000-000000000054', 'Pub/Sub', 'pub-sub', 'devops', 'd0000000-0000-0000-0000-000000000006'),

  -- CI / CD
  ('d0000000-0000-0000-0000-000000000007', 'CI/CD', 'ci-cd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000008', 'GitHub Actions', 'github-actions', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000009', 'Jenkins', 'jenkins', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000023', 'GitLab CI', 'gitlab-ci', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000024', 'CircleCI', 'circleci', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000055', 'Travis CI', 'travis-ci', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000056', 'Bitbucket Pipelines', 'bitbucket-pipelines', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000057', 'TeamCity', 'teamcity', 'devops', 'd0000000-0000-0000-0000-000000000007'),
  ('d0000000-0000-0000-0000-000000000058', 'Drone CI', 'drone-ci', 'devops', 'd0000000-0000-0000-0000-000000000007'),

  -- IaC
  ('d0000000-0000-0000-0000-000000000010', 'Terraform', 'terraform', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000013', 'Ansible', 'ansible', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000020', 'Pulumi', 'pulumi', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000059', 'Chef', 'chef', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000060', 'Puppet', 'puppet', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000061', 'SaltStack', 'saltstack', 'devops', NULL),

  -- GitOps
  ('d0000000-0000-0000-0000-000000000018', 'ArgoCD', 'argocd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000062', 'Flux CD', 'flux-cd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000063', 'Argo Workflows', 'argo-workflows', 'devops', NULL),

  -- Monitoring / Observability
  ('d0000000-0000-0000-0000-000000000014', 'Prometheus', 'prometheus', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000015', 'Grafana', 'grafana', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000016', 'Datadog', 'datadog', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000017', 'New Relic', 'new-relic', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000064', 'Splunk', 'splunk', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000065', 'ELK Stack', 'elk-stack', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000066', 'Loki', 'loki', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000067', 'Jaeger', 'jaeger', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000068', 'OpenTelemetry', 'opentelemetry', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000069', 'Honeycomb', 'honeycomb', 'devops', NULL),

  -- Servers / Proxies
  ('d0000000-0000-0000-0000-000000000011', 'Nginx', 'nginx', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000022', 'Apache', 'apache', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000070', 'HAProxy', 'haproxy', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000071', 'Traefik', 'traefik', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000072', 'Istio', 'istio', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000073', 'Linkerd', 'linkerd', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000074', 'Consul', 'consul', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000075', 'Vault', 'vault', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000076', 'etcd', 'etcd', 'devops', NULL),

  -- Messaging
  ('d0000000-0000-0000-0000-000000000077', 'RabbitMQ', 'rabbitmq-devops', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000078', 'Apache Kafka', 'apache-kafka', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000079', 'NATS', 'nats', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000080', 'Apache Pulsar', 'apache-pulsar', 'devops', NULL),

  -- OS / Misc
  ('d0000000-0000-0000-0000-000000000012', 'Linux', 'linux', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000021', 'Vagrant', 'vagrant', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000030', 'Vercel', 'vercel', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000081', 'Netlify', 'netlify', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000082', 'Cloudflare', 'cloudflare', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000083', 'Heroku', 'heroku', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000084', 'DigitalOcean', 'digitalocean', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000085', 'Render', 'render', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000086', 'Fly.io', 'fly-io', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000087', 'Packer', 'packer', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000088', 'Caddy', 'caddy', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000089', 'Sentry (Ops)', 'sentry-ops', 'devops', NULL),
  ('d0000000-0000-0000-0000-000000000090', 'Pingdom', 'pingdom', 'devops', NULL);

-- =============================================
-- TOOLS (80)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- VCS
  ('e0000000-0000-0000-0000-000000000001', 'Git', 'git', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000002', 'GitHub', 'github', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'GitLab', 'gitlab', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000013', 'Bitbucket', 'bitbucket', 'tool', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000031', 'Mercurial', 'mercurial', 'tool', NULL),

  -- Editors
  ('e0000000-0000-0000-0000-000000000004', 'VS Code', 'vs-code', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000014', 'IntelliJ IDEA', 'intellij-idea', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000032', 'WebStorm', 'webstorm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000033', 'PyCharm', 'pycharm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000034', 'GoLand', 'goland', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000035', 'PhpStorm', 'phpstorm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000036', 'RubyMine', 'rubymine', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000037', 'Android Studio', 'android-studio', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000038', 'Xcode', 'xcode', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000039', 'Vim', 'vim', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000040', 'Neovim', 'neovim', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000041', 'Emacs', 'emacs', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000042', 'Sublime Text', 'sublime-text', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000043', 'Cursor', 'cursor', 'tool', NULL),

  -- API
  ('e0000000-0000-0000-0000-000000000005', 'Postman', 'postman', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000020', 'Insomnia', 'insomnia', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000008', 'Swagger/OpenAPI', 'swagger-openapi', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000044', 'Thunder Client', 'thunder-client', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000045', 'Bruno', 'bruno', 'tool', NULL),

  -- Design
  ('e0000000-0000-0000-0000-000000000006', 'Figma', 'figma', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000030', 'Adobe XD', 'adobe-xd', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000046', 'Sketch', 'sketch', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000047', 'InVision', 'invision', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000048', 'Zeplin', 'zeplin', 'tool', NULL),

  -- Project Management
  ('e0000000-0000-0000-0000-000000000007', 'Jira', 'jira', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000016', 'Confluence', 'confluence', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000017', 'Notion', 'notion', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000018', 'Trello', 'trello', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000019', 'Linear', 'linear', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000049', 'Asana', 'asana', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000050', 'Monday', 'monday', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000051', 'ClickUp', 'clickup', 'tool', NULL),

  -- Communication
  ('e0000000-0000-0000-0000-000000000015', 'Slack', 'slack', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000052', 'Microsoft Teams', 'microsoft-teams', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000053', 'Discord', 'discord', 'tool', NULL),

  -- Build / Bundlers
  ('e0000000-0000-0000-0000-000000000010', 'Webpack', 'webpack', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000011', 'Vite', 'vite', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000054', 'esbuild', 'esbuild', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000055', 'Rollup', 'rollup', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000056', 'Parcel', 'parcel', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000057', 'Babel', 'babel', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000058', 'SWC', 'swc', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000059', 'Turbopack', 'turbopack', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000060', 'Gulp', 'gulp', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000061', 'Gradle', 'gradle', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000062', 'Maven', 'maven', 'tool', NULL),

  -- Package Managers
  ('e0000000-0000-0000-0000-000000000009', 'npm', 'npm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000023', 'pnpm', 'pnpm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000024', 'yarn', 'yarn', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000063', 'pip', 'pip', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000064', 'Poetry', 'poetry', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000065', 'Conda', 'conda', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000066', 'Cargo', 'cargo', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000067', 'Composer', 'composer', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000068', 'Bundler', 'bundler', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000069', 'NuGet', 'nuget', 'tool', NULL),

  -- Quality
  ('e0000000-0000-0000-0000-000000000012', 'Jest', 'jest', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000025', 'ESLint', 'eslint', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000026', 'Prettier', 'prettier', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000027', 'SonarQube', 'sonarqube', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000028', 'Sentry', 'sentry', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000021', 'Storybook', 'storybook', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000022', 'Turborepo', 'turborepo', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000070', 'Nx', 'nx', 'tool', NULL),

  -- CLI
  ('e0000000-0000-0000-0000-000000000071', 'jq', 'jq', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000072', 'yq', 'yq', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000073', 'curl', 'curl', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000074', 'tmux', 'tmux', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000075', 'ngrok', 'ngrok', 'tool', NULL),

  -- Misc
  ('e0000000-0000-0000-0000-000000000029', 'Miro', 'miro', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000076', 'Lucidchart', 'lucidchart', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000077', 'Mermaid', 'mermaid', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000078', 'PlantUML', 'plantuml', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000079', 'DataDog (APM)', 'datadog-apm', 'tool', NULL),
  ('e0000000-0000-0000-0000-000000000080', 'Charles Proxy', 'charles-proxy', 'tool', NULL);

-- =============================================
-- METHODOLOGY (50)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- Agile
  ('f0000000-0000-0000-0000-000000000001', 'Scrum', 'scrum', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000002', 'Kanban', 'kanban', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000017', 'SAFe', 'safe', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000018', 'Lean', 'lean', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000019', 'XP', 'extreme-programming', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000021', 'LeSS', 'less', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000022', 'Disciplined Agile', 'disciplined-agile', 'methodology', NULL),

  -- Test
  ('f0000000-0000-0000-0000-000000000003', 'TDD', 'tdd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000011', 'BDD', 'bdd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000023', 'ATDD', 'atdd', 'methodology', NULL),

  -- Architecture
  ('f0000000-0000-0000-0000-000000000004', 'Clean Architecture', 'clean-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000008', 'Microservices', 'microservices', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000009', 'DDD', 'ddd', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000012', 'Event-Driven Architecture', 'event-driven-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000013', 'CQRS', 'cqrs', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000014', 'Event Sourcing', 'event-sourcing', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000015', 'Hexagonal Architecture', 'hexagonal-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000016', 'Serverless', 'serverless', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000024', 'Onion Architecture', 'onion-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000025', 'Monolithic Architecture', 'monolithic-architecture', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000026', '12-Factor App', '12-factor-app', 'methodology', NULL),

  -- API / Communication
  ('f0000000-0000-0000-0000-000000000006', 'REST API', 'rest-api', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000007', 'GraphQL', 'graphql', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000027', 'gRPC API', 'grpc-api', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000028', 'WebSockets API', 'websockets-api', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000029', 'API First Design', 'api-first-design', 'methodology', NULL),

  -- Design Patterns / SOLID
  ('f0000000-0000-0000-0000-000000000005', 'Design Patterns', 'design-patterns', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000010', 'SOLID', 'solid', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000030', 'DRY/KISS/YAGNI', 'dry-kiss-yagni', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000031', 'GRASP', 'grasp', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000032', 'MVC', 'mvc', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000033', 'MVVM', 'mvvm', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000034', 'MVP Pattern', 'mvp-pattern', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000035', 'Repository Pattern', 'repository-pattern', 'methodology', NULL),

  -- Practices
  ('f0000000-0000-0000-0000-000000000020', 'DevSecOps', 'devsecops', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000036', 'GitOps', 'gitops', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000037', 'ChatOps', 'chatops', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000038', 'FinOps', 'finops', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000039', 'Code Review', 'code-review', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000040', 'Pair Programming', 'pair-programming', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000041', 'Mob Programming', 'mob-programming', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000042', 'Refactoring', 'refactoring', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000043', 'Trunk-Based Development', 'trunk-based-development', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000044', 'GitFlow', 'gitflow', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000045', 'Continuous Integration', 'continuous-integration', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000046', 'Continuous Deployment', 'continuous-deployment', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000047', 'Feature Flags', 'feature-flags', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000048', 'Blue-Green Deploy', 'blue-green-deploy', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000049', 'Canary Deploy', 'canary-deploy', 'methodology', NULL),
  ('f0000000-0000-0000-0000-000000000050', 'A/B Testing', 'ab-testing', 'methodology', NULL);

-- =============================================
-- SOFT SKILLS (40)
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
  ('f1000000-0000-0000-0000-000000000020', 'Ownership', 'ownership', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000021', 'Storytelling', 'storytelling', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000022', 'Public Speaking', 'public-speaking', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000023', 'Stakeholder Management', 'stakeholder-management', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000024', 'Pensamento estratégico', 'pensamento-estrategico', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000025', 'Inteligência emocional', 'inteligencia-emocional', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000026', 'Escuta ativa', 'escuta-ativa', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000027', 'Colaboração remota', 'colaboracao-remota', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000028', 'Self-management', 'self-management', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000029', 'Comunicação intercultural', 'comunicacao-intercultural', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000030', 'Customer empathy', 'customer-empathy', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000031', 'Product thinking', 'product-thinking', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000032', 'Business acumen', 'business-acumen', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000033', 'Data-driven decisions', 'data-driven-decisions', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000034', 'Escrita técnica', 'escrita-tecnica', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000035', 'Francês', 'frances', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000036', 'Alemão', 'alemao', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000037', 'Mandarim', 'mandarim', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000038', 'Italiano', 'italiano', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000039', 'Foco em resultado', 'foco-em-resultado', 'soft_skill', NULL),
  ('f1000000-0000-0000-0000-000000000040', 'Curiosidade técnica', 'curiosidade-tecnica', 'soft_skill', NULL);

-- =============================================
-- OTHER (50)
-- =============================================
INSERT INTO skill_tree (id, name, slug, category, parent_id) VALUES
  -- Data
  ('f2000000-0000-0000-0000-000000000001', 'Machine Learning', 'machine-learning', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000002', 'Data Science', 'data-science', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000019', 'OpenAI/LLM', 'openai-llm', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000020', 'Computer Vision', 'computer-vision', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000021', 'NLP', 'nlp', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000025', 'ETL', 'etl', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000026', 'Apache Spark', 'apache-spark', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000027', 'Apache Airflow', 'apache-airflow', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000028', 'dbt', 'dbt', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000031', 'MLflow', 'mlflow', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000032', 'Kubeflow', 'kubeflow', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000033', 'Hadoop', 'hadoop', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000034', 'Power BI', 'power-bi', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000035', 'Tableau', 'tableau', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000036', 'Looker', 'looker', 'other', NULL),

  -- Security / Auth
  ('f2000000-0000-0000-0000-000000000003', 'Segurança da Informação', 'seguranca-da-informacao', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000010', 'OAuth/OpenID', 'oauth-openid', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000011', 'JWT', 'jwt', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000037', 'Penetration Testing', 'penetration-testing', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000038', 'OWASP Top 10', 'owasp-top-10', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000039', 'SAML', 'saml', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000040', 'Cryptography', 'cryptography', 'other', NULL),

  -- Web
  ('f2000000-0000-0000-0000-000000000004', 'UX/UI Design', 'ux-ui-design', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000005', 'SEO', 'seo', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000006', 'WebSockets', 'websockets', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000009', 'gRPC', 'grpc', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000012', 'PWA', 'pwa', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000013', 'Web Accessibility', 'web-accessibility', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000014', 'i18n / l10n', 'i18n-l10n', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000015', 'Stripe/Payments', 'stripe-payments', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000016', 'Twilio/SMS', 'twilio-sms', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000017', 'SendGrid/Email', 'sendgrid-email', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000018', 'Elasticsearch (Search)', 'elasticsearch-search', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000029', 'Figma Prototyping', 'figma-prototyping', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000030', 'Design System', 'design-system', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000041', 'Web Performance', 'web-performance', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000042', 'Web Vitals', 'web-vitals', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000043', 'A/B Testing (Tools)', 'ab-testing-tools', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000044', 'Google Analytics', 'google-analytics', 'other', NULL),

  -- Web3 / Other
  ('f2000000-0000-0000-0000-000000000007', 'RabbitMQ', 'rabbitmq', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000008', 'Kafka', 'kafka', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000022', 'Blockchain', 'blockchain', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000023', 'Web3', 'web3', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000024', 'IoT', 'iot', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000045', 'Smart Contracts', 'smart-contracts', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000046', 'AR/VR', 'ar-vr', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000047', 'Game Design', 'game-design', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000048', 'WordPress', 'wordpress', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000049', 'Shopify', 'shopify', 'other', NULL),
  ('f2000000-0000-0000-0000-000000000050', 'Salesforce', 'salesforce', 'other', NULL);

-- =============================================
-- Verificação
-- =============================================
-- SELECT category, COUNT(*) FROM skill_tree GROUP BY category ORDER BY category;
-- Total esperado: ~500 skills (50 lang + 160 fw + 40 db + 90 devops + 80 tool + 50 method + 40 soft + 50 other)
