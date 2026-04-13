# Data Model — Dev Port

> Versão: 2.0
> Data: 2026-04-11
> Status: Draft
> Banco: PostgreSQL
> Referência: [PRD.md](PRD.md)

---

## 1. Diagrama de Relacionamentos (ER)

```
┌──────────┐       ┌───────────────┐
│  users   │1────1│ dev_profiles  │  ← role = dev
└────┬─────┘       └──────┬────────┘
     │                    │1
     │      ┌─────────────┼──────────────┬───────────────┬───────────────┐
     │      │N            │N             │N              │N              │N
     │ ┌────┴──────┐ ┌────┴─────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌─────┴──────┐
     │ │ dev_skills│ │educations│ │ experiences │ │  projects   │ │  (github)  │
     │ └─────┬─────┘ └──────────┘ └──────┬──────┘ └─────────────┘ └────────────┘
     │       │N                          │N
     │       │                     ┌─────┴────────────┐
     │       │                     │ experience_skills │ (pivot: experience ↔ skill_tree)
     │       │                     └─────┬────────────┘
     │       │                           │N
     │       │
     │  ┌────┴──────────┐
     │  │  skill_tree   │←──┐ (self-ref: parent)
     │  └────┬──────────┘   │
     │       │N             │0..1
     │       └──────────────┘
     │
     │1      ┌──────────────────┐
     └─────1│ company_profiles │  ← role = company
             └──────┬───────────┘
                    │1
                    ├───────────────────┐
                    │N                  │N
              ┌─────┴──────┐     ┌──────┴────���────┐
              │    jobs     │     │ company_units  │
              └─────┬──────┘     └────────────────┘
                    │N
                    │N
              ┌─────┴──────┐
              │ job_skills  │ (pivot: job ↔ skill_tree + min_level)
              └─────┬──────┘
                    │N
                    │1
              ┌─────┴──────┐
              │ skill_tree  │
              └────────────┘

┌───────────────┐       ┌──────────────────┐       ┌─────────┐
│ dev_profiles  │N────N│ job_applications  │N────1│  jobs    │
└───────────────┘       └──────────────────┘       └─────────┘

┌──────────────────┐       ┌───────────────────┐       ┌─────────┐
│ company_profiles │1────N│ saved_developers   │N────1│  jobs    │
└──────────────────┘       └────────┬──────────┘       └─────────┘
                                    │N
                                    │1
                           ┌────────┴──────┐
                           │ dev_profiles   │
                           └───────────────┘
```

---

## 2. Tabelas

### 2.1 `users`

Autenticação e acesso ao sistema. Suporta dois tipos de usuário.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `name` | `varchar(255)` | não | — | Nome para login |
| `email` | `varchar(255)` | não | — | E-mail (unique) |
| `password_hash` | `varchar(255)` | não | — | Senha bcrypt |
| `role` | `varchar(10)` | não | — | `dev` ou `company` |
| `refresh_token` | `varchar(500)` | sim | null | Refresh token atual (hash) |
| `created_at` | `timestamp` | não | now() | Criação do registro |
| `updated_at` | `timestamp` | não | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`

**Check constraints:**
- `role IN ('dev', 'company')`

---

### 2.2 `states`

Estados brasileiros (fonte: IBGE).

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `integer` (PK) | não | — | Código UF (IBGE) |
| `abbr` | `varchar(2)` | não | — | Sigla (UF) |
| `name` | `varchar(100)` | não | — | Nome do estado |
| `latitude` | `decimal(10,6)` | não | — | Latitude do centróide |
| `longitude` | `decimal(10,6)` | não | — | Longitude do centróide |
| `region` | `varchar(20)` | não | — | Região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste) |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (abbr)`

---

### 2.3 `cities`

