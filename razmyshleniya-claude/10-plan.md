# План работ (после раунда 1)

Срез: 2026-05-01. Учитывает [09-decisions-round-1.md](09-decisions-round-1.md).

## Принципы

1. **Простота для LLM**. Один проект — один файл. Минимум магии, минимум абстракций.
2. **Чистая статика**. `npm run build` → `dist/`. Папка `dist/` работает на любом хостинге без node.
3. **Сначала копия**. Дизайн = текущий ReadyMag 1-в-1. Темы, переключатели, оптимизации — потом.
4. **Source ≠ site**. `parse-1`, `docs`, `redymag-pdf-site2020`, `scripts` — это «сырьё». Финальная сборка — только в `/site`.
5. **Git с самого начала**. Все артефакты сразу под контролем версий, кроме 600 MB PDF и `node_modules`.

## Целевая структура репозитория

```
sapozhnikov/
  README.md                       ← короткий гайд по репозиторию
  .gitignore
  .gitattributes

  site/                           ← Astro-проект, единственная финальная сборка
    package.json
    astro.config.mjs
    tsconfig.json
    src/
      pages/
        index.astro
        retro.astro
        a-wonderful-day.astro
        dance.astro
        senza-titolo.astro
        untitled.astro
        the-city.astro
        the-drama-machine.astro
        total-picture.astro
        photos-2003-2011.astro
        photos-2010.astro
        about.astro
        books.astro
        links.astro
        contacts.astro
      layouts/
        BaseLayout.astro
      components/
        SiteHeader.astro
        SiteFooter.astro
        ProjectsMenu.astro
        Gallery.astro
        YouTubeEmbed.astro
      styles/
        global.css
        tokens.css                ← CSS custom properties, готовим место под темы
    public/
      images/
        index/
        retro/
        ...
      fonts/
      favicon/

  source/                         ← всё, что не часть финальной сборки
    parse-1/                      ← перенос сюда из текущего корня
    redymag-pdf-site2020/         ← PDF-экспорт (через .gitignore)
    pdf-derived/                  ← результаты обработки PDF (превью, изображения)
    screenshots/                  ← переезжает из корня
    scripts/                      ← парсер и будущие утилиты

  docs/                           ← остаётся как есть
  razmyshleniya-claude/           ← остаётся как есть
```

## Фазы

### Фаза 0 — фундамент (1 сессия)

1. `git init` в `/Users/.../sapozhnikov/`.
2. `.gitignore`:
   - `node_modules/`
   - `site/node_modules/`
   - `site/dist/`
   - `site/.astro/`
   - `source/redymag-pdf-site2020/*.pdf` (600 MB не комитим)
   - `.DS_Store`, `*.log`, `.env*`
3. `.gitattributes` — нормализация переводов строк.
4. Перенести существующие папки:
   - `parse-1/` → `source/parse-1/`
   - `screenshots/` (внутри parse-1 уже лежит) → проверить, оставить там
   - `scripts/` → `source/scripts/`
   - `redymag-pdf-site2020/` → `source/redymag-pdf-site2020/`
5. Короткий `README.md` в корне: что это за репо, где сайт, где сырьё.
6. Создать GitHub-репо. Имя: на твой выбор (см. вопросы ниже).
7. Первый коммит: «research baseline + repo layout».

### Фаза 1 — каркас Astro (1 сессия)

1. `npm create astro@latest site` (внутри корня репозитория).
2. Минимальная конфигурация:
   - TypeScript = strict,
   - integrations: только `@astrojs/mdx` (для длинных текстов проектов),
   - вывод: `output: 'static'` (по умолчанию),
   - trailingSlash: `'always'` чтобы совпадать с текущим ReadyMag.
3. Базовый layout: `BaseLayout.astro` — `<head>` с meta, og, фонтами, и общая обёртка.
4. Левое меню `ProjectsMenu.astro` — повторяет текущее.
5. `tokens.css` с CSS-переменными для цветов, типографики, spacing. Сейчас одна тема (текущая, светлая); место под темы готово.
6. `index.astro` — главная, точная копия (1 hero-картинка + меню).
7. `retro.astro` — длинная страница ретроспективы. Тексты + 20 картинок + 1 YouTube.
8. Не делаем остальные 13 страниц на этой фазе. Только index + retro.
9. `npm run dev` — крутится локально, визуально совпадает с текущим сайтом.

