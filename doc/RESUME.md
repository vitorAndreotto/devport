# Dev Port

## Visão Geral

O **Dev Port** é uma plataforma de recrutamento tech onde desenvolvedores constroem perfis profissionais completos e empresas publicam vagas — com um sistema de matching inteligente que conecta os dois lados.

A plataforma funciona como um **porto digital**: devs "ancoram" seus perfis, empresas "atracam" suas vagas, e o sistema de matching atua como uma **bússola** que aponta as melhores conexões.

---

## Objetivo do Projeto

Este projeto tem como foco **estudo e aprendizado**, abordando:

- **NestJS** — API RESTful com arquitetura modular, JWT, Guards, TypeORM
- **Angular** — SPA com standalone components, Signals, lazy loading
- **PostgreSQL** — Modelagem relacional, constraints, ILIKE search
- **Redis** — Cache, JWT blacklist, refresh token storage
- **Docker** — Containerização completa do ambiente
- **TypeScript** — Full-stack, strict mode

---

## Conceito do Produto

| Conceito | Metáfora náutica |
|---|---|
| Desenvolvedor | Navio |
| Empresa | Atracadouro |
| Experiência | Jornada / Rotas |
| Projetos | Entregas / Cargas |
| Skills | Equipamentos |
| Vagas | Âncoras |
| Matching | Bússola |

> O tema náutico é aplicado na interface (UI). A modelagem de dados usa nomenclatura técnica direta.

---

## Funcionalidades do MVP

### Lado Dev
- Perfil profissional completo (bio, cargo, links, localização)
- Skills vinculadas a uma árvore padronizada (com nível e anos de experiência)
- Formação acadêmica e certificações
- Histórico profissional
- Projetos (manuais + importação do GitHub)
- Busca de vagas com score de compatibilidade

### Lado Empresa
- Perfil corporativo (CNPJ, setor, tamanho)
- Publicação de vagas (skills exigidas, modelo, modalidade, salário)
- Busca de devs com score de compatibilidade por vaga

### Matching
- Score de 0 a 100 baseado em: skills (60%), experiência (20%), modalidade (10%), localização (10%)
- Bidirecional: dev busca vagas, empresa busca devs
- Faixa salarial visível apenas internamente para a empresa

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (Node.js / TypeScript) |
| Frontend | Angular (TypeScript) |
| Banco de dados | PostgreSQL |
| Cache / Sessão | Redis |
| Autenticação | JWT (access + refresh token) |
| ORM | TypeORM |
| Containerização | Docker + Docker Compose |

---

## Documentação

A documentação completa está organizada em [`/doc/`](doc/):

### Produto

| Documento | Descrição |
|---|---|
| [PRD.md](doc/PRD.md) | **Product Requirements** — Visão do produto, dois tipos de usuário, módulos detalhados, priorização MoSCoW e roadmap |
| [USER_STORIES.md](doc/USER_STORIES.md) | **User Stories** — 42 histórias organizadas por módulo, com critérios de aceite |
| [DATA_MODEL.md](doc/DATA_MODEL.md) | **Data Model** — 10 tabelas PostgreSQL com UUID, índices, constraints e regras de integridade |
| [API_CONTRACT.md](doc/API_CONTRACT.md) | **API Contract** — 40 endpoints RESTful com request/response, validações e códigos de erro |

### Técnico

| Documento | Descrição |
|---|---|
| [ARCHITECTURE.md](doc/ARCHITECTURE.md) | **Arquitetura** — Estrutura de pastas, camadas, decisões (TypeORM, JWT, Redis, Standalone Components), fluxos |
| [CODING_STANDARDS.md](doc/CODING_STANDARDS.md) | **Padrões de código** — Nomenclatura, exemplos por camada, regras TypeScript, checklist de review |

---

## Estrutura do Projeto

```
devport/
├── backend/             # NestJS API (:3000)
├── frontend/            # Angular SPA (:4200)
├── doc/                 # Documentação completa
├── docker-compose.yml   # PostgreSQL + Redis + Backend + Frontend
└── README.md
```

---

## Identidade Visual

| Elemento | Direção |
|---|---|
| Tema | Náutico / marítimo |
| Cor principal | Azul escuro (navy) |
| Cor de ação | Azul médio |
| Tons neutros | Areia / cinza |
| Estilo | Corporativo, limpo, profissional |

---

## Escopo e Filosofia

O Dev Port é um projeto de estudo — não tem como objetivo ser um produto comercial.

> "Fazer simples, bem feito e bem estruturado."

- Evitar complexidade desnecessária
- Priorizar clareza e organização
- Focar em aprendizado real das tecnologias

---

## Possíveis Evoluções Futuras

- OAuth (GitHub / Google)
- Chat entre dev e empresa
- Candidatura formal a vagas
- Notificações (e-mail, push)
- Score automático baseado em GitHub
- Dashboard de analytics
- Painel administrativo para skill tree
