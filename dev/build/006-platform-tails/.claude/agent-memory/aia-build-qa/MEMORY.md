# Memory Index

- [Hidden-вкладка вбиває анімацію](method_hidden_tab_limits.md) — перевіряти visibilityState першим; rAF/переходи/таймери мертві, геометрія і a11y живі
- [resize_window ненадійний](method_viewport_resize_unreliable.md) — рапортує успіх без зміни вʼюпорта; звіряти innerWidth, інакше — iframe
- [Tailwind JIT: класи лише з JS = зсув](project_tailwind_jit_shift_class.md) — ґреп класу по HTML, 0 входжень = дефект; три підтверджені випадки в AIA
- [Токен сесії не чіпати](feedback_session_token_untouchable.md) — гостьовий тест через localhost, а не підміну sb-*-auth-token
