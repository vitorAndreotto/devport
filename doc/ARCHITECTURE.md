# Architecture — Dev Port

> Versão: 3.0
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
│  Helmet → CORS → ThrottlerGuard                     │
│  SanitizePipe → ValidationPipe                      │
│  Guards → Pipes → Controller → Service → Repository │
│  TransformInterceptor ← HttpExceptionFilter         │
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
│   │   │   ├── roles.decorator.ts
│   │   │   └── skip-transform.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── refresh-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── pipes/
│   │   │   ├── sanitize.pipe.ts         # XSS: escapa HTML em todo body
│   │   │   ├── parse-handle.pipe.ts     # Valida formato de handle em params
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
│   │   ├── dto/
│   │   │   └── list-skills-query.dto.ts # Validação de query params
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
│   │   ├── app.ts                        # Root component
│   │   ├── app.html
│   │   ├── app.scss
│   │   ├── app.config.ts                 # Providers, interceptors, icons
│   │   ├── app.routes.ts                 # Main routes (lazy loading)
│   │   │
│   │   ├── core/                         # Singleton — carregado uma vez
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts       # JWT, login, register, logout (Signals)
│   │   │   │   └── auth.interceptor.ts   # Injeta Bearer token
│   │   │   ├── api/
│   │   │   │   ├── api.service.ts        # Wrapper HTTP genérico
│   │   │   │   ├── api-error.util.ts     # extractErrorMessage() — DRY
│   │   │   │   └── error.interceptor.ts  # 401 auto-logout, erros centralizados
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts         # authGuard, devGuard, guestGuard
│   │   │   │   └── profile.guard.ts      # hasProfileGuard, noProfileGuard
│   │   │   ├── services/
│   │   │   │   ├── dev-profile.service.ts  # Profile CRUD + cache via Signal
│   │   │   │   ├── skill.service.ts        # Skill CRUD + tree cache em memória
│   │   │   │   ├── location.service.ts     # States, cities API
│   │   │   │   ├── viacep.service.ts       # CEP → endereço (API externa)
│   │   │   │   └── notification.service.ts # Toast centralizado (Signal queue)
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── dev-profile.model.ts
│   │   │   │   ├── skill.model.ts
│   │   │   │   └── location.model.ts
│   │   │   └── icons.ts                  # Registro de ícones Lucide
│   │   │
│   │   ├── shared/                       # Componentes, pipes, directives reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── toast/                # ToastComponent — global, via NotificationService
│   │   │   │   ├── form-field/           # Wrapper de input com label + erros
│   │   │   │   ├── handle-input/         # Validação async de handle (disponibilidade)
│   │   │   │   └── city-search/          # Autocomplete de cidades com debounce
│   │   │   └── directives/
│   │   │       └── cep-mask.directive.ts # Máscara XXXXX-XXX
│   │   │
│   │   ├── features/                     # Feature modules (lazy loaded)
│   │   │   ├── landing/
│   │   │   │   └── landing.component.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   │       └── register-form/    # Sub-componente de formulário
│   │   │   ├── dev/
│   │   │   │   ├── dev.routes.ts         # Child routes com guards
│   │   │   │   ├── onboarding/           # Primeiro acesso (noProfileGuard)
│   │   │   │   ├── dashboard/            # Stats reais + ações rápidas
│   │   │   │   ├── profile/              # Edição completa (endereço, links, CEP)
│   │   │   │   └── skills/               # Smart component
│   │   │   │       ├── skills.component.ts           # Orquestrador (smart)
│   │   │   │       └── components/
│   │   │   │           ├── skill-card/               # Dumb: view/edit de uma skill
│   │   │   │           └── skill-add-modal/          # Dumb: busca + config de nova skill
│   │   │   ├── not-found/               # 404 (wildcard route)
│   │   │   ├── company/                 # (planejado)
│   │   │   └── public/                  # (planejado)
│   │   │
│   │   └── layouts/
│   │       └── dev-layout/              # Sidebar + header + router-outlet
│   │
│   ├── environments/
│   │   ├── environment.ts               # apiUrl: http://localhost:3000/api/v1
│   │   └── environment.prod.ts          # apiUrl: /api/v1 (relativo)
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

