# Data Model — Dev Port (MVP)

> Versão: 1.0
> Data: 2026-04-09
> Status: Draft
> Banco: PostgreSQL
> Referência: [PRD.md](PRD.md)

---

## 1. Diagrama de Relacionamentos (ER)

```
┌──────────┐       ┌──────────────┐
│  users   │1────1│   profiles   │
└──────────┘       └──────┬───────┘
                          │1
            ┌─────────────┼─────────────┬──────────────┐
            │N            │N            │N             │N
     ┌──────┴──────┐ ┌────┴─────┐ ┌─────┴──────┐ ┌─────┴──────┐
     │   skills    │ │educations│ │experiences │ │  projects  │
     └─────────────┘ └──────────┘ └────────────┘ └────────────┘
```

---

## 2. Tabelas

### 2.1 `users`

Autenticação e acesso ao sistema.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `name` | `varchar(255)` | não | — | Nome para login |
| `email` | `varchar(255)` | não | — | E-mail (unique) |
| `email_verified_at` | `timestamp` | sim | null | Data de verificação |
| `password` | `varchar(255)` | não | — | Senha hash |
| `remember_token` | `varchar(100)` | sim | null | Token de sessão |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`

> Tabela padrão do Laravel (migration default).

---

### 2.2 `profiles`

Dados profissionais do desenvolvedor.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `user_id` | `bigint` (FK) | não | — | Referência ao usuário |
| `full_name` | `varchar(255)` | não | — | Nome completo |
| `title` | `varchar(255)` | não | — | Cargo/título atual |
| `bio` | `varchar(500)` | não | — | Resumo profissional |
| `avatar_url` | `varchar(2048)` | sim | null | URL do avatar |
| `email_contact` | `varchar(255)` | não | — | E-mail público de contato |
| `location` | `varchar(255)` | sim | null | Localização |
| `github_username` | `varchar(255)` | sim | null | Username do GitHub |
| `links` | `jsonb` | sim | null | Links externos |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (user_id)`
- `INDEX (full_name)` — busca por nome
- `INDEX (github_username)`

**Foreign Keys:**
- `user_id → users(id) ON DELETE CASCADE`

**Estrutura do campo `links` (jsonb):**
```json
[
  { "label": "LinkedIn", "url": "https://linkedin.com/in/fulano" },
  { "label": "Site pessoal", "url": "https://fulano.dev" }
]
```

---

### 2.3 `skills`

Habilidades técnicas e comportamentais.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `profile_id` | `bigint` (FK) | não | — | Referência ao perfil |
| `name` | `varchar(100)` | não | — | Nome da skill |
| `type` | `varchar(10)` | não | — | `hard` ou `soft` |
| `level` | `varchar(20)` | sim | null | `beginner`, `intermediate`, `advanced` |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `UNIQUE (profile_id, name)` — impede duplicata por perfil
- `INDEX (name)` — busca por skill

**Foreign Keys:**
- `profile_id → profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `type IN ('hard', 'soft')`
- `level IN ('beginner', 'intermediate', 'advanced') OR level IS NULL`

---

### 2.4 `educations`

Formação acadêmica e certificações.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `profile_id` | `bigint` (FK) | não | — | Referência ao perfil |
| `institution` | `varchar(255)` | não | — | Nome da instituição |
| `course` | `varchar(255)` | não | — | Nome do curso/certificação |
| `type` | `varchar(20)` | não | — | Tipo de formação |
| `workload_hours` | `integer` | sim | null | Carga horária em horas |
| `start_date` | `date` | sim | null | Data de início |
| `end_date` | `date` | sim | null | Data de conclusão |
| `is_ongoing` | `boolean` | não | false | Em andamento |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (profile_id)`

