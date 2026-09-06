# Memory Index

- [Квізи заморожені 007](project_quiz_frozen_007.md) — `quizData` не правити; знахідки в звіт; `check-quiz.py --verify` має лишатись OK
- [Межа рецензії: квіз](feedback_review_scope_quiz.md) — те саме правило як настанова до дій редактора
- [Задача 008](project_task_008_review.md) — вичитка 26 сторінок «AI Термінала», по одній на агента
- [Задача 008 (варіант запису)](project_content_review_008.md) — той самий контекст, дубль; чистити при нагоді
- [Чим перевіряти урок](reference_lesson_verification.md) — check-lessons.py / check-quiz.py, screens/, curl доксів; машина зʼїхала з 2.1.236 на 2.1.263
- [Де брати факти](reference_lesson_fact_sources.md) — curl доксів замість WebFetch (він переказує, дослівні рядки губляться); llms.txt, glossary, мапа сторінок по темах
- [screens/*.txt: зсув на рядок](reference_screens_line_count.md) — файл починається з набраної команди, `wc -l` на 1 більше
- [Числа курсу вже зʼїхали](reference_course_numbers_drift.md) — 62→65 опцій, 13→18 підкоманд, 19→20 контекстів, `--restricted` зʼявився (звірено 2026-09-06)
- [Перехресні посилання на модулі](project_lesson_crossrefs.md) — «це вже було в модулі N» перевіряти grep-ом; у c07 таке посилання було хибне
- [Термінологія: оточення/середовище](project_terminology_env_vars.md) — c03 каже «змінна оточення», решта дев'яти уроків «змінні середовища»; не правити в одному файлі
