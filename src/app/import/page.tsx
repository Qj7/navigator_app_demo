import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ImportForm } from "@/components/ImportForm";
import { getSession } from "@/lib/auth";

export default async function ImportPage() {
  const user = await getSession();
  if (!user) notFound();
  if (user.role !== "ADMIN") notFound();

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          К журналу
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Импорт из Excel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Загрузите скачанный файл Google Sheets для переноса туров и бронирований
          </p>
        </div>

        <ImportForm />
      </div>
    </AppShell>
  );
}
