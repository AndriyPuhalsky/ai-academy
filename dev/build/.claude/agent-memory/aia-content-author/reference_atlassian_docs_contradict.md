---
name: reference-atlassian-docs-contradict
description: Дві сторінки доксів Atlassian про ту саму фічу дають різні переліки й різні межі — перед цитуванням списку звіряти другу сторінку розділу (доведено на workflow-правилах і перейменуванні статусу, 2026-09-18)
metadata:
  type: reference
---

**Перед тим як переносити в урок ПЕРЕЛІК або МЕЖУ дії з доксів Atlassian, відкрий другу
сторінку того ж розділу.** Розбіжність між власними сторінками Atlassian — не рідкість,
а норма, і вона мовчазна: обидві сторінки виглядають свіжими й авторитетними.

**Why:** на `j10` (workflow) два випадки в одному уроці.
1. `jira-software-cloud/docs/available-workflow-rules-in-team-managed-projects/` перелічує
   **сім** правил переходу; `…/add-or-remove-workflow-rules-in-team-managed-projects/` —
   **п'ять**, причому один із них (`Remind people to update empty fields`) на першій
   сторінці не згадується взагалі. Автор, який процитує будь-яку одну, дасть учневі
   неповний або чужий список.
2. `jira-cloud-administration/docs/what-is-a-workflow-status/` каже, що перейменування
   статусу розходиться «in every workflow (and every space) that uses it», а
   `…/create-edit-and-delete-statuses-in-team-managed-projects/` — «in all your space's
   workflows». Для team-managed вірне друге (статуси там свої в кожному спейсі), тобто
   адмінська сторінка описує інший тип спейсу, не позначивши цього.

**Третій випадок (j13, 2026-09-18): факт живе лише на сторінці «чужого» типу спейсу.**
Поведінка WIP-ліміту для team-managed описана одним реченням («the column changes color
when it contains too many work items»), а кольори й показ значення — тільки на
company-managed-сторінці `configure-columns` («Red column header — maximum number of work
items exceeded», «The values of the column constraints will appear at the top of each
column»). Викидати такий факт шкода, брати мовчки не можна: у курсі він поданий з явним
підписом «це сторінка про дошки рівня компанії». Там само — два різні шляхи до тієї самої
настройки (`Space settings → Board → Edit column` проти `колонка → More actions → Set
column limit`), причому перший веде в розділ, якого немає на знімку sandbox.

Робоче правило: **адмінські сторінки (`jira-cloud-administration/docs/…`) описують
company-managed світ**, сторінки з банером «This page is for team-managed spaces» —
наш. Коли вони розходяться, для курсу вірна team-managed-сторінка. Так само окремі
близнюки статей живуть у `jira-service-management-cloud/docs/…` — для JSM брати їх.

**How to apply:** будь-який `<ul>` назв (правила, типи полів, канали, ролі) або будь-яке
«змінюється всюди / лише тут» — це сигнал відкрити другу сторінку. Розбіжність, яку
знайшов, не ховати: вона йде в розділ 6 звіту, а якщо стосується того, що учень
натисне, — одним реченням в урок.

Дрібниця того ж походження: `curl -sL … -w '%{url_effective}'` показує, що частина
слагів **редіректить** (`…/add-a-separate-workflow-for-epics-in-team-managed-projects/`
→ `…/create-and-edit-workflows-in-team-managed-projects/`). Посилатись треба на кінцеву
адресу. Решта прийомів пошуку — [[reference-atlassian-docs-lookup]];
джерельна ієрархія курсу — [[project-jira-course-authoring]].
