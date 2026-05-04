# DEBIT-002 — Testes Unitarios Ausentes (Backend)

> Tipo: Qualidade
> Prioridade: Alta
> Status: Pendente

---

## Problema

O backend possui apenas testes E2E para o modulo de autenticacao (`auth.e2e-spec.ts`). Nenhum teste unitario existe para services, repositories ou pipes. Isso significa que:
- Regras de negocio nos services nao sao verificadas isoladamente
- Refatoracoes podem introduzir regressoes silenciosas
- A cobertura de testes e criticamente baixa

---

## Escopo

### Modulos sem cobertura de testes

| Modulo | Prioridade | Justificativa |
|---|---|---|
| `matching` | Critica | Algoritmo complexo com calculos de score, pesos e cache |
| `job` | Alta | Validacoes de endereco condicional, skills com exigencia |
| `job-application` | Alta | Maquina de estados (pending/accepted/rejected/withdrawn) |
| `dev-skill` | Media | Limite de 50 skills, validacao de duplicidade |
| `dev-profile` | Media | Validacao de handle, salary_min <= salary_max |
| `company-profile` | Media | Validacao de CNPJ unico, handle unico |
| `company-unit` | Baixa | CRUD simples com validacoes de endereco |
| `education` | Baixa | Validacao condicional (workload_hours quando type=course) |
| `experience` | Baixa | Validacao is_current vs end_date |
| `project` | Baixa | CRUD simples |

### Tipos de teste necessarios

1. **Testes unitarios de services** — validar regras de negocio com mocks de repositories
2. **Testes unitarios de pipes** — validar SanitizePipe, ParseHandlePipe
3. **Testes E2E** — expandir para cobrir todos os endpoints (alem de auth)

---

## Implementacao sugerida

1. Configurar Jest para testes unitarios (ja presente via NestJS CLI)
2. Criar `*.spec.ts` para cada service, priorizando `matching.service.spec.ts`
3. Usar mocks do TypeORM (`Repository`) via `@nestjs/testing`
4. Adicionar script `test:cov` para relatorio de cobertura

---

## Criterios de aceite

- [ ] Testes unitarios para `matching.service.ts` com cobertura dos 4 criterios de score
- [ ] Testes unitarios para `job-application.service.ts` com todas as transicoes de status
- [ ] Testes unitarios para `job.service.ts` com validacoes condicionais de endereco
- [ ] Testes unitarios para `dev-skill.service.ts` (limite, duplicidade)
- [ ] Testes para `SanitizePipe` e `ParseHandlePipe`
- [ ] Cobertura minima de 60% nos services
- [ ] Script `npm run test:cov` funcional

---

## Arquivos impactados

- `backend/src/**/*.spec.ts` *(novos)*
- `backend/package.json` (scripts de cobertura)
- `backend/jest.config.ts` (se necessario ajustes)
