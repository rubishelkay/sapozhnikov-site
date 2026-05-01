# Архитектура нового сайта

## Маршруты

URL'ы текущего сайта надо сохранить (SEO, входящие ссылки от галерей и прессы):

- `/` — index, hero и навигация,
- `/retro/` — Retrospective (Новая Третьяковка 2020),
- `/a_wonderful_day/`,
- `/dance/`,
- `/senza_titolo/`,
- `/untitled/`,
- `/the_city/`,
- `/the_drama_machine/`,
- `/total_picture/`,
- `/2010_photos/`,
- `/2003-2011/`,
- `/about/`,
- `/books/`,
- `/links/`,
- `/contacts/`.

Astro/Next роутинг ставится 1-в-1 (с trailing slash через config). Можно нормализовать имена в kebab-case (`a-wonderful-day` вместо `a_wonderful_day`) и сделать redirect старых URL'ов через `astro:redirects` или `next.config.js redirects`.

## Sitemap страниц

```
/
├─ /retro/                       Retrospective 2003-2018
├─ /a-wonderful-day/             A Wonderful Day (2018)
├─ /dance/                       Dance
├─ /senza-titolo/                Senza titolo
├─ /untitled/                    Untitled
├─ /the-city/                    The City
├─ /the-drama-machine/           The Drama Machine
├─ /total-picture/               Total Picture
├─ /photos-2003-2011/            2003-2011
├─ /photos-2010/                 2010
├─ /about/                       About / CV
├─ /books/                       Books
├─ /links/                       Links
└─ /contacts/                    Contacts
```

## Глобальные элементы

**Шапка**: лого "Sergey Sapozhnikov" + минимальная навигация (Projects, About, Books, Contacts) + переключатель языка (если делаем).

**Меню Projects** на текущем сайте — длинный левый список. На новом лучше: либо то же самое (фотографы любят такой формат), либо overlay-меню по клику.

**Подвал**: контакт, smart art, Instagram (×2), email, копирайт.

## Компоненты

- `<Hero>` — большая картинка-обложка для каждого проекта.
- `<ProjectMeta>` — год, место, кураторы, теги.
- `<RichText>` — MDX-content с настроенной типографикой.
- `<Gallery items={...} layout={...}>` — основной фоторяд. Поддерживает строки разной плотности.
- `<Lightbox>` — клик по фото открывает full-size карусель. Минимально нужный JS.
- `<YouTubeEmbed videoId={...}>` — lazy-load (заглушка → embed только по клику).
- `<PdfLink>` — карточка для каталога с превьюшкой обложки.

## Производительность

Цели:

- LCP <2.5s на 4G,
- CLS ~0,
- JS bundle на index <30 KB gzip,
- инициальный HTML страницы проекта <30 KB,
- картинки lazy всё, кроме первого экрана.

## Доступность

- alt-тексты к каждой картинке (брать из caption или генерировать через AI с проверкой Сергея),
- focus styles,
- проход по клавиатуре по галерее и lightbox,
- prefers-reduced-motion для любых анимаций,
- контраст на тёмном фоне (если выберем тёмную тему).

## Тема

Текущий сайт — светлый, минималистичный, левое меню чёрным шрифтом. Стоит обсудить:

- сохранить светлую палитру и поставить акцент на сами фотографии,
- или сделать тёмную (как на artsy / музейных сайтах) — фото на тёмном фоне читаются "галерейно",
- или toggle dark/light.

Рекомендация: тёмная по умолчанию + переключатель. Художественные проекты выигрывают от тёмного фона; работы Сергея цветовые, на чёрном они звучат сильнее.

## SEO и социальные карточки

- `og:image` — большая обложка проекта,
- `og:title`, `og:description` — из frontmatter,
- structured data: `Person` для самого Сергея, `VisualArtwork` для проектов, `Article` для long-form текстов,
- `sitemap.xml` генерируется автоматически,
- `robots.txt` со ссылкой на sitemap,
- canonical URL, чтобы не было дублей при trailing-slash вариациях.
