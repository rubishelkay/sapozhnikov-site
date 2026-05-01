# Контентный пайплайн

## Источники контента

1. ReadyMag HTML-сниппеты (через парсер) → структурированный JSON.
2. PDF-экспорт ReadyMag → визуальная сверка + резервные растры.
3. Оригинальные файлы от Сергея (надеемся получить) → high-res JPEG/TIFF/RAW.
4. Внешние PDF на `lingvoeast.ru` (10 каталогов).
5. YouTube embeds (10 видео).

## Целевая структура

```
content/
  projects/
    retro.mdx                # Retrospective 2003-2018
    a-wonderful-day.mdx
    dance.mdx
    senza-titolo.mdx
    untitled.mdx
    the-city.mdx
    the-drama-machine.mdx
    total-picture.mdx
    photos-2003-2011.mdx
    photos-2010.mdx
  pages/
    about.mdx
    books.mdx
    links.mdx
    contacts.mdx
  data/
    cv.json                  # выставки, коллекции, образование
    books.json               # PDF-каталоги
public/
  images/
    retro/
      original/              # оригиналы (если получим от Сергея)
      derived/               # AVIF/WebP/JPEG в нескольких размерах
    ...
```

## Frontmatter MDX

```mdx
---
title: "Retrospective 2003-2018"
slug: "retro"
sortOrder: 1
year: "2003-2018"
venue: "New Tretyakov Gallery, Krymsky Val 10, Moscow"
dates: "28.01 - 29.03.2020"
curator: "Maria Chiara di Trapani"
cover: "images/retro/cover.jpg"
youtube: ["6GBRIbJjET4"]
externalPdfs:
  - { lang: "ru", url: "/books/sapozhnikov_tretyakov_gallery_2003-2018.pdf" }
---

# Retrospective 2003-2018

Текст проекта...

<Gallery folder="retro" />
```

## Подходы к галереям

Несколько разумных вариантов компонента `<Gallery>`:

1. **Folder-based**: компонент сам читает `public/images/{folder}/derived/*` через build-time glob, генерирует JSX. Минимум работы.
2. **Manifest-based**: рядом с MDX лежит `retro.images.json` с порядком, кропами, подписями. Больше контроля, можно расставлять "большие/маленькие" блоки.
3. **Hybrid**: основной порядок — alphabetical/numeric из папки, плюс опциональный `retro.layout.json` с правилами вёрстки (двойные/тройные ряды).

Рекомендация: вариант 3. Сергей фотограф, ему важно, как именно лежат картинки рядом.

## Пайплайн изображений (подробнее в 04-image-strategy.md)

`scripts/process-images.mjs` (sharp):

1. читает `public/images/*/original/*`,
2. генерирует AVIF (q=55), WebP (q=78), JPEG (q=82),
3. в размерах 480 / 960 / 1440 / 1920 / 2880 (для retina),
4. кладёт результат в `public/images/*/derived/`,
5. пишет `manifest.json` с шириной/высотой/blurhash,
6. реальные оригиналы можно держать вне git (S3 / R2 / отдельный том) и подтягивать при сборке.

## Где лежат оригиналы

3 варианта:

- **Cloudflare R2** — дёшево, S3-совместимо, без egress fees. Подходит для архива оригиналов и для раздачи самих фотографий.
- **Backblaze B2** — ещё дешевле, но egress есть.
- **Локально + бэкап на внешний диск + iCloud/Dropbox** — если Сергей не хочет cloud.

При сборке: оригиналы локально → sharp → derived → коммит в git только derived (или derived тоже на R2). Оригиналы git хранить нельзя, они утопят репозиторий.

## Тексты на двух языках

Видно, что часть страниц на русском (`the_city`, `dance`), часть на английском, часть микс. Варианты:

1. Один язык на проект, как сейчас. Меняется только переключатель в шапке для About/Contacts.
2. Полная двуязычность: `dance.ru.mdx` + `dance.en.mdx`. Дороже по поддержке.

Рекомендация: вариант 1 для старта, перейти к 2 только если Сергей попросит.

## Книги (PDF-каталоги)

`books.json`:

```json
[
  {
    "title": "Sergey Sapozhnikov 2003-2012",
    "year": 2012,
    "languages": [
      { "lang": "ru", "url": "https://lingvoeast.ru/f/ssap/sergey_sapozhnikov_2003-2012_ru.pdf" },
      { "lang": "en", "url": "https://lingvoeast.ru/f/ssap/sergey_sapozhnikov_2003-2012_eng.pdf" }
    ]
  }
]
```

При сборке скачать все 10 PDF в `public/books/` и переключить ссылки на локальные. Так домен `lingvoeast.ru` перестаёт быть точкой отказа.
