# API Contract — Dev Port (MVP)

> Versão: 1.0
> Data: 2026-04-09
> Status: Draft
> Base URL: `/api/v1`
> Formato: JSON
> Referência: [PRD.md](PRD.md) | [DATA_MODEL.md](DATA_MODEL.md)

---

## Convenções

| Item | Padrão |
|---|---|
| Autenticação | Laravel Sanctum (Bearer Token) |
| Content-Type | `application/json` |
| Paginação | `?page=1&per_page=12` |
| Ordenação | Definida por padrão em cada recurso |
| Erros | Formato padronizado (seção 9) |
| Datas | `YYYY-MM-DD` |
| Timestamps | `YYYY-MM-DDTHH:mm:ssZ` (ISO 8601) |

**Ícones de autenticação:**
- 🔓 Rota pública (sem token)
- 🔒 Rota autenticada (Bearer Token obrigatório)

---

## 1. Auth

### 1.1 Registrar

```
POST /auth/register
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
      "id": 1,
      "name": "vitorsantos",
      "email": "vitor@email.com",
      "created_at": "2026-04-09T10:00:00Z"
    },
    "token": "1|abc123tokenhere..."
  }
}
```

**Validações:**
- `name`: obrigatório, string, max 255
- `email`: obrigatório, email válido, unique
- `password`: obrigatório, min 8, confirmed

---

### 1.2 Login

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
      "id": 1,
      "name": "vitorsantos",
      "email": "vitor@email.com"
    },
    "token": "2|xyz789tokenhere..."
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

### 1.3 Logout

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

## 2. Profile

### 2.1 Criar perfil

```
POST /profile
```
🔒

**Request:**
```json
{
  "full_name": "Vitor Santos",
  "title": "Desenvolvedor Full Stack",
  "bio": "Apaixonado por código limpo e boas práticas.",
  "avatar_url": "https://example.com/avatar.jpg",
  "email_contact": "contato@vitor.dev",
  "location": "São Paulo, SP",
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
    "id": 1,
    "user_id": 1,
    "full_name": "Vitor Santos",
    "title": "Desenvolvedor Full Stack",
    "bio": "Apaixonado por código limpo e boas práticas.",
    "avatar_url": "https://example.com/avatar.jpg",
    "email_contact": "contato@vitor.dev",
    "location": "São Paulo, SP",
    "github_username": "vitorsantos",
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/in/vitorsantos" },
      { "label": "Site", "url": "https://vitor.dev" }
    ],
    "created_at": "2026-04-09T10:00:00Z",
    "updated_at": "2026-04-09T10:00:00Z"
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
- `github_username`: opcional, string, max 255
- `links`: opcional, array de objetos `{ label, url }`
- Usuário pode ter apenas 1 perfil → retorna `409` se já existir

---

### 2.2 Visualizar perfil próprio

```
GET /profile
```
🔒

**Response `200 OK`:** mesmo formato do 2.1 response.

**Response `404 Not Found`:** perfil ainda não criado.

---

### 2.3 Atualizar perfil

```
PUT /profile
```
🔒

**Request:** mesmos campos do 2.1 (enviar apenas os campos a atualizar).

**Response `200 OK`:** perfil atualizado completo.

---

### 2.4 Visualizar perfil público (por ID)

```
GET /profiles/{profileId}
```
🔓

**Response `200 OK`:**
```json
{
  "data": {
    "id": 1,
    "full_name": "Vitor Santos",
    "title": "Desenvolvedor Full Stack",
    "bio": "Apaixonado por código limpo e boas práticas.",
    "avatar_url": "https://example.com/avatar.jpg",
    "email_contact": "contato@vitor.dev",
    "location": "São Paulo, SP",
    "github_username": "vitorsantos",
    "links": [
      { "label": "LinkedIn", "url": "https://linkedin.com/in/vitorsantos" }
    ],
    "skills": [],
    "educations": [],
    "experiences": [],
    "projects": [],
    "created_at": "2026-04-09T10:00:00Z"
  }
}
```

> Perfil público inclui todos os relacionamentos carregados.

---

## 3. Skills

### 3.1 Listar skills do perfil

```
GET /profile/skills
```
🔒

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Laravel",
      "type": "hard",
      "level": "advanced"
    },
    {
      "id": 2,
      "name": "Comunicação",
      "type": "soft",
      "level": null
    }
  ]
}
```