**Foreign Keys:**
- `profile_id → profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `type IN ('technical', 'graduation', 'master', 'doctorate', 'postdoc', 'mba', 'course', 'certification')`
- `NOT (is_ongoing = true AND end_date IS NOT NULL)` — em andamento não tem data fim
- `NOT (type = 'course' AND workload_hours IS NULL)` — curso exige carga horária

---

### 2.5 `experiences`

Histórico profissional.

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `profile_id` | `bigint` (FK) | não | — | Referência ao perfil |
| `company` | `varchar(255)` | não | — | Nome da empresa |
| `position` | `varchar(255)` | não | — | Cargo |
| `description` | `text` | sim | null | Descrição das atividades |
| `start_date` | `date` | não | — | Data de início |
| `end_date` | `date` | sim | null | Data de fim |
| `is_current` | `boolean` | não | false | Emprego atual |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (profile_id)`

**Foreign Keys:**
- `profile_id → profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `NOT (is_current = true AND end_date IS NOT NULL)` — atual não tem data fim

---

### 2.6 `projects`

Projetos do desenvolvedor (manuais e importados do GitHub).

| Coluna | Tipo | Nullable | Default | Descrição |
|---|---|---|---|---|
| `id` | `bigint` (PK) | não | auto_increment | Identificador único |
| `profile_id` | `bigint` (FK) | não | — | Referência ao perfil |
| `name` | `varchar(255)` | não | — | Nome do projeto |
| `description` | `text` | não | — | Descrição |
| `technologies` | `jsonb` | sim | null | Lista de tecnologias |
| `repository_url` | `varchar(2048)` | sim | null | URL do repositório |
| `demo_url` | `varchar(2048)` | sim | null | URL de demonstração |
| `image_url` | `varchar(2048)` | sim | null | Imagem do projeto |
| `source` | `varchar(10)` | não | 'manual' | `manual` ou `github` |
| `github_repo_id` | `bigint` | sim | null | ID do repo no GitHub |
| `github_stars` | `integer` | sim | null | Quantidade de stars |
| `github_language` | `varchar(100)` | sim | null | Linguagem principal |
| `created_at` | `timestamp` | sim | now() | Criação do registro |
| `updated_at` | `timestamp` | sim | now() | Última atualização |

**Índices:**
- `PRIMARY KEY (id)`
- `INDEX (profile_id)`
- `UNIQUE (profile_id, github_repo_id)` — impede importação duplicada

**Foreign Keys:**
- `profile_id → profiles(id) ON DELETE CASCADE`

**Check constraints:**
- `source IN ('manual', 'github')`

**Estrutura do campo `technologies` (jsonb):**
```json
["Laravel", "PostgreSQL", "Vue.js", "Docker"]
```

---

## 3. Regras de Integridade Resumidas

| Regra | Implementação |
|---|---|
| 1 user = 1 profile | `UNIQUE (user_id)` em profiles |
| Skill única por perfil | `UNIQUE (profile_id, name)` em skills |
| Em andamento → sem data fim | CHECK constraint em educations e experiences |
| Curso exige carga horária | CHECK constraint em educations |
| Repo GitHub único por perfil | `UNIQUE (profile_id, github_repo_id)` em projects |
| Deletar user cascateia tudo | ON DELETE CASCADE em todas as FKs |

---

## 4. Ordenação Padrão por Tabela

| Tabela | Ordenação padrão |
|---|---|
| `skills` | `name ASC` |
| `educations` | `is_ongoing DESC, start_date DESC NULLS LAST` |
| `experiences` | `is_current DESC, start_date DESC` |
| `projects` | `created_at DESC` |

---

## 5. Considerações para a Busca

A busca de desenvolvedores utiliza consultas diretas no PostgreSQL:

```sql
-- Busca por nome (case-insensitive)
SELECT * FROM profiles WHERE full_name ILIKE '%termo%';

-- Busca por skill
SELECT DISTINCT p.* FROM profiles p
JOIN skills s ON s.profile_id = p.id
WHERE s.name ILIKE '%termo%';
```

> Para o MVP, `ILIKE` é suficiente. Em evolução futura, considerar `pg_trgm` ou full-text search para melhor performance.

---

## 6. Migration Order (Laravel)

Ordem de criação das migrations para respeitar as dependências:

```
1. create_users_table
2. create_profiles_table
3. create_skills_table
4. create_educations_table
5. create_experiences_table
6. create_projects_table
```
