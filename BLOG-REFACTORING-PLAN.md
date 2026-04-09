# План рефакторинга блога и Keystatic

## Сравнение проектов

### Шаблон (`templates/blog` — Coline)

Полноценный блог с:
- **Keystatic как CMS** с кастомными полями из `@syfxlin/reks` (document fields с component blocks)
- **Keystatic reader** (`@keystatic/core/reader`) для серверного чтения данных
- **Богатый контент**: KaTeX, GitHub-карточки, message-боксы, встройки статей
- **Категории, теги, архивы** с группировкой и пагинацией
- **RSS, sitemap, поиск** (Fuse.js)
- **Синглтоны конфигурации**: SEO, автор, шапка, подвал, лицензия, главная, друзья, проекты
- Vanilla Extract CSS-in-JS + кастомная тема на Radix Colors
- Next.js 14, React 18

### Ваш проект (`soft-press`)

Бойлерплейт с auth/i18n/RBAC, но **сырым блогом**:
- **Ручной парсинг фронтматтера** через regex (хрупкий)
- **Ручной рендеринг markdown** построчно (неполный)
- **Нет Keystatic reader** — сырые `fs` вызовы
- **Нет категорий, тегов, архивов**, пагинации
- **Нет RSS**, нет поиска
- Простой Keystatic config с базовым `fields.markdoc`
- Next.js 16, React 19, Tailwind 4, shadcn/ui

---

## План рефакторинга

### Фаза 1: Keystatic Reader для получения данных

**Проблема:** Страницы блога парсят `.mdoc` файлы через regex вместо использования `@keystatic/core/reader`.

1. **Создать `src/contents/reader.ts`** — инициализация Keystatic reader через `createReader()`, коррекция пути для Vercel-сборки
2. **Создать `src/contents/fetcher.ts`** — кэшированный слой данных с:
   - `posts()` — чтение всех постов, фильтрация по статусу, сортировка по дате
   - `post(slug)` — чтение одного поста
   - `categories()` — извлечение из поля tags (или добавить categories в схему)
   - `tags()` — извлечение из поля tags
   - `archives()` — группировка постов по годам
3. **Создать `src/contents/types.ts`** — TypeScript-интерфейсы для всех форматов данных
4. **Создать `src/contents/slugger.ts`** — генерация слагов через `github-slugger`
5. **Создать `src/contents/index.ts`** — реэкспорт fetcher, slugger, searcher

### Фаза 2: Апгрейд Keystatic конфигурации

**Проблема:** Config использует простой `fields.markdoc` без component blocks и без дат.

1. **Добавить `published_time` и `modified_time`** как `fields.datetime` с `defaultValue: { kind: "now" }`
2. **Заменить `fields.markdoc`** на `fields.document` (кастомный или через библиотеку) с component blocks
3. **Добавить component blocks**: KaTeX, GitHub-карточки, message-боксы, встройки статей
4. **Добавить поле `categories`** как `fields.array(fields.text())` к существующим `tags`
5. **Добавить синглтоны** для конфигурации сайта: SEO, автор, навигация шапки/подвала
6. **Поддержка GitHub storage** для продакшена (через env-переменную)

### Фаза 3: Рефакторинг страницы списка блога

**Проблема:** Использует сырые `fs.readFileSync` и ручной парсинг фронтматтера.

1. Заменить `getPosts()` на `fetcher.posts()` из нового слоя данных
2. Добавить **пагинацию** (`/blog/page/[index]`)
3. Добавить **сайдбар категорий**
4. Добавить **облако тегов**
5. Добавить секцию **архивов** (по годам)
6. Добавить **поиск** (интеграция Fuse.js)

### Фаза 4: Рефакторинг страницы поста

**Проблема:** Ручной рендеринг markdown построчно — нет подсветки кода, нет KaTeX, нет TOC, нет изображений в контенте.

1. Заменить ручной markdown-рендеринг на **Keystatic `DocumentRenderer`** или **`@markdoc/markdoc`**
2. Добавить **Table of Contents** с scroll-spy (intersection observer)
3. Добавить навигацию **пред./след. пост**
4. Добавить карточку **мета-информации** (дата, автор, категории, теги, время чтения)
5. Добавить отображение **обложки/thumbnail**
6. Добавить секцию **авторских прав/лицензии**
7. Добавить **medium-zoom** для изображений

### Фаза 5: Страницы группировки (категории, теги, архивы)

**Проблема:** Страниц фильтрации/группировки не существуют.

1. Создать `(group)/category/[slug]/page.tsx` — посты по категории
2. Создать `(group)/tag/[slug]/page.tsx` — посты по тегам
3. Создать `(group)/archive/[slug]/page.tsx` — посты по году
4. Создать `(group)/archives/page.tsx` — обзор всех категорий, тегов, лет
5. Всё с поддержкой пагинации

