-- =============================================
-- Seed: 5.000 Empresas + 8 vagas cada = 40.000 vagas
-- Skills, salários e experiência consistentes por senioridade
-- 30 cidades para vagas presenciais/híbridas
-- UUIDs: 20000000-0000-0000-TTTT-NNNNNNNNNNNN
-- =============================================

DO $$
DECLARE
  pw_hash TEXT := '$2b$10$q.MSk2tX.BfoaIo2PT5utePYn7hHRYhNAE.JnfkS3nBxsi0YHngb6';
  i INT;
  j INT;
  k INT;
  user_uuid UUID;
  profile_uuid UUID;
  job_uuid UUID;
  company_name TEXT;
  company_handle TEXT;
  company_cnpj TEXT;
  job_title TEXT;
  job_desc TEXT;
  job_seniority TEXT;
  job_contract TEXT;
  job_work_mode TEXT;
  job_salary_min DECIMAL;
  job_salary_max DECIMAL;
  job_min_exp INT;
  job_city INT;
  job_zip TEXT;
  job_street TEXT;
  job_neighborhood TEXT;
  job_number TEXT;
  cur_benefits TEXT;
  num_skills INT;
  sk_id TEXT;
  sk_level TEXT;
  sk_req TEXT;
  sk_pool TEXT[];
  sk_pool_size INT;

  -- 50 prefixes + 20 suffixes = 1000 unique names, repeat with number
  prefixes TEXT[] := ARRAY[
    'Tech','Dev','Cloud','Data','Code','Net','Sys','App','Web','Pixel',
    'Smart','Blue','Green','Fast','Open','Next','Nova','Core','Flow','Link',
    'Hub','Lab','Base','Stack','Edge','Prime','Digi','Byte','Logic','Mind',
    'Alpha','Beta','Gamma','Delta','Omega','Apex','Zen','Arc','Pulse','Vortex',
    'Neo','Hyper','Turbo','Spark','Flux','Ion','Quantum','Atlas','Titan','Forge'
  ];
  suffixes TEXT[] := ARRAY[
    'Corp','Solutions','Systems','Labs','Digital','Tech','Software','Group','Works','IO',
    'Dev','Cloud','AI','Analytics','Dynamics','Platforms','Services','Studio','Hub','Network'
  ];

  industries TEXT[] := ARRAY[
    'Tecnologia da Informação','Fintech','E-commerce','Saúde Digital','Educação',
    'Logística','Agritech','Energia','Telecomunicações','Consultoria',
    'Mídia','Segurança','Varejo','RH Tech','Proptech','Legaltech','Insurtech','Gaming','SaaS','Marketplace'
  ];

  sizes TEXT[] := ARRAY['startup','small','medium','large','enterprise'];
  contracts TEXT[] := ARRAY['clt','pj','clt_pj'];
  work_modes TEXT[] := ARRAY['remote','hybrid','onsite'];

  -- 30 cities for job locations
  job_cities INT[] := ARRAY[
    3550308,3304557,5300108,2927408,4106902,2611606,1302603,2304400,4314902,3106200,
    1501402,5002704,5103403,3518800,3509502,4205407,3548500,2704302,3170206,4209102,
    3543402,3547809,5208707,3303500,4113700,2507507,3205309,3552205,4305108,3136702
  ];

  streets TEXT[] := ARRAY[
    'Av. Paulista','Rua Augusta','Av. Faria Lima','Rua Oscar Freire','Av. Brasil',
    'Rua das Flores','Av. Atlântica','Rua XV de Novembro','Av. Beira Mar','Rua da Consolação',
    'Av. Rio Branco','Rua Sete de Setembro','Av. Afonso Pena','Rua do Comércio','Av. Santos Dumont',
    'Rua da Liberdade','Av. Getúlio Vargas','Rua Dom Pedro II','Av. Presidente Vargas','Rua Marechal Deodoro',
    'Av. Independência','Rua da República','Av. Boa Viagem','Rua das Palmeiras','Av. Central',
    'Rua São Paulo','Av. Amazonas','Rua Curitiba','Av. Goiás','Rua Bahia'
  ];
  neighborhoods TEXT[] := ARRAY[
    'Centro','Jardins','Pinheiros','Bela Vista','Boa Viagem',
    'Savassi','Batel','Moinhos de Vento','Aldeota','Pituba',
    'Funcionários','Água Verde','Leblon','Asa Sul','Juvevê',
    'Bigorrilho','Centro Histórico','Lourdes','Santa Efigênia','Graça',
    'Copacabana','Botafogo','Ipanema','Vila Mariana','Moema',
    'Consolação','Liberdade','Perdizes','Santana','Tatuapé'
  ];
  zip_codes TEXT[] := ARRAY[
    '01310-100','01305-000','04538-132','01426-001','20040-020',
    '30130-000','80240-210','90050-170','60110-040','41830-000',
    '30180-010','80250-060','22430-010','70070-120','82520-000',
    '80530-010','90030-001','30130-070','01033-000','40150-120',
    '22041-080','22250-040','22410-003','04023-000','04535-000',
    '01302-000','01501-000','05005-000','02012-000','03310-000'
  ];
  numbers TEXT[] := ARRAY[
    '100','250','500','1000','1500','75','320','800','45','1200',
    '180','600','920','350','2100','88','430','710','55','1650',
    '200','400','650','850','1100','150','300','550','750','950'
  ];

  benefits_raw TEXT[] := ARRAY[
    'VR|VA|Plano de saúde|PLR',
    'VR|Plano de saúde|Plano odonto|Gympass|Home office',
    'VA|Plano de saúde|Stock options|Budget educação',
    'VR|VA|Plano de saúde|Plano odonto|PLR|13º antecipado',
    'VR|Plano de saúde|Day off aniversário|Home office',
    'VR|VA|Gympass|Plano odonto|Budget educação|Horário flexível',
    'Plano de saúde|Plano odonto|VR|VA|PLR|Stock options|Home office',
    'VR|Plano de saúde|Auxílio creche|Home office'
  ];

  -- =============================================
  -- 8 job templates per company (title, seniority, min_exp, description)
  -- Cycled by (company_idx % 10) for variety
  -- =============================================

  -- 40 job titles (5 templates x 8 jobs)
  all_titles TEXT[] := ARRAY[
    -- Template 0: Web/Fullstack
    'Desenvolvedor Frontend','Desenvolvedor Backend','Desenvolvedor Fullstack','DevOps Engineer','QA Engineer','Tech Lead','UX Designer','Analista de Dados',
    -- Template 1: Data/Cloud
    'Engenheiro de Dados','Desenvolvedor Python','SRE Engineer','Analista de BI','Arquiteto Cloud','Data Scientist','DBA','Desenvolvedor Go',
    -- Template 2: Mobile/Product
    'Desenvolvedor Mobile','Dev React Native','Designer UX/UI','Desenvolvedor Backend','Product Manager','QA Mobile','Desenvolvedor Flutter','Analista de Produto',
    -- Template 3: Java/Enterprise
    'Desenvolvedor Java','Desenvolvedor .NET','DBA Oracle/PostgreSQL','Analista de Sistemas','Scrum Master','Desenvolvedor PL/SQL','Arquiteto Java','Tech Lead Java',
    -- Template 4: PHP/Modern
    'Desenvolvedor Laravel','Desenvolvedor Vue.js','DevOps Junior','QA Automation','Desenvolvedor WordPress','API Developer','Desenvolvedor Node.js','Frontend React'
  ];

  all_descs TEXT[] := ARRAY[
    'Desenvolvimento de interfaces modernas e responsivas com frameworks atuais.',
    'Desenvolvimento de APIs RESTful robustas e escaláveis com boas práticas.',
    'Atuação full stack em projetos de alta complexidade e impacto.',
    'Manutenção de infraestrutura cloud, pipelines CI/CD e monitoramento.',
    'Criação e manutenção de testes automatizados e garantia de qualidade.',
    'Liderança técnica do time de engenharia e definição de arquitetura.',
    'Criação de interfaces intuitivas e acessíveis com foco em usabilidade.',
    'Análise de dados, dashboards e relatórios para tomada de decisão.',
    'Construção de pipelines de dados, ETL e modelagem dimensional.',
    'Desenvolvimento de microserviços em Python com FastAPI/Django.',
    'Garantia de disponibilidade e performance dos sistemas em produção.',
    'Criação de dashboards analíticos e modelagem de dados.',
    'Definição de arquitetura cloud-native e migração de sistemas.',
    'Modelagem e treinamento de modelos de Machine Learning.',
    'Administração de bancos de dados, tuning de queries e backup/recovery.',
    'Desenvolvimento de sistemas e automação com Go.',
    'Desenvolvimento de aplicativos mobile nativos e cross-platform.',
    'Desenvolvimento de features mobile com React Native.',
    'Criação de protótipos, pesquisa com usuários e design systems.',
    'Desenvolvimento de APIs para suporte mobile e web.',
    'Definição de roadmap de produto junto ao time de engenharia.',
    'Testes automatizados de apps mobile e integração contínua.',
    'Desenvolvimento cross-platform com Flutter e Dart.',
    'Análise de requisitos e priorização de backlog de produto.',
    'Desenvolvimento de sistemas corporativos com Java/Spring Boot.',
    'Desenvolvimento com .NET Core e C# para sistemas enterprise.',
    'Administração de Oracle e PostgreSQL, otimização e recovery.',
    'Levantamento de requisitos e modelagem de processos.',
    'Facilitação de cerimônias ágeis e métricas de produtividade.',
    'Desenvolvimento PL/SQL para procedures e integrações.',
    'Definição de arquitetura de sistemas Java de larga escala.',
    'Liderança técnica de times Java com mentoria e code review.',
    'Desenvolvimento web com Laravel e PHP moderno.',
    'Desenvolvimento de interfaces SPA com Vue.js.',
    'Setup e manutenção de ambientes Docker e CI/CD.',
    'Automação de testes end-to-end e regressão.',
    'Desenvolvimento e manutenção de sites WordPress customizados.',
    'Desenvolvimento de APIs RESTful com documentação OpenAPI.',
    'Desenvolvimento backend com Node.js e TypeScript.',
    'Desenvolvimento frontend com React e TypeScript.'
  ];

  -- 15 Skill pools (each 15 skills) — rotated per company for high variety
  tmpl_skills TEXT[] := ARRAY[
    -- 0: Web/Fullstack (React stack)
    'a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000003|b0000000-0000-0000-0000-000000000004|b0000000-0000-0000-0000-000000000007|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000004|b0000000-0000-0000-0000-000000000019|a0000000-0000-0000-0000-000000000014|c0000000-0000-0000-0000-000000000018|e0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000006|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000025|f2000000-0000-0000-0000-000000000011|b0000000-0000-0000-0000-000000000050',
    -- 1: Data/Cloud (Python + AWS)
    'a0000000-0000-0000-0000-000000000003|c0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000004|d0000000-0000-0000-0000-000000000010|f2000000-0000-0000-0000-000000000001|f2000000-0000-0000-0000-000000000008|b0000000-0000-0000-0000-000000000059|b0000000-0000-0000-0000-000000000060|c0000000-0000-0000-0000-000000000009|f2000000-0000-0000-0000-000000000025|f2000000-0000-0000-0000-000000000027|a0000000-0000-0000-0000-000000000013|d0000000-0000-0000-0000-000000000025|c0000000-0000-0000-0000-000000000003|a0000000-0000-0000-0000-000000000024',
    -- 2: Mobile (React Native + Flutter)
    'b0000000-0000-0000-0000-000000000017|a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000018|a0000000-0000-0000-0000-000000000012|c0000000-0000-0000-0000-000000000010|a0000000-0000-0000-0000-000000000010|b0000000-0000-0000-0000-000000000049|e0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000006|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000028|f2000000-0000-0000-0000-000000000004|a0000000-0000-0000-0000-000000000011|b0000000-0000-0000-0000-000000000048|e0000000-0000-0000-0000-000000000021',
    -- 3: Java/Enterprise
    'a0000000-0000-0000-0000-000000000004|b0000000-0000-0000-0000-000000000013|b0000000-0000-0000-0000-000000000040|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000007|a0000000-0000-0000-0000-000000000013|f0000000-0000-0000-0000-000000000005|f0000000-0000-0000-0000-000000000008|f0000000-0000-0000-0000-000000000009|b0000000-0000-0000-0000-000000000057|d0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000009|f0000000-0000-0000-0000-000000000010|e0000000-0000-0000-0000-000000000027|b0000000-0000-0000-0000-000000000041',
    -- 4: PHP/Laravel
    'a0000000-0000-0000-0000-000000000006|b0000000-0000-0000-0000-000000000014|c0000000-0000-0000-0000-000000000002|c0000000-0000-0000-0000-000000000004|a0000000-0000-0000-0000-000000000001|b0000000-0000-0000-0000-000000000005|b0000000-0000-0000-0000-000000000019|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000003|d0000000-0000-0000-0000-000000000012|c0000000-0000-0000-0000-000000000014|f0000000-0000-0000-0000-000000000006|e0000000-0000-0000-0000-000000000025|b0000000-0000-0000-0000-000000000006',
    -- 5: DevOps/SRE
    'd0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000003|d0000000-0000-0000-0000-000000000004|d0000000-0000-0000-0000-000000000010|d0000000-0000-0000-0000-000000000012|d0000000-0000-0000-0000-000000000014|d0000000-0000-0000-0000-000000000015|d0000000-0000-0000-0000-000000000018|d0000000-0000-0000-0000-000000000019|a0000000-0000-0000-0000-000000000024|a0000000-0000-0000-0000-000000000007|d0000000-0000-0000-0000-000000000011|d0000000-0000-0000-0000-000000000008|f0000000-0000-0000-0000-000000000020|c0000000-0000-0000-0000-000000000001',
    -- 6: Angular stack
    'a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000001|b0000000-0000-0000-0000-000000000002|a0000000-0000-0000-0000-000000000014|a0000000-0000-0000-0000-000000000016|b0000000-0000-0000-0000-000000000007|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000019|e0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000006|e0000000-0000-0000-0000-000000000011|e0000000-0000-0000-0000-000000000021|d0000000-0000-0000-0000-000000000001|f0000000-0000-0000-0000-000000000010|f2000000-0000-0000-0000-000000000013',
    -- 7: Python ML/AI
    'a0000000-0000-0000-0000-000000000003|b0000000-0000-0000-0000-000000000061|b0000000-0000-0000-0000-000000000062|b0000000-0000-0000-0000-000000000063|b0000000-0000-0000-0000-000000000059|b0000000-0000-0000-0000-000000000060|f2000000-0000-0000-0000-000000000001|f2000000-0000-0000-0000-000000000002|f2000000-0000-0000-0000-000000000021|f2000000-0000-0000-0000-000000000020|c0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000004|d0000000-0000-0000-0000-000000000001|a0000000-0000-0000-0000-000000000013|f2000000-0000-0000-0000-000000000019',
    -- 8: .NET/C#
    'a0000000-0000-0000-0000-000000000005|b0000000-0000-0000-0000-000000000016|b0000000-0000-0000-0000-000000000046|c0000000-0000-0000-0000-000000000006|c0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000005|a0000000-0000-0000-0000-000000000013|f0000000-0000-0000-0000-000000000005|f0000000-0000-0000-0000-000000000008|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000001|f0000000-0000-0000-0000-000000000010|d0000000-0000-0000-0000-000000000009|e0000000-0000-0000-0000-000000000027|f0000000-0000-0000-0000-000000000006',
    -- 9: Go/Rust systems
    'a0000000-0000-0000-0000-000000000007|a0000000-0000-0000-0000-000000000008|d0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000003|d0000000-0000-0000-0000-000000000012|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000004|f0000000-0000-0000-0000-000000000008|f2000000-0000-0000-0000-000000000009|f2000000-0000-0000-0000-000000000007|d0000000-0000-0000-0000-000000000010|d0000000-0000-0000-0000-000000000004|b0000000-0000-0000-0000-000000000065|a0000000-0000-0000-0000-000000000024|e0000000-0000-0000-0000-000000000001',
    -- 10: Vue/Nuxt stack
    'a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000005|b0000000-0000-0000-0000-000000000006|b0000000-0000-0000-0000-000000000019|a0000000-0000-0000-0000-000000000014|a0000000-0000-0000-0000-000000000015|c0000000-0000-0000-0000-000000000001|b0000000-0000-0000-0000-000000000007|e0000000-0000-0000-0000-000000000011|e0000000-0000-0000-0000-000000000012|d0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000018|f0000000-0000-0000-0000-000000000006|e0000000-0000-0000-0000-000000000025|f2000000-0000-0000-0000-000000000012',
    -- 11: Elixir/Ruby
    'a0000000-0000-0000-0000-000000000019|b0000000-0000-0000-0000-000000000064|a0000000-0000-0000-0000-000000000009|b0000000-0000-0000-0000-000000000015|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000004|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000001|f0000000-0000-0000-0000-000000000003|f0000000-0000-0000-0000-000000000012|f2000000-0000-0000-0000-000000000006|d0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000010|d0000000-0000-0000-0000-000000000008|c0000000-0000-0000-0000-000000000003',
    -- 12: QA/Testing
    'e0000000-0000-0000-0000-000000000012|b0000000-0000-0000-0000-000000000054|b0000000-0000-0000-0000-000000000055|b0000000-0000-0000-0000-000000000056|f0000000-0000-0000-0000-000000000003|f0000000-0000-0000-0000-000000000011|a0000000-0000-0000-0000-000000000002|a0000000-0000-0000-0000-000000000001|d0000000-0000-0000-0000-000000000007|e0000000-0000-0000-0000-000000000005|e0000000-0000-0000-0000-000000000027|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000008|a0000000-0000-0000-0000-000000000003|b0000000-0000-0000-0000-000000000058',
    -- 13: Svelte/Modern frontend
    'b0000000-0000-0000-0000-000000000067|b0000000-0000-0000-0000-000000000068|a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000019|b0000000-0000-0000-0000-000000000051|a0000000-0000-0000-0000-000000000014|a0000000-0000-0000-0000-000000000015|e0000000-0000-0000-0000-000000000011|e0000000-0000-0000-0000-000000000012|d0000000-0000-0000-0000-000000000030|f2000000-0000-0000-0000-000000000012|f2000000-0000-0000-0000-000000000013|e0000000-0000-0000-0000-000000000021|e0000000-0000-0000-0000-000000000025|f0000000-0000-0000-0000-000000000006',
    -- 14: Node.js/Express full
    'a0000000-0000-0000-0000-000000000002|b0000000-0000-0000-0000-000000000008|b0000000-0000-0000-0000-000000000009|c0000000-0000-0000-0000-000000000001|c0000000-0000-0000-0000-000000000003|c0000000-0000-0000-0000-000000000004|d0000000-0000-0000-0000-000000000001|e0000000-0000-0000-0000-000000000012|f0000000-0000-0000-0000-000000000006|f2000000-0000-0000-0000-000000000011|f2000000-0000-0000-0000-000000000006|f0000000-0000-0000-0000-000000000008|d0000000-0000-0000-0000-000000000008|e0000000-0000-0000-0000-000000000028|c0000000-0000-0000-0000-000000000020'
  ];

  seniorities TEXT[] := ARRAY['intern','junior','junior','mid','mid','senior','senior','lead'];
  min_exps INT[] := ARRAY[0, 1, 2, 3, 4, 5, 7, 8];

  tmpl_idx INT;
  job_num INT;
  city_pick INT;
  addr_idx INT;
