# DEBIT-001 — reCAPTCHA v3 (Backend)

> Tipo: Segurança
> Prioridade: Alta
> Status: Pendente
> Relacionado: [DEBIT-001 Frontend](../front/DEBIT-001-recaptcha-frontend.md)

---

## Problema

O backend aceita requests de registro e login sem nenhuma verificação de que o client é humano. Isso permite:
- Criação em massa de contas por bots
- Ataques de brute force no login
- Credential stuffing com listas de senhas vazadas

---

## Solução

Validar o **token reCAPTCHA v3** enviado pelo frontend, verificando o score retornado pela API do Google. Rejeitar requests com score abaixo do threshold.

---

## Escopo

### Endpoints afetados
- `POST /api/v1/auth/register/dev`
- `POST /api/v1/auth/register/company`
- `POST /api/v1/auth/login`

### Implementação

1. **Adicionar variáveis de ambiente**
   ```env
   RECAPTCHA_SECRET_KEY=SECRET_KEY_AQUI
   RECAPTCHA_MIN_SCORE=0.5
   ```

2. **Criar `RecaptchaService`**
   ```
   backend/src/common/services/recaptcha.service.ts
   ```

   ```typescript
   @Injectable()
   export class RecaptchaService {
     private readonly secretKey: string;
     private readonly minScore: number;

     constructor(private readonly config: ConfigService, private readonly http: HttpService) {
       this.secretKey = config.get<string>('RECAPTCHA_SECRET_KEY', '');
       this.minScore = config.get<number>('RECAPTCHA_MIN_SCORE', 0.5);
     }

     async verify(token: string, expectedAction: string): Promise<void> {
       const response = await firstValueFrom(
         this.http.post('https://www.google.com/recaptcha/api/siteverify', null, {
           params: {
             secret: this.secretKey,
             response: token,
           },
         }),
       );

       const { success, score, action } = response.data;

       if (!success || score < this.minScore || action !== expectedAction) {
         throw new BadRequestException('Verificação reCAPTCHA falhou.');
       }
     }
   }
   ```

3. **Criar `RecaptchaModule`**
   ```
   backend/src/common/services/recaptcha.module.ts
   ```
   Importar `HttpModule` e exportar `RecaptchaService`.

4. **Atualizar DTOs de registro e login**
   ```typescript
   // register.dto.ts
   @IsString()
   @IsNotEmpty()
   recaptcha_token: string;

   // login.dto.ts
   @IsString()
   @IsNotEmpty()
   recaptcha_token: string;
   ```

5. **Atualizar `AuthService`**
   ```typescript
   constructor(
     // ...
     private readonly recaptchaService: RecaptchaService,
   ) {}

   async register(dto: RegisterDto, role: UserRole) {
     await this.recaptchaService.verify(dto.recaptcha_token, 'register');
     // ... restante da lógica
   }

   async login(dto: LoginDto) {
     await this.recaptchaService.verify(dto.recaptcha_token, 'login');
     // ... restante da lógica
   }
   ```

6. **Bypass para testes e desenvolvimento**
   ```typescript
   async verify(token: string, expectedAction: string): Promise<void> {
     if (!this.secretKey) {
       return; // Skip em dev se secret não configurado
     }
     // ... verificação normal
   }
   ```

---

## Critérios de aceite

- [ ] Token `recaptcha_token` obrigatório nos endpoints de register e login
- [ ] Token validado contra a API do Google (`siteverify`)
- [ ] Score abaixo de 0.5 retorna `400 Bad Request`
- [ ] Action verificada (`register` ou `login`) para evitar replay entre endpoints
- [ ] Secret key configurável via `.env`
- [ ] Min score configurável via `.env`
- [ ] Bypass automático em desenvolvimento se `RECAPTCHA_SECRET_KEY` não estiver definida
- [ ] Testes e2e continuam passando (bypass ativo em test)
- [ ] Log do score para monitoramento futuro

---

## Arquivos impactados

- `backend/.env` e `.env.example`
- `backend/src/common/services/recaptcha.service.ts` *(novo)*
- `backend/src/common/services/recaptcha.module.ts` *(novo)*
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/dto/register.dto.ts`
- `backend/src/auth/dto/login.dto.ts`

---

## Referências

- [Google reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- Endpoint de verificação: `POST https://www.google.com/recaptcha/api/siteverify`
- Response: `{ success, score, action, challenge_ts, hostname }`
