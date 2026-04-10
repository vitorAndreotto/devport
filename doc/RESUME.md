# ⚓ Dev Port

## 📖 Visão Geral

O **Dev Port** é uma plataforma de currículos voltada para desenvolvedores, com identidade visual inspirada no universo náutico.

A proposta é que cada desenvolvedor tenha um espaço centralizado para apresentar sua trajetória profissional, habilidades e projetos de forma organizada e visualmente atraente.

O conceito da plataforma gira em torno da ideia de um **porto**, onde desenvolvedores “ancoram” seus perfis e compartilham sua jornada profissional.

---

## 🎯 Objetivo do Projeto

Este projeto tem como foco **estudo e aprendizado**, abordando:

- Estruturação de um sistema completo (CRUD)
- Boas práticas de desenvolvimento
- Organização de código (camadas e responsabilidades)
- Integração com APIs externas (GitHub)
- Experiência de usuário (UX) com identidade visual consistente

---

## ⚓ Conceito do Produto

- Desenvolvedor → Perfil (navio)
- Experiência → Jornada (rotas)
- Projetos → Entregas (cargas)
- Skills → Capacidades técnicas (equipamentos)

> ⚠️ O tema náutico será aplicado principalmente na interface (UI), mantendo a modelagem de dados simples e objetiva.

---

## 🧩 Funcionalidades do MVP

### 👤 Perfil
- Informações principais do desenvolvedor
- Apresentação / resumo profissional
- Contato
- Links externos (GitHub, LinkedIn, etc.)

---

### 🛠️ Skills
- Cadastro de habilidades
- Separação entre:
  - Hard skills (tecnologias)
  - Soft skills (comportamentais)

---

### 🎓 Formação
- Cursos
- Graduação
- Certificações

---

### 💼 Experiência
- Histórico profissional
- Empresas anteriores
- Cargos
- Período de atuação

---

### 📦 Projetos
- Cadastro manual de projetos
- Informações como:
  - Nome
  - Descrição
  - Tecnologias utilizadas
  - Link do repositório

---

### 🔗 Integração com GitHub (básica)
- Conexão com conta GitHub
- Importação de repositórios
- Exibição de projetos automaticamente

---

### 🔍 Busca de Desenvolvedores
- Busca por:
  - Nome
  - Skills
- Filtros básicos
- Listagem de perfis

---

## 📚 Documentação de Produto

A documentação detalhada do projeto está organizada em [`/doc/`]:

| Documento | Descrição |
|---|---|
| [PRD.md](product/PRD.md) | **Product Requirements Document** — Visão do produto, módulos detalhados com campos e regras de negócio, priorização MoSCoW e roadmap de entregas |
| [USER_STORIES.md](product/USER_STORIES.md) | **User Stories** — 25 histórias de usuário organizadas por módulo, com critérios de aceite em checklist |
| [DATA_MODEL.md](product/DATA_MODEL.md) | **Data Model** — Modelagem de banco PostgreSQL com 6 tabelas, índices, constraints e regras de integridade |
| [API_CONTRACT.md](product/API_CONTRACT.md) | **API Contract** — 28 endpoints RESTful documentados com request/response, validações e códigos de erro |

---

## 🧱 Estrutura Técnica (visão geral)

O projeto será desenvolvido utilizando **Laravel**, com foco em:

- CRUD completo
- Organização em camadas (Controllers, Services, etc.)
- Boas práticas de código
- Relacionamentos entre entidades

---

## 🎨 Identidade Visual

### Tema
- Náutico / marítimo

### Direção visual
- Interface leve e fluida
- Cores baseadas em oceano:
  - Azul escuro (principal)
  - Azul médio (ação)
  - Tons neutros (areia / cinza)

---

## 🚀 Escopo do Projeto

O Dev Port não tem como objetivo inicial ser um produto comercial, mas sim:

- Servir como projeto de estudo
- Consolidar conhecimentos técnicos
- Explorar integração com APIs externas
- Criar um sistema completo do zero

---

## 📌 Possíveis Evoluções Futuras

- Score automático baseado em GitHub
- Dashboard de atividades
- Sistema de recomendações
- Match com vagas

---

## 🧠 Filosofia do Projeto

> "Fazer simples, bem feito e bem estruturado."

- Evitar complexidade desnecessária
- Priorizar clareza e organização
- Focar em aprendizado real

---