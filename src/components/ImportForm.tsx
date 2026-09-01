"use client";

import { useActionState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import {
  importExcelAction,
  type ImportState,
} from "@/lib/actions/import";

export function ImportForm() {
  const [state, formAction, pending] = useActionState<
    ImportState | null,
    FormData
  >(importExcelAction, null);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <label
            htmlFor="file"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Файл Excel
          </label>
          <div className="relative">
            <input
              id="file"
              name="file"
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              required
              className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Скачайте таблицу из Google Sheets: Файл → Скачать → Microsoft Excel.
            Максимальный размер файла — 50 МБ.
          </p>
        </div>

        <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            name="replaceExisting"
            defaultChecked
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <p className="text-sm font-medium text-slate-800">
              Заменить данные за импортируемые даты
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Существующие туры и брони за эти даты будут удалены перед импортом
            </p>
          </div>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {pending ? "Импорт..." : "Импортировать данные"}
        </button>
      </form>

      {state && !state.ok && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Ошибка импорта</p>
            <p className="mt-1">{state.error}</p>
            {state.skippedSheets && state.skippedSheets.length > 0 && (
              <p className="mt-2 text-xs text-rose-700">
                Пропущенные вкладки: {state.skippedSheets.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      {state?.ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="space-y-2">
              <p className="font-semibold">Импорт завершён</p>
              <ul className="space-y-1 text-emerald-800">
                <li>Обработано вкладок: {state.sheetsProcessed}</li>
                <li>Создано туров: {state.toursCreated}</li>
                <li>Создано бронирований: {state.bookingsCreated}</li>
                {state.dates && state.dates.length > 0 && (
                  <li>Даты: {state.dates.join(", ")}</li>
                )}
              </ul>
              {state.skippedSheets && state.skippedSheets.length > 0 && (
                <p className="text-xs text-emerald-700">
                  Пропущено вкладок: {state.skippedSheets.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Формат файла
          </h2>
        </div>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Каждая вкладка — отдельный день (название: <code className="rounded bg-slate-100 px-1">30.08.2026</code>)</li>
          <li>• Цветные строки — заголовки туров (например, «ХЮЭ 30/08 — SERGEI»)</li>
          <li>• Под каждым туром — строки бронирований</li>
          <li>• Вкладки «ОТМЕНЫ» пропускаются автоматически</li>
          <li>• Колонки: Отель, Комната, Имя, взр/дет, Телефон, Выезд, Стоимость, Оплата, Адрес</li>
        </ul>
      </div>
    </div>
  );
}
