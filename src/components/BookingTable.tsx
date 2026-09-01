"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Plus, Pencil, XCircle } from "lucide-react";
import type { Permissions, SerializedBooking } from "@/lib/types";
import {
  cn,
  formatPickupTime,
  formatUsd,
  formatVnd,
  getPaymentCellClass,
  getNotesCellClass,
} from "@/lib/utils";
import { cancelBooking } from "@/lib/actions/bookings";
import { BookingModal } from "./BookingModal";

type BookingTableProps = {
  tourId: string;
  bookings: SerializedBooking[];
  permissions: Permissions;
  canAddBooking: boolean;
};

const HEAD = "bg-slate-100";
const HEAD_SUB = "bg-slate-50";

/** Column widths: # | Отель | Имя | взр | дет | Телефон */
const COL = {
  num: "w-10",
  hotel: "w-[120px]",
  name: "w-[100px]",
  adults: "w-12",
  children: "w-12",
  phone: "w-[120px]",
} as const;

export function BookingTable({
  tourId,
  bookings,
  permissions,
  canAddBooking,
}: BookingTableProps) {
  const [editingBooking, setEditingBooking] = useState<SerializedBooking | null>(
    null,
  );
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const hasActions = bookings.some((b) => b.canEdit || b.canCancel);
  const colSpan = hasActions ? 19 : 18;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [bookings, updateScrollState]);

  function rowBg(idx: number) {
    return idx % 2 === 1 ? "bg-[#fdf2f8]" : "bg-white";
  }

  return (
    <>
      <div className="relative min-w-0">
        {canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-50 w-8 bg-gradient-to-l from-white to-transparent"
          />
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto overscroll-x-contain scroll-smooth"
        >
            <table className="booking-table w-full min-w-[1200px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-600">
                  <th
                    className={cn(
                      "px-2 py-2.5 text-center font-semibold",
                      HEAD,
                      COL.num,
                    )}
                  >
                    #
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      HEAD,
                      COL.hotel,
                    )}
                  >
                    Отель
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      HEAD,
                      COL.name,
                    )}
                  >
                    Имя
                  </th>
                  <th
                    className={cn(
                      "w-24 px-2 py-2.5 text-center font-semibold",
                      HEAD,
                    )}
                    colSpan={2}
                  >
                    Кол-во
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      HEAD,
                      COL.phone,
                    )}
                  >
                    Телефон
                  </th>
                  <th className={cn("w-16 px-2 py-2.5 text-center font-semibold", HEAD)}>
                    Комн.
                  </th>
                  <th className={cn("w-16 px-2 py-2.5 text-center font-semibold", HEAD)}>
                    Выезд
                  </th>
                  <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", HEAD)}>
                    Стоим.
                  </th>
                  <th className={cn("px-2 py-2.5 text-center font-semibold", HEAD)} colSpan={3}>
                    Оплата
                  </th>
                  <th className={cn("min-w-[140px] px-3 py-2.5 text-left font-semibold", HEAD)}>
                    Адрес отеля
                  </th>
                  <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", HEAD)}>
                    Bill&apos;s
                  </th>
                  <th className={cn("min-w-[90px] px-2 py-2.5 text-left font-semibold", HEAD)}>
                    Менеджер
                  </th>
                  <th className={cn("min-w-[100px] px-3 py-2.5 text-left font-semibold", HEAD)}>
                    Примечание
                  </th>
                  {hasActions && (
                    <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", HEAD)} />
                  )}
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                  <th colSpan={3} className={HEAD_SUB} />
                  <th
                    className={cn(
                      "px-2 py-1 text-center font-medium",
                      HEAD_SUB,
                      COL.adults,
                    )}
                  >
                    взр
                  </th>
                  <th
                    className={cn(
                      "px-2 py-1 text-center font-medium",
                      HEAD_SUB,
                      COL.children,
                    )}
                  >
                    дет
                  </th>
                  <th className={cn(HEAD_SUB, COL.phone)} />
                  <th colSpan={3} className={HEAD_SUB} />
                  <th className={cn("px-2 py-1 text-center font-medium", HEAD_SUB)}>
                    депозит
                  </th>
                  <th className={cn("px-2 py-1 text-center font-medium", HEAD_SUB)}>
                    $ гиду
                  </th>
                  <th className={cn("px-2 py-1 text-center font-medium", HEAD_SUB)}>
                    VND
                  </th>
                  <th colSpan={hasActions ? 5 : 4} className={HEAD_SUB} />
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colSpan}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Нет бронирований
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, idx) => {
                    const bg = rowBg(idx);
                    return (
                      <tr key={booking.id} className={cn("border-b border-slate-100", bg)}>
                        <td
                          className={cn(
                            "px-2 py-2 text-center text-slate-400",
                            COL.num,
                            bg,
                          )}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 font-medium text-slate-800",
                            COL.hotel,
                            bg,
                          )}
                        >
                          {booking.hotel}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 text-slate-800",
                            COL.name,
                            bg,
                          )}
                        >
                          {booking.guestName}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-medium",
                            COL.adults,
                            bg,
                          )}
                        >
                          {booking.adults}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-medium",
                            COL.children,
                            bg,
                          )}
                        >
                          {booking.children}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 whitespace-nowrap text-slate-600",
                            COL.phone,
                            bg,
                          )}
                        >
                          {booking.phone || "—"}
                        </td>
                        <td className="px-2 py-2 text-center text-slate-600">
                          {booking.room || "—"}
                        </td>
                        <td className="px-2 py-2 text-center font-medium whitespace-nowrap text-slate-700">
                          {formatPickupTime(booking.pickupTime)}
                        </td>
                        <td className="px-2 py-2 text-center font-semibold text-slate-800">
                          {formatUsd(booking.costUsd)}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center text-xs",
                            getPaymentCellClass(booking.deposit),
                          )}
                        >
                          {booking.deposit || "—"}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center text-xs",
                            getPaymentCellClass(booking.balanceUsd),
                          )}
                        >
                          {booking.balanceUsd || "—"}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center text-xs",
                            getPaymentCellClass(booking.balanceVnd),
                          )}
                        >
                          {formatVnd(booking.balanceVnd)}
                        </td>
                        <td className="max-w-[180px] px-3 py-2 text-xs text-slate-600">
                          <div className="line-clamp-2">{booking.hotelAddress || "—"}</div>
                          {booking.notes && (
                            <div
                              className={cn(
                                "mt-1 line-clamp-2 rounded px-1.5 py-0.5",
                                getNotesCellClass(booking.notes),
                              )}
                            >
                              {booking.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-slate-700">
                          {booking.billNumber || "—"}
                        </td>
                        <td className="px-2 py-2 text-xs font-medium text-slate-700">
                          {booking.managerName || "—"}
                        </td>
                        <td className="max-w-[120px] px-3 py-2 text-xs text-slate-600">
                          <span className="line-clamp-2">{booking.remark || "—"}</span>
                        </td>
                        {hasActions && (
                          <td className="px-2 py-2">
                            {(booking.canEdit || booking.canCancel) && (
                              <div className="flex items-center justify-center gap-0.5">
                                {booking.canEdit && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingBooking(booking)}
                                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-indigo-600"
                                    title="Редактировать"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {booking.canCancel && (
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => {
                                      if (confirm("Перенести бронь в отмены?")) {
                                        startTransition(() => {
                                          void cancelBooking(booking.id);
                                        });
                                      }
                                    }}
                                    className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                                    title="Отменить"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
        </div>
      </div>

      {canAddBooking && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Добавить бронь
        </button>
      )}

      {(adding || editingBooking) && (
        <BookingModal
          tourId={tourId}
          booking={editingBooking ?? undefined}
          permissions={permissions}
          onClose={() => {
            setAdding(false);
            setEditingBooking(null);
          }}
        />
      )}
    </>
  );
}
