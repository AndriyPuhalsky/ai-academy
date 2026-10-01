# Memory Index

- [Дизайн-система 009 у коді (з 010)](project_aia_design_system_010.md) — токени/компоненти/рух у трьох спільних файлах; reduce = два рядки; GSAP потребує власних воріт motionOn(); calm гасить лише цикли — з 2026-09-08 і GSAP через AIA.motion.loopOn/onPreset
- [Роадмап: 38 токенів у трьох файлах](project_aia_roadmap_tokens_010.md) — правити одним комітом; var(--c-bg) поза лапками; голова змійки після render(); сценарні ?data=
- [Компоненти й токени css/custom.css (ІСТОРІЯ, файл видалений 2026-09-07)](project_aia_css_components.md) — чотири системи; читати лише як довідку, чого там колись не було
- [Що показало видалення custom.css (етап 9)](project_aia_stage9_leftovers.md) — шість дірок системи 009 (три крапки термінала, підкреслення rm-entry, ::selection); метод A/B на 476 властивостях; пастка лапок при заміні хексів у JS
- [Перевірка: браузер і чим його заміняли](feedback_verification_without_browser.md) — iframe, cache-buster, CDP 45 с через window.__last; у фоновій вкладці переходи й rAF не йдуть; scroll-smooth ламає scrollTo; A/B у CSSOM + elementFromPoint
- [Латентні пастки, які лишаються в коді свідомо](project_aia_known_latent_traps.md) — дві в js/roadmap-render.js; документуємо, не виправляємо; QA попереджена
- [Діаграми Mermaid (010, коло фіксів)](project_aia_diagrams_mermaid.md) — useMaxWidth:false + скрол + margin-inline:auto; `<br/>` мертвий через securityLevel:strict; iframe ≥1024 ламає рендер
- [Пастки заміру в браузері](reference_browser_measure_traps.md) — вʼюпорт вкладки ≠ resize_window; урок гостя дає нульові ширини; атрибут після програмного скролу відстає
- [Звіт і коміти](feedback_report_and_commits.md) — report .md ПИСАТИ файлом (вимога власника 2026-09-10) + дублювати текстом; `-m`/`-F` перед `--`; дві правки одного файла = два послідовні коміти
- [Четвертий курс у коді (012 Jira)](project_aia_course_registry_jira_012.md) — ізоляція «лише додавати»: чотири нові js замість правок у спільних; AIA_PROGRESS не існує (є AIAProgress.completedSet); обгортка теми Mermaid лише ПЕРЕД mermaid-init
- [Пробник контрасту й напівпрозорі фони](reference_contrast_probe_compositing.md) — компонувати від КОРЕНЯ вниз, інакше вузли з власною альфою дають хибні 1,0 і 1,75
- [Таблиці: чому стискаються замість прокрутки](reference_tables_minwidth_autolayout.md) — дві половини причини, і жодна не працює сама; min-width на КОМІРЦІ ламає розподіл ширини, на table — ні
- [Ширини контейнера довідника](reference_aia_container_widths.md) — 348/702/**630**/766/766: на 1024 найвужче в проєкті; безпечна min-width < 630 px
