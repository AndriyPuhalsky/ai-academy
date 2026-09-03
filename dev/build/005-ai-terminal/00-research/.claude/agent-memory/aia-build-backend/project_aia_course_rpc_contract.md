---
name: aia-course-rpc-contract
description: Як влаштоване розблокування модулів і видача сертифікатів у базі AIA — скоуп за курсом, обов'язкове зарахування, пастка глобальної мапи кодів
metadata:
  type: project
---

Розблокування модулів у базі AIA **скоуплене за курсом**, а не глобальне. `submit_quiz`
сама попередній модуль не шукає — делегує в `module_unlocked(p_user, p_module)`, і та
робить три перевірки по черзі:

1. `exists(enrollments where user_id + course_id + status='active')` — **першою**;
2. `number <= 1` → true;
3. інакше `select id into v_prev from modules where course_id = v_course and number = v_number - 1`
   і `exists(progress where module_id = v_prev and status='completed')`.

`maybe_issue_certificate(p_user, p_course)` рахує модулі динамічно
(`count(*) from modules where course_id = p_course`) — захардкодженого числа немає.

**Why:** воротний аудит задачі 005 (2026-09-03, читання живої бази) перевіряв, чи не
зламає третій курс два живі. Не зламає — фільтр за `course_id` є в усіх гілках.

**How to apply:** додаючи курс, це три обов'язкові речі, а не одна вставка рядків:
`courses.is_paid = false` (інакше `handle_new_user` не зарахує навіть нових користувачів),
суцільна нумерація `number` 1…N без дірок (дірка = модуль після неї недосяжний назавжди,
бо `v_prev` буде null), і **backfill `enrollments` для вже наявних акаунтів** —
`handle_new_user` тригериться лише на створення користувача, старих не накриє. Без
backfill курс виглядає зламаним: перший модуль дає «Модуль ще заблоковано».

**Пастка, що не в базі, а на стику:** у базі `UNIQUE(course_id, code)`, тобто СУБД
дозволяє однаковий `code` у різних курсах. А `js/auth.js` (`buildModuleMap`) читає
`modules` **без фільтра за курсом** і робить `map[code] = id` — збіг коду мовчки затирає
модуль чужого курсу й ламає живий курс. Префікси (`m*` Академія, `a*` Architect,
`c*` AI Термінал) — несуча конструкція, не стильова угода.

Деталі й повний код функцій — `dev/build/005-ai-terminal/02-backend/audit-gate.md`.
Пов'язане: [[aia-live-db-read-routes]]
