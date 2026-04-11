# Architecture — Dev Port

> Versão: 2.0
> Data: 2026-04-11
> Status: Draft
> Stack: NestJS · Angular · PostgreSQL · Redis
> Referência: [PRD.md](PRD.md) | [DATA_MODEL.md](DATA_MODEL.md) | [API_CONTRACT.md](API_CONTRACT.md)

---

## 1. Visão Geral

O Dev Port é composto por uma **API RESTful** (NestJS) e uma **SPA** (Angular), com PostgreSQL como banco principal e Redis para cache e gerenciamento de sessões JWT.

```
┌─────────────────────────────────────────────────────┐
│                    Angular (SPA)                     │
│          http://localhost:4200                       │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / JSON
                     ▼
┌─────────────────────────────────────────────────────┐
│                   NestJS (API)                       │
│              http://localhost:3000                   │
│                  /api/v1/*                           │
├─────────────────────────────────────────────────────┤
│  Guards → Pipes → Controller → Service → Repository │
└──────────┬──────────────────────────────┬───────────┘
           │                              │
           ▼                              ▼
    ┌──────────┐                   ┌──────────┐
    │ PostgreSQL│                   │  Redis   │
    │  :5432   │                   │  :6379   │
    └──────────┘                   └──────────┘
```

---

## 2. Estrutura de Pastas

### 2.1 Backend (NestJS)

