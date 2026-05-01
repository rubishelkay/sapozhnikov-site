# Parse 1

Первый пробный перенос двух страниц:

- `https://sergeysapozhnikov.ru/`
- `https://sergeysapozhnikov.ru/retro/`

## Структура

- `source/` — исходный HTML страниц и ReadyMag `HtmlSnippet`.
- `content/` — тексты и JSON по каждой странице.
- `assets/` — скачанные изображения ReadyMag CDN.
- `site/` — локальная статическая сборка.
- `screenshots/` — скриншоты live-сайта и локальной сборки.
- `assets-manifest.json` — общий манифест страниц и ассетов.
- `download-assets.curl` — curl config для повторной загрузки картинок.

## Локальная проверка

Сервер поднят от корня `parse-1`, поэтому страницы доступны так:

- `http://127.0.0.1:4174/site/index.html`
- `http://127.0.0.1:4174/site/retro.html`

В локальной сборке рабочей сделана ссылка `New Tretyakov Gallery`; остальные пункты меню пока сохранены как структура, но не ведут на собранные страницы.

## Скриншоты

- `screenshots/desktop/index-1440.png` — live главная, 1440 viewport.
- `screenshots/mobile/index-380.png` — live главная, mobile context 380 viewport.
- `screenshots/desktop/retro-1440.png` — live `retro`, viewport.
- `screenshots/mobile/retro-380.png` — live `retro`, mobile context 380 viewport.
- `screenshots/local-index-1440.png` — локальная главная, 1440.
- `screenshots/local-index-380.png` — локальная главная, 380.
- `screenshots/local-retro-1440-full.png` — локальная `retro`, полный desktop документ 1440 x 14036.
- `screenshots/local-retro-380-full.png` — локальная `retro`, полный mobile документ 380 x 5208.
