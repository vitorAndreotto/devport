# DEBIT-002 — Testes Ausentes (Frontend)

> Tipo: Qualidade
> Prioridade: Alta
> Status: Pendente

---

## Problema

O frontend possui apenas o teste basico de criacao do `AppComponent` (`app.spec.ts`). Nenhum componente, service ou guard possui testes. Isso significa que:
- Logica de services (AuthService, MatchingService) nao e verificada
- Componentes com logica complexa (skill-add-modal, job-form) nao sao testados
- Guards de rota (devGuard, hasProfileGuard) nao sao validados
- Refatoracoes podem quebrar funcionalidades sem deteccao

---

## Escopo

### Prioridade de testes

| Camada | Prioridade | Exemplos |
|---|---|---|
| Services (core) | Alta | `AuthService`, `DevProfileService`, `NotificationService` |
| Guards | Alta | `devGuard`, `companyGuard`, `hasProfileGuard`, `guestGuard` |
| Interceptors | Alta | `authInterceptor`, `errorInterceptor` |
| Smart Components | Media | `SkillsComponent`, `JobFormComponent`, `DashboardComponent` |
| Shared Components | Baixa | `FormFieldComponent`, `HandleInputComponent`, `CitySearchComponent` |
| Dumb Components | Baixa | `SkillCardComponent`, `SkillAddModalComponent` |

### Tipos de teste

1. **Testes unitarios de services** — verificar logica de estado (Signals), chamadas HTTP, cache
2. **Testes de guards** — verificar redirecionamentos e protecao de rotas
3. **Testes de componentes** — verificar renderizacao e interacao basica

---

## Criterios de aceite

- [ ] Testes unitarios para `AuthService` (login, logout, estado JWT)
- [ ] Testes unitarios para `DevProfileService` (cache via Signal)
- [ ] Testes para todos os guards (devGuard, companyGuard, guestGuard, hasProfileGuard, noProfileGuard)
- [ ] Testes para `authInterceptor` e `errorInterceptor`
- [ ] Testes de componente para `SkillsComponent` (smart component)
- [ ] Script `npm run test` funcional com reporter de cobertura
- [ ] Cobertura minima de 50% em services e guards

---

## Arquivos impactados

- `frontend/src/app/**/*.spec.ts` *(novos)*
- `frontend/karma.conf.js` ou `angular.json` (ajustes de config se necessario)