### 3.2 Pipes (Validação e Sanitização)

Pipes globais e dedicados para validação e segurança.

| Pipe | Escopo | Responsabilidade |
|---|---|---|
| `SanitizePipe` | Global (body) | Escapa HTML em todas as strings — previne XSS |
| `ValidationPipe` | Global | Valida e transforma body/query via DTOs (`class-validator`) |
| `ParseUUIDPipe` | Route param | Valida formato UUID |
| `ParseIntPipe` | Route param | Valida e converte para inteiro |
| `ParseHandlePipe` | Route param | Valida formato de handle (`^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$`) |

**Ordem de execução no `main.ts`:** `SanitizePipe` → `ValidationPipe` (sanitiza antes de validar).

**Regras:**
- DTOs definem as regras com decorators (`@IsString()`, `@IsEnum()`, etc.)
- Query params de endpoints públicos **devem** ter um DTO dedicado com `@MaxLength()`
- Route params devem usar pipes de validação (`ParseUUIDPipe`, `ParseHandlePipe`, etc.)
- `ValidationPipe` com `whitelist` + `forbidNonWhitelisted` rejeita campos extras

---

### 3.3 Interceptors

Transformam a response **na saída** do controller.

| Interceptor | Responsabilidade |
|---|---|
| `TransformInterceptor` | Wrapa toda response em `{ data: ... }` automaticamente |

**Regras:**
- Registrado globalmente no `main.ts`
- Controllers retornam dados puros — **nunca** fazem `return { data: ... }` manualmente
- Para endpoints que precisam de formato diferente (ex: logout retorna `{ message }`), usar `@SkipTransform()` no método

```typescript
// ✅ Controller retorna dados puros — o interceptor cuida do wrapper
@Get()
async list() {
  return this.myService.findAll();
}
// Response: { "data": [...] }

// ✅ Exceção: endpoint com formato customizado
@Post('logout')
@SkipTransform()
async logout() {
  await this.authService.logout(user.id);
  return { message: 'Logout realizado com sucesso.' };
}
// Response: { "message": "..." }
```

---

### 3.4 Filters

Interceptam **exceptions** e padronizam a response de erro.

| Filter | Responsabilidade |
|---|---|
| `HttpExceptionFilter` | Formata todas as exceptions no padrão `{ statusCode, message, errors }` |

**Regras:**
- Registrado globalmente no `main.ts`
- Erros de validação (array de mensagens do `ValidationPipe`) são agrupados por campo em `errors`
- Exceptions simples retornam apenas `statusCode` e `message`

```json
// Erro de validação (422)
{
  "statusCode": 422,
  "message": "Erro de validação.",
  "errors": {
    "email": ["email must be an email"],
    "password": ["password must be longer than or equal to 8 characters"]
  }
}

// Erro simples (404)
{
  "statusCode": 404,
  "message": "Perfil não encontrado."
}
```

---

### 3.5 Controllers

Camada fina que recebe a request validada e delega ao service.

**Responsabilidades:**
- Receber a request (já validada pelo Pipe/DTO)
- Delegar ao Service
- Retornar dados puros (o `TransformInterceptor` cuida do wrapper `{ data }`)

**Regras:**
- Controllers são magros — sem lógica de negócio
- Sem queries diretas ao banco
- Um controller por módulo
- Decorators definem rota, método, guards e swagger
- **Nunca** retornar `{ data: ... }` manualmente — o interceptor global faz isso

---

### 3.6 Services

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

### 3.7 Repositories

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

### 3.8 Entities

Representação das tabelas via TypeORM.

**Responsabilidades:**
- Definir colunas, tipos, constraints
- Definir relacionamentos (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`)

**Regras:**
- Uma entity por tabela
- Usar decorators do TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`)
- UUIDs como primary key

---

### 3.9 DTOs

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

#### Interceptors

