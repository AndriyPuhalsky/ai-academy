# Memory Index

- [MCP недоступний у PM-підсесії](reference_mcp_unavailable_in_pm.md) — `mcp__supabase__*` немає; REST упирається в service_role; єдине живе джерело — `/auth/v1/settings`
- [Джерело правди дизайн-хендофу](project_design_handoff_source.md) — переносити `04-variants/shared/`, не `03-build/`; три речі, яких пісочниця не знає
- [Розділ `js/auth.js` навпіл](project_auth_js_split.md) — auth.js (дані) ↔ auth-ui.js (вигляд); прийом проти конфлікту зон + правило порядку push
- [Латентні пастки лишаються задокументованими](feedback_latent_traps_stay.md) — макет переносимо як є; фікс → у ризики, звіт і «не подавати як дефект», не в код
- [Живий конфіг Auth](project_live_auth_config.md) — `mailer_autoconfirm: true`, наслідки для реєстрації та звʼязування акаунтів
- [Перевірка «текст не мінявся»](reference_text_untouched_check.md) — extract.py + базова лінія з коміта; «зникло = 0» замість суперечок на око
