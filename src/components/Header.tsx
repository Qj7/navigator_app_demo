import Link from "next/link";
import { MapPin, LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

type HeaderProps = {
  user: SessionUser;
};

export function Header({ user }: HeaderProps) {
  return (
    <header className="z-40 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">
              Navigator Tour
            </p>
            <p className="text-xs text-slate-500">Журнал бронирований</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <Link
              href="/import"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Импорт
            </Link>
          )}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
              title="Выйти"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