| Interceptor | Responsabilidade |
|---|---|
| `authInterceptor` | Injeta `Authorization: Bearer {token}` em toda request |
| `errorInterceptor` | Intercepta `401` em rotas não-auth e faz auto-logout + redirect |

Ambos são **funções** (`HttpInterceptorFn`), registrados em `app.config.ts` via `withInterceptors([...])`.

#### Guards

| Guard | Responsabilidade | Tipo |
|---|---|---|
| `authGuard` | Requer autenticação (qualquer role) | `CanActivateFn` |
| `devGuard` | Requer autenticação + role `dev` | `CanActivateFn` |
| `guestGuard` | Bloqueia usuários autenticados (login/register) | `CanActivateFn` |
| `hasProfileGuard` | Requer perfil completo, senão redireciona para onboarding | `CanActivateFn` |
| `noProfileGuard` | Requer SEM perfil (onboarding), senão redireciona para dashboard | `CanActivateFn` |

#### Services

| Service | Responsabilidade | Estado |
|---|---|---|
| `AuthService` | Login, registro, logout, estado JWT | Signals: `user`, `isAuthenticated`, `userRole` |
| `ApiService` | Wrapper HTTP genérico com base URL e error handling | Sem estado |
| `DevProfileService` | Profile CRUD, cache do perfil atual | Signal: `currentProfile` |
| `SkillService` | Skill tree + dev skills CRUD | Cache em memória para tree e categories |
| `LocationService` | States e cities da API | Sem estado |
| `ViaCepService` | Busca endereço por CEP (API externa) | Sem estado |
| `NotificationService` | Toast centralizado (success/error/info) | Signal queue com auto-dismiss |

#### Utilities

| Utilitário | Responsabilidade |
|---|---|
| `extractErrorMessage()` | Extrai mensagem de `ApiError` (string ou array) — evita duplicação |

---

### 4.2 Shared

Componentes, directives e pipes reutilizáveis entre features.

#### Componentes

| Componente | Responsabilidade |
|---|---|
| `NavbarComponent` | Barra de navegação pública |
| `FooterComponent` | Rodapé com ano dinâmico |
| `ToastComponent` | Renderiza notificações globais via `NotificationService` |
| `FormFieldComponent` | Wrapper de input com label, erros, validação automática |
| `HandleInputComponent` | Input especializado com validação regex + check assíncrono de disponibilidade |
| `CitySearchComponent` | Autocomplete de cidades com debounce, requer estado selecionado |

#### Directives

| Directive | Responsabilidade |
|---|---|
| `CepMaskDirective` | Máscara de input `XXXXX-XXX` para campos de CEP |

---

### 4.3 Features (lazy loaded)

Cada feature é carregada sob demanda via `loadChildren`.

| Feature | Rotas | Quem acessa | Guard |
|---|---|---|---|
| `landing` | `/` | Público | — |
| `auth` | `/auth/login`, `/auth/register` | Público (não logado) | `guestGuard` |
| `dev` | `/dev/*` | Role `dev` | `devGuard` + `hasProfileGuard` |
| `not-found` | `**` (wildcard) | Público | — |
| `company` | `/company/*` (planejado) | Role `company` | — |
| `public` | `/developers/*` (planejado) | Público | — |

#### Padrão Smart/Dumb dentro de Features

Features complexas devem seguir o padrão **Smart/Dumb** (Container/Presentational):

```
skills/
├── skills.component.ts           # Smart: orquestra estado, chama services
├── skills.component.html          # Template delega para sub-componentes
└── components/
    ├── skill-card/                # Dumb: recebe @input, emite @output
    │   ├── skill-card.component.ts
    │   ├── skill-card.component.html
    │   └── skill-card.component.scss
    └── skill-add-modal/           # Dumb: recebe dados, emite confirm/close
        ├── skill-add-modal.component.ts
        ├── skill-add-modal.component.html
        └── skill-add-modal.component.scss
```

