# Memory Index

- [Ширини в'юпорта: 768 вікном, 390 тільки iframe](method_viewport_widths.md) — resize_window ПРАЦЮЄ (старий запис хибний), але дно 500 px; пастки iframe і scroll-smooth
- [Пробник контрасту й доступності](method_contrast_and_a11y_probe.md) — складати альфу й opacity предків, інакше хибні провали; ArrowRight, не Right
- [Класи дефектів, що повторюються](project_recurring_defect_classes.md) — таблиці без обгортки на 390, стан появи поза DOM, напівпрозора шапка; і що тут платформне
- [Як міряти CLS у цьому оточенні](method_cls_measurement.md) — layout-shift API мовчить у фоновому вікні; міряти геометрію пробниками ⚠️ пункт про resize_window застарів
- [Гостьові тести — на localhost](method_guest_tests_on_localhost.md) — інший origin рятує живу сесію тестового акаунта на превʼю
- [A/B-доказ для CSS-фіксів](method_ab_css_proof.md) — знімати правило через CSSOM і перезаміряти; контроль обовʼязковий; у фоні transition не тікає
- [Симуляція прогресу через hydrate](method_progress_simulation.md) — стан «залогінений» без входу; ⛔ не перезаписувати completedSet — це функція
- [Межа: акаунт створює власник](feedback_account_creation_boundary.md) — дозвіл у task.md знімає питання про базу, але не про дію; що робити натомість
- [Сертифікат: D-04/D-05/QR закриті](project_certificate_pdf_findings.md) — 27 МБ→0,42 МБ, 2 клікабельні області, QR читається; перевіряти сам файл, а не шаблон; імʼя брати з `profiles`, не з метаданих
- [Клік по посиланню в PDF](method_pdf_link_click_testing.md) — стенд pdf.js з AnnotationLayer; переглядач Chrome завмирає; ⚠️ стенд працює лише в АКТИВНІЙ вкладці
