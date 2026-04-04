# 📝 Пошаговый план создания блога

## Контекст

**Проект:** Next.js 16 Elite Boilerplate  
**Текущие возможности:** авторизация (NextAuth), i18n (6 языков), темизация, SEO, PWA  
**Цель:** Превратить в полноценный блог

---

## Этап 1: Выбор стратегии управления контентом

Определитесь, где будут храниться статьи:

### Вариант А: MDX файлы (рекомендуется для начала)
- ✅ Просто, быстро, бесплатно
- ✅ Пишете статьи в Markdown прямо в репозитории
- ✅ Поддержка React компонентов в статьях
- ❌ Нужен деплой для новых статей

### Вариант Б: Headless CMS (Sanity/Contentful/Strapi)
- ✅ Удобный редактор для авторов
- ✅ Без деплоя можно добавлять статьи
- ❌ Дополнительная зависимость/стоимость

### Вариант В: Собственная БД (PostgreSQL + Prisma/Drizzle)
- ✅ Полный контроль, комментарии, лайки
- ❌ Сложнее, нужен хостинг БД

---

## Этап 2: Базовая структура блога (дни 2-3)

### Шаги:

1. **Установить MDX** (если выбрали вариант А):
   ```bash
   npm install @next/mdx @mdx-js/loader @mdx-js/react
   ```

2. **Настроить MDX** в `next.config.mjs`

3. **Создать структуру папок:**
   ```
   src/content/blog/              # MDX файлы статей
   src/app/(public)/blog/         # Список всех статей
   src/app/(public)/blog/[slug]/  # Страница одной статьи
   src/app/(public)/blog/author/[id]/  # Профиль автора
   ```

4. **Создать типы TypeScript:**
   ```typescript
   // src/shared/types/blog.ts
   interface Post {
     slug: string;
     title: string;
     description: string;
     date: string;
     author: string;
     tags: string[];
     coverImage?: string;
     published: boolean;
   }
   ```

---

## Этап 3: Утилиты для работы с контентом (день 3-4)

### Создать:

1. **Парсер MDX файлов:**
   - `src/shared/lib/blog-utils.ts`
   - Чтение всех статей из `content/blog/`
   - Парсинг frontmatter (метаданные)
   - Сортировка по дате

2. **Генерация RSS:**
   ```bash
   npm install feed
   ```
   - `src/app/(public)/rss.xml/route.ts`

---

## Этап 4: Компоненты блога (дни 4-6)

### Создать компоненты:

1. **Список статей:**
   - `src/features/blog/components/post-card.tsx`
   - `src/features/blog/components/post-list.tsx`

2. **Страница статьи:**
   - `src/features/blog/components/post-content.tsx`
   - `src/features/blog/components/post-header.tsx`
   - `src/features/blog/components/table-of-contents.tsx`
   - `src/features/blog/components/post-navigation.tsx`

3. **Дополнительно:**
   - `src/features/blog/components/tag-filter.tsx`
   - `src/features/blog/components/search-input.tsx`
   - `src/features/blog/components/reading-time.tsx`
   - `src/features/blog/components/share-buttons.tsx`

---

## Этап 5: Страницы блога (дни 6-7)

### Создать:

1. **`src/app/(public)/blog/page.tsx`** - все статьи с фильтрацией
2. **`src/app/(public)/blog/[slug]/page.tsx`** - одна статья
3. **`src/app/(public)/blog/tags/[tag]/page.tsx`** - фильтр по тегу
4. **`src/app/(public)/blog/search/page.tsx`** - поиск

---

## Этап 6: SEO и мета (день 7-8)

1. **Динамические метаданные для каждой статьи:**
   ```typescript
   // В [slug]/page.tsx
   export async function generateMetadata({ params }) {
     const post = await getPost(params.slug);
     return {
       title: post.title,
       description: post.description,
       openGraph: { images: [post.coverImage] },
     };
   }
   ```

2. **JSON-LD schema для статей** (Article schema)
3. **Обновить sitemap.xml** чтобы включал статьи блога
4. **Canonical URLs**

---

## Этап 7: Дополнительные фичи (дни 8-12)

### По приоритету:

1. **Комментарии:**
   - Проще: Giscus (GitHub-based)
   - Сложнее: собственная система с БД

2. **Поиск по статьям:**
   - Локальный: fuse.js
   - Продвинутый: Algolia/Meilisearch

3. **Подписка на новости:**
   - Интеграция с Resend/SendGrid
   - Форма email подписки

4. **Аналитика просмотров:**
   - Счётчик просмотров для каждой статьи
   - Популярные статьи

5. **Оглавление (Table of Contents):**
   - Автоматическая генерация из заголовков

6. **Похожие статьи:**
   - На основе тегов/категорий

---

## Этап 8: Админка для авторов (опционально, дни 12-15)

Если нужна админка без работы с кодом:

1. **Вариант А: Sanctum с Next.js API**
2. **Вариант Б: Интеграция с Decap CMS (бывший Netlify CMS)**
3. **Вариант В: Кастомная админка с авторизацией**

---

## Этап 9: Тесты и оптимизация (дни 15-16)

1. **Unit тесты для утилит блога**
2. **E2E тесты (Playwright):**
   - Навигация к блогу
   - Открытие статьи
   - Поиск
   - Фильтрация по тегам

3. **Оптимизация изображений:**
   - Использовать `next/image` для cover images
   - Lazy loading

4. **Performance:**
   - ISR (Incremental Static Regeneration)
   - `revalidate: 3600` для страниц

---

## Этап 10: Деплой и мониторинг (день 16-17)

1. **Деплой на Vercel** (рекомендуется)
2. **Настроить Preview deployments**
3. **Настроить реальный домен**
4. **Google Search Console**
5. **Проверить RSS фид в Feedly**

---

## 🚀 Быстрый старт (MVP за 2-3 дня)

Если хотите быстро запустить минимальную версию:

1. ✅ MDX для статей
2. ✅ Простая страница `/blog` со списком
3. ✅ Страница `/blog/[slug]` для чтения
4. ✅ Теги и базовый поиск
5. ✅ SEO мета для каждой статьи
6. ✅ RSS фид

Всё остальное можно добавлять постепенно!

---

## Примечания

- **Текущие технологии проекта:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, NextAuth.js
- **Архитектура:** Feature-sliced design с path aliases (`@/shared/*`, `@/features/*`, `@/app/*`)
- **Тестирование:** Vitest (unit) + Playwright (E2E)
- **i18n:** 6 языков (en, bn, ar, fr, es, zh)