---

### 3.2 Adicionar skill

```
POST /profile/skills
```
🔒

**Request:**
```json
{
  "name": "Laravel",
  "type": "hard",
  "level": "advanced"
}
```

**Response `201 Created`:**
```json
{
  "data": {
    "id": 1,
    "name": "Laravel",
    "type": "hard",
    "level": "advanced",
    "created_at": "2026-04-09T10:00:00Z",
    "updated_at": "2026-04-09T10:00:00Z"
  }
}
```

**Validações:**
- `name`: obrigatório, string, max 100, unique por perfil
- `type`: obrigatório, enum: `hard`, `soft`
- `level`: opcional, enum: `beginner`, `intermediate`, `advanced`
- Máximo 30 skills por perfil → retorna `422` se exceder

---

### 3.3 Atualizar skill

```
PUT /profile/skills/{skillId}
```
🔒

**Request:** mesmos campos do 3.2.

**Response `200 OK`:** skill atualizada.

---

### 3.4 Remover skill

```
DELETE /profile/skills/{skillId}
```
🔒

**Response `204 No Content`**

---

## 4. Education

### 4.1 Listar formações

```
GET /profile/educations
```
🔒

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "institution": "FIAP",
      "course": "Análise e Desenvolvimento de Sistemas",
      "type": "graduation",
      "workload_hours": null,
      "start_date": "2022-02-01",
      "end_date": null,
      "is_ongoing": true,
      "created_at": "2026-04-09T10:00:00Z",
      "updated_at": "2026-04-09T10:00:00Z"
    }
  ]
}
```

> Ordenação padrão: `is_ongoing DESC, start_date DESC NULLS LAST`

---

### 4.2 Adicionar formação

```
POST /profile/educations
```
🔒

**Request:**
```json
{
  "institution": "Alura",
  "course": "Laravel do Zero ao Deploy",
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
- `end_date`: opcional, date, deve ser ≥ start_date
- `is_ongoing`: opcional, boolean, default false
- Se `is_ongoing = true`, `end_date` deve ser nulo → retorna `422` se conflitar

---

### 4.3 Atualizar formação

```
PUT /profile/educations/{educationId}
```
🔒

**Request:** mesmos campos do 4.2.

**Response `200 OK`:** formação atualizada.

---

### 4.4 Remover formação

```
DELETE /profile/educations/{educationId}
```
🔒

**Response `204 No Content`**

---

## 5. Experience

### 5.1 Listar experiências

```
GET /profile/experiences
```
🔒

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "company": "Empresa X",
      "position": "Desenvolvedor Pleno",
      "description": "Desenvolvimento de APIs RESTful com Laravel.",
      "start_date": "2024-03-01",
      "end_date": null,
      "is_current": true,
      "created_at": "2026-04-09T10:00:00Z",
      "updated_at": "2026-04-09T10:00:00Z"
    }
  ]
}
```

> Ordenação padrão: `is_current DESC, start_date DESC`

---

### 5.2 Adicionar experiência

```
POST /profile/experiences
```
🔒

**Request:**
```json
{
  "company": "Empresa X",
  "position": "Desenvolvedor Pleno",
  "description": "Desenvolvimento de APIs RESTful com Laravel.",
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
- `end_date`: opcional, date, deve ser ≥ start_date
- `is_current`: opcional, boolean, default false
- Se `is_current = true`, `end_date` deve ser nulo → retorna `422`

---

### 5.3 Atualizar experiência

```
PUT /profile/experiences/{experienceId}
```
🔒

**Request:** mesmos campos do 5.2.

**Response `200 OK`:** experiência atualizada.

---

### 5.4 Remover experiência

```
DELETE /profile/experiences/{experienceId}
```
🔒

**Response `204 No Content`**

---

## 6. Projects

### 6.1 Listar projetos

```
GET /profile/projects
```
🔒

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Dev Port",
      "description": "Plataforma de currículos para devs.",
      "technologies": ["Laravel", "PostgreSQL", "Vue.js"],
      "repository_url": "https://github.com/vitor/devport",
      "demo_url": "https://devport.app",
      "image_url": null,
      "source": "manual",
      "github_repo_id": null,
      "github_stars": null,
      "github_language": null,
      "created_at": "2026-04-09T10:00:00Z",
      "updated_at": "2026-04-09T10:00:00Z"
    }
  ]
}
```

> Ordenação padrão: `created_at DESC`

---

### 6.2 Adicionar projeto

```
POST /profile/projects
```
🔒

**Request:**
```json
{
  "name": "Dev Port",
  "description": "Plataforma de currículos para devs.",
  "technologies": ["Laravel", "PostgreSQL", "Vue.js"],
  "repository_url": "https://github.com/vitor/devport",
  "demo_url": "https://devport.app",
  "image_url": null
}
```

**Response `201 Created`:** projeto criado com `source: manual`.

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
PUT /profile/projects/{projectId}
```
🔒