**Smart Component** (orquestrador):
- Injeta services, gerencia estado global da feature
- Usa `NotificationService` para feedback ao usuário
- Usa `extractErrorMessage()` para tratamento de erros
- Passa dados via `input()` e escuta `output()` dos filhos

**Dumb Component** (apresentação):
- Recebe dados via `input()`, emite eventos via `output()`
- Sem injeção de services de domínio
- Gerencia apenas estado local de UI (ex: `isEditing`, `searchQuery`)
- Reutilizável e testável de forma isolada

---

### 4.4 Layouts

| Layout | Uso |
|---|---|
| `DevLayout` | Painel do dev: sidebar com nav, header mobile, avatar, logout |

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

1. Helmet              → adiciona security headers
2. CORS                → valida origin permitida
3. ThrottlerGuard      → verifica rate limit por IP
4. SanitizePipe        → escapa HTML no body
5. ValidationPipe      → valida body contra CreateDevSkillDto
6. JwtAuthGuard        → valida access token, extrai payload
7. RolesGuard          → verifica role = 'dev'
8. DevSkillController  → this.devSkillService.create(user.id, dto)
9. DevSkillService     → verifica limite 50, verifica duplicata
10. Repository (TypeORM) → salva no banco
11. Controller          → retorna dados puros, status 201
12. TransformInterceptor → wrapa em { data: ... }

// Em caso de erro em qualquer etapa:
X. HttpExceptionFilter  → formata em { statusCode, message, errors? }
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
| Rate limit excedido | ThrottlerGuard | `ThrottlerException` | `429` |
| Handle inválido | ParseHandlePipe | `BadRequestException` | `400` |

O `HttpExceptionFilter` global (registrado no `main.ts`) formata todas as exceptions no padrão:
```json
{ "statusCode": 422, "message": "Erro de validação.", "errors": { "campo": ["mensagem"] } }
```

Para exceptions simples (sem array de validação), retorna apenas `statusCode` e `message`:
```json
{ "statusCode": 404, "message": "Perfil não encontrado." }
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

---

## 12. Segurança

### 12.1 Middleware e Headers

| Camada | Ferramenta | Função |
|---|---|---|
| Security headers | `helmet` | CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc. |
| CORS | `app.enableCors()` | Origins restritas via `CORS_ORIGINS` env var |
| Rate limiting | `@nestjs/throttler` | Limita requisições por IP por janela de tempo |

**Configuração via env:**
```bash
CORS_ORIGINS=http://localhost:4200       # Comma-separated em produção
THROTTLE_TTL=60000                        # Janela global: 60s
THROTTLE_LIMIT=100                        # Limite global: 100 req/janela
THROTTLE_AUTH_TTL=60000                   # Janela auth: 60s
THROTTLE_AUTH_LIMIT=10                    # Limite auth: 10 req/janela
```

### 12.2 Rate Limiting

Dois perfis de throttling configurados no `ThrottlerModule`:

| Perfil | TTL | Limite | Onde se aplica |
|---|---|---|---|
| `default` | 60s | 100 req | Disponível para qualquer controller |
| `auth` | 60s | 10 req | `AuthController` — login, register, refresh |

O `AuthController` usa `@UseGuards(ThrottlerGuard)` + `@Throttle({ auth: { ... } })` para aplicar o perfil mais restritivo.

### 12.3 Sanitização de Input (XSS)

O `SanitizePipe` é registrado **globalmente antes do ValidationPipe** e escapa caracteres HTML perigosos em todo campo string do body:

| Caractere | Escapado para |
|---|---|
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#x27;` |
| `&` | `&amp;` |

**Escopo:** apenas `body` (não afeta query params ou route params).
**Recursivo:** percorre objetos e arrays aninhados.

### 12.4 Validação de Input

Defesa em profundidade — cada camada valida o que pode:

| Camada | Mecanismo | Exemplo |
|---|---|---|
| **Route params** | Pipes dedicados | `ParseUUIDPipe`, `ParseIntPipe`, `ParseHandlePipe` |
| **Query params** | DTOs com `class-validator` | `ListSkillsQueryDto` (maxLength, IsIn) |
| **Body** | DTOs com `class-validator` | `@MaxLength`, `@IsEnum`, `@Matches`, `@ArrayMaxSize` |
| **Global** | `ValidationPipe` com `whitelist` + `forbidNonWhitelisted` | Rejeita campos não declarados no DTO |

