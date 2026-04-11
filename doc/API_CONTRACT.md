# API Contract — Dev Port

> Versão: 2.0
> Data: 2026-04-11
> Status: Draft
> Base URL: `/api/v1`
> Formato: JSON
> Referência: [PRD.md](PRD.md) | [DATA_MODEL.md](DATA_MODEL.md)

---

## Convenções

| Item | Padrão |
|---|---|
| Autenticação | JWT (Bearer Token) — access + refresh |
| Content-Type | `application/json` |
| Paginação | `?page=1&limit=12` |
| Ordenação | Definida por padrão em cada recurso |
| Erros | Formato padronizado (seção 12) |
| Datas | `YYYY-MM-DD` |
| Timestamps | `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601) |
| IDs | UUID v4 |

**Ícones de autenticação:**
- 🔓 Rota pública (sem token)
- 🔒 Rota autenticada (Bearer Token)
- 🔒🧑‍💻 Apenas role `dev`
- 🔒🏢 Apenas role `company`

---

## 1. Auth

### 1.1 Registrar Dev

```
POST /auth/register/dev
```
🔓

**Request:**
```json
{
  "name": "vitorsantos",
  "email": "vitor@email.com",
  "password": "senha123",
  "password_confirmation": "senha123"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "vitorsantos",
      "email": "vitor@email.com",
      "role": "dev",
      "created_at": "2026-04-11T10:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validações:**
- `name`: obrigatório, string, max 255
- `email`: obrigatório, email válido, unique
- `password`: obrigatório, min 8, confirmed

---

### 1.2 Registrar Empresa

```
POST /auth/register/company
```
🔓

**Request:**
```json
{
  "name": "techcorp",
  "email": "rh@techcorp.com",
  "password": "senha123",
  "password_confirmation": "senha123"
}
```

**Response `201 Created`:** mesmo formato do 1.1, com `role: "company"`.

---

### 1.3 Login

```
POST /auth/login
```
🔓

**Request:**
```json
{
  "email": "vitor@email.com",
  "password": "senha123"
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "vitorsantos",
      "email": "vitor@email.com",
      "role": "dev"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Response `401 Unauthorized`:**
```json
{
  "message": "Credenciais inválidas."
}
```

---

### 1.4 Refresh Token

```
POST /auth/refresh
```
🔓

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200 OK`:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Regras:**
- Refresh token antigo é invalidado (rotação)
- Refresh token expirado retorna `401`

---

### 1.5 Logout

```
POST /auth/logout
```
🔒

**Response `200 OK`:**
```json
{
  "message": "Logout realizado com sucesso."
}
```

---

## 2. Dev Profile

### 2.1 Criar perfil

```
POST /dev/profile
```
🔒🧑‍💻

**Request:**
```json
{
  "full_name": "Vitor Santos",
  "title": "Desenvolvedor Full Stack",
  "bio": "Apaixonado por código limpo e boas práticas.",
  "avatar_url": "https://example.com/avatar.jpg",
  "email_contact": "contato@vitor.dev",
  "location": "São Paulo, SP",
  "work_mode": "remote",
  "github_username": "vitorsantos",
  "links": [
    { "label": "LinkedIn", "url": "https://linkedin.com/in/vitorsantos" },
    { "label": "Site", "url": "https://vitor.dev" }
  ]
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "Vitor Santos",
    "title": "Desenvolvedor Full Stack",
    "bio": "Apaixonado por código limpo e boas práticas.",
    "avatar_url": "https://example.com/avatar.jpg",
    "email_contact": "contato@vitor.dev",
    "location": "São Paulo, SP",
    "work_mode": "remote",
    "github_username": "vitorsantos",
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/in/vitorsantos" },
      { "label": "Site", "url": "https://vitor.dev" }
    ],
    "created_at": "2026-04-11T10:00:00Z",
    "updated_at": "2026-04-11T10:00:00Z"
  }
}
```

**Validações:**
- `full_name`: obrigatório, string, max 255
- `title`: obrigatório, string, max 255
- `bio`: obrigatório, string, max 500
- `avatar_url`: opcional, url válida, max 2048
- `email_contact`: obrigatório, email válido
- `location`: opcional, string, max 255
- `work_mode`: opcional, enum: `onsite`, `hybrid`, `remote`
- `github_username`: opcional, string, max 255
- `links`: opcional, array de `{ label: string, url: string(url) }`
- Retorna `409` se perfil já existir

---

### 2.2 Ver perfil próprio

```
GET /dev/profile
```
🔒🧑‍💻

**Response `200 OK`:** mesmo formato do 2.1 response.

**Response `404 Not Found`:** perfil não criado.

---

### 2.3 Atualizar perfil

```
PUT /dev/profile
```
🔒🧑‍💻

**Request:** mesmos campos do 2.1 (parcial — enviar apenas o que atualizar).

**Response `200 OK`:** perfil atualizado completo.

---

## 3. Dev Skills

### 3.1 Listar skills do dev

```
GET /dev/skills
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440010",
      "skill": {
        "id": "880e8400-e29b-41d4-a716-446655440020",
        "name": "TypeScript",
        "slug": "typescript",
        "category": "language"
      },
      "level": "advanced",
      "years_experience": 4,
      "created_at": "2026-04-11T10:00:00Z",
      "updated_at": "2026-04-11T10:00:00Z"
    }
  ]
}
```

---

### 3.2 Adicionar skill

```
POST /dev/skills
```
🔒🧑‍💻

**Request:**
```json
{
  "skill_id": "880e8400-e29b-41d4-a716-446655440020",
  "level": "advanced",
  "years_experience": 4
}
```

**Response `201 Created`:** skill criada (formato do 3.1 item).

**Validações:**
- `skill_id`: obrigatório, uuid, deve existir em skill_tree
- `level`: obrigatório, enum: `beginner`, `intermediate`, `advanced`, `expert`
- `years_experience`: opcional, integer, min 0
- Skill duplicada → `422`
- Máximo 50 skills → `422`

---

### 3.3 Atualizar skill

```
PUT /dev/skills/{devSkillId}
```
🔒🧑‍💻

**Request:**
```json
{
  "skill_id": "880e8400-e29b-41d4-a716-446655440020",
  "level": "expert",
  "years_experience": 5
}
```

**Response `200 OK`:** skill atualizada.

---

### 3.4 Remover skill

```
DELETE /dev/skills/{devSkillId}
```
🔒🧑‍💻

**Response `204 No Content`**

---

## 4. Education

### 4.1 Listar formações

```
GET /dev/educations
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440030",
      "institution": "FIAP",
      "course": "Análise e Desenvolvimento de Sistemas",
      "type": "graduation",
      "workload_hours": null,
      "start_date": "2022-02-01",
      "end_date": null,
      "is_ongoing": true,
      "created_at": "2026-04-11T10:00:00Z",
      "updated_at": "2026-04-11T10:00:00Z"
    }
  ]
}
```

> Ordenação: `is_ongoing DESC, start_date DESC NULLS LAST`

---

### 4.2 Adicionar formação

```
POST /dev/educations
```
🔒🧑‍💻

**Request:**
```json
{
  "institution": "Alura",
  "course": "NestJS do Zero ao Deploy",
  "type": "course",
  "workload_hours": 40,
  "start_date": "2026-01-15",
  "end_date": "2026-02-20",
  "is_ongoing": false
}
```

**Response `201 Created`:** formação criada.

**Validações:**
- `institution`: obrigatório, string, max 255
- `course`: obrigatório, string, max 255
- `type`: obrigatório, enum: `technical`, `graduation`, `master`, `doctorate`, `postdoc`, `mba`, `course`, `certification`
- `workload_hours`: obrigatório se `type = course`, integer, min 1
- `start_date`: opcional, date
- `end_date`: opcional, date, ≥ start_date
- `is_ongoing`: opcional, boolean, default false
- Se `is_ongoing = true` e `end_date` preenchido → `422`

---

### 4.3 Atualizar formação

```
PUT /dev/educations/{educationId}
```
🔒🧑‍💻

**Response `200 OK`:** formação atualizada.

---

### 4.4 Remover formação

```
DELETE /dev/educations/{educationId}
```
🔒🧑‍💻

**Response `204 No Content`**

---

## 5. Experience

### 5.1 Listar experiências

```
GET /dev/experiences
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440040",
      "company": "Empresa X",
      "position": "Desenvolvedor Pleno",
      "description": "Desenvolvimento de APIs RESTful com NestJS.",
      "start_date": "2024-03-01",
      "end_date": null,
      "is_current": true,
      "created_at": "2026-04-11T10:00:00Z",
      "updated_at": "2026-04-11T10:00:00Z"
    }
  ]
}
```

> Ordenação: `is_current DESC, start_date DESC`

---

### 5.2 Adicionar experiência

```
POST /dev/experiences
```
🔒🧑‍💻

**Request:**
```json
{
  "company": "Empresa X",
  "position": "Desenvolvedor Pleno",
  "description": "Desenvolvimento de APIs RESTful com NestJS.",
  "start_date": "2024-03-01",
  "end_date": null,
  "is_current": true
}
```

**Response `201 Created`:** experiência criada.

**Validações:**
- `company`: obrigatório, string, max 255
- `position`: obrigatório, string, max 255
- `description`: opcional, text
- `start_date`: obrigatório, date
- `end_date`: opcional, date, ≥ start_date
- `is_current`: opcional, boolean, default false
- Se `is_current = true` e `end_date` preenchido → `422`

---

### 5.3 Atualizar experiência

```
PUT /dev/experiences/{experienceId}
```
🔒🧑‍💻

**Response `200 OK`:** experiência atualizada.

---

### 5.4 Remover experiência

```
DELETE /dev/experiences/{experienceId}
```
🔒🧑‍💻

**Response `204 No Content`**

---

## 6. Projects

### 6.1 Listar projetos

```
GET /dev/projects
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440050",
      "name": "Dev Port",
      "description": "Plataforma de recrutamento para devs.",
      "technologies": ["NestJS", "Angular", "PostgreSQL"],
      "repository_url": "https://github.com/vitor/devport",
      "demo_url": "https://devport.app",
      "image_url": null,
      "source": "manual",
      "github_repo_id": null,
      "github_stars": null,
      "github_language": null,
      "created_at": "2026-04-11T10:00:00Z",
      "updated_at": "2026-04-11T10:00:00Z"
    }
  ]
}
```

> Ordenação: `created_at DESC`

---

### 6.2 Adicionar projeto

```
POST /dev/projects
```
🔒🧑‍💻

**Request:**
```json
{
  "name": "Dev Port",
  "description": "Plataforma de recrutamento para devs.",
  "technologies": ["NestJS", "Angular", "PostgreSQL"],
  "repository_url": "https://github.com/vitor/devport",
  "demo_url": "https://devport.app",
  "image_url": null
}
```

**Response `201 Created`:** projeto criado com `source: "manual"`.

**Validações:**
- `name`: obrigatório, string, max 255
- `description`: obrigatório, text
- `technologies`: opcional, array de strings
- `repository_url`: opcional, url válida, max 2048
- `demo_url`: opcional, url válida, max 2048
- `image_url`: opcional, url válida, max 2048

---

### 6.3 Atualizar projeto

```
PUT /dev/projects/{projectId}
```
🔒🧑‍💻

**Response `200 OK`:** projeto atualizado.

---

### 6.4 Remover projeto

```
DELETE /dev/projects/{projectId}
```
🔒🧑‍💻

**Response `204 No Content`**

---

## 7. GitHub Integration

### 7.1 Listar repositórios do GitHub

```
GET /dev/github/repositories
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": [
    {
      "github_repo_id": 123456,
      "name": "devport",
      "description": "Plataforma de recrutamento para devs.",
      "language": "TypeScript",
      "stars": 12,
      "url": "https://github.com/vitor/devport",
      "already_imported": false
    }
  ]
}
```

**Erros:**
- `404` — perfil sem `github_username`
- `502` — falha na API do GitHub

---

### 7.2 Importar repositórios

```
POST /dev/github/import
```
🔒🧑‍💻

**Request:**
```json
{
  "repositories": [123456, 789012]
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "imported": 1,
    "skipped": 1,
    "projects": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440060",
        "name": "devport",
        "source": "github",
        "github_repo_id": 123456,
        "github_stars": 12,
        "github_language": "TypeScript",
        "repository_url": "https://github.com/vitor/devport"
      }
    ]
  }
}
```

---

### 7.3 Sincronizar repositórios

```
POST /dev/github/sync
```
🔒🧑‍💻

**Response `200 OK`:**
```json
{
  "data": {
    "synced": 3,
    "failed": 0
  }
}
```

---

## 8. Company Profile

### 8.1 Criar perfil da empresa

```
POST /company/profile
```
🔒🏢

**Request:**
```json
{
  "company_name": "TechCorp",
  "cnpj": "12.345.678/0001-90",
  "description": "Empresa de tecnologia focada em soluções cloud.",
  "logo_url": "https://example.com/logo.png",
  "website": "https://techcorp.com",
  "industry": "Tecnologia da Informação",
  "size": "medium",
  "location": "São Paulo, SP",
  "links": [
    { "label": "LinkedIn", "url": "https://linkedin.com/company/techcorp" }
  ]
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440070",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "company_name": "TechCorp",
    "cnpj": "12.345.678/0001-90",
    "description": "Empresa de tecnologia focada em soluções cloud.",
    "logo_url": "https://example.com/logo.png",
    "website": "https://techcorp.com",
    "industry": "Tecnologia da Informação",
    "size": "medium",
    "location": "São Paulo, SP",
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/company/techcorp" }
    ],
    "created_at": "2026-04-11T10:00:00Z",
    "updated_at": "2026-04-11T10:00:00Z"
  }
}
```

**Validações:**
- `company_name`: obrigatório, string, max 255
- `cnpj`: obrigatório, string, formato válido, unique
- `description`: obrigatório, string, max 1000
- `logo_url`: opcional, url válida, max 2048
- `website`: opcional, url válida, max 2048
- `industry`: obrigatório, string, max 255
- `size`: obrigatório, enum: `startup`, `small`, `medium`, `large`, `enterprise`
- `location`: obrigatório, string, max 255
- `links`: opcional, array de `{ label, url }`
- Retorna `409` se perfil já existir

---

### 8.2 Ver perfil próprio

```
GET /company/profile
```
🔒🏢

**Response `200 OK`:** mesmo formato do 8.1 response.

---

### 8.3 Atualizar perfil

```
PUT /company/profile
```
🔒🏢

**Response `200 OK`:** perfil atualizado.

---

## 9. Jobs

### 9.1 Listar vagas da empresa

```
GET /company/jobs
```
🔒🏢

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440080",
      "title": "Desenvolvedor Angular Pleno",
      "description": "Buscamos dev Angular para nosso time de produto...",
      "skills": [
        {
          "skill": {
            "id": "880e8400-e29b-41d4-a716-446655440020",
            "name": "Angular",
            "slug": "angular",
            "category": "framework"
          },
          "min_level": "intermediate"
        },
        {
          "skill": {
            "id": "880e8400-e29b-41d4-a716-446655440021",
            "name": "TypeScript",
            "slug": "typescript",
            "category": "language"
          },
          "min_level": "advanced"
        }
      ],
      "min_experience_years": 3,
      "contract_model": "clt",
      "salary_min": 8000.00,
      "salary_max": 12000.00,
      "work_mode": "hybrid",
      "location": "São Paulo, SP",
      "status": "open",
      "created_at": "2026-04-11T10:00:00Z",
      "updated_at": "2026-04-11T10:00:00Z"
    }
  ]
}
```

> Faixa salarial visível **apenas** neste endpoint (empresa dona).
> Ordenação: `status ASC (open first), created_at DESC`

---

### 9.2 Publicar vaga

```
POST /company/jobs
```
🔒🏢

**Request:**
```json
{
  "title": "Desenvolvedor Angular Pleno",
  "description": "Buscamos dev Angular para nosso time de produto...",
  "skills": [
    { "skill_id": "880e8400-e29b-41d4-a716-446655440020", "min_level": "intermediate" },
    { "skill_id": "880e8400-e29b-41d4-a716-446655440021", "min_level": "advanced" }
  ],
  "min_experience_years": 3,
  "contract_model": "clt",
  "salary_min": 8000.00,
  "salary_max": 12000.00,
  "work_mode": "hybrid",
  "location": "São Paulo, SP"
}
```

**Response `201 Created`:** vaga criada com `status: "open"`.

**Validações:**
- `title`: obrigatório, string, max 255
- `description`: obrigatório, text
- `skills`: obrigatório, array de `{ skill_id: uuid, min_level: enum }`
- `skills[].skill_id`: deve existir em skill_tree
- `skills[].min_level`: enum: `beginner`, `intermediate`, `advanced`, `expert`
- `min_experience_years`: obrigatório, integer, min 0
- `contract_model`: obrigatório, enum: `clt`, `pj`, `clt_pj`
- `salary_min`: obrigatório, decimal, min 0
- `salary_max`: obrigatório, decimal, ≥ salary_min
- `work_mode`: obrigatório, enum: `onsite`, `hybrid`, `remote`
- `location`: obrigatório se `work_mode` = `onsite` ou `hybrid`, string, max 255

---

### 9.3 Atualizar vaga

```
PUT /company/jobs/{jobId}
```
🔒🏢

**Response `200 OK`:** vaga atualizada.

---

### 9.4 Fechar vaga

```
PATCH /company/jobs/{jobId}/close
```
🔒🏢

**Response `200 OK`:**
```json
{
  "data": {
    "id": "ee0e8400-e29b-41d4-a716-446655440080",
    "status": "closed",
    "updated_at": "2026-04-11T15:00:00Z"
  }
}
```

---

### 9.5 Remover vaga

```
DELETE /company/jobs/{jobId}
```
🔒🏢

**Response `204 No Content`**

---

## 10. Skill Tree (Público)

### 10.1 Listar skills

```
GET /skills
```
🔓

**Query Parameters:**

| Param | Tipo | Descrição |
|---|---|---|
| `category` | string | Filtra por categoria |
| `q` | string | Busca no nome (ILIKE) |
| `parent_id` | uuid | Filtra filhos de uma skill |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440020",
      "name": "Angular",
      "slug": "angular",
      "category": "framework",
      "parent_id": null,
      "children": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440025",
          "name": "Angular Material",
          "slug": "angular-material",
          "category": "framework",
          "parent_id": "880e8400-e29b-41d4-a716-446655440020"
        }
      ]
    }
  ]
}
```

