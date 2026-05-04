# DEBIT-004 — Modulo saved_developers Nao Implementado (Backend)

> Tipo: Feature
> Prioridade: Media
> Status: Pendente
> Referencia: [PRD.md](../../PRD.md) secao 6.2.4 | [USER_STORIES.md](../../USER_STORIES.md) US-870 a US-872

---

## Problema

O modulo de devs salvos (shortlist interna da empresa) esta documentado no PRD e nas User Stories mas nao foi implementado no backend. As User Stories US-870, US-871 e US-872 sao todas classificadas como Must Have.

---

## Escopo

### Funcionalidades pendentes

| User Story | Descricao | Prioridade |
|---|---|---|
| US-870 | Salvar dev para vaga (shortlist) | Must |
| US-871 | Listar devs salvos por vaga | Must |
| US-872 | Remover dev salvo | Must |

### Endpoints a implementar (conforme API_CONTRACT.md)

- `POST /company/jobs/{jobId}/saved-developers` — Salvar dev
- `GET /company/jobs/{jobId}/saved-developers` — Listar salvos por vaga
- `DELETE /company/jobs/{jobId}/saved-developers/{savedDevId}` — Remover dev salvo

### Entidades

A tabela `saved_developers` ja esta documentada no DATA_MODEL.md (secao 2.13) com:
- `company_profile_id` (FK)
- `dev_profile_id` (FK)
- `job_id` (FK)
- Constraint UNIQUE `(company_profile_id, dev_profile_id, job_id)`

---

## Implementacao sugerida

1. Criar entity `SavedDeveloper`
2. Criar migration para tabela `saved_developers`
3. Criar module, controller, service, repository, DTOs
4. Endpoints protegidos por `@Roles(UserRole.Company)`
5. Validar que a vaga pertence a empresa
6. Retornar 409 se dev ja salvo para a mesma vaga

---

## Criterios de aceite

- [ ] Empresa pode salvar dev vinculado a uma vaga
- [ ] Nao permite duplicata (mesmo dev + mesma vaga)
- [ ] Empresa pode listar devs salvos por vaga
- [ ] Empresa pode remover dev salvo
- [ ] Apenas a empresa dona da vaga pode acessar
- [ ] Dev nao e notificado

---

## Arquivos impactados

- `backend/src/saved-developer/` *(novo modulo)*
  - `saved-developer.module.ts`
  - `saved-developer.controller.ts`
  - `saved-developer.service.ts`
  - `saved-developer.entity.ts`
  - `saved-developer.repository.ts`
  - `dto/save-developer.dto.ts`
- `backend/src/migrations/` (nova migration)
- `backend/src/app.module.ts` (registrar modulo)
