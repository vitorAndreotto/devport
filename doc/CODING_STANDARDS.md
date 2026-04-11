# Coding Standards — Dev Port

> Versão: 2.0
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
  ): Promise<DevSkill> {
    return this.devSkillService.create(user, dto);
  }

  @Delete(':devSkillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('devSkillId', ParseUUIDPipe) devSkillId: string,
  ): Promise<void> {
    await this.devSkillService.remove(user, devSkillId);
  }
}
```

**Regras:**
- Guards no nível da classe (quando todas as rotas exigem)
- `@HttpCode()` explícito quando diferente de 200
- `@CurrentUser()` decorator customizado para extrair o user do token
- Tipagem de retorno em todos os métodos
- Sem lógica de negócio

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
  selector: 'app-skill-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="levelClass()">
      {{ skill().name }} — {{ skill().level }}
    </span>
  `,
})
export class SkillBadgeComponent {
  skill = input.required<DevSkill>();

  levelClass = computed(() => `badge-${this.skill().level}`);
}
```

**Regras:**
- Todos os components são `standalone: true`
- Usar Signals (`input`, `computed`, `signal`) em vez de `@Input()/@Output()`
- Template inline para componentes pequenos, arquivo separado para maiores
- Styles com `styleUrl` apontando para SCSS

---

### 4.2 Services

```typescript
@Injectable({ providedIn: 'root' })
export class DevProfileService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<DevProfile> {
    return this.api.get<DevProfile>('/dev/profile');
  }

  updateProfile(data: UpdateDevProfileDto): Observable<DevProfile> {
    return this.api.put<DevProfile>('/dev/profile', data);
  }
}
```

**Regras:**
- `inject()` em vez de constructor injection (padrão Angular 17+)
- `providedIn: 'root'` para singletons
- Retorno `Observable<T>` tipado
- Services de feature ficam na pasta da feature

---

### 4.3 Reactive Forms

```typescript
this.form = this.fb.group({
  fullName: ['', [Validators.required, Validators.maxLength(255)]],
  title: ['', [Validators.required, Validators.maxLength(255)]],
  bio: ['', [Validators.required, Validators.maxLength(500)]],
  emailContact: ['', [Validators.required, Validators.email]],
  location: [''],
  workMode: [null],
});
```

**Regras:**
- Sempre `ReactiveFormsModule` (não template-driven)
- Validações no form, não no template
- Nomes dos controls em camelCase

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
import request from 'supertest';
import { AppModule } from '../src/app.module';
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

## 6. Enums — Referência Completa

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

## 7. Imports — Ordem

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

## 8. Regras Gerais

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

## 9. Checklist de Code Review

### Backend
- [ ] Controller magro (sem lógica de negócio)
- [ ] DTO com validações completas (`class-validator`)
- [ ] Entity com tipos corretos e nomes de coluna mapeados
- [ ] Service lança exceptions do NestJS
- [ ] Repository encapsula queries
- [ ] Testes unitários para o service
- [ ] Sem `any` no código
- [ ] Guards aplicados corretamente

### Frontend
- [ ] Componentes standalone
- [ ] Signals em vez de `@Input()/@Output()` decorators
- [ ] Reactive forms (não template-driven)
- [ ] Services usam `inject()`
- [ ] Tipagem completa nos models
- [ ] Lazy loading nas rotas de feature
- [ ] Sem lógica pesada no template
