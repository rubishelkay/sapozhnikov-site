# Стратегия Парсинга ReadyMag

## Вывод

Да, сайт можно спарсить. Для этого не нужен ReadyMag Export и не нужен PDF. Текущий сайт отдает достаточно данных через обычные публичные запросы:

- sitemap со всеми публичными страницами;
- HTML каждой страницы;
- встроенный JSON ReadyMag `__RM_PROPS__`;
- CDN-ссылки на отдельные HTML-сниппеты страниц;
- в сниппетах: тексты, ссылки, изображения, YouTube ID, координаты и размеры виджетов.

Это не даст идеальный исходный ReadyMag-проект, но даст весь контент и контентную карту для миграции.

## Как устроен источник

На странице `https://sergeysapozhnikov.ru/about/` найден JSON проекта:

- project id: `1407828`
- user id/uri: `q5`
- pages count: `15`
- exported: `false`
- hasYoutube: `true`
- publicPath: `https://st-p.rmcdn1.net/b45ea352/dist`

У каждой страницы есть:

- `uri`
- `title`
- `height`
- `viewport_phone_portrait.height`
- `screenshot`
- `htmlUrl`

`htmlUrl` ведет на файл вида:

```text
https://c-p.rmcdn.net/5b924738956cc300857b8c8a/1407828/HtmlSnippet-....html
```

Именно эти файлы дают основную добычу.

## Рекомендуемый парсер

Лучше писать маленькую Node.js CLI-утилиту:

```text
scripts/scrape-readymag.mjs
```

Базовые шаги:

1. Скачать `https://sergeysapozhnikov.ru/about/` или любую страницу сайта.
2. Извлечь `__RM_PROPS__` из атрибута `data-content`.
3. Раскодировать HTML entities (`&quot;`, `&amp;`, `&lt;`, `&gt;`).
4. Распарсить JSON.
5. Из `project.pages` собрать список страниц и `htmlUrl`.
6. Скачать каждый `HtmlSnippet`.
7. Через Cheerio разобрать:
   - `article.page`;
   - `.rmwidget`;
   - `.widget-text-v3`;
   - `.widget-picture`;
   - `.widget-button`;
   - `.widget-shape`;
   - ссылки `a[href]`;
   - `img`, `srcset`, inline background images;
   - YouTube thumbnails/IDs.
8. Сохранить:
   - `content/readymag/project.json`;
   - `content/readymag/pages/{slug}.json`;
   - `content/readymag/pages/{slug}.html`;
   - `content/readymag/assets-manifest.json`;
   - опционально, текущие CDN-картинки в `public/legacy-assets/{slug}/`.

## Что сохранять в Page JSON

Минимальная структура:

```json
{
  "slug": "dance",
  "title": "Dance",
  "sourceUrl": "https://sergeysapozhnikov.ru/dance/",
  "readymag": {
    "pageNum": 4,
    "desktopHeight": 20358,
    "phoneHeight": 23733,
    "htmlUrl": "https://c-p.rmcdn.net/..."
  },
  "textBlocks": [],
  "images": [],
  "videos": [],
  "links": [],
  "widgets": []
}
```

Для каждого виджета стоит сохранить:

- `type`
- `id`
- `left`, `top`, `width`, `height`, `zIndex`
- `html`
- `plainText` для текста
- `href` для ссылок
- `src`/`srcset` для картинок
- `youtubeId` для видео

## Картинки

Картинки лежат в ReadyMag CDN, в основном:

```text
https://i-p.rmcdn.net/5b924738956cc300857b8c8a/1407828/upload-....jpg
```

В HTML часто есть варианты с query-параметром `?w=...`. Для миграции нужно сохранять:

- исходный URL без query;
- все найденные `?w=` варианты;
- максимальную ширину;
- страницу и widget id, где картинка использована;
- локальное имя файла, если решим скачать.

Так как у вас есть изображения в полном качестве, ReadyMag-ассеты лучше использовать как временные placeholders и как карту соответствия. Потом можно заменить по визуальному совпадению, имени проекта и порядку на странице.

## Видео

Видео лучше не скачивать. Сохраняем YouTube ID и собираем URL:

```text
https://www.youtube.com/watch?v={id}
```

Найденные ID уже перечислены в [02-current-site-inventory.md](02-current-site-inventory.md).

## Тексты

Тексты доступны как HTML внутри `.widget-text-v3`. Их лучше хранить в двух видах:

- `html`: чтобы не потерять ссылки, переносы и базовую структуру;
- `plainText`: чтобы быстро использовать в поиске, редактуре и будущей CMS.

Для будущего сайта текстовые блоки можно руками привести к нормальной редакторской структуре: заголовок проекта, годы, основной текст, подписи, библиография/каталог.

## Нужен ли Playwright

Для извлечения контента — не обязательно. HTML-сниппеты уже содержат данные. Playwright нужен позже для проверки:

- что текущая страница действительно визуально соответствует сохраненному HTML;
- какие изображения видны в конкретных viewport;
- не пропущены ли lazy-loaded элементы;
- как выглядит мобильная версия.

То есть ядро парсера: `fetch + Cheerio`. Визуальная валидация: Playwright.

## Риски

- ReadyMag может отдавать разные фрагменты для desktop/phone; нужно проверять мобильные data-атрибуты.
- Часть изображений может быть только в `srcset` или inline style.
- Некоторые страницы очень длинные: `2010_photos` и `2003-2011` требуют аккуратного порядка виджетов.
- В текущем CDN могут быть не оригиналы, а подготовленные web-версии. Для финала нужны ваши high-res файлы.
- PDF-каталоги лежат на внешнем домене `lingvoeast.ru`; нужно решить, хотим ли их зеркалировать.
- У ReadyMag-ссылок встречаются внутренние пути вида `/1407828/dance/`; при миграции их нужно нормализовать в `/dance/`.

## Рекомендуемый порядок следующего этапа

1. Написать парсер и сохранить `content/readymag/*`.
2. Скачать текущие изображения как placeholders.
3. Сгенерировать отчет: на какой странице сколько текстов, картинок, видео и внешних ссылок.
4. Подготовить таблицу замены изображений: ReadyMag URL -> high-res source filename.
5. После этого проектировать новую структуру сайта и CMS/данные.
