"use client";

import { useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import type { Permissions, SerializedBookingWithTour } from "@/lib/types";
import { deleteBooking, restoreBooking } from "@/lib/actions/bookings";
import { formatDateTab, formatUsd } from "@/lib/utils";

type CancellationsListProps = {
  bookings: SerializedBookingWithTour[];
  permissions: Permissions;
};

export function CancellationsList({
  bookings,
  permissions,
}: CancellationsListProps) {
  const [isPending, startTransition] = useTransition();

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
        Нет отменённых бронирований
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <th className="px-4 py-3 text-left font-semibold">Тур</th>
            <th className="px-4 py-3 text-left font-semibold">Отель</th>
            <th className="px-4 py-3 text-left font-semibold">Имя</th>
            <th className="px-4 py-3 text-left font-semibold">Менеджер</th>
            <th className="px-4 py-3 text-center font-semibold">взр/дет</th>
            <th className="px-4 py-3 text-center font-semibold">Стоим.</th>
            <th className="px-4 py-3 text-left font-semibold">Дата отмены</th>
            {permissions.canManageCancellations && (
              <th className="px-4 py-3 text-center font-semibold">Действия</th>
            )}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-4 py-3">
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: b.tour.color }}
                >
                  {b.tour.name}
                  {b.tour.guideName ? ` — ${b.tour.guideName}` : ""}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{b.hotel}</td>
              <td className="px-4 py-3 font-medium">{b.guestName}</td>
              <td className="px-4 py-3 text-slate-600">
                {b.managerName || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {b.adults}/{b.children}
              </td>
              <td className="px-4 py-3 text-center">
                {formatUsd(b.costUsd)}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {b.cancelledAt ? formatDateTab(b.cancelledAt) : "—"}
              </td>
              {permissions.canManageCancellations && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(() => {
                          void restoreBooking(b.id);
                        })
                      }
                      className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                      title="Восстановить"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm("Удалить бронь навсегда?")) {
                          startTransition(() => {
                            void deleteBooking(b.id);
                          });
                        }
                      }}
                      className="rounded p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
