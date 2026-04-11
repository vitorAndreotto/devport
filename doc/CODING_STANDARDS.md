# Coding Standards — Dev Port

> Versão: 3.0
> Data: 2026-04-11
> Status: Draft
> Stack: NestJS · Angular · TypeScript
> Referência: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Padrão Geral

TypeScript strict mode em todo o projeto. ESLint + Prettier como ferramentas de lint e formatação.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

---

## 2. Nomenclatura

### 2.1 Arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Entity | `kebab-case.entity.ts` | `dev-profile.entity.ts` |
| Controller | `kebab-case.controller.ts` | `dev-profile.controller.ts` |
| Service | `kebab-case.service.ts` | `dev-profile.service.ts` |
| Repository | `kebab-case.repository.ts` | `dev-profile.repository.ts` |
| Module | `kebab-case.module.ts` | `dev-profile.module.ts` |
| DTO | `kebab-case.dto.ts` | `create-dev-profile.dto.ts` |
| Guard | `kebab-case.guard.ts` | `jwt-auth.guard.ts` |
| Pipe | `kebab-case.pipe.ts` | `uuid-validation.pipe.ts` |
| Interceptor | `kebab-case.interceptor.ts` | `transform.interceptor.ts` |
| Filter | `kebab-case.filter.ts` | `http-exception.filter.ts` |
| Enum | `kebab-case.enum.ts` | `skill-level.enum.ts` |
| Spec | `kebab-case.spec.ts` | `dev-profile.service.spec.ts` |
| Angular Component | `kebab-case.component.ts` | `skill-badge.component.ts` |
| Angular Service | `kebab-case.service.ts` | `auth.service.ts` |
| Angular Guard | `kebab-case.guard.ts` | `auth.guard.ts` |

### 2.2 Classes e Interfaces

| Tipo | Convenção | Exemplo |
|---|---|---|
| Classe | PascalCase | `DevProfileService`, `JwtAuthGuard` |
| Interface | PascalCase (sem prefixo I) | `JwtPayload`, `MatchResult` |
| DTO | PascalCase + sufixo Dto | `CreateDevProfileDto` |
| Entity | PascalCase | `DevProfile`, `JobSkill` |
| Enum | PascalCase | `SkillLevel`, `WorkMode` |
| Type alias | PascalCase | `PaginatedResult<T>` |

### 2.3 Variáveis e Métodos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Variáveis | camelCase | `matchScore`, `devProfile` |
| Métodos | camelCase | `findByUserId()`, `calculateScore()` |
| Constantes | UPPER_SNAKE | `MAX_SKILLS_PER_PROFILE` |
| Propriedades privadas | camelCase (sem underscore) | `private readonly profileService` |
| Parâmetros | camelCase | `userId`, `createDto` |

### 2.4 Banco de Dados

| Tipo | Convenção | Exemplo |
|---|---|---|
| Tabelas | Plural, snake_case | `dev_profiles`, `job_skills` |
| Colunas | Singular, snake_case | `full_name`, `start_date` |
| Foreign keys | Singular + `_id` | `dev_profile_id`, `skill_id` |
| Booleanos | Prefixo `is_` ou `has_` | `is_ongoing`, `is_current` |
| Timestamps | `created_at`, `updated_at` | — |

### 2.5 Rotas da API

| Tipo | Convenção | Exemplo |
|---|---|---|
| URI | Plural, kebab-case | `/dev/skills`, `/company/jobs` |
| Parâmetros | camelCase | `:devSkillId`, `:jobId` |
| Prefixo | `/api/v1` | `/api/v1/dev/profile` |

### 2.6 Angular

| Tipo | Convenção | Exemplo |
|---|---|---|
| Seletores | Prefixo `app-`, kebab-case | `app-skill-badge`, `app-navbar` |
| Rotas | kebab-case | `/dev/job-search`, `/auth/register-dev` |
| Signals | camelCase | `isLoading`, `currentUser` |
| Observables | sufixo `$` | `profile$`, `jobs$` |

