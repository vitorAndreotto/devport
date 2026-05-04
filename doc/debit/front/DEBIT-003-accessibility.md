# DEBIT-003 — Acessibilidade (a11y) (Frontend)

> Tipo: UX
> Prioridade: Media
> Status: Pendente

---

## Problema

O frontend nao possui atributos de acessibilidade (ARIA). Nenhum `aria-*`, `role` ou pratica semantica avancada foi detectada nos templates. Isso impacta:
- Usuarios que dependem de leitores de tela (screen readers)
- Navegacao exclusivamente por teclado
- Conformidade com WCAG 2.1 nivel AA

---

## Escopo

### Areas criticas

| Area | Problemas esperados |
|---|---|
| Formularios | Faltam `aria-label`, `aria-describedby` para campos, associacao label-input |
| Modais | Faltam `role="dialog"`, `aria-modal`, focus trap |
| Toasts/Notificacoes | Faltam `role="alert"`, `aria-live="polite"` |
| Navegacao | Faltam `aria-current="page"`, skip links, `role="navigation"` |
| Tabelas/listas | Faltam `role`, `aria-sort` em colunas ordenaveis |
| Botoes de icone | Faltam `aria-label` em botoes que usam apenas icones (Lucide) |
| Sidebar mobile | Falta focus trap quando sidebar esta aberta |

### Melhorias sugeridas

1. **FormFieldComponent** — associar `<label>` com `for` e `id`, adicionar `aria-describedby` para mensagens de erro
2. **ToastComponent** — adicionar `role="alert"` e `aria-live="assertive"`
3. **NavbarComponent** — adicionar `role="navigation"`, `aria-label`, skip link
4. **Modais** — implementar focus trap, `role="dialog"`, `aria-modal="true"`
5. **Botoes de icone** — adicionar `aria-label` descritivo
6. **Contraste de cores** — verificar ratios do tema nautico (azul escuro sobre fundos claros)

---

## Criterios de aceite

- [ ] Todos os formularios com labels associados e `aria-describedby` para erros
- [ ] Toasts com `role="alert"`
- [ ] Navegacao com `role="navigation"` e skip link
- [ ] Botoes de icone com `aria-label`
- [ ] Auditoria Lighthouse Accessibility > 80
- [ ] Navegacao funcional apenas com teclado (Tab, Enter, Escape)

---

## Arquivos impactados

- `frontend/src/app/shared/components/**/*.html`
- `frontend/src/app/features/**/*.html`
- `frontend/src/app/layouts/**/*.html`
- `frontend/src/styles.scss` (ajustes de contraste se necessario)