BEGIN
  FOR i IN 1..5000 LOOP
    user_uuid    := ('20000000-0000-0000-0001-' || lpad(i::text, 12, '0'))::uuid;
    profile_uuid := ('20000000-0000-0000-0002-' || lpad(i::text, 12, '0'))::uuid;

    company_name := prefixes[((i - 1) % 50) + 1] || ' ' || suffixes[((i - 1) % 20) + 1];
    -- Append number if needed for uniqueness
    IF i > 1000 THEN
      company_name := company_name || ' ' || ((i / 1000)::text);
    END IF;
    company_handle := 'company-' || lpad(i::text, 5, '0');
    company_cnpj := lpad(((i / 100000) % 100)::text, 2, '0') || '.' ||
                    lpad(((i / 100) % 1000)::text, 3, '0') || '.' ||
                    lpad((i % 100)::text, 3, '0') || '/0001-' ||
                    lpad(((i % 99) + 1)::text, 2, '0');

    -- User
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (user_uuid, company_name, 'company' || i || '@devport.test', pw_hash, 'company')
    ON CONFLICT (id) DO NOTHING;

    -- Company profile
    INSERT INTO company_profiles (id, user_id, handle, company_name, cnpj, description, industry, size, city_id)
    VALUES (
      profile_uuid, user_uuid, company_handle, company_name, company_cnpj,
      'Empresa do setor de ' || industries[((i - 1) % 20) + 1] || '. Inovação e excelência em tecnologia.',
      industries[((i - 1) % 20) + 1],
      sizes[((i - 1) % 5) + 1],
      job_cities[((i - 1) % 30) + 1]
    )
    ON CONFLICT (id) DO NOTHING;

    -- Template for this company (15 pools for variety)
    tmpl_idx := ((i - 1) % 15); -- 0-14
    sk_pool := string_to_array(tmpl_skills[tmpl_idx + 1], '|');
    sk_pool_size := array_length(sk_pool, 1);

    -- 8 jobs per company
    FOR j IN 1..8 LOOP
      job_num := (i - 1) * 8 + j;
      job_uuid := ('20000000-0000-0000-0003-' || lpad(job_num::text, 12, '0'))::uuid;

      -- Title from template (cycle titles through 5 base templates, skills through 15 pools)
      job_title := all_titles[((tmpl_idx % 5) * 8) + j];
      job_desc := all_descs[((tmpl_idx % 5) * 8) + j];
      job_seniority := seniorities[j];
      job_min_exp := min_exps[j];
      job_contract := contracts[((i + j) % 3) + 1];
      job_work_mode := work_modes[((i + j) % 3) + 1];

      -- Address for non-remote
      IF job_work_mode = 'remote' THEN
        job_city := NULL; job_zip := NULL; job_street := NULL; job_neighborhood := NULL; job_number := NULL;
      ELSE
        city_pick := ((i + j) % 30) + 1;
        addr_idx := ((i + j) % 30) + 1;
        job_city := job_cities[city_pick];
        job_zip := zip_codes[addr_idx];
        job_street := streets[addr_idx];
        job_neighborhood := neighborhoods[addr_idx];
        job_number := numbers[addr_idx];
      END IF;

      -- Salary consistent with seniority
      job_salary_min := CASE job_seniority
        WHEN 'intern'     THEN 1200 + (i % 5) * 100
        WHEN 'junior'     THEN 2500 + (i % 8) * 200
        WHEN 'mid'        THEN 5500 + (i % 10) * 300
        WHEN 'senior'     THEN 10000 + (i % 8) * 500
        WHEN 'lead'       THEN 15000 + (i % 6) * 600
        WHEN 'specialist' THEN 18000 + (i % 5) * 800
        ELSE 5000
      END;
      job_salary_max := job_salary_min + 2000 + (j * 400);

      cur_benefits := benefits_raw[((i + j - 1) % 8) + 1];

      INSERT INTO jobs (
        id, company_profile_id, title, description, seniority,
        min_experience_years, contract_model, salary_min, salary_max,
        show_salary, benefits, work_mode,
        city_id, zip_code, street, neighborhood, number, status
      ) VALUES (
        job_uuid, profile_uuid, job_title, job_desc, job_seniority,
        job_min_exp, job_contract, job_salary_min, job_salary_max,
        ((i + j) % 4 = 0),
        to_jsonb(string_to_array(cur_benefits, '|')),
        job_work_mode,
        job_city, job_zip, job_street, job_neighborhood, job_number, 'open'
      )
      ON CONFLICT (id) DO NOTHING;

      -- =============================================
      -- Skills: 3-6 per job, levels consistent with seniority
      -- First skills = required, then expected, then differential
      -- =============================================

      num_skills := 3 + (j % 4); -- 3-6 skills per job
      IF num_skills > sk_pool_size THEN num_skills := sk_pool_size; END IF;

      FOR k IN 1..num_skills LOOP
        -- Rotate starting position per company+job for variety
        sk_id := sk_pool[((i + j * 3 + k - 1) % sk_pool_size) + 1];

        -- Level based on seniority
        IF job_seniority IN ('intern', 'junior') THEN
          sk_level := CASE WHEN k <= 2 THEN 'intermediate' ELSE 'beginner' END;
        ELSIF job_seniority = 'mid' THEN
          sk_level := CASE WHEN k <= 2 THEN 'advanced' WHEN k <= 4 THEN 'intermediate' ELSE 'beginner' END;
        ELSE -- senior, lead, specialist
          sk_level := CASE WHEN k <= 2 THEN 'expert' WHEN k <= 4 THEN 'advanced' ELSE 'intermediate' END;
        END IF;

        -- Requirement: first = required, middle = expected, last = differential
        IF k <= CEIL(num_skills * 0.5) THEN
          sk_req := 'required';
        ELSIF k <= CEIL(num_skills * 0.8) THEN
          sk_req := 'expected';
        ELSE
          sk_req := 'differential';
        END IF;

        INSERT INTO job_skills (id, job_id, skill_id, min_level, requirement)
        VALUES (
          ('20000000-0000-0000-0004-' || lpad(((job_num - 1) * 6 + k)::text, 12, '0'))::uuid,
          job_uuid, sk_id::uuid, sk_level, sk_req
        )
        ON CONFLICT DO NOTHING;
      END LOOP;

    END LOOP; -- jobs
  END LOOP; -- companies

  RAISE NOTICE 'Seed complete: 5000 companies, 40000 jobs';
END $$;

-- =============================================
-- Verification
-- =============================================
-- SELECT COUNT(*) FROM company_profiles;
-- SELECT COUNT(*) FROM jobs;
-- SELECT COUNT(*) FROM job_skills;
-- SELECT seniority, COUNT(*) FROM jobs GROUP BY seniority ORDER BY seniority;
-- SELECT work_mode, COUNT(*) FROM jobs GROUP BY work_mode;
-- SELECT requirement, COUNT(*) FROM job_skills GROUP BY requirement;