---

## 3. Backend — NestJS

### 3.1 Controllers

```typescript
@Controller('dev/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class DevSkillController {
  constructor(private readonly devSkillService: DevSkillService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateDevSkillDto,
  ) {
    // ✅ Retorna dados puros — TransformInterceptor wrapa em { data }
    return this.devSkillService.create(user.id, dto);
  }

  @Delete(':devSkillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('devSkillId', ParseUUIDPipe) devSkillId: string,
  ): Promise<void> {
    await this.devSkillService.remove(user.id, devSkillId);
  }
}
```

**Regras:**
- Guards no nível da classe (quando todas as rotas exigem)
- `@HttpCode()` explícito quando diferente de 200
- `@CurrentUser()` decorator customizado para extrair o user do token
- Sem lógica de negócio
- **Nunca** retornar `{ data: ... }` manualmente — o `TransformInterceptor` global faz isso
- Para endpoints com formato diferente (ex: logout `{ message }`), usar `@SkipTransform()`

```typescript
// ❌ ERRADO — duplica o wrapper
@Get()
async list() {
  const items = await this.service.findAll();
  return { data: items };  // resulta em { data: { data: items } }
}

// ✅ CORRETO — interceptor cuida do wrapper
@Get()
async list() {
  return this.service.findAll();  // resulta em { data: items }
}

// ✅ EXCEÇÃO — endpoint sem wrapper padrão
@Post('logout')
@SkipTransform()
async logout(@CurrentUser() user: User) {
  await this.authService.logout(user.id);
  return { message: 'Logout realizado com sucesso.' };
}
```

---

### 3.2 Services

```typescript
@Injectable()
export class DevSkillService {
  private readonly MAX_SKILLS = 50;

  constructor(
    private readonly devSkillRepository: DevSkillRepository,
    private readonly devProfileService: DevProfileService,
  ) {}

  async create(user: User, dto: CreateDevSkillDto): Promise<DevSkill> {
    const profile = await this.devProfileService.findByUserOrFail(user.id);

    const count = await this.devSkillRepository.countByProfile(profile.id);
    if (count >= this.MAX_SKILLS) {
      throw new BadRequestException('Limite de 50 skills atingido.');
    }

    const exists = await this.devSkillRepository.existsByProfileAndSkill(
      profile.id,
      dto.skillId,
    );
    if (exists) {
      throw new ConflictException('Skill já cadastrada no perfil.');
    }

    return this.devSkillRepository.createAndSave(profile.id, dto);
  }
}
```

**Regras:**
- `@Injectable()` em todo service
- Injeção via constructor
- Constantes de negócio como propriedades `private readonly`
- Lança exceptions do `@nestjs/common`
- Sem dependência de HTTP (Request, Response)
- Retorno tipado com `Promise<T>`

---

### 3.3 DTOs

```typescript
export class CreateDevSkillDto {
  @IsUUID()
  @IsNotEmpty()
  skillId: string;

  @IsEnum(SkillLevel)
  @IsNotEmpty()
  level: SkillLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsExperience?: number;
}

export class UpdateDevSkillDto extends PartialType(CreateDevSkillDto) {}
```

**Regras:**
- Decorators do `class-validator` para validação
- `PartialType()` do `@nestjs/mapped-types` para update
- Propriedades opcionais com `?` e `@IsOptional()`
- Nunca incluir campos internos (id, created_at, etc.)

---

### 3.4 Entities

```typescript
@Entity('dev_skills')
export class DevSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id' })
  devProfileId: string;

  @Column({ name: 'skill_id' })
  skillId: string;

  @Column({ type: 'varchar', length: 15 })
  level: SkillLevel;

  @Column({ name: 'years_experience', nullable: true })
  yearsExperience: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => DevProfile, (profile) => profile.skills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;

  @ManyToOne(() => SkillTree)
  @JoinColumn({ name: 'skill_id' })
  skill: SkillTree;
}
```

