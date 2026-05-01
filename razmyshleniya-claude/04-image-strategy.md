# Изображения

## Что нам нужно от картинок

- максимальная цветовая верность (Сергей работает с насыщенным барочным цветом),
- быстрая загрузка на мобильном (большие фото — не повод заставлять ждать),
- retina-качество на десктопе,
- предсказуемые layout shifts (явный width/height),
- работа без JS, если возможно (`<picture>` нативно).

## Форматы

- **AVIF** — основной. Лучшее сжатие, поддерживается всеми современными браузерами с 2023.
- **WebP** — fallback для старых iOS.
- **JPEG (mozjpeg)** — финальный fallback и для печати/скачивания.

Не использовать: PNG (для фото бессмысленно), HEIC (не поддерживается в Web).

## Размеры

Для каждой картинки генерируем 5 размеров:

- 480w — мобильный,
- 960w — мобильный @2x / планшет,
- 1440w — десктоп,
- 1920w — десктоп @2x,
- 2880w — retina большие экраны.

Это 5 × 3 = 15 файлов на одну фотографию. На 424 картинки получается ~6 360 файлов в derived. Терпимо для git, если каждый файл AVIF в среднем 80-200 KB (общий объём ~1-2 GB derived). Если многовато — выкидываем 2880 для всего, кроме hero, и оставляем 4 размера.

## Pipeline

`scripts/process-images.mjs`:

```js
import sharp from "sharp";
import { glob } from "glob";

const SIZES = [480, 960, 1440, 1920, 2880];
const FORMATS = [
  { ext: "avif", opts: { quality: 55, effort: 6 } },
  { ext: "webp", opts: { quality: 78 } },
  { ext: "jpg",  opts: { quality: 82, mozjpeg: true } },
];

for (const original of await glob("public/images/*/original/*.{jpg,jpeg,tif,tiff}")) {
  for (const w of SIZES) {
    for (const f of FORMATS) {
      // sharp(original).resize({width: w}).toFormat(...).toFile(...);
    }
  }
}
```

Запускать на CI или локально перед деплоем. Кешировать через `content-hash` каждого оригинала, чтобы не пересобирать всё каждый раз.

## Манифест

Рядом с derived лежит `manifest.json`:

```json
{
  "upload-389fea47": {
    "src": "/images/index/derived/upload-389fea47",
    "width": 4096,
    "height": 2730,
    "aspectRatio": 1.5,
    "blurDataURL": "data:image/jpeg;base64,...",
    "lqip": "data:image/svg+xml;..."
  }
}
```

Этот манифест читает `<Gallery>` и `<ProjectImage>` для корректного `width/height` и blur placeholder.

## LQIP / blur placeholder

Можно через `plaiceholder` или `sharp().resize({ width: 8 }).blur().jpeg({quality:30})`. Маленький blob (~1 KB) встраивается в HTML как `style="background-image: url(...)"` и заменяется на реальную картинку при загрузке.

## Доставка

Если хостинг — Vercel или Cloudflare, derived файлы можно положить прямо в `public/` и отдавать через CDN. Дополнительный image transform не нужен, всё уже предсобрано.

Если оригиналов очень много (>5 GB), стоит вынести `public/images/*/derived/` на R2/S3 и раздавать через `cdn.sergeysapozhnikov.ru`.

## Что делать с текущим CDN ReadyMag

`https://i-p.rmcdn.net/.../upload-XXX.jpg` — пока живой. На время миграции можно держать ссылки на ReadyMag CDN как первичные. Но **до выхода production** все картинки должны быть переехавшими, иначе сайт привязан к чужой CDN.

## Что делать с PDF-извлечёнными изображениями

Их использовать только если:

- они **выше качества**, чем то, что отдаёт ReadyMag CDN,
- и **есть оригиналы Сергея**, с которыми их можно сверить (PDF мог пожать цвет).

Иначе оставить как backup, не использовать в production.

## Оригиналы от Сергея

Это самый важный пункт, без которого сайт всегда будет downscaled. Нужно:

1. попросить у Сергея каталог оригиналов (можно по проектам),
2. получить разрешение на хранение и публикацию,
3. договориться, в каком разрешении он готов выкладывать (часто фотографы отдают max 2880px по длинной стороне),
4. договориться о водяном знаке / EXIF copyright (можно встроить через sharp).
