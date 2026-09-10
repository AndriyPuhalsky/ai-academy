# Memory Index

- [MCP недоступний у PM-підсесії](reference_mcp_unavailable_in_pm.md) — `mcp__supabase__*` немає; REST упирається в service_role; єдине живе джерело — `/auth/v1/settings`
- [Джерело правди дизайн-хендофу](project_design_handoff_source.md) — переносити `04-variants/shared/`, не `03-build/`; три речі, яких пісочниця не знає
- [Розділ `js/auth.js` навпіл](project_auth_js_split.md) — auth.js (дані) ↔ auth-ui.js (вигляд); прийом проти конфлікту зон + правило порядку push
- [Латентні пастки лишаються задокументованими](feedback_latent_traps_stay.md) — макет переносимо як є; фікс → у ризики, звіт і «не подавати як дефект», не в код
- [Живий конфіг Auth](project_live_auth_config.md) — `mailer_autoconfirm: true`, наслідки для реєстрації та звʼязування акаунтів
- [Перевірка «текст не мінявся»](reference_text_untouched_check.md) — extract.py + базова лінія з коміта; «зникло = 0» замість суперечок на око
- [Рішення №6 · резерв сайдбара](project_011_decision6_sidebar_reserve.md) — резерв == стеля, тільки під раннім замком гостя; безумовний `:has(#aiaGate)` заборонений
- [Делеговане рішення](feedback_owner_delegates_decisions.md) — «вирішуй сам» = одне рішення зі спекою й «що НЕ робити», не меню варіантів
- [Один вхід на сторінку](project_011_decision2_page_in_rule.md) — `data-page-in` проти власної хореографії; roadmap свідомо без нього, додавання БЕЗПЕЧНЕ, але накладається на 100 %
- [Прозорість маскує CLS + ін'єкція атрибута](reference_cls_opacity_masking.md) — «покращення CLS» перевіряти прогоном під reduce; A/B чужого атрибута без правки файла
- [Механіка смуг прокрутки](reference_scrollbar_hint_mechanics.md) — успадкований `scrollbar-color` вимикає `::-webkit-scrollbar`; на macOS усі скролери накладні; метод «чи є що гасити»