---

### 10.2 Listar categorias

```
GET /skills/categories
```
🔓

**Response `200 OK`:**
```json
{
  "data": [
    "language",
    "framework",
    "database",
    "devops",
    "tool",
    "methodology",
    "soft_skill",
    "other"
  ]
}
```

---

## 11. Search & Matching (Público / Autenticado)

### 11.1 Buscar vagas

```
GET /jobs
```
🔓 (público vê vagas; 🔒🧑‍💻 dev logado vê com match score)

**Query Parameters:**

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | Busca no título e descrição |
| `skill` | uuid | Filtra por skill exigida |
| `work_mode` | string | `onsite`, `hybrid`, `remote` |
| `contract_model` | string | `clt`, `pj`, `clt_pj` |
| `location` | string | Busca textual na localização |
| `sort` | string | `match_score`, `recent`, `experience_asc` |
| `page` | integer | Página (default: 1) |
| `limit` | integer | Itens por página (default: 12, max: 50) |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "ee0e8400-e29b-41d4-a716-446655440080",
      "title": "Desenvolvedor Angular Pleno",
      "description": "Buscamos dev Angular para nosso time de produto...",
      "skills": [
        {
          "skill": { "id": "...", "name": "Angular", "slug": "angular", "category": "framework" },
          "min_level": "intermediate"
        }
      ],
      "min_experience_years": 3,
      "contract_model": "clt",
      "work_mode": "hybrid",
      "location": "São Paulo, SP",
      "status": "open",
      "company": {
        "id": "dd0e8400-e29b-41d4-a716-446655440070",
        "company_name": "TechCorp",
        "logo_url": "https://example.com/logo.png"
      },
      "match_score": 85,
      "created_at": "2026-04-11T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "limit": 12,
    "total": 45,
    "last_page": 4
  }
}
```

**Regras:**
- `match_score` só aparece se dev estiver autenticado
- Apenas vagas `open`
- Default sort: `match_score` (dev logado) ou `recent` (visitante)
- Faixa salarial **nunca** é retornada neste endpoint

---

### 11.2 Ver vaga pública

```
GET /jobs/{jobId}
```
🔓 (🔒🧑‍💻 dev logado vê com match score)

**Response `200 OK`:**
```json
{
  "data": {
    "id": "ee0e8400-e29b-41d4-a716-446655440080",
    "title": "Desenvolvedor Angular Pleno",
    "description": "Buscamos dev Angular para nosso time de produto...",
    "skills": [
      {
        "skill": { "id": "...", "name": "Angular", "slug": "angular", "category": "framework" },
        "min_level": "intermediate"
      },
      {
        "skill": { "id": "...", "name": "TypeScript", "slug": "typescript", "category": "language" },
        "min_level": "advanced"
      }
    ],
    "min_experience_years": 3,
    "contract_model": "clt",
    "work_mode": "hybrid",
    "location": "São Paulo, SP",
    "status": "open",
    "company": {
      "id": "dd0e8400-e29b-41d4-a716-446655440070",
      "company_name": "TechCorp",
      "logo_url": "https://example.com/logo.png",
      "industry": "Tecnologia da Informação",
      "size": "medium",
      "location": "São Paulo, SP"
    },
    "match_score": 85,
    "created_at": "2026-04-11T10:00:00Z"
  }
}
```

> `match_score` presente apenas se dev autenticado. Salário nunca visível.

---

### 11.3 Buscar devs (empresa)

```
GET /developers
```
🔒🏢

**Query Parameters:**

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | Busca no nome |
| `skill` | uuid | Filtra por skill |
| `min_level` | string | Nível mínimo na skill filtrada |
| `location` | string | Busca textual |
| `job_id` | uuid | Vaga de referência para cálculo de match |
| `page` | integer | Página (default: 1) |
| `limit` | integer | Itens por página (default: 12, max: 50) |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "full_name": "Vitor Santos",
      "title": "Desenvolvedor Full Stack",
      "avatar_url": "https://example.com/avatar.jpg",
      "location": "São Paulo, SP",
      "work_mode": "remote",
      "skills": [
        { "name": "Angular", "level": "advanced" },
        { "name": "TypeScript", "level": "advanced" }
      ],
      "match_score": 85
    }
  ],
  "meta": {
    "current_page": 1,
    "limit": 12,
    "total": 30,
    "last_page": 3
  }
}
```