**Request:** mesmos campos do 6.2.

**Response `200 OK`:** projeto atualizado.

---

### 6.4 Remover projeto

```
DELETE /profile/projects/{projectId}
```
🔒

**Response `204 No Content`**

---

## 7. GitHub Integration

### 7.1 Listar repositórios do GitHub

```
GET /profile/github/repositories
```
🔒

> Busca repos públicos do `github_username` cadastrado no perfil.

**Response `200 OK`:**
```json
{
  "data": [
    {
      "github_repo_id": 123456,
      "name": "devport",
      "description": "Plataforma de currículos para devs.",
      "language": "PHP",
      "stars": 12,
      "url": "https://github.com/vitor/devport",
      "already_imported": false
    },
    {
      "github_repo_id": 789012,
      "name": "dotfiles",
      "description": "Minhas configurações",
      "language": "Shell",
      "stars": 3,
      "url": "https://github.com/vitor/dotfiles",
      "already_imported": true
    }
  ]
}
```

**Erros:**
- `404` — perfil sem `github_username` configurado
- `502` — falha ao comunicar com a API do GitHub

---

### 7.2 Importar repositórios

```
POST /profile/github/import
```
🔒

**Request:**
```json
{
  "repositories": [123456, 789012]
}
```

> Array de `github_repo_id` selecionados pelo usuário.

**Response `201 Created`:**
```json
{
  "data": {
    "imported": 1,
    "skipped": 1,
    "projects": [
      {
        "id": 5,
        "name": "devport",
        "description": "Plataforma de currículos para devs.",
        "source": "github",
        "github_repo_id": 123456,
        "github_stars": 12,
        "github_language": "PHP",
        "repository_url": "https://github.com/vitor/devport"
      }
    ]
  }
}
```

**Validações:**
- `repositories`: obrigatório, array de integers
- Repos já importados são ignorados (skipped)

---

### 7.3 Sincronizar repositórios importados

```
POST /profile/github/sync
```
🔒

> Atualiza dados de todos os projetos com `source: github`.

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

## 8. Search (Público)

### 8.1 Buscar desenvolvedores

```
GET /developers
```
🔓

**Query Parameters:**

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | Busca por nome (ILIKE) |
| `skill` | string | Filtra por nome da skill (ILIKE) |
| `page` | integer | Página (default: 1) |
| `per_page` | integer | Itens por página (default: 12, max: 50) |