```
backend/
├── src/
│   ├── main.ts                          # Bootstrap da aplicação
│   ├── app.module.ts                    # Módulo raiz
│   │
│   ├── common/                          # Compartilhado entre módulos
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── refresh-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── pipes/
│   │   │   └── uuid-validation.pipe.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   ├── skill-level.enum.ts
│   │   │   ├── skill-category.enum.ts
│   │   │   ├── education-type.enum.ts
│   │   │   ├── contract-model.enum.ts
│   │   │   ├── work-mode.enum.ts
│   │   │   ├── job-status.enum.ts
│   │   │   ├── project-source.enum.ts
│   │   │   └── company-size.enum.ts
│   │   └── types/
│   │       └── jwt-payload.type.ts
│   │
│   ├── config/                          # Configuração centralizada
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── jwt.config.ts
│   │   └── github.config.ts
│   │
│   ├── auth/                            # Módulo de autenticação
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── jwt-refresh.strategy.ts
│   │
│   ├── dev-profile/                     # Módulo perfil do dev
│   │   ├── dev-profile.module.ts
│   │   ├── dev-profile.controller.ts
│   │   ├── dev-profile.service.ts
│   │   ├── dev-profile.entity.ts
│   │   ├── dev-profile.repository.ts
│   │   └── dto/
│   │       ├── create-dev-profile.dto.ts
│   │       └── update-dev-profile.dto.ts
│   │
│   ├── dev-skill/                       # Módulo skills do dev
│   │   ├── dev-skill.module.ts
│   │   ├── dev-skill.controller.ts
│   │   ├── dev-skill.service.ts
│   │   ├── dev-skill.entity.ts
│   │   ├── dev-skill.repository.ts
│   │   └── dto/
│   │       ├── create-dev-skill.dto.ts
│   │       └── update-dev-skill.dto.ts
│   │
│   ├── education/                       # Módulo formação
│   │   ├── education.module.ts
│   │   ├── education.controller.ts
│   │   ├── education.service.ts
│   │   ├── education.entity.ts
│   │   ├── education.repository.ts
│   │   └── dto/
│   │       ├── create-education.dto.ts
│   │       └── update-education.dto.ts
│   │
│   ├── experience/                      # Módulo experiência
│   │   ├── experience.module.ts
│   │   ├── experience.controller.ts
│   │   ├── experience.service.ts
│   │   ├── experience.entity.ts
│   │   ├── experience.repository.ts
│   │   └── dto/
│   │       ├── create-experience.dto.ts
│   │       └── update-experience.dto.ts
│   │
│   ├── project/                         # Módulo projetos
│   │   ├── project.module.ts
│   │   ├── project.controller.ts
│   │   ├── project.service.ts
│   │   ├── project.entity.ts
│   │   ├── project.repository.ts
│   │   └── dto/
│   │       ├── create-project.dto.ts
│   │       └── update-project.dto.ts
│   │
│   ├── github/                          # Módulo integração GitHub
│   │   ├── github.module.ts
│   │   ├── github.controller.ts
│   │   ├── github.service.ts
│   │   └── dto/
│   │       └── import-repositories.dto.ts
│   │
│   ├── company-profile/                 # Módulo perfil empresa
│   │   ├── company-profile.module.ts
│   │   ├── company-profile.controller.ts
│   │   ├── company-profile.service.ts
│   │   ├── company-profile.entity.ts
│   │   ├── company-profile.repository.ts
│   │   └── dto/
│   │       ├── create-company-profile.dto.ts
│   │       └── update-company-profile.dto.ts
│   │
│   ├── job/                             # Módulo vagas
│   │   ├── job.module.ts
│   │   ├── job.controller.ts
│   │   ├── job.service.ts
│   │   ├── job.entity.ts
│   │   ├── job-skill.entity.ts
│   │   ├── job.repository.ts
│   │   └── dto/
│   │       ├── create-job.dto.ts
│   │       ├── update-job.dto.ts
│   │       └── job-skill.dto.ts
│   │
│   ├── skill-tree/                      # Módulo árvore de skills
│   │   ├── skill-tree.module.ts
│   │   ├── skill-tree.controller.ts
│   │   ├── skill-tree.service.ts
│   │   ├── skill-tree.entity.ts
│   │   ├── skill-tree.repository.ts
│   │   └── seed/
│   │       └── skill-tree.seed.ts
│   │
│   ├── matching/                        # Módulo matching
│   │   ├── matching.module.ts
│   │   └── matching.service.ts
│   │
│   └── search/                          # Módulo busca
│       ├── search.module.ts
│       ├── search.controller.ts
│       └── search.service.ts
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── dev-profile.e2e-spec.ts
│   └── ...
│
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

### 2.2 Frontend (Angular)

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   │
│   │   ├── core/                        # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── role.guard.ts
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── api/
│   │   │   │   └── api.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── dev-profile.model.ts
│   │   │       ├── company-profile.model.ts
│   │   │       ├── job.model.ts
│   │   │       └── skill.model.ts
│   │   │
│   │   ├── shared/                      # Componentes, pipes, directives reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── skill-badge/
│   │   │   │   ├── match-score/
│   │   │   │   └── pagination/
│   │   │   ├── pipes/
│   │   │   └── directives/
│   │   │
│   │   ├── features/                    # Feature modules (lazy loaded)
│   │   │   ├── landing/
│   │   │   │   ├── landing.component.ts
│   │   │   │   └── landing.routes.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register-dev/
│   │   │   │   ├── register-company/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── dev/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── skills/
│   │   │   │   ├── education/
│   │   │   │   ├── experience/
│   │   │   │   ├── projects/
│   │   │   │   ├── github/
│   │   │   │   ├── job-search/
│   │   │   │   └── dev.routes.ts
│   │   │   ├── company/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── profile/
│   │   │   │   ├── jobs/
│   │   │   │   ├── dev-search/
│   │   │   │   └── company.routes.ts
│   │   │   └── public/
│   │   │       ├── dev-profile/
│   │   │       ├── company-profile/
│   │   │       ├── job-detail/
│   │   │       ├── developers/
│   │   │       └── public.routes.ts
│   │   │
│   │   └── layouts/
│   │       ├── main-layout/
│   │       ├── dev-layout/
│   │       └── company-layout/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _theme.scss
│   │   └── styles.scss
│   │
│   └── index.html
│
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 3. Camadas e Responsabilidades (Backend)

### 3.1 Guards

Interceptam a request antes do controller.

| Guard | Responsabilidade |
|---|---|
| `JwtAuthGuard` | Valida access token JWT |
| `RefreshAuthGuard` | Valida refresh token JWT |
| `RolesGuard` | Verifica se o `role` do usuário tem permissão na rota |

**Regras:**
- Guards são aplicados via decorators (`@UseGuards()`) ou globalmente
- `@Roles('dev')` e `@Roles('company')` definem quem acessa a rota

---

### 3.2 Pipes (Validação)

Validação automática via `class-validator` + `class-transformer`.

**Regras:**
- DTOs definem as regras com decorators (`@IsString()`, `@IsEnum()`, etc.)
- `ValidationPipe` global transforma e valida automaticamente
- Erros de validação retornam `422` no padrão definido

---

### 3.3 Controllers

Camada fina que recebe a request validada e delega ao service.

**Responsabilidades:**
- Receber a request (já validada pelo Pipe/DTO)
- Delegar ao Service
- Retornar response com status HTTP correto

**Regras:**
- Controllers são magros — sem lógica de negócio
- Sem queries diretas ao banco
- Um controller por módulo
- Decorators definem rota, método, guards e swagger

---

### 3.4 Services

Camada de lógica de negócio.

**Responsabilidades:**
- Implementar regras de negócio
- Orquestrar operações com Repositories
- Tratar exceções de domínio
- Interagir com serviços externos (GitHub, Redis)

**Regras:**
- Um service por domínio
- Services não conhecem HTTP (sem Request, Response, status codes)
- Recebem DTOs ou tipos primitivos
- Lançam exceptions do NestJS (`ConflictException`, `NotFoundException`, etc.)

---

### 3.5 Repositories

Camada de acesso a dados via TypeORM.

**Responsabilidades:**
- Encapsular queries ao banco
- Construir queries complexas (joins, filtros, paginação)
- Retornar entities ou dados raw

**Regras:**
- Extendem `Repository<Entity>` do TypeORM
- Um repository por entity principal
- Queries simples: usar métodos do TypeORM (`find`, `findOne`, `save`)
- Queries complexas: usar `QueryBuilder`

---

### 3.6 Entities

Representação das tabelas via TypeORM.

**Responsabilidades:**
- Definir colunas, tipos, constraints
- Definir relacionamentos (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`)