> `match_score` presente apenas se `job_id` informado.

---

### 11.4 Buscar devs (público)

```
GET /developers/search
```
🔓

**Query Parameters:**

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | Busca no nome |
| `skill` | uuid | Filtra por skill |
| `page` | integer | Página (default: 1) |
| `limit` | integer | Itens por página (default: 12, max: 50) |

**Response `200 OK`:** mesmo formato do 11.3 sem `match_score`.

---

### 11.5 Ver perfil público do dev

```
GET /developers/{devProfileId}
```
🔓

**Response `200 OK`:**
```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "full_name": "Vitor Santos",
    "title": "Desenvolvedor Full Stack",
    "bio": "Apaixonado por código limpo e boas práticas.",
    "avatar_url": "https://example.com/avatar.jpg",
    "email_contact": "contato@vitor.dev",
    "location": "São Paulo, SP",
    "work_mode": "remote",
    "github_username": "vitorsantos",
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/in/vitorsantos" }
    ],
    "skills": [
      {
        "skill": { "id": "...", "name": "Angular", "slug": "angular", "category": "framework" },
        "level": "advanced",
        "years_experience": 4
      }
    ],
    "educations": [],
    "experiences": [],
    "projects": [],
    "created_at": "2026-04-11T10:00:00Z"
  }
}
```