Municípios brasileiros (fonte: IBGE).

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `integer` (PK) | não | — | Código IBGE do município |
| `state_id` | `integer` (FK) | não | — | Código UF |
| `name` | `varchar(255)` | não | — | Nome do município |
| `latitude` | `decimal(10,6)` | não | — | Latitude |
| `longitude` | `decimal(10,6)` | não | — | Longitude |
| `is_capital` | `boolean` | não | false | É capital do estado |
| `siafi_id` | `integer` | não | — | Código SIAFI |
| `ddd` | `integer` | não | — | DDD telefônico |
| `timezone` | `varchar(50)` | não | — | Fuso horário (ex: America/Sao_Paulo) |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (state_id)`
- `INDEX (name)`

**Foreign Keys:**
- `state_id → states(id)`

---

### 2.4 `dev_profiles`

Dados profissionais do desenvolvedor.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `user_id` | `uuid` (FK) | não | — | Referência ao usuário |
| `handle` | `varchar(40)` | não | — | Identificador público (unique, URL-friendly) |
| `full_name` | `varchar(255)` | não | — | Nome completo |
| `title` | `varchar(255)` | não | — | Cargo/título atual |
| `bio` | `varchar(500)` | não | — | Resumo profissional |
| `avatar_url` | `varchar(2048)` | sim | null | URL do avatar |
| `email_contact` | `varchar(255)` | não | — | E-mail público de contato |
| `city_id` | `integer` (FK) | sim | null | Referência ao município (IBGE) |
| `zip_code` | `varchar(9)` | sim | null | CEP (formato 00000-000) |
| `street` | `varchar(255)` | sim | null | Rua / Logradouro |
| `neighborhood` | `varchar(255)` | sim | null | Bairro |
| `number` | `varchar(20)` | sim | null | Número |
| `complement` | `varchar(255)` | sim | null | Complemento |
| `work_modes` | `jsonb` | sim | null | Array de modalidades preferidas: `["remote","hybrid"]` |
| `employment_status` | `varchar(10)` | sim | null | `looking`, `employed` |
| `salary_min` | `decimal(10,2)` | sim | null | Pretensão salarial mínima |
| `salary_max` | `decimal(10,2)` | sim | null | Pretensão salarial máxima |
| `github_username` | `varchar(255)` | sim | null | Username do GitHub |
| `links` | `jsonb` | sim | null | Links externos |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id)`
- `UNIQUE (handle)` — URL pública: `/developers/{handle}`
- `INDEX (full_name)` — busca por nome
- `INDEX (city_id)` — busca por localização
- `INDEX (github_username)`

**Foreign Keys:**
- `user_id → users(id) ON DELETE CASCADE`
- `city_id → cities(id) ON DELETE SET NULL`

**Check constraints:**
- `handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'` — 3-40 chars, lowercase, números e hífens, sem iniciar/terminar com hífen
- `work_modes` é jsonb array (ex: `["remote","hybrid"]`) ou null
- `employment_status IN ('looking', 'employed') OR employment_status IS NULL`
- `salary_min IS NULL OR salary_min >= 0`
- `salary_max IS NULL OR salary_max >= salary_min`

**Estrutura do campo `links` (jsonb):**
```json
[
  { "label": "LinkedIn", "url": "https://linkedin.com/in/fulano" },
  { "label": "Site pessoal", "url": "https://fulano.dev" }
]
```

---

### 2.3 `company_profiles`

Dados da empresa.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `user_id` | `uuid` (FK) | não | — | Referência ao usuário |
| `handle` | `varchar(40)` | não | — | Identificador público (unique, URL-friendly) |
| `company_name` | `varchar(255)` | não | — | Nome da empresa |
| `cnpj` | `varchar(18)` | não | — | CNPJ formatado (unique) |
| `description` | `varchar(1000)` | não | — | Sobre a empresa |
| `logo_url` | `varchar(2048)` | sim | null | URL do logo |
| `website` | `varchar(2048)` | sim | null | Site da empresa |
| `industry` | `varchar(255)` | não | — | Setor de atuação |
| `size` | `varchar(20)` | não | — | Tamanho da empresa |
| `city_id` | `integer` (FK) | sim | null | Município da sede (IBGE) |
| `zip_code` | `varchar(9)` | sim | null | CEP da sede (formato 00000-000) |
| `street` | `varchar(255)` | sim | null | Rua / Logradouro |
| `neighborhood` | `varchar(255)` | sim | null | Bairro |
| `number` | `varchar(20)` | sim | null | Número |
| `complement` | `varchar(255)` | sim | null | Complemento |
| `links` | `jsonb` | sim | null | Links externos |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id)`
- `UNIQUE (handle)` — URL pública: `/companies/{handle}`
- `UNIQUE (cnpj)`
- `INDEX (company_name)`
- `INDEX (city_id)`

**Foreign Keys:**
- `user_id → users(id) ON DELETE CASCADE`
- `city_id → cities(id) ON DELETE SET NULL`

**Check constraints:**
- `handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'` — mesma regra do dev
- `size IN ('startup', 'small', 'medium', 'large', 'enterprise')`

