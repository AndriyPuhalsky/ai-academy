---
name: mcp-unavailable-in-pm-subagent
description: Supabase MCP tools are NOT in the aia-build-pm toolset; REST fallback is blocked too — plan around it instead of retrying
metadata:
  type: reference
---

`mcp__supabase__*` інструментів у наборі агента `aia-build-pm` **немає**, хоча кореневий
`.mcp.json` налаштований правильно і `enabledMcpjsonServers` містить `supabase`.
MCP працює в **кореневій** сесії, не в цій підсесії. Перевірено 2026-08-23 викликом
`list_tables` → «No such tool available».

**Обхідні шляхи та їхні межі:**
- `GET /rest/v1/` (OpenAPI зі схемою) — **не працює**: `401 Only the service_role API key
  can be used for this endpoint`. Anon-ключа замало.
- `GET /auth/v1/settings` з anon-ключем — **працює**, віддає стан провайдерів
  (`external.google`), `disable_signup`, `mailer_autoconfirm`. Єдине живе джерело
  фактів про Auth, доступне звідси.
- Anon-ключ у `config.json` → `supabase.anonKey`.

**Why:** без цього кожна нова задача витрачає кілька викликів на з'ясування того самого.
**How to apply:** у плані брати схему з `dev/build/002-rls-role-escalation/02-backend/findings.md`
і розділу «Стан бекенду» кореневого `CLAUDE.md`, **позначати такі факти як успадковані**,
а перевірку тіл функцій/тригерів ставити першим завданням бекендеру (у нього MCP є,
плюс `mcp__claude-in-chrome` як запасний шлях). Гадати й називати це фактом — заборонено.

Пов'язане: [[live-auth-config-facts]]