**Regras:**
- Nome da tabela explícito em `@Entity('table_name')`
- `@Column({ name: 'snake_case' })` para mapear nomes do banco
- UUID como primary key
- Relacionamentos tipados com `onDelete`
- Ordenar: columns → timestamps → relationships

---

### 3.5 Enums

```typescript
export enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}
```

**Regras:**
- Chaves em PascalCase, valores em lowercase snake_case
- Usados em entities (`@Column`), DTOs (`@IsEnum`) e guards

---

### 3.6 Repositories

```typescript
@Injectable()
export class DevSkillRepository {
  constructor(
    @InjectRepository(DevSkill)
    private readonly repo: Repository<DevSkill>,
  ) {}

  async findAllByProfile(profileId: string): Promise<DevSkill[]> {
    return this.repo.find({
      where: { devProfileId: profileId },
      relations: ['skill'],
      order: { skill: { name: 'ASC' } },
    });
  }

  async countByProfile(profileId: string): Promise<number> {
    return this.repo.count({ where: { devProfileId: profileId } });
  }
}
```

**Regras:**
- `@InjectRepository()` do TypeORM
- Métodos com nomes descritivos
- Retorno tipado com `Promise<T>`
- Queries simples via `find/findOne`, complexas via `QueryBuilder`

---

## 4. Frontend — Angular

### 4.1 Components (Standalone)

```typescript
@Component({
  selector: 'app-skill-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './skill-card.component.html',
  styleUrl: './skill-card.component.scss',
})
export class SkillCardComponent {
  skill = input.required<DevSkill>();
  saving = input(false);

  edit = output<{ level: string; years_experience: number | null }>();
  remove = output<void>();

  isEditing = signal(false);
  levelClass = computed(() => `badge-${this.skill().level}`);
}
```

**Regras:**
- Todos os components são `standalone: true`
- Usar Signals (`input`, `computed`, `signal`) em vez de `@Input()/@Output()` decorators
- Usar `output()` em vez de `@Output()` decorator
- Template inline para componentes pequenos, arquivo separado para maiores
- Styles com `styleUrl` apontando para SCSS

---

### 4.2 Services

```typescript
@Injectable({ providedIn: 'root' })
export class DevProfileService {
  private readonly api = inject(ApiService);

  private readonly profile = signal<DevProfile | null>(null);
  readonly currentProfile = this.profile.asReadonly();

  loadProfile(): Observable<DevProfile | null> {
    return this.api.get<{ data: DevProfile }>('/dev/profile').pipe(
      tap((res) => this.profile.set(res.data)),
    );
  }
}
```

**Regras:**
- `inject()` em vez de constructor injection (padrão Angular 17+)
- `providedIn: 'root'` para singletons
- Estado reativo via `signal()` + `asReadonly()` para expor
- Retorno `Observable<T>` tipado
- Services de feature ficam na pasta da feature

---

### 4.3 Reactive Forms

```typescript
this.form = this.fb.group({
  full_name: ['', [Validators.required, Validators.maxLength(255)]],
  title: ['', [Validators.required, Validators.maxLength(255)]],
  bio: ['', [Validators.required, Validators.maxLength(500)]],
  email_contact: ['', [Validators.required, Validators.email]],
  work_mode: [null as string | null],
});
```

**Regras:**
- Sempre `ReactiveFormsModule` (não template-driven)
- Validações no form, não no template
- Nomes dos controls em snake_case (alinhado com a API)

---

### 4.4 Notificações (Toast)

Feedback ao usuário é centralizado no `NotificationService`. **Nunca** usar `setTimeout` manual ou signals locais de `successMessage`/`apiError` para toasts.

```typescript
// No smart component:
private readonly notify = inject(NotificationService);

onSave(): void {
  this.myService.save(data).subscribe({
    next: () => this.notify.success('Salvo com sucesso!'),
    error: (err: ApiError) => this.notify.error(extractErrorMessage(err)),
  });
}
```