---

### 2.3.1 `company_units`

Unidades/filiais da empresa (endereços adicionais).

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `company_profile_id` | `uuid` (FK) | não | — | Referência ao perfil empresa |
| `name` | `varchar(255)` | não | — | Nome da unidade (ex: "Filial SP") |
| `city_id` | `integer` (FK) | não | — | Município (IBGE) |
| `zip_code` | `varchar(9)` | não | — | CEP (formato 00000-000) |
| `street` | `varchar(255)` | não | — | Rua / Logradouro |
| `neighborhood` | `varchar(255)` | não | — | Bairro |
| `number` | `varchar(20)` | não | — | Número |
| `complement` | `varchar(255)` | sim | null | Complemento |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (company_profile_id)`
- `INDEX (city_id)`

**Foreign Keys:**
- `company_profile_id → company_profiles(id) ON DELETE CASCADE`
- `city_id → cities(id) ON DELETE RESTRICT`

> Todos os campos de endereço são obrigatórios ao criar uma unidade. `complement` é a única exceção.

---

### 2.4 `skill_tree`

Catálogo hierárquico de skills padronizadas.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `name` | `varchar(100)` | não | — | Nome da skill |
| `slug` | `varchar(120)` | não | — | Slug (unique, para URLs e busca) |
| `category` | `varchar(20)` | não | — | Categoria |
| `parent_id` | `uuid` (FK) | sim | null | Skill pai (hierarquia) |
| `created_at` | `timestamp` | não | now() | Criação |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (slug)`
- `INDEX (category)`
- `INDEX (parent_id)`
- `INDEX (name)`

**Foreign Keys:**
- `parent_id → skill_tree(id) ON DELETE SET NULL`

**Check constraints:**
- `category IN ('language', 'framework', 'database', 'devops', 'tool', 'methodology', 'soft_skill', 'other')`

---

### 2.5 `dev_skills`

Skills selecionadas pelo dev, vinculadas à árvore.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `skill_id` | `uuid` (FK) | não | — | Referência à árvore de skills |
| `level` | `varchar(15)` | não | — | Nível de proficiência |
| `years_experience` | `integer` | sim | null | Anos de experiência |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (dev_profile_id, skill_id)` — impede duplicata
- `INDEX (skill_id)` — busca por skill

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`
- `skill_id → skill_tree(id) ON DELETE CASCADE`

**Check constraints:**
- `level IN ('beginner', 'intermediate', 'advanced', 'expert')`
- `years_experience >= 0 OR years_experience IS NULL`

---

### 2.6 `educations`

Formação acadêmica e certificações.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `institution` | `varchar(255)` | não | — | Instituição |
| `course` | `varchar(255)` | não | — | Curso/certificação |
| `type` | `varchar(20)` | não | — | Tipo de formação |
| `workload_hours` | `integer` | sim | null | Carga horária (horas) |
| `start_date` | `date` | sim | null | Data início |
| `end_date` | `date` | sim | null | Data conclusão |
| `is_ongoing` | `boolean` | não | false | Em andamento |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (dev_profile_id)`

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `type IN ('technical', 'graduation', 'master', 'doctorate', 'postdoc', 'mba', 'course', 'certification')`
- `NOT (is_ongoing = true AND end_date IS NOT NULL)`
- `NOT (type = 'course' AND workload_hours IS NULL)`

---

### 2.7 `experiences`

Histórico profissional.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `company` | `varchar(255)` | não | — | Empresa |
| `position` | `varchar(255)` | não | — | Cargo |
| `description` | `text` | sim | null | Descrição das atividades |
| `start_date` | `date` | não | — | Data início |
| `end_date` | `date` | sim | null | Data fim |
| `is_current` | `boolean` | não | false | Emprego atual |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (dev_profile_id)`

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `NOT (is_current = true AND end_date IS NOT NULL)`

