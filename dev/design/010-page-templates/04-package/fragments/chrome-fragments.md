# Фрагменти спільного хрому — копіювати дослівно

Джерело — **каталог `_check/b1/chrome.html`**, де кожен фрагмент показаний живим,
а розмітка знята **з того самого DOM**, тому показане й скопійоване не можуть розʼїхатись.

⚠ **Це канонічні версії.** Кадри Б2 (урок, іспит) і Б3 (довідник, роадмап, verify,
сертифікат) містять шапку на одну редакцію старішу: у них **немає обгортки
`.ds-hdr__inner`**. Заміряно валідатором: `Б1=Б2 ✗`, `Б1=Б3 ✗`, і різниця — саме вона.
Бери версії звідси, а не з кадрів Б2/Б3.

⚠ **`.ds-hdr__inner` і правка `.ds-hdr .ds-nav` (замість `.ds-hdr > .ds-nav`) — пара.**
Обгортка без правки дає **+273 px горизонтального скролу на 320 px**: дочірній селектор
перестає діяти, і десктопна навігація лишається на мобілці. Правка вже в
`files/css/components.css`; обгортка — у фрагментах нижче.

**Чотири профілі шапки — це не чотири шапки, а один набір блоків у різних комбінаціях.**
Висота, паддінги, липкість, межа — однакові скрізь.

| Профіль | Де | Що є |
| ------- | -- | ---- |
| **H1** | 3 лендінги | бренд · навігація · дропдаун «Курси» · слот авторизації · бургер ≤640 |
| **H2** | 57 уроків та іспит | бренд · крихта «/ Модуль 01» · пілюля прогресу · слот · бургер змісту ≤1024 |
| **H3** | 3 довідники + сертифікат | бренд · крихта · слот |
| **H4** | verify | бренд. **Слота немає — і це правильно**: сторінка для сторонніх людей |

| Профіль футера | Де |
| -------------- | -- |
| **F1** повний | 3 лендінги + roadmap |
| **F2** короткий | 57 уроків + 3 довідники |
| **F3** футера немає | `verify.html`, `certificate.html` — лишається як є |

---


## `01-common-blocks` — Ф1 · чотири спільні блоки (§6.1): skip-link, #ariaLive, noscript, #configError

```html
<div class="ds-wrap ds-band">
  <div class="ds-note ds-note--warn" role="alert">
    <span class="ds-note__glyph" aria-hidden="true">▲</span>
    <p class="ds-note__body">Для роботи платформи потрібен JavaScript — увімкни його в налаштуваннях браузера.</p>
  </div>
  <div class="ds-note ds-note--err" role="alert" style="margin-top:var(--s-4)">
    <span class="ds-note__glyph" aria-hidden="true">✕</span>
    <p class="ds-note__body">
      ⚠ Не вдалося завантажити <code class="ds-code--inline">config.json</code>. Відкрий сайт через
      локальний сервер, наприклад: <code class="ds-code--inline">python -m http.server 8000</code> —
      і зайди на <code class="ds-code--inline">localhost:8000</code>.
    </p>
  </div>
</div>
```


## `02-header-h1-landing` — Ф2 · шапка, профіль H1 — лендінг (3 сторінки)

Знято з живого `_check/b1/index.html` (не з каталогу — там підписи каталогу).
`js/config.js` підставляє назву курсу в `.ds-hdr__brand`, `js/auth-ui.js` — вміст слота.