### Фаза 6: RSS-лента и API поиска

1. Создать `app/rss.xml/route.ts` — генерация RSS через пакет `rss`
2. Создать `app/api/search/route.ts` — эндпоинт поиска с Fuse.js
3. Обновить `sitemap.ts` для включения всех страниц группировки
4. Добавить **Spotlight-поиск** (модальное окно поиска на клиенте)

### Фаза 7: Улучшение страниц Keystatic Admin

**Проблема:** Страницы Keystatic минимальны — просто обёртка `makePage(config)`.

1. Перестроить под route-группу `(admin)` для ясности
2. Добавить корректный layout-враппер для админки
3. Убедиться что API route handler корректно типизирован
4. Рассмотреть **аутентификацию Keystatic** (GitHub OAuth) для облачного режима

### Фаза 8: Директория контента и раздача статики

1. Переместить контент из `content/posts/` в `public/content/posts/` (как в шаблоне) — ИЛИ оставить текущий `content/` и убедиться что catch-all route раздаёт файлы
2. Убедиться что `app/content/[...path]/route.ts` правильно раздаёт изображения с MIME-типами
3. Добавить оптимизацию изображений или оставить `unoptimized: true`

### Фаза 9: Метаданные и SEO

1. Добавить `generateMetadata` к страницам блога с OpenGraph/Twitter картами
2. Использовать синглтоны конфига (SEO, автор) для генерации метаданных
3. Добавить JSON-LD структурированные данные для постов (Article schema)

### Фаза 10: Опциональные улучшения

1. **Комментарии** — интеграция Artalk или Giscus
2. **Аналитика** — Google Analytics / Vercel Analytics (уже есть Vercel)
3. **Прогресс-бар** — индикатор загрузки страниц
4. **Время чтения** — расчёт для постов
5. **Подсветка кода** — Shikiji (Shiki)

---

## Порядок по приоритету (быстрые победы первыми)

| Приоритет | Фаза | Влияние |
|-----------|------|---------|
| 🔴 P0 | Фаза 1 | Слой данных — от этого зависит всё остальное |
| 🔴 P0 | Фаза 3 | Список блога — сразу улучшает UX |
| 🔴 P0 | Фаза 4 | Страница поста — сразу улучшает чтение |
| 🟡 P1 | Фаза 2 | Keystatic config — лучшее редактирование контента |
| 🟡 P1 | Фаза 5 | Страницы группировки — навигация/фильтрация |
| 🟢 P2 | Фаза 6 | RSS + поиск — обнаруживаемость |
| 🟢 P2 | Фаза 7 | Улучшения админки |
| 🟢 P2 | Фаза 9 | SEO |
| ⚪ P3 | Фаза 8 | Реструктуризация директорий контента |
| ⚪ P3 | Фаза 10 | Приятные мелочи |

---

## Ключевые зависимости

```
@keystatic/core/reader     — чтение контента
github-slugger             — генерация слагов
fuse.js                    — полнотекстовый поиск
rss                        — генерация RSS-ленты
@markdoc/markdoc           — рендеринг контента (уже установлен)
medium-zoom                — зум изображений
```

## Целевая структура файлов

```
src/
├── contents/
│   ├── reader.ts          # Keystatic reader инициализация
│   ├── fetcher.ts         # Кэшированные функции получения данных
│   ├── types.ts           # TypeScript-интерфейсы
│   ├── slugger.ts         # Генерация слагов
│   ├── searcher.ts        # Fuse.js поиск
│   └── index.ts           # Реэкспорт
│
├── app/
│   ├── (public)/
│   │   ├── blog/
│   │   │   ├── page.tsx               # Список блога (рефакторинг)
│   │   │   ├── [slug]/page.tsx        # Пост (рефакторинг)
│   │   │   └── page/[index]/page.tsx  # Пагинация
│   │   └── ...
│   ├── (group)/
│   │   ├── category/[slug]/page.tsx
│   │   ├── category/[slug]/page/[index]/page.tsx
│   │   ├── tag/[slug]/page.tsx
│   │   ├── tag/[slug]/page/[index]/page.tsx
│   │   ├── archive/[slug]/page.tsx
│   │   ├── archive/[slug]/page/[index]/page.tsx
│   │   └── archives/page.tsx
│   ├── (admin)/
│   │   ├── keystatic/
│   │   │   ├── layout.tsx
│   │   │   ├── keystatic.tsx
│   │   │   └── [[...params]]/page.tsx
│   │   └── api/keystatic/[...params]/route.ts
│   ├── rss.xml/route.ts
│   └── api/search/route.ts
│
├── components/
│   ├── docs/              # Компоненты контента (TOC, код, KaTeX и т.д.)
│   ├── layouts/           # Layout-компоненты
│   ├── templates/         # Шаблоны страниц
│   └── widgets/           # Виджеты (TOC, copyright, друзья)
```