---

### 2.8 `experience_skills`

Pivot: skills associadas a uma experiência (tag simples, sem nível).

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `experience_id` | `uuid` (FK) | não | — | Referência à experiência |
| `skill_id` | `uuid` (FK) | não | — | Referência à árvore de skills |
| `created_at` | `timestamp` | não | now() | Criação |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (experience_id, skill_id)` — impede duplicata
- `INDEX (skill_id)`

**Foreign Keys:**
- `experience_id → experiences(id) ON DELETE CASCADE`
- `skill_id → skill_tree(id) ON DELETE CASCADE`

---

### 2.9 `projects`

Projetos do desenvolvedor.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `name` | `varchar(255)` | não | — | Nome do projeto |
| `description` | `text` | não | — | Descrição |
| `technologies` | `jsonb` | sim | null | Lista de tecnologias |
| `repository_url` | `varchar(2048)` | sim | null | URL do repositório |
| `demo_url` | `varchar(2048)` | sim | null | URL de demonstração |
| `image_url` | `varchar(2048)` | sim | null | Imagem do projeto |
| `source` | `varchar(10)` | não | 'manual' | `manual` ou `github` |
| `github_repo_id` | `bigint` | sim | null | ID do repo no GitHub |
| `github_stars` | `integer` | sim | null | Stars |
| `github_language` | `varchar(100)` | sim | null | Linguagem principal |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (dev_profile_id)`
- `UNIQUE (dev_profile_id, github_repo_id)` — impede importação duplicada

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `source IN ('manual', 'github')`

---

### 2.10 `jobs`

Vagas publicadas por empresas.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `company_profile_id` | `uuid` (FK) | não | — | Referência ao perfil empresa |
| `company_unit_id` | `uuid` (FK) | sim | null | Unidade de referência (null = sede) |
| `title` | `varchar(255)` | não | — | Título da vaga |
| `description` | `text` | não | — | Descrição |
| `seniority` | `varchar(15)` | não | — | Nível de senioridade |
| `min_experience_years` | `integer` | não | — | Experiência mínima (anos) |
| `contract_model` | `varchar(10)` | não | — | Modelo de contratação |
| `salary_min` | `decimal(10,2)` | não | — | Faixa salarial mínima |
| `salary_max` | `decimal(10,2)` | não | — | Faixa salarial máxima |
| `show_salary` | `boolean` | não | false | Exibir faixa salarial publicamente |
| `benefits` | `jsonb` | sim | null | Lista de benefícios |
| `work_mode` | `varchar(10)` | não | — | Modalidade |
| `city_id` | `integer` (FK) | sim | null | Município da vaga |
| `zip_code` | `varchar(9)` | sim | null | CEP |
| `street` | `varchar(255)` | sim | null | Rua / Logradouro |
| `neighborhood` | `varchar(255)` | sim | null | Bairro |
| `number` | `varchar(20)` | sim | null | Número |
| `complement` | `varchar(255)` | sim | null | Complemento |
| `status` | `varchar(10)` | não | 'open' | Status da vaga |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (company_profile_id)`
- `INDEX (company_unit_id)`
- `INDEX (seniority)`
- `INDEX (status)`
- `INDEX (work_mode)`
- `INDEX (city_id)`
- `INDEX (created_at)`

**Foreign Keys:**
- `company_profile_id → company_profiles(id) ON DELETE CASCADE`
- `company_unit_id → company_units(id) ON DELETE SET NULL`
- `city_id → cities(id) ON DELETE SET NULL`

**Check constraints:**
- `seniority IN ('intern', 'junior', 'mid', 'senior', 'lead', 'specialist')`
- `contract_model IN ('clt', 'pj', 'clt_pj')`
- `work_mode IN ('onsite', 'hybrid', 'remote')`
- `status IN ('open', 'closed')`
- `salary_min >= 0`
- `salary_max >= salary_min`
- `NOT (work_mode IN ('onsite', 'hybrid') AND city_id IS NULL)` — presencial/híbrido exige endereço

> `company_unit_id` é apenas referência para pré-preenchimento no frontend. O endereço da vaga é independente e editável.

**Estrutura do campo `benefits` (jsonb):**
```json
["VR", "VA", "Plano de saúde", "Plano odonto", "Gympass", "PLR", "Stock options", "Home office"]
```
> Array de strings livres. Sem catálogo fixo — a empresa digita os benefícios.

**Regra de `show_salary`:**
- `false` (default): faixa salarial visível apenas para a empresa dona
- `true`: faixa salarial exibida publicamente na vaga

---

### 2.11 `job_skills`

Pivot: skills de uma vaga, com nível mínimo e tipo de exigência.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `job_id` | `uuid` (FK) | não | — | Referência à vaga |
| `skill_id` | `uuid` (FK) | não | — | Referência à árvore de skills |
| `min_level` | `varchar(15)` | não | — | Nível mínimo exigido |
| `requirement` | `varchar(15)` | não | 'required' | Tipo de exigência |
| `created_at` | `timestamp` | não | now() | Criação |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (job_id, skill_id)` — impede duplicata
- `INDEX (skill_id)`
- `INDEX (job_id, requirement)` — busca por tipo de exigência

