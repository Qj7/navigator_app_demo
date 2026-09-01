"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(
    loginAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.replace("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <AppLogo size={48} className="mx-auto mb-4 rounded-xl" />
          <h1 className="text-2xl font-bold text-slate-900">Navigator Tour</h1>
          <p className="mt-1 text-sm text-slate-500">Войдите в журнал бронирований</p>
        </div>

        <form
          action={formAction}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {state?.error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{state.error}</span>
            </div>
          )}

          <label className="mb-4 block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue=""
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="valera@navigator.com"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Пароль
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <p className="mb-2 font-medium text-slate-700">Демо-аккаунты (пароль: demo123)</p>
          <ul className="space-y-1">
            <li>admin@navigator.com — Админ</li>
            <li>valera@navigator.com — Менеджер (Валера)</li>
            <li>vova@navigator.com — Гид (VOVA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
