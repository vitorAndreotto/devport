# DEBIT-003 — Logging e Monitoramento (Backend)

> Tipo: Observabilidade
> Prioridade: Media
> Status: Pendente

---

## Problema

O backend nao possui nenhum sistema de logging estruturado nem monitoramento. Isso dificulta:
- Diagnostico de erros em producao
- Rastreamento de requests (request ID)
- Auditoria de acoes criticas (login, candidaturas, matching)
- Identificacao de gargalos de performance
- Monitoramento do reCAPTCHA score (mencionado no DEBIT-001)

---

## Solucao

Implementar logging estruturado usando o `Logger` nativo do NestJS com output JSON em producao, e adicionar request tracing.

---

## Escopo

### 1. Logger global

- Usar `Logger` do NestJS (ja disponivel, sem dependencias extras)
- Formato JSON em producao, texto colorido em desenvolvimento
- Niveis: `error`, `warn`, `log`, `debug`

### 2. Request logging

- Interceptor global que loga: method, path, status, duration, user_id (se autenticado)
- Request ID gerado via `uuid` e propagado nos headers (`X-Request-Id`)

### 3. Pontos criticos para logging

| Ponto | Nivel | Dados |
|---|---|---|
| Login sucesso/falha | `log` / `warn` | email, IP, user_id |
| Registro de usuario | `log` | email, role |
| Candidatura a vaga | `log` | dev_id, job_id |
| Calculo de matching | `debug` | dev_id, job_id, sub-scores |
| Erro de validacao | `warn` | endpoint, campos invalidos |
| Erro inesperado (500) | `error` | stack trace, request_id |

---

## Criterios de aceite

- [ ] Logger configurado globalmente no bootstrap (`main.ts`)
- [ ] Request ID gerado e retornado no header `X-Request-Id`
- [ ] Interceptor de logging registra method, path, status, duration
- [ ] Acoes criticas logadas (login, registro, candidatura)
- [ ] Formato JSON em producao
- [ ] Erros 500 logam stack trace completo

---

## Arquivos impactados

- `backend/src/main.ts`
- `backend/src/common/interceptors/logging.interceptor.ts` *(novo)*
- `backend/src/auth/auth.service.ts` (adicionar logs)
- `backend/src/job-application/job-application.service.ts` (adicionar logs)
- `backend/src/matching/matching.service.ts` (adicionar logs)