**Foreign Keys:**
- `job_id → jobs(id) ON DELETE CASCADE`
- `skill_id → skill_tree(id) ON DELETE CASCADE`

**Check constraints:**
- `min_level IN ('beginner', 'intermediate', 'advanced', 'expert')`
- `requirement IN ('required', 'expected', 'differential')`

**Tipos de exigência:**
- `required` — Obrigatória: skill indispensável para a vaga
- `expected` — Esperada: skill que o candidato idealmente possui
- `differential` — Diferencial: skill que destaca o candidato, mas não é eliminatória

---

### 2.12 `job_applications`

Candidaturas de devs a vagas.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `job_id` | `uuid` (FK) | não | — | Referência à vaga |
| `status` | `varchar(10)` | não | 'pending' | Status da candidatura |
| `created_at` | `timestamp` | não | now() | Data da candidatura |
| `updated_at` | `timestamp` | não | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (dev_profile_id, job_id)` — impede candidatura duplicada
- `INDEX (job_id, status)` — busca de candidatos por vaga
- `INDEX (dev_profile_id)` — listagem de candidaturas do dev

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`
- `job_id → jobs(id) ON DELETE CASCADE`

**Check constraints:**
- `status IN ('pending', 'accepted', 'rejected', 'withdrawn')`

---

### 2.13 `saved_developers`

Shortlist interna da empresa — devs salvos por vaga.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `company_profile_id` | `uuid` (FK) | não | — | Referência ao perfil empresa |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `job_id` | `uuid` (FK) | não | — | Referência à vaga |
| `created_at` | `timestamp` | não | now() | Data do salvamento |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (company_profile_id, dev_profile_id, job_id)` — impede duplicata
- `INDEX (company_profile_id, job_id)` — listagem por vaga
- `INDEX (dev_profile_id)` — consulta reversa

**Foreign Keys:**
- `company_profile_id → company_profiles(id) ON DELETE CASCADE`
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`
- `job_id → jobs(id) ON DELETE CASCADE`

---

### 2.14 `match_scores`

