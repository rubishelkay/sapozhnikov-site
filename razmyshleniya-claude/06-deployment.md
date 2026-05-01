# Деплой и инфраструктура

## Хостинг

Кандидаты под статический портфолио:

### Cloudflare Pages + R2

- бесплатный тариф щедрый (unlimited bandwidth, 500 builds/month),
- R2 для оригиналов и больших ассетов: 10 GB бесплатно, дальше копейки, **нулевой egress**,
- свой домен sergeysapozhnikov.ru подключается за 5 минут,
- Workers для будущих серверных нужд (контактная форма, Stripe).

**Рекомендация — этот вариант**.

### Vercel

- лучший DX для Next.js,
- бесплатный hobby tier, но bandwidth/image transforms лимитированы,
- если делаем Astro/статикой, вся ценность Vercel пропадает.

### VPS (Hetzner / DigitalOcean / Selectel)

- даёт полный контроль, можно посадить рядом простой backend,
- nginx + Caddy + Hugo/Astro static — работает 5 лет без обслуживания,
- нужно следить за certbot, бэкапами, обновлениями ОС,
- риск: если Сергей хочет сам править — VPS для него overkill.

Если есть опыт и желание — VPS ок, но Cloudflare Pages дешевле и проще.

## Домен и DNS

- `sergeysapozhnikov.ru` — уже куплен и настроен. Нужно проверить регистратора и срок продления.
- DNS перенести в Cloudflare (бесплатно), там же сертификат.
- Сделать `www.sergeysapozhnikov.ru → sergeysapozhnikov.ru` 301-redirect.
- Не забыть про MX-записи для `sapo21@yandex.ru` (если почта где-то ещё).

## CI/CD

GitHub Actions на каждый push в main:

```yaml
- checkout
- setup-node
- npm ci
- npm run build
- deploy to Cloudflare Pages (через wrangler-action)
```

Превью: на каждый PR/branch — превью-деплой на Cloudflare. Так Сергей сможет смотреть изменения до прода.

## Бэкапы

- репо в GitHub (исходники, MDX, derived images <2 GB),
- оригиналы в R2 + локальная копия у тебя + у Сергея (3-2-1 правило),
- 600 MB ReadyMag PDF — в R2 или Backblaze, не в git,
- ежеквартально dump R2 на локальный диск.

## Аналитика

- **Plausible** или **Umami** — простые, без cookie-баннера, GDPR-friendly,
- Cloudflare Web Analytics — бесплатно, тоже без cookies,
- Google Analytics не нужен (требует cookie consent, тяжёлый).

## Мониторинг

Для статики достаточно:

- UptimeRobot или Cloudflare Health Checks → email/Telegram при падении,
- Cloudflare Pages даёт логи деплоев и ошибок 5xx сам.

## Контактная форма

Если на `/contacts/` будет форма (помимо mailto):

- **Resend** + Cloudflare Worker — отправка письма, простой rate-limit,
- **Formspree** / **Web3Forms** — без своего бэка,
- **mailto:** — самый простой, не требует ничего, но не работает у пользователей без настроенного email-клиента.

## Стоимость

Ориентир:

- домен ~600₽/год,
- Cloudflare Pages — 0₽,
- Cloudflare R2 (если оригиналов 30-50 GB) — ~$0.45/мес,
- Plausible self-host или $9/мес,
- итого: **~$10-12/мес**, или **~$0** при self-host аналитики.

## Git и репо

Сейчас рабочая папка не под git. Первое действие в первой же сессии работы:

```sh
cd /Users/jacobshmol/Documents/q5/cgit/sapozhnikov
git init
git lfs install   # для derived images, если решим хранить в repo
git remote add origin git@github.com:<owner>/<repo>.git
```

`.gitignore`:

- `redymag-pdf-site2020/` (PDF слишком большой),
- `public/images/*/original/` (оригиналы — отдельно),
- `node_modules`,
- `.DS_Store`, `.env*`.
