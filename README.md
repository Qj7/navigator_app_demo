# Navigator Tour App

Веб-приложение для управления бронированиями туров — замена Google Sheets журнала.

## Стек

- **Next.js 16** + React + TypeScript
- **PostgreSQL** (Prisma ORM) — готово к переключению на Supabase
- **Tailwind CSS**

## Быстрый старт

```bash
# 1. Запустить PostgreSQL
docker compose up -d

# 2. Создать таблицы и заполнить демо-данными
npm run db:setup

# 3. Запустить dev-сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — потребуется вход.

### Демо-аккаунты (пароль: `demo123`)

| Email | Роль | Возможности |
|-------|------|-------------|
| admin@navigator.com | Админ | Туры: создать/редактировать/удалить. Все брони. Отмены. |
| valera@navigator.com | Менеджер (Валера) | Добавить бронь, редактировать **свои** (где менеджер = Валера) |
| dasha@navigator.com | Менеджер (Даша) | То же для броней Даши |
| vova@navigator.com | Гид | Только просмотр |

## Переключение на Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте Connection String (Transaction pooler) → `DATABASE_URL`
3. В **Project Settings → API** скопируйте `URL` и `anon public` key
4. Обновите `.env`:

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
AUTH_SECRET="случайная-строка-32+"
```

5. Примените схему и демо-данные:

```bash
npx prisma db push
npm run db:seed
```

## Деплой на GitHub Pages

Репозиторий: `git@github.com:Qj7/navigator_app_demo.git`  
Сайт: `https://qj7.github.io/navigator_app_demo/`

### Настройка репозитория

1. **Settings → Pages → Build and deployment** → Source: **GitHub Actions**
2. **Settings → Secrets and variables → Actions** — добавьте:

| Secret | Описание |
|--------|----------|
| `DATABASE_URL` | Supabase Transaction pooler URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `AUTH_SECRET` | Секрет для JWT-сессий (32+ символов) |

3. Push в `main` запускает workflow `.github/workflows/deploy.yml`

### Важно: ограничение GitHub Pages

GitHub Pages отдаёт **только статические файлы**. Текущая версия приложения использует серверные возможности Next.js (middleware, Server Actions, Prisma на сервере) — они **не работают** на GitHub Pages.

Для полноценного деплоя на Pages нужна миграция на клиентский Supabase SDK. Альтернатива без миграции — **Vercel** или **Netlify** (бесплатно, поддерживают Next.js + Supabase PostgreSQL).

Локальная проверка сборки для Pages:

```bash
npm run build:pages
```

## Функционал

- Дневной журнал туров с вкладками по датам
- Группировка по турам с названием, датой и гидом
- Таблица бронирований (отель, комната, имя, взр/дет, телефон, выезд, оплата)
- Автоматические итоги по туру и по дню
- Цветовая индикация статусов оплаты
- CRUD: добавление/редактирование/отмена броней и туров
- **Роли:** админ, менеджер, гид — с разными правами доступа
- Колонки Bill's number, Менеджер, Примечание
- Вкладка «ОТМЕНЫ» с восстановлением (только админ)

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production сборка |
| `npm run build:pages` | Сборка для GitHub Pages (статический экспорт) |
| `npm run db:setup` | Push схемы + seed |
| `npm run db:studio` | Prisma Studio (GUI для БД) |
