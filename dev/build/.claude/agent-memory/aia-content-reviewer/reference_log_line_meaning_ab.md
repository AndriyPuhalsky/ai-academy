---
name: log-line-meaning-ab
description: Рядок журналу, процитований разом із тлумаченням («тобто X не завантажився»), перевіряти A/B-запуском — у c17 «Hooks: Found 0 total hooks in registry» означало не те, що написав автор
metadata:
  type: reference
---

Найпідступніший клас дефекту в уроках про діагностику: рядок **справжній** (автор його
бачив), а **тлумачення** до нього вигадане. Чекер такого не бачить, і читач теж — рядок
виглядає як доказ.

**Прецедент `c17` (2026-09-06).** Автор процитував `Hooks: Found 0 total hooks in registry`
з журналу `--debug` і написав «тобто той самий зламаний перехоплювач не завантажився».
Насправді рядок рахує **відкладені асинхронні хуки**, які чекають на вивід, а не завантажені
з `settings.json`. Виправлено в чотирьох місцях уроку (блок 3, вправа 3, грабля 4, підсумок).

**Метод, який це довів — A/B на живій збірці (2.1.263), дві хвилини:**

1. у `/private/tmp/<щось>/.claude/settings.json` покласти **робочий** `SessionStart`-хук
   (`{"hooks":{"SessionStart":[{"matcher":"","hooks":[{"type":"command","command":"echo hookfired"}]}]}}`);
2. `claude --debug-file <шлях> -p "reply with the single word OK"` — одна крихітна відповідь;
3. те саме з **зламаним** файлом (`"matcher":["x"]`);
4. порівняти журнали.

Результат: `Hooks: Found 0 total hooks in registry` присутній **в обох**, а справжня різниця —
рядок `Hook SessionStart:startup (SessionStart) success:` є лише в робочому випадку. Це
збіглося з доксами: `debug-your-config.md` — «The debug log records each event, which matchers
were checked, and the hook's exit code and output».

**Другий доказ, без жодного запуску:** `strings "$(which claude)" | grep "total hooks"` віддає
мініфіковану функцію цілком — видно, що вона читає `pendingHooks` реєстру асинхронних хуків.
Тобто `strings` годиться не лише щоб порахувати наявність ключа ([[lesson-verification]]),
а й щоб **прочитати код, який друкує рядок**.

**How to apply.** Побачив у тексті конструкцію «рядок X — тобто Y» — не приймай Y на віру.
Або відтвори A/B, або винеси у звіт. Споріднене: [[author-own-measurements]] (те саме про
числа з власних дослідів автора).