**Regras:**
- Uma entity por tabela
- Usar decorators do TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`)
- UUIDs como primary key

---

### 3.7 DTOs

Data Transfer Objects para validação de entrada.

**Responsabilidades:**
- Definir shape dos dados de entrada
- Regras de validação via decorators (`class-validator`)
- Transformação de tipos (`class-transformer`)

**Regras:**
- `CreateXxxDto` para criação
- `UpdateXxxDto` extends `PartialType(CreateXxxDto)` para atualização
- Nunca expor campos internos (password_hash, refresh_token)

---

## 4. Camadas e Responsabilidades (Frontend)

### 4.1 Core

Serviços singleton, guards e interceptors carregados uma vez.

| Elemento | Responsabilidade |
|---|---|
| `AuthService` | Login, registro, refresh, estado de autenticação |
| `AuthGuard` | Protege rotas autenticadas |
| `RoleGuard` | Protege rotas por tipo de usuário |
| `AuthInterceptor` | Injeta Bearer token em requests, faz refresh automático |
| `ApiService` | Wrapper HTTP com base URL e error handling |

---

### 4.2 Shared

Componentes, pipes e directives reutilizáveis entre features.

---

### 4.3 Features (lazy loaded)

Cada feature é um módulo independente carregado sob demanda.

| Feature | Rotas | Quem acessa |
|---|---|---|
| `landing` | `/` | Público |
| `auth` | `/auth/*` | Público |
| `dev` | `/dev/*` | Role `dev` |
| `company` | `/company/*` | Role `company` |
| `public` | `/developers/*`, `/companies/*`, `/jobs/*` | Público |

---

### 4.4 Layouts

Templates de página que envolvem as features.

| Layout | Uso |
|---|---|
| `MainLayout` | Landing, páginas públicas |
| `DevLayout` | Painel do dev (sidebar, navbar autenticada) |
| `CompanyLayout` | Painel da empresa (sidebar, navbar autenticada) |

---

## 5. Decisões Arquiteturais

### 5.1 Monorepo vs Repos Separados

**Repos separados** (`backend/` e `frontend/` na raiz do projeto).

**Por quê:** simplicidade, deploy independente, sem overhead de ferramentas de monorepo (Nx, Turborepo). Cada projeto tem seu `package.json` e pipeline.

---

### 5.2 TypeORM + Repository Pattern — SIM

**Por quê:** TypeORM é o ORM mais usado com NestJS, suporte nativo a PostgreSQL, decorators alinhados com o estilo do NestJS. Repository pattern isola queries e facilita testes.

---

### 5.3 Redis — Para JWT Blacklist e Cache

| Uso | Detalhe |
|---|---|
| Refresh token hash | Armazena hash do refresh token ativo por usuário |
| JWT blacklist (logout) | Invalida access tokens antes do vencimento |
| Cache de skill tree | Árvore de skills muda raramente — cache de 1h |

---

### 5.4 JWT — Access + Refresh Token

| Token | Tempo de vida | Armazenamento |
|---|---|---|
| Access token | 15 minutos | Memory (frontend) |
| Refresh token | 7 dias | httpOnly cookie ou body |

**Rotação:** a cada refresh, o refresh token antigo é invalidado no Redis.

---

### 5.5 Angular — Standalone Components

**Por quê:** padrão do Angular 17+, sem `NgModules` nos componentes. Mais simples, tree-shakeable, alinhado com a direção do framework.

---

### 5.6 Lazy Loading por Feature

**Por quê:** reduz o bundle inicial. Cada feature carrega apenas quando o usuário navega para aquela rota.

---

## 6. Fluxo de uma Request (exemplo)

```
POST /api/v1/dev/skills
Authorization: Bearer {access_token}
Body: { "skill_id": "uuid", "level": "advanced", "years_experience": 4 }

1. JwtAuthGuard     → valida access token, extrai payload
2. RolesGuard       → verifica role = 'dev'
3. ValidationPipe   → valida body contra CreateDevSkillDto
4. DevSkillController → this.devSkillService.create(user, dto)
5. DevSkillService  → verifica limite 50, verifica duplicata
6. DevSkillRepository → salva no banco via TypeORM
7. Controller       → retorna entity, status 201
8. TransformInterceptor → formata response padrão { data: ... }
```

---

## 7. Fluxo de Autenticação

```
┌─────────┐     POST /auth/login      ┌─────────┐
│ Angular │ ──────────────────────────→ │ NestJS  │
│  (SPA)  │ ←────────────────────────── │  (API)  │
└────┬────┘  { access_token,           └────┬────┘
     │         refresh_token }              │
     │                                      │ hash(refresh_token) → Redis
     │                                      │
     │     GET /api/v1/dev/profile          │
     │ ──── Authorization: Bearer {at} ───→ │
     │ ←── { data: profile }               │
     │                                      │
     │     POST /auth/refresh               │
     │ ──── { refresh_token } ────────────→ │
     │ ←── { new_access, new_refresh } ──── │ invalida old RT no Redis
     │                                      │
     │     POST /auth/logout                │
     │ ──── Authorization: Bearer {at} ───→ │
     │                                      │ remove RT do Redis
     │                                      │ adiciona AT na blacklist
```

---

## 8. Fluxo de Matching

```
GET /api/v1/jobs?sort=match_score
Authorization: Bearer {dev_access_token}

1. SearchController   → detecta dev autenticado
2. SearchService      → busca vagas abertas com filtros
3. MatchingService    → para cada vaga, calcula score:
   │
   ├─ Skills (60%)    → % das skills exigidas que o dev possui
   │                     bônus se dev.level >= job.min_level
   ├─ Experiência (20%) → dev.total_years vs job.min_experience
   ├─ Modalidade (10%)  → dev.work_mode vs job.work_mode
   └─ Localização (10%) → match textual dev.location vs job.location
   │
4. Filtra score < 20
5. Ordena por score DESC
6. Retorna com paginação
```

---

## 9. Comunicação com API Externa (GitHub)

```
Controller → GitHubService → GitHub REST API (pública)
                  │
                  ▼
           ProjectService → ProjectRepository → DB
```

- `GitHubService` usa `HttpModule` do NestJS (Axios sob o capô)
- Erros da API do GitHub mapeados para `HttpException(502)`
- Sem OAuth — apenas API pública com username

---

## 10. Tratamento de Erros

| Cenário | Onde tratar | Exception | HTTP |
|---|---|---|---|
| Validação de input | Pipe (automático) | `BadRequestException` | `422` |
| Recurso não encontrado | Service | `NotFoundException` | `404` |
| Perfil já existe | Service | `ConflictException` | `409` |
| CNPJ duplicado | Service | `ConflictException` | `409` |
| Limite de skills | Service | `BadRequestException` | `422` |
| Falha GitHub API | GitHubService | `HttpException(502)` | `502` |
| Não autenticado | Guard | `UnauthorizedException` | `401` |
| Role errado | Guard | `ForbiddenException` | `403` |

O `HttpExceptionFilter` global formata todas as exceptions no padrão:
```json
{ "statusCode": 422, "message": "...", "errors": { ... } }
```

---

## 11. Infraestrutura (Docker)

```yaml
services:
  backend     → NestJS        :3000
  frontend    → Angular (dev) :4200
  pgsql       → PostgreSQL    :5432
  redis       → Redis         :6379
```

Cada serviço roda em container próprio, comunicação via rede interna do Docker.