```html
<header class="ds-hdr">
    <div class="ds-hdr__inner">

      <!-- 2. БРЕНД -->
      <a class="ds-hdr__brand" href="index.html">
        <span class="ds-hdr__mark" data-site="shortName" aria-hidden="true">AIA</span>
        <span data-site="name">AI Академія</span>
      </a>

      <!-- 3. НАВІГАЦІЯ — тільки на лендінгах · §6.3 -->
      <nav class="ds-nav" aria-label="Головна навігація">
        <a class="ds-nav__link" href="#tracks">Треки</a>
        <a class="ds-nav__link" href="#syllabus">Програма</a>
        <a class="ds-nav__link" href="#donate">Підтримка</a>

        <div class="ds-nav__group">
          <button id="coursesBtn" type="button" class="ds-nav__link ds-nav__trigger"
                  aria-haspopup="true" aria-expanded="false" aria-controls="coursesMenu">
            Курси
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>
          </button>
          <div id="coursesMenu" class="ds-nav__menu" role="menu" aria-labelledby="coursesBtn">
            <a class="ds-nav__link" role="menuitem" href="index.html" aria-current="page">Базовий</a>
            <a class="ds-nav__link" role="menuitem" href="architect.html">AI Architect</a>
            <a class="ds-nav__link" role="menuitem" href="claude-code.html">Claude Code CLI</a>
          </div>
        </div>

        <a class="ds-nav__link" data-link="github" href="#">GitHub ↗</a>
      </nav>

      <span class="ds-hdr__spacer"></span>

      <!-- 4. СЛОТ АВТОРИЗАЦІЇ (js/auth-ui.js). Ширина фіксована токеном → CLS = 0 -->
      <div id="aiaAuth" class="ds-hdr__slot"></div>

      <!-- 5. ПІЛЮЛЯ ПРОГРЕСУ (js/config.js) -->
      <span id="navProgress" hidden class="ds-pill ds-pill--unknown"></span>

      <!-- 6. БУРГЕР МЕНЮ — тільки на лендінгах -->
      <button id="menuBtn" type="button" class="ds-btn ds-btn--icon ds-btn--sm ds-hdr__burger"
              aria-expanded="false" aria-controls="mobileMenu">
        <span class="sr-only">Меню</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
    </div>
  </header>
```


## `03-header-h2-lesson` — Ф2 · шапка, профіль H2 — урок та іспит (57 сторінок)

```html
<header class="ds-hdr">
  <div class="ds-hdr__inner">
    <button id="sidebarBtn" type="button" class="ds-btn ds-btn--icon ds-btn--sm ds-hdr__burger"
            aria-expanded="false" aria-controls="moduleSidebar">
      <span class="sr-only">Зміст курсу</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
    <a class="ds-hdr__brand" href="../index.html">
      <span class="ds-hdr__mark" data-site="shortName" aria-hidden="true">AIT</span>
      <span data-site="name">AI Термінал</span>
    </a>
    <span class="ds-hdr__crumb" aria-hidden="true">/</span>
    <span class="ds-hdr__crumb">Модуль 05 · Інтерфейс і навігація</span>
    <span class="ds-hdr__spacer"></span>
    <div id="aiaAuth" class="ds-hdr__slot"><button type="button" class="ds-btn ds-btn--secondary ds-btn--sm">Увійти</button></div>
    <span id="navProgress" class="ds-pill"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">4/23</span></span>
    <a class="ds-nav__link" href="../claude-code.html">До програми</a>
  </div>
</header>
```


## `04-header-h3-reference` — Ф2 · шапка, профіль H3 — довідник і сертифікат (4 сторінки)

```html
<header class="ds-hdr">
  <div class="ds-hdr__inner">
    <a class="ds-hdr__brand" href="claude-code.html">
      <span class="ds-hdr__mark" data-site="shortName" aria-hidden="true">AIT</span>
      <span data-site="name">AI Термінал</span>
    </a>
    <span class="ds-hdr__crumb" aria-hidden="true">/</span>
    <span class="ds-hdr__crumb">Довідник · усі команди й клавіші</span>
    <span class="ds-hdr__spacer"></span>
    <div id="aiaAuth" class="ds-hdr__slot"><span class="ds-skel ds-skel--guest" aria-hidden="true"></span></div>
    <span id="navProgress" class="ds-pill ds-pill--unknown"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">—</span></span>
    <a class="ds-nav__link" href="claude-code.html">До курсу</a>
  </div>
</header>
```


## `05-header-h4-verify` — Ф2 · шапка, профіль H4 — verify (1 сторінка). Слота НЕМАЄ свідомо

```html
<header class="ds-hdr">
  <div class="ds-hdr__inner">
    <a class="ds-hdr__brand" href="index.html">
      <span class="ds-hdr__mark" aria-hidden="true">AIA</span>
      <span>AI Академія</span>
    </a>
    <span class="ds-hdr__spacer"></span>
    <a class="ds-nav__link" href="index.html">На головну</a>
  </div>
</header>
```


## `06-progress-pill` — Ф6 · пілюля прогресу (§6.5)

