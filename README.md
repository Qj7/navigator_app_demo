# Navigator Tour App

Веб-приложение для управления бронированиями туров — замена Google Sheets журнала.

## Стек

- **Next.js 16** + React + TypeScript
- **Supabase** (PostgreSQL + Prisma ORM)
- **Vercel** (деплой)
- **Tailwind CSS**

## Быстрый старт (локально)

```bash
# Вариант A: Supabase (production DB)
cp .env.example .env   # заполнить значениями
npm install
npm run dev

# Вариант B: локальный Docker Postgres
docker compose up -d
npm run db:setup
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Демо-аккаунты (пароль: `demo123`)

| Email | Роль |
|-------|------|
| admin@navigator.com | Админ |
| valera@navigator.com | Менеджер |
| dasha@navigator.com | Менеджер |
| vova@navigator.com | Гид |

## Supabase

Проект: **navigator_app** (`nynbxynddxxevkcsuuog`)

Переменные в `.env`:

```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://nynbxynddxxevkcsuuog.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
AUTH_SECRET="..."
```

Пересоздать `.env` из пароля БД:

```bash
node scripts/setup-supabase-env.mjs "YOUR_DB_PASSWORD"
```

## Деплой на Vercel

Репозиторий: `git@github.com:Qj7/navigator_app_demo.git`

1. [vercel.com](https://vercel.com) → **Add New Project** → импорт `navigator_app_demo`
2. **Environment Variables** (Production + Preview):

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | Supabase pooler URL (из `.env`) |
| `AUTH_SECRET` | Секрет для JWT-сессий |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nynbxynddxxevkcsuuog.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |

3. Deploy — push в `main` автоматически пересобирает проект

Через CLI:

```bash
npx vercel link
npx vercel env pull .env.vercel
npx vercel --prod
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production сборка |
| `npm run db:setup` | Push схемы + seed (локальный Docker) |
| `npm run db:studio` | Prisma Studio |
