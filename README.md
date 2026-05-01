# sapozhnikov-site

Перенос https://sergeysapozhnikov.ru с ReadyMag на статический Astro-сайт.

ReadyMag-аккаунт отключится в конце 2026, до этого момента нужно успеть переехать. Цель: папка-архив, которую можно положить на любой VPS или shared hosting и которая работает без node-рантайма.

## Структура

```
.
├── site/                       — Astro-проект, единственная финальная сборка
├── source/                     — сырые материалы (парсер, PDF, скриншоты)
│   ├── parse-1/                — пробный парс index + retro
│   ├── scripts/                — node-утилиты для парсинга и обработки
│   └── redymag-pdf-site2020/   — PDF-экспорт ReadyMag (PDF в .gitignore)
├── docs/                       — research-материалы и канонические заметки
├── razmyshleniya-claude/       — рабочие черновики Claude по миграции
├── .githooks/pre-commit        — отбивает любой staged-файл > 25 MB
├── .gitignore
└── .gitattributes
```

## Правила репо

1. **Никаких больших файлов.** В git идёт только то, что меньше 25 MB. pre-commit hook отбивает остальное. Большие исходники (PDF, RAW, оригиналы фотографий) лежат локально или в `.gitignore`-папках.
2. **Sources ≠ site.** Всё в `/source` — сырьё. Финал собирается только в `/site`. Если что-то нужно сайту, копируется в `site/public/` или `site/src/`.
3. **Чистая статика.** `site` собирается в `dist/` без серверных функций. Деплой = копирование папки.

## Быстрый старт

```sh
# одна команда после клонирования — активирует pre-commit
git config core.hooksPath .githooks

# рабочий dev-сервер сайта
cd site
npm install
npm run dev   # → http://localhost:4321
```

## Дальше читать

- [docs/](docs/) — профиль Сергея, инвентарь старого сайта, стратегия парсинга, URL-маппинг, шрифты.
- [razmyshleniya-claude/](razmyshleniya-claude/) — рабочие заметки и план по фазам.
- [source/parse-1/README.md](source/parse-1/README.md) — устройство пробного парса.