Cache de scores de matching entre devs e vagas.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `dev_profile_id` | `uuid` (FK) | não | — | Referência ao perfil dev |
| `job_id` | `uuid` (FK) | não | — | Referência à vaga |
| `score` | `integer` | não | — | Score calculado (0-100) |
| `dev_hash` | `varchar(32)` | não | — | MD5 dos dados do dev usados no cálculo |
| `job_hash` | `varchar(32)` | não | — | MD5 dos dados da vaga usados no cálculo |
| `skill_score` | `decimal(5,2)` | não | — | Sub-score de skills (0-100) |
| `experience_score` | `decimal(5,2)` | não | — | Sub-score de experiência (0-100) |
| `modality_score` | `decimal(5,2)` | não | — | Sub-score modalidade+localização (0-100) |
| `salary_score` | `decimal(5,2)` | não | — | Sub-score salarial (0-100) |
| `calculated_at` | `timestamp` | não | now() | Data do cálculo |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (dev_profile_id, job_id)` — um score por par dev+vaga (upsert)
- `INDEX (job_id, score DESC)` — ranking de devs por vaga
- `INDEX (dev_profile_id, score DESC)` — ranking de vagas por dev
- `INDEX (dev_hash)` — busca por hash do dev
- `INDEX (job_hash)` — busca por hash da vaga

**Foreign Keys:**
- `dev_profile_id → dev_profiles(id) ON DELETE CASCADE`
- `job_id → jobs(id) ON DELETE CASCADE`

**Composição do `dev_hash` (MD5 de):**
```
{dev_profile_id}:{work_modes_sorted}:{city_id}:{salary_min}:{salary_max}:{skills_sorted}:{total_experience_months}
```
Onde `skills_sorted` = lista ordenada de `skill_id:level` das dev_skills.

**Composição do `job_hash` (MD5 de):**
```
{job_id}:{work_mode}:{city_id}:{salary_min}:{salary_max}:{seniority}:{min_experience_years}:{skills_sorted}
```
Onde `skills_sorted` = lista ordenada de `skill_id:min_level:requirement` das job_skills.

---

#### Estratégia de Cache (Redis + PostgreSQL)

**Camada 1 — Redis (hot cache):**
```
Key:   match:{dev_profile_id}:{job_id}
Value: { score, dev_hash, job_hash, skill_score, experience_score, modality_score, salary_score }
TTL:   24 horas
```

**Camada 2 — PostgreSQL (tabela `match_scores`):**
- Persistência do último cálculo
- Permite queries analíticas (ranking, busca paginada por score)
- Upsert ao calcular (`ON CONFLICT (dev_profile_id, job_id) DO UPDATE`)

**Fluxo de cálculo:**

```
1. Requisição de match (dev, job)
2. Buscar no Redis → key: match:{dev_id}:{job_id}
   ├─ HIT: comparar dev_hash e job_hash atuais
   │   ├─ Hashes iguais → retornar score do cache ✓
   │   └─ Hashes mudaram → recalcular (passo 4)
   └─ MISS: buscar no PostgreSQL (tabela match_scores)
       ├─ FOUND: comparar hashes
       │   ├─ Iguais → salvar no Redis + retornar ✓
       │   └─ Mudaram → recalcular (passo 4)
       └─ NOT FOUND → recalcular (passo 4)
