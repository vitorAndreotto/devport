# DEBIT-004 — Perfis Publicos Nao Implementados (Frontend)

> Tipo: Feature
> Prioridade: Alta
> Status: Pendente
> Referencia: [PRD.md](../../PRD.md) secoes 6.1.1 e 6.2.1 | [USER_STORIES.md](../../USER_STORIES.md) US-102, US-702

---

## Problema

As paginas publicas de perfis (dev e empresa) estao documentadas como Must Have no PRD mas nao existem no frontend. O diretorio `features/public/` esta marcado como "planejado" na arquitetura.

Atualmente nao e possivel:
- Acessar o perfil de um dev via `/developers/{handle}` (US-102)
- Acessar o perfil de uma empresa via `/companies/{handle}` (US-702)

Essas paginas sao essenciais para o produto pois sao a vitrine publica de devs e empresas.

---

## Escopo

### Paginas a implementar

#### 1. Perfil publico do dev — `/developers/{handle}`

**Dados exibidos:**
- Informacoes pessoais (nome, titulo, bio, avatar, localizacao, situacao profissional)
- Skills agrupadas por categoria com nivel e anos de experiencia
- Formacoes ordenadas (em andamento primeiro, depois por data)
- Experiencias ordenadas (atual primeiro, depois por data) com skills associadas
- Projetos (manuais e importados do GitHub)
- Links externos (GitHub, LinkedIn, site)

**Regras:**
- Acessivel sem autenticacao
- Pretensao salarial NUNCA exibida
- Secoes sem dados nao sao exibidas
- Handle valido, retorna 404 se nao encontrado

#### 2. Perfil publico da empresa — `/companies/{handle}`

**Dados exibidos:**
- Dados da empresa (nome, descricao, logo, setor, tamanho, site)
- Endereco da sede (se informado)
- Unidades/filiais
- Lista de vagas abertas (sem faixa salarial, exceto se show_salary=true)

**Regras:**
- Acessivel sem autenticacao
- Faixa salarial NAO exibida (exceto show_salary=true)
- Handle valido, retorna 404 se nao encontrado

---

## Implementacao sugerida

1. Criar `features/public/` com rotas lazy loaded
2. Endpoints publicos do backend: `GET /developers/{handle}`, `GET /companies/{handle}`
3. Componentes: `PublicDevProfileComponent`, `PublicCompanyProfileComponent`
4. Reutilizar shared components (skill badges, timeline)
5. SEO: meta tags dinamicas com nome e titulo

---

## Criterios de aceite

- [ ] Perfil dev acessivel via `/developers/{handle}` sem autenticacao
- [ ] Exibe todas as secoes do perfil (dados, skills, formacao, experiencia, projetos)
- [ ] Pretensao salarial nunca visivel publicamente
- [ ] Perfil empresa acessivel via `/companies/{handle}` sem autenticacao
- [ ] Exibe dados da empresa, unidades e vagas abertas
- [ ] Faixa salarial controlada por `show_salary`
- [ ] 404 para handles inexistentes
- [ ] Layout responsivo (mobile e desktop)

---

## Arquivos impactados

- `frontend/src/app/features/public/` *(novo modulo)*
  - `public.routes.ts`
  - `dev-profile/public-dev-profile.component.ts`
  - `company-profile/public-company-profile.component.ts`
- `frontend/src/app/app.routes.ts` (registrar rotas publicas)
- `frontend/src/app/core/services/public-profile.service.ts` *(novo)*
