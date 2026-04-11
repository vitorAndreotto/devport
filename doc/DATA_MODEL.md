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
     │ └─────┬─────┘ └──────────┘ └─────────────┘ └─────────────┘ └────────────┘
     │       │N
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
                    │N
              ┌─────┴──────┐
              │    jobs     │
              └─────┬──────┘
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
| `work_mode` | `varchar(10)` | sim | null | `onsite`, `hybrid`, `remote` |
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
- `work_mode IN ('onsite', 'hybrid', 'remote') OR work_mode IS NULL`

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
| `location` | `varchar(255)` | não | — | Localização da sede |
| `links` | `jsonb` | sim | null | Links externos |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id)`
- `UNIQUE (handle)` — URL pública: `/companies/{handle}`
- `UNIQUE (cnpj)`
- `INDEX (company_name)`

**Foreign Keys:**
- `user_id → users(id) ON DELETE CASCADE`

**Check constraints:**
- `handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'` — mesma regra do dev
- `size IN ('startup', 'small', 'medium', 'large', 'enterprise')`

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

### 2.8 `projects`

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

### 2.9 `jobs`

Vagas publicadas por empresas.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `company_profile_id` | `uuid` (FK) | não | — | Referência ao perfil empresa |
| `title` | `varchar(255)` | não | — | Título da vaga |
| `description` | `text` | não | — | Descrição |
| `min_experience_years` | `integer` | não | — | Experiência mínima (anos) |
| `contract_model` | `varchar(10)` | não | — | Modelo de contratação |
| `salary_min` | `decimal(10,2)` | não | — | Faixa salarial mínima |
| `salary_max` | `decimal(10,2)` | não | — | Faixa salarial máxima |
| `work_mode` | `varchar(10)` | não | — | Modalidade |
| `location` | `varchar(255)` | sim | null | Localização (presencial/híbrido) |
| `status` | `varchar(10)` | não | 'open' | Status da vaga |
| `created_at` | `timestamp` | não | now() | Criação |
| `updated_at` | `timestamp` | não | now() | Atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (company_profile_id)`
- `INDEX (status)`
- `INDEX (work_mode)`
- `INDEX (created_at)`

**Foreign Keys:**
- `company_profile_id → company_profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `contract_model IN ('clt', 'pj', 'clt_pj')`
- `work_mode IN ('onsite', 'hybrid', 'remote')`
- `status IN ('open', 'closed')`
- `salary_min >= 0`
- `salary_max >= salary_min`
- `NOT (work_mode IN ('onsite', 'hybrid') AND location IS NULL)` — presencial/híbrido exige localização

---

### 2.10 `job_skills`

Pivot: skills exigidas por uma vaga, com nível mínimo.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `uuid` (PK) | não | gen_random_uuid() | Identificador único |
| `job_id` | `uuid` (FK) | não | — | Referência à vaga |
| `skill_id` | `uuid` (FK) | não | — | Referência à árvore de skills |
| `min_level` | `varchar(15)` | não | — | Nível mínimo exigido |
| `created_at` | `timestamp` | não | now() | Criação |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (job_id, skill_id)` — impede duplicata
- `INDEX (skill_id)`

**Foreign Keys:**
- `job_id → jobs(id) ON DELETE CASCADE`
- `skill_id → skill_tree(id) ON DELETE CASCADE`

**Check constraints:**
- `min_level IN ('beginner', 'intermediate', 'advanced', 'expert')`

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
| Skill única por vaga | `UNIQUE (job_id, skill_id)` em job_skills |
| Slug único na árvore | `UNIQUE (slug)` em skill_tree |
| Em andamento → sem data fim | CHECK em educations e experiences |
| Curso exige carga horária | CHECK em educations |
| Presencial/híbrido exige localização | CHECK em jobs |
| Salário max ≥ min | CHECK em jobs |
| Repo GitHub único por dev | `UNIQUE (dev_profile_id, github_repo_id)` em projects |
| Deletar user cascateia tudo | ON DELETE CASCADE em todas as FKs |

---

## 4. Ordenação Padrão por Tabela

| Tabela | Ordenação padrão |
|---|---|
| `dev_skills` | `skill_tree.name ASC` (via join) |
| `educations` | `is_ongoing DESC, start_date DESC NULLS LAST` |
| `experiences` | `is_current DESC, start_date DESC` |
| `projects` | `created_at DESC` |
| `jobs` | `status ASC (open first), created_at DESC` |
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
```

> Para o MVP, `ILIKE` é suficiente. Evolução futura: `pg_trgm` ou full-text search.

---

## 6. Migration Order

Ordem de criação respeitando dependências:

```
1. users
2. dev_profiles
3. company_profiles
4. skill_tree
5. dev_skills
6. educations
7. experiences
8. projects
9. jobs
10. job_skills
```

---

## 7. Notas sobre UUID

Todas as tabelas usam `uuid` como primary key em vez de `bigint` auto-increment.

**Por quê:**
- Segurança: IDs não sequenciais, não expõem volume de dados
- Distribuição: compatível com sistemas distribuídos (futuro)
- NestJS/TypeORM: suporte nativo e idiomático

**Geração:** `gen_random_uuid()` no PostgreSQL (v13+), sem dependência de extensão.
