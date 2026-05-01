# Шрифты

Принцип: на старте используем только системные шрифты. Никаких внешних загрузок, ноль HTTP-запросов на font-файлы. Когда дойдём до фазы темирования и редизайна, можем подключить self-hosted веб-шрифт.

## Стек, который ставим в `site/src/styles/tokens.css`

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont,
               "Helvetica Neue", Helvetica, Arial,
               "Segoe UI", Roboto,
               sans-serif,
               "Apple Color Emoji", "Segoe UI Emoji";

  --font-serif: ui-serif,
                Georgia, "Times New Roman", Times,
                serif;

  --font-mono: ui-monospace,
               SFMono-Regular, "SF Mono",
               Menlo, Consolas, "Liberation Mono",
               monospace;
}
```

## Как это рендерится

| Платформа | sans | serif | mono |
|---|---|---|---|
| macOS / iOS | San Francisco (через `-apple-system`) | New York (`ui-serif`) | SF Mono (`ui-monospace`) |
| Windows | Segoe UI | Georgia | Consolas |
| Android | Roboto | Noto Serif | Roboto Mono |
| Linux | Roboto / DejaVu Sans / Liberation Sans | Liberation Serif / DejaVu Serif | DejaVu Sans Mono |

Никаких fallback'ов на «Roboto from Google Fonts» — заменён локальной альтернативой или системным дефолтом.

## Если позже захотим веб-шрифты

Кандидаты, которые хорошо смотрятся на художественных портфолио:

- **Inter** — лицензия SIL OFL, базовый sans для почти всего.
- **Söhne / GT America / Suisse** — коммерческие, требуют покупки лицензии.
- **Authentic Sans** — open-source альтернатива Söhne.
- **Tobias / Editorial New / Reckless Neue** — для крупных заголовков, акцентный serif.
- **Fraunces** — open-source serif, очень гибкий, есть variable fork.

Алгоритм подключения, когда дойдёт:

1. Скачать `.woff2` нужных весов (`regular` + `medium`/`semibold`).
2. Положить в `site/public/fonts/`.
3. В `tokens.css` добавить `@font-face` с `font-display: swap` и `unicode-range`, чтобы кириллица не тянулась впустую.
4. Подменить `--font-sans` / `--font-serif` на новый стек, оставив системный fallback.

Не подключать `Google Fonts CDN` — это внешняя зависимость, GDPR-проблема и медленный first paint.

## Размеры

Базовая шкала, тоже в `tokens.css` — пока заглушки, отполируем в фазе дизайна:

```css
:root {
  --fs-xs: 0.75rem;   /* 12px */
  --fs-sm: 0.875rem;  /* 14px */
  --fs-md: 1rem;      /* 16px */
  --fs-lg: 1.25rem;   /* 20px */
  --fs-xl: 1.75rem;   /* 28px */
  --fs-xxl: 2.5rem;   /* 40px */

  --lh-tight: 1.2;
  --lh-normal: 1.5;
  --lh-loose: 1.7;
}
```
