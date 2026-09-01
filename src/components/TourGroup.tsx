"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteTour } from "@/lib/actions/tours";
import { BookingTable } from "./BookingTable";
import { TourModal, type TourFormOptions } from "./TourModal";
import { cn, formatDateShort } from "@/lib/utils";
import type { Permissions, SerializedTour } from "@/lib/types";

type TourGroupProps = {
  tour: SerializedTour;
  dateParam: string;
  permissions: Permissions;
  tourFormOptions: TourFormOptions;
};

export function TourGroup({
  tour,
  dateParam,
  permissions,
  tourFormOptions,
}: TourGroupProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalAdults = tour.bookings.reduce((s, b) => s + b.adults, 0);
  const totalChildren = tour.bookings.reduce((s, b) => s + b.children, 0);
  const totalCost = tour.bookings.reduce(
    (s, b) => s + (b.costUsd ?? 0),
    0,
  );

  const title = [
    tour.name.toUpperCase(),
    formatDateShort(tour.date),
    tour.guideName ? `— ${tour.guideName.toUpperCase()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleDelete() {
    if (
      !confirm(
        `Удалить тур «${tour.name}» и все ${tour.bookings.length} бронирований?`,
      )
    ) {
      return;
    }
    startTransition(() => {
      void deleteTour(tour.id);
    });
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: tour.color }}
      >
        <h2 className="truncate text-sm font-bold tracking-wide sm:text-base">{title}</h2>
        {tour.canEdit && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
              title="Редактировать тур"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/20 disabled:opacity-50"
              title="Удалить тур"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <BookingTable
        tourId={tour.id}
        bookings={tour.bookings}
        permissions={permissions}
        canAddBooking={tour.canAddBooking}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm">
        <span className="font-semibold text-cyan-900">Итого:</span>
        <span className="text-cyan-800">
          <span className="font-medium">взр</span>{" "}
          <span className="font-bold">{totalAdults}</span>
        </span>
        <span className="text-cyan-800">
          <span className="font-medium">дет</span>{" "}
          <span className="font-bold">{totalChildren}</span>
        </span>
        {totalCost > 0 && (
          <span className="ml-auto font-semibold text-cyan-900">
            {totalCost}$
          </span>
        )}
      </div>

      {showEdit && (
        <TourModal
          dateParam={dateParam}
          permissions={permissions}
          options={tourFormOptions}
          tour={tour}
          onClose={() => setShowEdit(false)}
        />
      )}
    </section>
  );
}

export function AddTourButton({
  dateParam,
  permissions,
  tourFormOptions,
}: {
  dateParam: string;
  permissions: Permissions;
  tourFormOptions: TourFormOptions;
}) {
  const [open, setOpen] = useState(false);

  if (!permissions.canCreateTour) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed",
          "border-slate-300 py-4 text-sm font-medium text-slate-500",
          "transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600",
        )}
      >
        <Plus className="h-4 w-4" />
        Добавить тур
      </button>
      {open && (
        <TourModal
          dateParam={dateParam}
          permissions={permissions}
          options={tourFormOptions}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