### 12.5 Limites de Input

| Campo | Limite | Motivo |
|---|---|---|
| `links[]` | Max 10 itens | Previne payload inflado |
| `links[].label` | Max 100 chars | — |
| `links[].url` | Max 2048 chars | Padrão de URL |
| `github_username` | Max 39 chars + regex GitHub | Previne injection em futuras chamadas à API |
| `query (q)` | Max 100 chars | Previne queries lentas via ILIKE |
| `category` | `@IsIn([...])` | Aceita apenas valores válidos do enum |
| Skills por perfil | Max 50 | Regra de negócio + previne abuso |

### 12.6 Fluxo de Segurança de uma Request

```
Request HTTP
  │
  ├─ 1. Helmet          → adiciona security headers na response
  ├─ 2. CORS            → rejeita origins não permitidas
  ├─ 3. ThrottlerGuard  → rejeita se IP excedeu limite (429)
  ├─ 4. SanitizePipe    → escapa HTML em strings do body
  ├─ 5. ValidationPipe  → valida e transforma body/query via DTOs
  ├─ 6. JwtAuthGuard    → valida access token (401 se inválido)
  ├─ 7. RolesGuard      → verifica permissão de role (403 se negado)
  ├─ 8. ParseHandlePipe → valida formato de :handle (400 se inválido)
  │
  └─ Controller → Service → Repository → DB
```

---

## 13. Estratégia de Testes

### 13.1 Tipos de Teste

| Tipo | Escopo | Ferramenta | Local |
|---|---|---|---|
| **E2E (API)** | Fluxo completo: HTTP → Controller → Service → DB | Jest + Supertest | `test/*.e2e-spec.ts` |
| **Unit** | Service isolado com mocks de dependências | Jest | `src/**/*.spec.ts` |
| **Frontend Unit** | Components e services Angular | Jest/Karma | `*.spec.ts` ao lado do arquivo |

### 13.2 E2E Tests (prioridade no MVP)

Testam o fluxo real da API contra um banco PostgreSQL de teste.

**Setup:**
- Usam `AppModule` real (sem mocks)
- `ValidationPipe` global configurado identicamente ao `main.ts`
- Banco de teste limpo antes de cada suite (`beforeAll`)
- App fechado após cada suite (`afterAll`)

**O que testar por endpoint:**
- Happy path (request válida → response esperada)
- Validação de campos (campos ausentes, inválidos → 400/422)
- Regras de negócio (duplicatas → 409, não encontrado → 404)
- Autenticação (sem token → 401, role errado → 403)
- Formato do response (estrutura JSON conforme API Contract)

**Naming:**
```
describe('Auth (e2e)')
  describe('POST /api/v1/auth/register/dev')
    it('should register a new dev')
    it('should return 409 if email already exists')
    it('should return 400 if password confirmation does not match')
```

### 13.3 Unit Tests (services)

Testam lógica de negócio isolada, com repositories mockados.

**O que testar:**
- Regras condicionais (limite de skills, ongoing + end_date)
- Cálculos (matching score)
- Edge cases (null, vazio, limites)

### 13.4 Cobertura Mínima por Módulo

| Módulo | E2E | Unit |
|---|---|---|
| Auth | Todos os endpoints | AuthService (register, login, refresh) |
| Dev Profile | CRUD completo | — |
| Skills | CRUD + limite 50 | — |
| Education | CRUD + regras condicionais | — |
| Experience | CRUD + regras condicionais | — |
| Projects | CRUD | — |
| GitHub | Listar, importar, sync | GitHubService (mock HTTP) |
| Company Profile | CRUD | — |
| Jobs | CRUD + close | — |
| Matching | — | MatchingService (cálculo de score) |
| Search | Busca com filtros | — |
