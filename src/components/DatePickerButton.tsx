"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDateParam, parseDateParam } from "@/lib/utils";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type DatePickerButtonProps = {
  activeDate?: string;
};

export function DatePickerButton({ activeDate }: DatePickerButtonProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    activeDate ? parseDateParam(activeDate) : new Date(),
  );

  useEffect(() => {
    if (activeDate) {
      setViewDate(parseDateParam(activeDate));
    }
  }, [activeDate]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const selected = activeDate ? parseDateParam(activeDate) : null;
  const today = new Date();

  const handlePick = (day: Date) => {
    router.push(`/${formatDateParam(day)}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title="Перейти к дате"
        aria-label="Перейти к дате"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors",
          open
            ? "bg-slate-100 text-slate-800"
            : "hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200",
        )}
      >
        <Calendar className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Выбор даты"
          className="absolute right-0 bottom-full z-50 mb-2 w-[min(18rem,calc(100vw-1rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setViewDate((date) => subMonths(date, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Предыдущий месяц"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900 capitalize">
              {format(viewDate, "LLLL yyyy", { locale: ru })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate((date) => addMonths(date, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Следующий месяц"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-xs font-medium text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, today);
              const isCurrentMonth = isSameMonth(day, viewDate);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handlePick(day)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
                    isSelected
                      ? "bg-indigo-600 font-medium text-white"
                      : isToday
                        ? "font-semibold text-indigo-600 hover:bg-indigo-50"
                        : isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50 hover:text-slate-500",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