**Exemplos:**
```
GET /developers?q=vitor
GET /developers?skill=laravel
GET /developers?q=vitor&skill=laravel&page=2
```

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Vitor Santos",
      "title": "Desenvolvedor Full Stack",
      "avatar_url": "https://example.com/avatar.jpg",
      "location": "São Paulo, SP",
      "skills": [
        { "name": "Laravel", "type": "hard" },
        { "name": "Vue.js", "type": "hard" }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 45,
    "last_page": 4
  }
}
```

> Response enxuto: só dados essenciais para o card de listagem.

---

### 8.2 Visualizar perfil público

```
GET /developers/{profileId}
```
🔓

> Mesmo response do endpoint 2.4 — perfil completo com todos os relacionamentos.

---

## 9. Padrão de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "message": "Descrição legível do erro.",
  "errors": {
    "campo": ["Mensagem de validação específica."]
  }
}
```

**Códigos HTTP utilizados:**

| Código | Uso |
|---|---|
| `200` | Sucesso (GET, PUT) |
| `201` | Recurso criado (POST) |
| `204` | Sucesso sem body (DELETE) |
| `401` | Não autenticado |
| `403` | Sem permissão (recurso de outro usuário) |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: perfil já existe) |
| `422` | Erro de validação |
| `429` | Rate limit excedido |
| `502` | Falha em serviço externo (GitHub API) |

---

## 10. Resumo de Endpoints

| # | Método | Endpoint | Auth | Descrição |
|---|---|---|---|---|
| 1.1 | POST | `/auth/register` | 🔓 | Registrar |
| 1.2 | POST | `/auth/login` | 🔓 | Login |
| 1.3 | POST | `/auth/logout` | 🔒 | Logout |
| 2.1 | POST | `/profile` | 🔒 | Criar perfil |
| 2.2 | GET | `/profile` | 🔒 | Ver perfil próprio |
| 2.3 | PUT | `/profile` | 🔒 | Atualizar perfil |
| 2.4 | GET | `/profiles/{id}` | 🔓 | Ver perfil público |
| 3.1 | GET | `/profile/skills` | 🔒 | Listar skills |
| 3.2 | POST | `/profile/skills` | 🔒 | Adicionar skill |
| 3.3 | PUT | `/profile/skills/{id}` | 🔒 | Atualizar skill |
| 3.4 | DELETE | `/profile/skills/{id}` | 🔒 | Remover skill |
| 4.1 | GET | `/profile/educations` | 🔒 | Listar formações |
| 4.2 | POST | `/profile/educations` | 🔒 | Adicionar formação |
| 4.3 | PUT | `/profile/educations/{id}` | 🔒 | Atualizar formação |
| 4.4 | DELETE | `/profile/educations/{id}` | 🔒 | Remover formação |
| 5.1 | GET | `/profile/experiences` | 🔒 | Listar experiências |
| 5.2 | POST | `/profile/experiences` | 🔒 | Adicionar experiência |
| 5.3 | PUT | `/profile/experiences/{id}` | 🔒 | Atualizar experiência |
| 5.4 | DELETE | `/profile/experiences/{id}` | 🔒 | Remover experiência |
| 6.1 | GET | `/profile/projects` | 🔒 | Listar projetos |
| 6.2 | POST | `/profile/projects` | 🔒 | Adicionar projeto |
| 6.3 | PUT | `/profile/projects/{id}` | 🔒 | Atualizar projeto |
| 6.4 | DELETE | `/profile/projects/{id}` | 🔒 | Remover projeto |
| 7.1 | GET | `/profile/github/repositories` | 🔒 | Listar repos GitHub |
| 7.2 | POST | `/profile/github/import` | 🔒 | Importar repos |
| 7.3 | POST | `/profile/github/sync` | 🔒 | Sincronizar repos |
| 8.1 | GET | `/developers` | 🔓 | Buscar devs |
| 8.2 | GET | `/developers/{id}` | 🔓 | Ver perfil público |

> **Total: 28 endpoints** — 4 públicos, 24 autenticados.