```html
<span class="ds-pill ds-pill--unknown"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">—</span></span>
<span class="ds-pill"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">3/12</span></span>
<span class="ds-pill"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">10/23</span></span>
<span class="ds-pill ds-pill--full"><span class="ds-pill__label">Прогрес:</span><span class="ds-num">23/23</span></span>
```


## `07-footer-f1-full` — Ф7 · футер, профіль F1 — повний (3 лендінги + roadmap)

```html
<footer class="ds-ftr">
  <div class="ds-ftr__grid">
    <div>
      <p class="ds-h4">AI Академія</p>
      <p class="ds-small">Незалежний освітній проєкт спільноти. Не є офіційним продуктом Anthropic і не афілійований з компанією. Claude та Anthropic — торгові марки відповідних власників.</p>
    </div>
    <nav aria-label="Посилання проєкту">
      <p class="ds-eyebrow">Проєкт</p>
      <ul class="ds-ftr__list">
        <li><a href="certificate.html">Мої сертифікати ↗</a></li>
        <li><button type="button" class="ds-btn ds-btn--quiet ds-btn--sm">Написати нам</button></li>
      </ul>
      <a class="rm-entry" href="roadmap.html">
        <span class="rm-entry__label">План розвитку</span>
        <span class="rm-entry__arrow" aria-hidden="true">→</span>
        <span class="rm-entry__rule" aria-hidden="true"></span>
      </a>
    </nav>
    <nav aria-label="Першоджерела">
      <p class="ds-eyebrow">Першоджерела</p>
      <ul class="ds-ftr__list">
        <li><a href="https://docs.claude.com">Документація Claude ↗</a></li>
        <li><a href="https://anthropic.skilljar.com">Офіційні курси Anthropic ↗</a></li>
      </ul>
    </nav>
  </div>
  <div class="ds-ftr__bar">
    <span>v0.4.2 · оновлено 6 вересня 2026</span>
    <span>Зроблено спільнотою · <a href="#top">Нагору ↑</a></span>
  </div>
</footer>
```


## `08-footer-f2-short` — Ф7 · футер, профіль F2 — короткий (57 уроків + 3 довідники)

```html
<footer class="ds-ftr ds-ftr--short">
  <div class="ds-ftr__bar">
    <span class="ds-small">Незалежний освітній проєкт спільноти. Не афілійований з Anthropic.</span>
    <span><a href="claude-code.html">На головну ↑</a></span>
  </div>
</footer>
```


## `09-rm-entry` — Ф8 · .rm-entry у футері — не рядок списку (§6.7)

```html
<a class="rm-entry" href="roadmap.html">
  <span class="rm-entry__label">План розвитку</span>
  <span class="rm-entry__arrow" aria-hidden="true">→</span>
  <span class="rm-entry__rule" aria-hidden="true"></span>
</a>
<a class="rm-entry" href="#top" aria-current="page">
  <span class="rm-entry__label">План розвитку (поточна сторінка)</span>
  <span class="rm-entry__arrow" aria-hidden="true">→</span>
  <span class="rm-entry__rule" aria-hidden="true"></span>
</a>
```


## `10-gbtn-google` — Ф9 · чужий брендовий актив .gbtn (Д7, G2) — значення не наші, не чіпати

```html
<button type="button" class="gbtn gbtn--light">
  <span class="gbtn__logo" aria-hidden="true">
    <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
  </span>
  <span class="gbtn__label">Продовжити з Google</span>
</button>
```


## `11-dialog-head-bar-tabs` — Ф10 · діалог: __head, __bar, ds-tabs (§8.10.4)

```html
<div class="ds-dlg__card" style="position:relative;opacity:1;transform:none">
  <div class="ds-dlg__head">
    <p class="ds-eyebrow">Вхід</p>
    <h3 class="ds-h3">Продовжити навчання</h3>
    <p class="ds-small">Прогрес зберігається на сервері — з будь-якого пристрою.</p>
  </div>
  <div class="ds-tabs">
    <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm ds-tabs__pill" aria-pressed="true">Увійти</button>
    <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm ds-tabs__pill" aria-pressed="false">Зареєструватись</button>
  </div>
  <div class="ds-dlg__bar" style="margin-top:var(--s-5)"><span></span></div>
</div>
```
