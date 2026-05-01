# Решения (раунд 2)

Дата: 2026-05-01.

Закрывает второй раунд вопросов. Канон.

| # | Тема | Решение |
|---|---|---|
| 1+2 | Имя репо | `sapozhnikov-site`. Remote: `git@github.com:rubishelkay/sapozhnikov-site.git`. |
| 3 | Видимость | **private** на старте. После переключения домена — обсудим публикацию. |
| 4 | Тестовый домен | Не нужен. Работаем на `localhost:4321`. og/canonical = `http://localhost:4321` пока, заменим перед продом. |
| 5 | poppler/mupdf | Подтвердить в чате перед `brew install`. |
| 6 | Структура `source/` | На моё усмотрение. **Жёсткое условие: ни одного большого файла в GitHub.** Делаю через `.gitignore` + локальный pre-commit hook на размер. Лимит — 25 MB. |
| 7 | MDX правило | Длинные авторские/проектные страницы с текстом и встроенными картинками — `.mdx`. Index, меню, галереи, технические шаблоны, сложные сетки — `.astro`. Layout/меню/project-компоненты — Astro components. Не переводить весь сайт в MDX автоматически. **На старте: MDX только для `/the-city/` как тест.** Если ок — расширим на `/dance/` и `/the-drama-machine/`. |
| 8 | Двуязычность | Откладываем. Просто копируем тексты как есть на странице, два языка идут одним блоком, не разделяем. |
| 9 | Картинки | Тянем из ReadyMag в максимально доступном качестве, переименовываем по схеме slug, храним локально в `site/public/images/{slug}/`. |
| 10 | Старт | Astro + MDX, ставим, запускаем. |
| 11 | Шрифты | Системный стек (Helvetica и пр). Без подключения веб-шрифтов на этапе. Список — отдельным файлом `docs/font-stack.md`. |
| 12 | URL-маппинг | Делаем `docs/url-mapping.md` — старые ReadyMag-маршруты → новые kebab-case. Это страховка на случай, если потеряем ссылки. Но в новом проекте используем только новые. |
| 13 | trailing slash | `'always'`. |
| 14 | Базовый язык | `<html lang="ru">`. |

## Защита от больших файлов в GitHub

Сергей и я не должны иметь возможности случайно закоммитить 600 MB PDF или high-res JPEG. Защита в три слоя:

1. **`.gitignore`** — явный список того, что никогда не идёт в git: `source/redymag-pdf-site2020/*.pdf`, `**/*.psd`, `**/*.tiff`, `site/dist/`, `node_modules/`, и т.д.
2. **`.githooks/pre-commit`** — bash-скрипт, который отбрасывает любой staged-файл > 25 MB с понятным сообщением. Активируется через `git config core.hooksPath .githooks` (одна команда после клонирования).
3. **README с предупреждением** — что и как не комитить.

GitHub сам отбивает файлы > 100 MB, но мы не хотим даже близко подходить к этому пределу. 25 MB — комфортный потолок для обычной фотографии в derived-форматах.

## MDX-правило (закрепляем)

```
.mdx → проектные страницы с длинным авторским текстом + inline-фото:
       /the-city/ (тест), /dance/ (потом), /the-drama-machine/ (потом).
.astro → всё остальное:
       index, projects-меню-страница, retro, galleries-only страницы,
       about, books, links, contacts.
Astro components → BaseLayout, SiteHeader, SiteFooter, ProjectsMenu,
                   Gallery, YouTubeEmbed.
```

Принцип: MDX — там, где LLM (или человек) хочет редактировать длинный текст и иметь рядом `<img>`/компоненты. `.astro` — там, где правит код-разметку.

## Системные шрифты

Стек, который кладу сразу в `tokens.css` (детали в `docs/font-stack.md`):

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Helvetica Neue",
             Helvetica, Arial, "Segoe UI", Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
             "Liberation Mono", monospace;
--font-serif: ui-serif, Georgia, "Times New Roman", Times, serif;
```

На macOS отрисуется San Francisco / Helvetica Neue, на Windows — Segoe UI, на Linux — Roboto/DejaVu, и так далее. Никаких загрузок, ноль request'ов на шрифты.
