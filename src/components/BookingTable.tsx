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

const STICKY_HEAD = "bg-slate-100";
const STICKY_HEAD_SUB = "bg-slate-50";

/** Fixed-width sticky block: # | Отель | Имя | взр | дет | Телефон */
const STICKY = {
  num: "sticky left-0 z-30 w-10",
  hotel: "sticky left-10 z-30 w-[120px]",
  name: "sticky left-[160px] z-30 w-[100px]",
  adults: "sticky left-[260px] z-30 w-12",
  children: "sticky left-[308px] z-30 w-12",
  phone:
    "sticky left-[356px] z-30 w-[120px] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]",
} as const;

const STICKY_CORNER = "z-40";

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
                      STICKY_HEAD,
                      STICKY.num,
                      STICKY_CORNER,
                    )}
                  >
                    #
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      STICKY_HEAD,
                      STICKY.hotel,
                      STICKY_CORNER,
                    )}
                  >
                    Отель
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      STICKY_HEAD,
                      STICKY.name,
                      STICKY_CORNER,
                    )}
                  >
                    Имя
                  </th>
                  <th
                    className={cn(
                      "px-2 py-2.5 text-center font-semibold",
                      STICKY_HEAD,
                      "sticky left-[260px] z-30 w-24",
                      STICKY_CORNER,
                    )}
                    colSpan={2}
                  >
                    Кол-во
                  </th>
                  <th
                    className={cn(
                      "px-3 py-2.5 text-left font-semibold",
                      STICKY_HEAD,
                      STICKY.phone,
                      STICKY_CORNER,
                    )}
                  >
                    Телефон
                  </th>
                  <th className={cn("w-16 px-2 py-2.5 text-center font-semibold", STICKY_HEAD)}>
                    Комн.
                  </th>
                  <th className={cn("w-16 px-2 py-2.5 text-center font-semibold", STICKY_HEAD)}>
                    Выезд
                  </th>
                  <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", STICKY_HEAD)}>
                    Стоим.
                  </th>
                  <th className={cn("px-2 py-2.5 text-center font-semibold", STICKY_HEAD)} colSpan={3}>
                    Оплата
                  </th>
                  <th className={cn("min-w-[140px] px-3 py-2.5 text-left font-semibold", STICKY_HEAD)}>
                    Адрес отеля
                  </th>
                  <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", STICKY_HEAD)}>
                    Bill&apos;s
                  </th>
                  <th className={cn("min-w-[90px] px-2 py-2.5 text-left font-semibold", STICKY_HEAD)}>
                    Менеджер
                  </th>
                  <th className={cn("min-w-[100px] px-3 py-2.5 text-left font-semibold", STICKY_HEAD)}>
                    Примечание
                  </th>
                  {hasActions && (
                    <th className={cn("w-20 px-2 py-2.5 text-center font-semibold", STICKY_HEAD)} />
                  )}
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                  <th
                    colSpan={3}
                    className={cn(STICKY_HEAD_SUB, "sticky left-0 z-30 bg-slate-50")}
                  />
                  <th
                    className={cn(
                      "px-2 py-1 text-center font-medium",
                      STICKY_HEAD_SUB,
                      STICKY.adults,
                      STICKY_CORNER,
                    )}
                  >
                    взр
                  </th>
                  <th
                    className={cn(
                      "px-2 py-1 text-center font-medium",
                      STICKY_HEAD_SUB,
                      STICKY.children,
                      STICKY_CORNER,
                    )}
                  >
                    дет
                  </th>
                  <th
                    className={cn(STICKY_HEAD_SUB, STICKY.phone, STICKY_CORNER)}
                  />
                  <th colSpan={3} className={cn(STICKY_HEAD_SUB, "bg-slate-50")} />
                  <th className={cn("px-2 py-1 text-center font-medium", STICKY_HEAD_SUB, "bg-slate-50")}>
                    депозит
                  </th>
                  <th className={cn("px-2 py-1 text-center font-medium", STICKY_HEAD_SUB, "bg-slate-50")}>
                    $ гиду
                  </th>
                  <th className={cn("px-2 py-1 text-center font-medium", STICKY_HEAD_SUB, "bg-slate-50")}>
                    VND
                  </th>
                  <th
                    colSpan={hasActions ? 5 : 4}
                    className={cn(STICKY_HEAD_SUB, "bg-slate-50")}
                  />
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
                            STICKY.num,
                            bg,
                          )}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 font-medium text-slate-800",
                            STICKY.hotel,
                            bg,
                          )}
                        >
                          {booking.hotel}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 text-slate-800",
                            STICKY.name,
                            bg,
                          )}
                        >
                          {booking.guestName}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-medium",
                            STICKY.adults,
                            bg,
                          )}
                        >
                          {booking.adults}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-2 text-center font-medium",
                            STICKY.children,
                            bg,
                          )}
                        >
                          {booking.children}
                        </td>
                        <td
                          className={cn(
                            "truncate px-3 py-2 whitespace-nowrap text-slate-600",
                            STICKY.phone,
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
