# Memory Index

- [MCP недоступний у PM-підсесії](reference_mcp_unavailable_in_pm.md) — `mcp__supabase__*` немає; REST упирається в service_role; єдине живе джерело — `/auth/v1/settings`
- [Джерело правди дизайн-хендофу](project_design_handoff_source.md) — переносити `04-variants/shared/`, не `03-build/`; три речі, яких пісочниця не знає
- [Розділ `js/auth.js` навпіл](project_auth_js_split.md) — auth.js (дані) ↔ auth-ui.js (вигляд); прийом проти конфлікту зон + правило порядку push
- [Живий конфіг Auth](project_live_auth_config.md) — `mailer_autoconfirm: true`, наслідки для реєстрації та звʼязування акаунтів
