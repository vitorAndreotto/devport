# DEBIT-001 — reCAPTCHA v3 (Frontend)

> Tipo: Segurança
> Prioridade: Alta
> Status: Pendente
> Relacionado: [DEBIT-001 Backend](../back/DEBIT-001-recaptcha-backend.md)

---

## Problema

As rotas de registro e login estão expostas a ataques de bots, brute force e credential stuffing. Não há nenhum mecanismo de proteção contra automação maliciosa no frontend.

---

## Solução

Integrar **Google reCAPTCHA v3** nos formulários de registro (dev e empresa) e login. O v3 é invisível (sem checkbox), calcula um score de 0.0 a 1.0 baseado no comportamento do usuário.

---

## Escopo

### Telas afetadas
- `/auth/register` — formulário de registro (dev e empresa)
- `/auth/login` — formulário de login

### Implementação

1. **Instalar a lib `ng-recaptcha`**
   ```bash
   cd frontend && npm install ng-recaptcha
   ```

2. **Configurar no `environment.ts`**
   ```typescript
   export const environment = {
     // ...
     recaptchaSiteKey: 'SITE_KEY_AQUI',
   };
   ```

3. **Registrar o provider no `app.config.ts`**
   ```typescript
   import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

   providers: [
     { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
   ]
   ```

4. **Injetar `ReCaptchaV3Service` nos componentes de registro e login**
   ```typescript
   private readonly recaptcha = inject(ReCaptchaV3Service);

   onSubmit(): void {
     this.recaptcha.execute('register').subscribe((token) => {
       // Envia o token junto com o payload para o backend
       this.authService.register({ ...payload, recaptcha_token: token }, this.role());
     });
   }
   ```

5. **Atualizar DTOs/models para incluir `recaptcha_token`**
   ```typescript
   export interface RegisterPayload {
     name: string;
     email: string;
     password: string;
     password_confirmation: string;
     recaptcha_token: string;
   }
   ```

6. **Atualizar `.env.example` com a chave de exemplo**

---

## Critérios de aceite

- [ ] reCAPTCHA v3 carrega em todas as telas de auth
- [ ] Token gerado e enviado ao backend em register (dev e company) e login
- [ ] Formulário não submete se a geração do token falhar
- [ ] Mensagem de erro exibida se reCAPTCHA falhar
- [ ] Site key configurável via environment
- [ ] Nenhum impacto visual (v3 é invisível)
- [ ] Badge do reCAPTCHA visível no canto inferior (obrigatório por ToS do Google)

---

## Arquivos impactados

- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.prod.ts`
- `frontend/src/app/app.config.ts`
- `frontend/src/app/core/models/user.model.ts`
- `frontend/src/app/features/auth/register/register-form/register-form.component.ts`
- `frontend/src/app/features/auth/login/login.component.ts` *(quando existir)*