**Regras:**
- `notify.success()` para operações concluídas
- `notify.error()` para erros de API
- `notify.info()` para mensagens informativas
- O `ToastComponent` global no root renderiza automaticamente
- Auto-dismiss em 4 segundos

---

### 4.5 Tratamento de Erros no Frontend

Todo erro de API deve ser extraído com a utility `extractErrorMessage()` para evitar duplicação.

```typescript
import { extractErrorMessage } from '../../../core/api/api-error.util';
import { ApiError } from '../../../core/api/api.service';

// Em vez de repetir isto em cada component:
// ❌ const msg = Array.isArray(err.message) ? err.message[0] : err.message;

// Usar:
// ✅ this.notify.error(extractErrorMessage(err));
```

**Fluxo de erro:**
1. `ApiService.handleError()` — formata `HttpErrorResponse` → `ApiError`
2. `errorInterceptor` — intercepta 401 em rotas não-auth → auto-logout
3. `extractErrorMessage()` — extrai string de `ApiError.message` (string ou array)
4. `NotificationService` — exibe toast de erro

---

### 4.6 Smart/Dumb Components

Features complexas devem separar **orquestração** de **apresentação**.

**Smart Component (Container):**
```typescript
@Component({ /* ... */ })
export class SkillsComponent {
  private readonly skillService = inject(SkillService);
  private readonly notify = inject(NotificationService);

  mySkills = signal<DevSkill[]>([]);

  onAddSkill(payload: SkillAddPayload): void {
    this.skillService.addSkill({ ... })
      .subscribe({
        next: (added) => {
          this.mySkills.update((s) => [...s, added]);
          this.notify.success('Skill adicionada!');
        },
        error: (err: ApiError) => this.notify.error(extractErrorMessage(err)),
      });
  }
}
```

**Dumb Component (Presentational):**
```typescript
@Component({ /* ... */ })
export class SkillCardComponent {
  skill = input.required<DevSkill>();      // Dados de entrada
  saving = input(false);                    // Estado de UI do pai

  edit = output<{ level: string }>();       // Emite para o pai
  remove = output<void>();                  // Emite para o pai

  isEditing = signal(false);                // Estado local de UI apenas
}
```

**Regras:**
- Smart: injeta services, gerencia estado, trata erros
- Dumb: recebe `input()`, emite `output()`, sem injeção de services de domínio
- Dumb pode ter estado local de UI (ex: `isEditing`, `searchQuery`)
- Sub-componentes ficam em `components/` dentro da feature

---

### 4.7 Guards

Todos os guards são **funções** (`CanActivateFn`), não classes.

```typescript
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dev']);
  return false;
};
```

**Guards disponíveis:**

| Guard | Protege | Redireciona para |
|---|---|---|
| `authGuard` | Rotas autenticadas | `/auth/login` |
| `devGuard` | Rotas de dev | `/` |
| `guestGuard` | Rotas de login/register (logados) | `/dev` |
| `hasProfileGuard` | Rotas que exigem perfil | `/dev/onboarding` |
| `noProfileGuard` | Rota de onboarding (com perfil) | `/dev` |

---

### 4.8 Cache em Services

Dados que mudam raramente (skill tree, categorias) devem ser cacheados no service.

```typescript
@Injectable({ providedIn: 'root' })
export class SkillService {
  private cachedTree: SkillTree[] | null = null;

  getSkillTree(): Observable<SkillTree[]> {
    if (this.cachedTree) {
      return of(this.cachedTree);
    }

    return this.api.get<{ data: SkillTree[] }>('/skills').pipe(
      map((res) => res.data),
      tap((tree) => this.cachedTree = tree),
    );
  }
}
```

**Regras:**
- Cache em memória (propriedade privada) para dados de referência
- Retorna `of(cached)` se disponível, senão faz HTTP e armazena
- Dados mutáveis do usuário (perfil, skills do dev) usam `signal()` em vez de cache manual
- Cache é limpo automaticamente no reload da SPA

