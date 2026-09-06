---
name: task-008-terminal-content-review
description: Задача 008 — вичитка 26 сторінок курсу «AI Термінал» по одній сторінці на агента; квіз чіпати заборонено
metadata:
  type: project
---

Задача 008 `terminal-content-review` (з 2026-09-06): вичитка 26 готових сторінок курсу
«AI Термінал» (`modules/claude-code-01..23.html` + три довідники) — по одній сторінці на
запуск редактора. Урок уже в проді, тому правки точкові.

**Тверда межа, яку ставить сама задача:** блок `<script id="quizData">` **не редагувати
взагалі**, навіть якщо в питанні є дефект. Зауваження до квіза йдуть у звіт текстом.

**Why:** задача 007 (2026-09-06) вирівняла довжину дистракторів у всіх 390 питаннях трьох
курсів і зафіксувала результат у `dev/build/007-quiz-distractors/baseline.json`. Будь-яка
правка тексту питання/варіанта/`explain` ламає
`check-quiz.py --verify baseline.json`, і зламану перевірку помітять не одразу.

**How to apply:** дефект у квізі → розділ звіту, не `Edit`. Перед завершенням прогнати
`python3 dev/build/007-quiz-distractors/check-quiz.py --verify dev/build/007-quiz-distractors/baseline.json`
(має дати `VERIFY: OK`) і `python3 dev/build/005-ai-terminal/01-authoring/check-lessons.py`.
Звіт — фінальним повідомленням: харнес блокує підагентам створення `.md`.
Див. [[reference-lesson-verification]].
