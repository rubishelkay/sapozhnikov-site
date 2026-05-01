# URL-маппинг

Текущий ReadyMag → новый Astro. Все маршруты с trailing slash.

| ReadyMag | Astro | Заметки |
|---|---|---|
| `/` | `/` | главная |
| `/retro/` | `/retro/` | без изменений |
| `/a_wonderful_day/` | `/a-wonderful-day/` | underscore → kebab |
| `/dance/` | `/dance/` | без изменений |
| `/senza_titolo/` | `/senza-titolo/` | underscore → kebab |
| `/untitled/` | `/untitled/` | без изменений |
| `/the_city/` | `/the-city/` | underscore → kebab |
| `/the_drama_machine/` | `/the-drama-machine/` | underscore → kebab |
| `/total_picture/` | `/total-picture/` | underscore → kebab |
| `/2010_photos/` | `/photos-2010/` | переставлено для лучшего sort и читаемости |
| `/2003-2011/` | `/photos-2003-2011/` | приведено к общему шаблону `photos-*` |
| `/about/` | `/about/` | без изменений |
| `/books/` | `/books/` | без изменений |
| `/links/` | `/links/` | без изменений |
| `/contacts/` | `/contacts/` | без изменений |

## Что делать со старыми ссылками

При финальном деплое на прод (когда переключим домен с ReadyMag на новый сайт) добавим 301-редиректы со старых форм с подчёркиваниями и старых годовых slug'ов. Места, где это конфигурируется:

- nginx: блок `location ~ ^/(a_wonderful_day|...)` с `return 301`,
- shared hosting: `.htaccess` с `RedirectMatch 301`,
- Cloudflare/Vercel/любой статик-хост: правила redirects в их UI или `_redirects` файл.

Конкретный конфиг положим в `site/redirects.example.conf` ближе к деплою.

## Источник истины

Для бэка-сценариев вроде «куда вёл этот старый линк», смотри эту таблицу. Внутри сайта только новые URL: парсер, ассеты, sitemap — всё работает через kebab-case.