---

### 4.9 Rotas

```typescript
export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: 'dev',
    canActivate: [devGuard],
    loadChildren: () => import('./features/dev/dev.routes').then((m) => m.devRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
```

**Regras:**
- Features lazy-loaded via `loadChildren`
- Rotas públicas de auth protegidas com `guestGuard`
- Rotas autenticadas protegidas com guard de role
- Sempre incluir rota wildcard `**` para 404
- Child routes usam `hasProfileGuard`/`noProfileGuard` para onboarding flow

---

## 5. Testes

### 5.1 Backend — E2E (API)

| Tipo | Local | Naming | Ferramenta |
|---|---|---|---|
| E2E | `test/*.e2e-spec.ts` | `auth.e2e-spec.ts` | Jest + Supertest |
| Unit | `src/**/*.spec.ts` | `auth.service.spec.ts` | Jest |

**Setup do E2E test:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    // Limpa tabelas relevantes antes de cada teste
    await dataSource.query('DELETE FROM users');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Regras:**
- Cada arquivo de teste cobre um módulo/controller
- `beforeAll`: cria app com mesma config do `main.ts`
- `beforeEach`: limpa tabelas para isolamento
- `afterAll`: fecha app e conexão
- Usa banco real (mesmo PostgreSQL de desenvolvimento)
- Testa: status code, body structure, headers, regras de negócio

**Padrão de assertion:**

```typescript
it('should register a new dev', async () => {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register/dev')
    .send({
      name: 'vitor',
      email: 'vitor@test.com',
      password: 'senha12345',
      password_confirmation: 'senha12345',
    })
    .expect(201);

  expect(res.body.data).toHaveProperty('user');
  expect(res.body.data).toHaveProperty('access_token');
  expect(res.body.data).toHaveProperty('refresh_token');
  expect(res.body.data.user.role).toBe('dev');
});
```

**Helpers reutilizáveis:**

```typescript
// test/helpers.ts — funções auxiliares para testes
async function registerDev(app, overrides = {}) { ... }
async function loginDev(app, email, password) { ... }
async function getAuthToken(app, role) { ... }
```

### 5.2 Backend — Unit

```typescript
describe('AuthService', () => {
  it('should throw ConflictException if email exists', async () => {
    // arrange: mock usersService.findByEmail → return user
    // act: authService.register(dto, UserRole.Dev)
    // assert: expect to throw ConflictException
  });
});
```

**Regras:**
- `describe` com nome da classe
- `it` com frase descritiva em inglês
- Padrão AAA (Arrange, Act, Assert)
- Mock de repositories e serviços injetados
- Testar regras de negócio e edge cases

### 5.3 Frontend

| Tipo | Local | Naming | Ferramenta |
|---|---|---|---|
| Unit | `*.spec.ts` ao lado do arquivo | `auth.service.spec.ts` | Jest ou Karma |
| Component | `*.spec.ts` ao lado do componente | `skill-badge.component.spec.ts` | Jest + Testing Library |

### 5.4 Executando testes

```bash
# E2E (backend)
cd backend && npm run test:e2e

# Unit (backend)
cd backend && npm run test

# Com cobertura
cd backend && npm run test:cov
```

---

## 6. Interceptors e Filters Globais

### 6.1 TransformInterceptor

Registrado no `main.ts`, wrapa automaticamente toda response em `{ data: ... }`.

```typescript
// main.ts
app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
```

**Impacto:** controllers retornam dados puros. O interceptor adiciona o envelope.

**Exceções via `@SkipTransform()`:**
```typescript
import { SkipTransform } from '../common/decorators/skip-transform.decorator.js';

@Post('logout')
@SkipTransform()
async logout() { ... }
```

### 6.2 HttpExceptionFilter

Registrado no `main.ts`, padroniza **todas** as respostas de erro.