---

### 11.6 Ver perfil público da empresa

```
GET /companies/{companyProfileId}
```
🔓

**Response `200 OK`:**
```json
{
  "data": {
    "id": "dd0e8400-e29b-41d4-a716-446655440070",
    "company_name": "TechCorp",
    "cnpj": "12.345.678/0001-90",
    "description": "Empresa de tecnologia focada em soluções cloud.",
    "logo_url": "https://example.com/logo.png",
    "website": "https://techcorp.com",
    "industry": "Tecnologia da Informação",
    "size": "medium",
    "location": "São Paulo, SP",
    "links": [],
    "open_jobs": [
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440080",
        "title": "Desenvolvedor Angular Pleno",
        "work_mode": "hybrid",
        "contract_model": "clt",
        "location": "São Paulo, SP",
        "created_at": "2026-04-11T10:00:00Z"
      }
    ],
    "created_at": "2026-04-11T10:00:00Z"
  }
}
```

> Salário **nunca** visível no perfil público. Apenas vagas `open`.

---

## 12. Padrão de Erros

```json
{
  "statusCode": 422,
  "message": "Erro de validação.",
  "errors": {
    "campo": ["Mensagem específica."]
  }
}
```

**Códigos HTTP:**

| Código | Uso |
|---|---|
| `200` | Sucesso (GET, PUT, PATCH) |
| `201` | Recurso criado (POST) |
| `204` | Sucesso sem body (DELETE) |
| `401` | Não autenticado / token inválido |
| `403` | Sem permissão (role errado / recurso de outro usuário) |
| `404` | Recurso não encontrado |
| `409` | Conflito (perfil já existe, CNPJ duplicado) |
| `422` | Erro de validação |
| `429` | Rate limit |
| `502` | Falha em serviço externo (GitHub API) |

