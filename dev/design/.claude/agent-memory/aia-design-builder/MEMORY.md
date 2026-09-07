# Memory Index

- [Дизайн-система AIA v1 · 009](project_aia_009_design_system_v1.md) — порахована в OKLCH палітра, Prata/Golos/JetBrains, три акценти, ризик «світло згори»
- [Механізм руху 009](reference_aia_motion_mechanism_009.md) — `--motion` як єдині ворота, дві похідні одиниці, @property, епсилон 0.0004ms
- [Дизайн-система AIA (001)](project_aia_design_system.md) — 40px контроли, `line-strong`/`clay-deep`, семантичні класи замість Tailwind у JS-рядку
- [Конвенції руху AIA](project_aia_motion.md) — три криві, 180/130 мс без каскаду, transform-only shimmer
- [Тверді рішення власника](feedback_owner_hard_rules.md) — чужий бренд як є, Google Sans не фетчити, 44px це AAA, розповзання обсягу виносити вголос
- [Задача 003 «Роадмап»](project_aia_roadmap_003.md) — концепція «змійка», де форма лінії кодує стан
- [Конвенції руху AIA (003)](reference_aia_motion_conventions.md) — 2 ScrollTrigger на сторінку, один loop, виміряні криві, пастки GSAP+SVG
- [Палітра AIA і її пастки](reference_aia_palette_contrast_traps.md) — приглушення робиться формою, не кольором; ролі `--c-prose` vs `--c-muted`
- [Макет 005 «AI Термінал»](project_aia_005_terminal_build.md) — «стіл», вісь сторінки, маркери колонками, друк через clip-path
- [Візуальна перевірка](reference_headless_visual_check.md) — живий Chrome з 2026-09-07; IO не доставляється нерендереній вкладці; iframe бере CSS із кешу
- [Пастки дизайн-системи AIA](reference_aia_design_system_traps.md) — `.prose-aia pre` (0,1,1), ButtonFace, мертвий `li::marker`
- [Обмеження Figma Starter](reference_figma_starter_limits.md) — один режим змінних, три сторінки, денна квота MCP закінчується на ~14 викликів
