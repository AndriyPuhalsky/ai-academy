---
name: review-scope-quiz-untouchable
description: На рецензії уроків AI Термінала блок quizData не редагується взагалі; перевірки — check-lessons.py і check-quiz.py --verify baseline.json
metadata:
  type: feedback
---

Рецензуючи сторінку уроку курсу «AI Термінал», **блок `<script id="quizData">` не
чіпати жодним символом** — зауваження до квіза йдуть тільки у звіт.

**Why:** задача 007 (2026-09-06) вирівняла довжини дистракторів у 390 питаннях трьох
курсів і зафіксувала стан у `dev/build/007-quiz-distractors/baseline.json`. Будь-яка
правка тексту питання/варіанта/пояснення ламає `--verify` і стирає результат 007.

**How to apply:** перед фінальним повідомленням прогнати
`python3 dev/build/005-ai-terminal/01-authoring/check-lessons.py` (свій файл має бути `✓`)
і `python3 dev/build/007-quiz-distractors/check-quiz.py --verify dev/build/007-quiz-distractors/baseline.json`
(має бути `VERIFY: OK`). Статистику по одному файлу дає `check-quiz.py --files <файл>`.
Слабкі підказки, яких чекери не бачать (пунктуаційний маркер — тире, крапка з комою,
лапки — лише у правильному варіанті), рахувати власним скриптом і виносити у звіт як
матеріал для наступного кола 007.

Див. також [[screens-line-count-offset]].