4. Calcular score (algoritmo 6.4)
5. Salvar no Redis (TTL 24h)
6. Upsert no PostgreSQL (match_scores)
7. Retornar score ✓
```

**Invalidação:**
- Quando dev atualiza perfil, skills ou experiências → deletar keys Redis `match:{dev_id}:*` e atualizar `dev_hash`
- Quando empresa atualiza vaga ou job_skills → deletar keys Redis `match:*:{job_id}` e atualizar `job_hash`
- O hash garante que mesmo sem invalidação explícita, o próximo acesso detecta mudança

**Cálculo em lote (para listagem paginada):**
- Ao listar vagas para um dev, calcular scores para a página inteira em batch
- Usar pipeline Redis para buscar/salvar múltiplos scores em uma operação
- Jobs sem score calculado são calculados on-demand e inseridos no cache

---

## 3. Regras de Integridade Resumidas

| Regra | Implementação |
|---|---|
| 1 user = 1 dev_profile | `UNIQUE (user_id)` em dev_profiles |
| 1 user = 1 company_profile | `UNIQUE (user_id)` em company_profiles |
| Handle único (dev) | `UNIQUE (handle)` em dev_profiles — URL: `/developers/{handle}` |
| Handle único (empresa) | `UNIQUE (handle)` em company_profiles — URL: `/companies/{handle}` |
| Handle válido | CHECK regex `^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$` em ambas as tabelas |
| CNPJ único | `UNIQUE (cnpj)` em company_profiles |
| Skill única por dev | `UNIQUE (dev_profile_id, skill_id)` em dev_skills |
| Skill única por experiência | `UNIQUE (experience_id, skill_id)` em experience_skills |
| Skill única por vaga | `UNIQUE (job_id, skill_id)` em job_skills |
| Slug único na árvore | `UNIQUE (slug)` em skill_tree |
| Em andamento → sem data fim | CHECK em educations e experiences |
| Curso exige carga horária | CHECK em educations |
| Presencial/híbrido exige endereço | CHECK `NOT (work_mode IN ('onsite','hybrid') AND city_id IS NULL)` em jobs |
| Salário max ≥ min | CHECK em jobs |
| Repo GitHub único por dev | `UNIQUE (dev_profile_id, github_repo_id)` em projects |
| Candidatura única por dev+vaga | `UNIQUE (dev_profile_id, job_id)` em job_applications |
| Dev salvo único por empresa+dev+vaga | `UNIQUE (company_profile_id, dev_profile_id, job_id)` em saved_developers |
| Score único por dev+vaga | `UNIQUE (dev_profile_id, job_id)` em match_scores (upsert) |
| Deletar user cascateia tudo | ON DELETE CASCADE em todas as FKs |

---

## 4. Ordenação Padrão por Tabela

| Tabela | Ordenação padrão |
|---|---|
| `dev_skills` | `skill_tree.name ASC` (via join) |
| `educations` | `is_ongoing DESC, start_date DESC NULLS LAST` |
| `experiences` | `is_current DESC, start_date DESC` |
| `projects` | `created_at DESC` |
| `company_units` | `name ASC` |
| `jobs` | `status ASC (open first), created_at DESC` |
| `job_applications` | `created_at DESC` |
| `saved_developers` | `created_at DESC` |
| `skill_tree` | `category ASC, name ASC` |

---

## 5. Considerações para Buscas

```sql
-- Busca de devs por nome
SELECT * FROM dev_profiles WHERE full_name ILIKE '%termo%';

-- Busca de devs por skill
SELECT DISTINCT dp.* FROM dev_profiles dp
JOIN dev_skills ds ON ds.dev_profile_id = dp.id
JOIN skill_tree st ON st.id = ds.skill_id
WHERE st.name ILIKE '%termo%';

-- Busca de vagas por título/descrição
SELECT * FROM jobs
WHERE status = 'open'
AND (title ILIKE '%termo%' OR description ILIKE '%termo%');

-- Busca de vagas por skill exigida
SELECT DISTINCT j.* FROM jobs j
JOIN job_skills js ON js.job_id = j.id
JOIN skill_tree st ON st.id = js.skill_id
WHERE j.status = 'open'
AND st.name ILIKE '%termo%';

-- Busca de vagas por município
SELECT * FROM jobs
WHERE status = 'open'
AND city_id = 3550308;
```

> Para o MVP, `ILIKE` é suficiente. Evolução futura: `pg_trgm` ou full-text search.

---

## 6. Migration Order

Ordem de criação respeitando dependências:

```
1. users
2. dev_profiles
3. company_profiles
3.1. company_units
4. skill_tree
5. dev_skills
6. educations
7. experiences
8. experience_skills
9. projects
10. jobs
11. job_skills
12. job_applications
13. saved_developers
14. match_scores
```

---

## 7. Notas sobre UUID

Todas as tabelas usam `uuid` como primary key em vez de `bigint` auto-increment.

**Por quê:**
- Segurança: IDs não sequenciais, não expõem volume de dados
- Distribuição: compatível com sistemas distribuídos (futuro)
- NestJS/TypeORM: suporte nativo e idiomático

**Geração:** `gen_random_uuid()` no PostgreSQL (v13+), sem dependência de extensão.