---

## 13. Resumo de Endpoints

### Auth (3 públicos, 1 autenticado)

| # | Método | Endpoint | Auth | Descrição |
|---|---|---|---|---|
| 1.1 | POST | `/auth/register/dev` | 🔓 | Registrar dev |
| 1.2 | POST | `/auth/register/company` | 🔓 | Registrar empresa |
| 1.3 | POST | `/auth/login` | 🔓 | Login |
| 1.4 | POST | `/auth/refresh` | 🔓 | Renovar token |
| 1.5 | POST | `/auth/logout` | 🔒 | Logout |

### Dev (18 endpoints autenticados)

| # | Método | Endpoint | Auth | Descrição |
|---|---|---|---|---|
| 2.1 | POST | `/dev/profile` | 🔒🧑‍💻 | Criar perfil |
| 2.2 | GET | `/dev/profile` | 🔒🧑‍💻 | Ver perfil próprio |
| 2.3 | PUT | `/dev/profile` | 🔒🧑‍💻 | Atualizar perfil |
| 3.1 | GET | `/dev/skills` | 🔒🧑‍💻 | Listar skills |
| 3.2 | POST | `/dev/skills` | 🔒🧑‍💻 | Adicionar skill |
| 3.3 | PUT | `/dev/skills/{id}` | 🔒🧑‍💻 | Atualizar skill |
| 3.4 | DELETE | `/dev/skills/{id}` | 🔒🧑‍💻 | Remover skill |
| 4.1 | GET | `/dev/educations` | 🔒🧑‍💻 | Listar formações |
| 4.2 | POST | `/dev/educations` | 🔒🧑‍💻 | Adicionar formação |
| 4.3 | PUT | `/dev/educations/{id}` | 🔒🧑‍💻 | Atualizar formação |
| 4.4 | DELETE | `/dev/educations/{id}` | 🔒🧑‍💻 | Remover formação |
| 5.1 | GET | `/dev/experiences` | 🔒🧑‍💻 | Listar experiências |
| 5.2 | POST | `/dev/experiences` | 🔒🧑‍💻 | Adicionar experiência |
| 5.3 | PUT | `/dev/experiences/{id}` | 🔒🧑‍💻 | Atualizar experiência |
| 5.4 | DELETE | `/dev/experiences/{id}` | 🔒🧑‍💻 | Remover experiência |
| 6.1 | GET | `/dev/projects` | 🔒🧑‍💻 | Listar projetos |
| 6.2 | POST | `/dev/projects` | 🔒🧑‍💻 | Adicionar projeto |
| 6.3 | PUT | `/dev/projects/{id}` | 🔒🧑‍💻 | Atualizar projeto |
| 6.4 | DELETE | `/dev/projects/{id}` | 🔒🧑‍💻 | Remover projeto |
| 7.1 | GET | `/dev/github/repositories` | 🔒🧑‍💻 | Listar repos GitHub |
| 7.2 | POST | `/dev/github/import` | 🔒🧑‍💻 | Importar repos |
| 7.3 | POST | `/dev/github/sync` | 🔒🧑‍💻 | Sincronizar repos |