**Выход фазы**: рабочий локальный сайт на 2 страницах.

### Фаза 2 — парсер на все 15 страниц (1-2 сессии)

1. Расширить `source/scripts/build-parse-1.mjs` → `build-parse.mjs`. Принимает список slug'ов или работает по умолчанию по всему `__RM_PROPS__`.
2. Прогнать на все 15 страниц.
3. Сохранить:
   - `source/parse/content/{slug}.json`
   - `source/parse/content/{slug}.txt`
   - `source/parse/source/{slug}.page.html`
   - `source/parse/source/{slug}.snippet.html`
   - `source/parse/assets/{slug}/...`
4. PDF-обработка:
   - `brew install poppler mupdf`,
   - `source/scripts/process-pdf.mjs` — режет 600 MB на per-page PDF, извлекает изображения, делает превью,
   - результаты в `source/pdf-derived/{page-XX}/`.
5. Сравнить PDF-извлечённые изображения с ReadyMag-CDN: где качество выше — берём из PDF.

**Выход фазы**: автономный архив всего контента, не зависящий от ReadyMag.

### Фаза 3 — наполнение (3-4 сессии)

По одному проекту за сессию:

1. `a-wonderful-day` — короткая, 7 картинок, 1 YouTube.
2. `dance` — большая, 24 картинки, 5 YouTube, длинный автобиографический текст.
3. `senza-titolo` — 31 картинка.
4. `untitled` — 49 картинок.
5. `the-city` — 32 картинки + большой русский текст Левашова.
6. `the-drama-machine` — 39 картинок, 2 YouTube.
7. `total-picture` — 44 картинки, 1 YouTube.
8. `photos-2003-2011` — 75 картинок, 1 YouTube.
9. `photos-2010` — 102 картинки, без видео.

Плюс info-страницы:

- `about` — CV (выставки, коллекции).
- `books` — внешние ссылки на lingvoeast.ru.
- `links` — внешние ресурсы.
- `contacts` — email + соцсети.

### Фаза 4 — финальная зачистка и деплой (1 сессия)

1. Sitemap.xml автогенерируется через `@astrojs/sitemap`.
2. `robots.txt`.
3. og-картинки для каждой страницы (можно одну большую default).
4. Lighthouse / accessibility прогон.
5. Playwright-скриншоты как baseline (десктоп 1440 + моб 380), чтобы потом регрессить.
6. Сборка `npm run build`, проверка `dist/`.
7. Заливка на тестовый домен.
8. Проверка с Сергеем.
9. Замена DNS на проде после approval.
10. 301 со старых ReadyMag-маршрутов на новые (если slug'и поменялись).

### Фаза 5 — backlog по мере появления

См. backlog в [09-decisions-round-1.md](09-decisions-round-1.md).

## Что точно НЕ делаем сейчас

- ❌ Tailwind.
- ❌ React-runtime.
- ❌ Backend / serverless.
- ❌ CMS.
- ❌ Headless-CMS adapter в Astro.
- ❌ ISR / SSR.
- ❌ Image-CDN (next/image, Cloudflare Images, etc).
- ❌ Внешние шрифты от Google (стянем нужный в `public/fonts/` если выберем).
- ❌ Сложные галерейные библиотеки (PhotoSwipe и т.п.). Вместо этого — нативный `<dialog>` или прямые ссылки на full-size.
- ❌ Перенос/зеркалирование PDF-каталогов с lingvoeast.ru (отложили).

## Где «оптимизация под LLM»

1. Один проект = один `.astro` или `.mdx` файл. Не размазываем по 5 файлам.
2. Картинки лежат рядом по slug: `public/images/{slug}/...`. LLM может сходу `ls` и понять, что есть.
3. Все текстовые блоки внутри страницы, не в JSON-data-файлах. Чтобы поправить текст — нужно открыть один файл.
4. Никаких generated `[...slug].astro` с динамической логикой. Каждый маршрут — явный файл.
5. Названия файлов = URL (`a-wonderful-day.astro` → `/a-wonderful-day/`).
6. Минимум абстракций в компонентах. `<Gallery>` принимает массив `images={[...]}`, и всё.
7. Никаких content collections с фронт-маттером, схемой и тайпчеком — это удобно, но добавляет когнитивную нагрузку для редактирования. Просто обычные страницы.

## Что нужно от тебя перед стартом

См. вопросы ниже в чате.