```typescript
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

**Formato padrão de erro:**
```json
{
  "statusCode": 422,
  "message": "Erro de validação.",
  "errors": {
    "email": ["email must be an email"],
    "password": ["password must be longer than or equal to 8 characters"]
  }
}
```

**Regras:**
- Erros de validação (array do `ValidationPipe`) são agrupados por campo em `errors`
- Exceptions simples (`NotFoundException`, `ConflictException`, etc.) retornam apenas `statusCode` + `message`
- O campo `errors` só aparece quando há erros de validação

### 6.3 Registro no main.ts

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
```

---

## 7. Enums — Referência Completa

| Enum | Valores |
|---|---|
| `UserRole` | `dev`, `company` |
| `SkillLevel` | `beginner`, `intermediate`, `advanced`, `expert` |
| `SkillCategory` | `language`, `framework`, `database`, `devops`, `tool`, `methodology`, `soft_skill`, `other` |
| `EducationType` | `technical`, `graduation`, `master`, `doctorate`, `postdoc`, `mba`, `course`, `certification` |
| `ContractModel` | `clt`, `pj`, `clt_pj` |
| `WorkMode` | `onsite`, `hybrid`, `remote` |
| `JobStatus` | `open`, `closed` |
| `ProjectSource` | `manual`, `github` |
| `CompanySize` | `startup`, `small`, `medium`, `large`, `enterprise` |

---

## 8. Imports — Ordem

```typescript
// 1. Node / terceiros
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 2. Módulos internos (caminho absoluto)
import { DevProfile } from '../dev-profile/dev-profile.entity';
import { SkillLevel } from '../common/enums/skill-level.enum';

// 3. Mesmo módulo (caminho relativo)
import { CreateDevSkillDto } from './dto/create-dev-skill.dto';
import { DevSkill } from './dev-skill.entity';
```

---

## 9. Regras Gerais

| Regra | Detalhe |
|---|---|
| Strict mode | `strict: true` no `tsconfig.json` |
| Tipagem | Tipar tudo — sem `any` (usar `unknown` se necessário) |
| `async/await` | Preferir sobre `.then()` no backend |
| Observables | Padrão no frontend (Angular) |
| Early return | Preferir sobre ifs aninhados |
| Null handling | Usar optional chaining (`?.`) e nullish coalescing (`??`) |
| String quotes | Aspas simples no backend, aspas simples no frontend |
| Trailing comma | Sempre em multiline |
| Semicolons | Sempre |
| Access modifiers | Explicitar `private`, `protected`, `public` no backend |
| `readonly` | Usar em propriedades injetadas e constantes |

---

## 10. Checklist de Code Review

### Backend
- [ ] Controller magro (sem lógica de negócio)
- [ ] Controller retorna dados puros (sem `{ data: ... }` manual)
- [ ] `@SkipTransform()` usado apenas quando necessário (ex: logout)
- [ ] DTO com validações completas (`class-validator`)
- [ ] Entity com tipos corretos e nomes de coluna mapeados
- [ ] Service lança exceptions do NestJS
- [ ] Repository encapsula queries
- [ ] Testes unitários para o service
- [ ] Sem `any` no código
- [ ] Guards aplicados corretamente

### Frontend
- [ ] Componentes standalone com `input()`/`output()` (não `@Input()/@Output()`)
- [ ] Reactive forms (não template-driven)
- [ ] Services usam `inject()` e `providedIn: 'root'`
- [ ] Tipagem completa nos models — sem `any`
- [ ] Lazy loading nas rotas de feature
- [ ] Sem lógica pesada no template
- [ ] Feedback via `NotificationService` (não signals locais de toast)
- [ ] Erros extraídos com `extractErrorMessage()` (não inline)
- [ ] Features complexas seguem Smart/Dumb pattern
- [ ] Rotas autenticadas com guard, rotas de auth com `guestGuard`
- [ ] Rota wildcard `**` presente para 404
- [ ] Dados de referência cacheados no service
- [ ] `takeUntilDestroyed(this.destroyRef)` em toda subscription de component