### Company (7 endpoints autenticados)

| # | Método | Endpoint | Auth | Descrição |
|---|---|---|---|---|
| 8.1 | POST | `/company/profile` | 🔒🏢 | Criar perfil |
| 8.2 | GET | `/company/profile` | 🔒🏢 | Ver perfil próprio |
| 8.3 | PUT | `/company/profile` | 🔒🏢 | Atualizar perfil |
| 9.1 | GET | `/company/jobs` | 🔒🏢 | Listar vagas |
| 9.2 | POST | `/company/jobs` | 🔒🏢 | Publicar vaga |
| 9.3 | PUT | `/company/jobs/{id}` | 🔒🏢 | Atualizar vaga |
| 9.4 | PATCH | `/company/jobs/{id}/close` | 🔒🏢 | Fechar vaga |
| 9.5 | DELETE | `/company/jobs/{id}` | 🔒🏢 | Remover vaga |

### Público (8 endpoints)

| # | Método | Endpoint | Auth | Descrição |
|---|---|---|---|---|
| 10.1 | GET | `/skills` | 🔓 | Listar árvore de skills |
| 10.2 | GET | `/skills/categories` | 🔓 | Listar categorias |
| 11.1 | GET | `/jobs` | 🔓* | Buscar vagas |
| 11.2 | GET | `/jobs/{id}` | 🔓* | Ver vaga |
| 11.3 | GET | `/developers` | 🔒🏢 | Buscar devs (empresa) |
| 11.4 | GET | `/developers/search` | 🔓 | Buscar devs (público) |
| 11.5 | GET | `/developers/{id}` | 🔓 | Ver perfil dev público |
| 11.6 | GET | `/companies/{id}` | 🔓 | Ver perfil empresa público |

> 🔓* = público, mas se dev autenticado, inclui `match_score`

> **Total: 40 endpoints** — 11 públicos, 22 dev, 8 empresa
