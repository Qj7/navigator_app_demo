"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn, formatDateParam, formatDateTab } from "@/lib/utils";

type DateTabsProps = {
  dates: string[];
  activeDate?: string;
};

function ScrollButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors",
        disabled
          ? "cursor-default opacity-30"
          : "hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200",
      )}
    >
      {children}
    </button>
  );
}

export function DateTabs({ dates, activeDate }: DateTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isCancellations = pathname === "/cancellations";

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [dates, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    const active = activeRef.current;
    if (!el || !active) return;

    const elRect = el.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (
      activeRect.left < elRect.left ||
      activeRect.right > elRect.right
    ) {
      active.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
    }
  }, [activeDate, dates]);

  const scroll = (direction: "start" | "end" | "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const page = el.clientWidth * 0.75;

    switch (direction) {
      case "start":
        el.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "end":
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        break;
      case "left":
        el.scrollBy({ left: -page, behavior: "smooth" });
        break;
      case "right":
        el.scrollBy({ left: page, behavior: "smooth" });
        break;
    }
  };

  const handleDatePick = (value: string) => {
    if (!value) return;
    router.push(`/${value}`);
  };

  const openDatePicker = () => {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center gap-1 px-2 py-2">
          <div className="flex shrink-0 items-center">
            <ScrollButton
              onClick={() => scroll("start")}
              disabled={!canScrollLeft}
              title="В начало"
            >
              <ChevronsLeft className="h-4 w-4" />
            </ScrollButton>
            <ScrollButton
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              title="Назад"
            >
              <ChevronLeft className="h-4 w-4" />
            </ScrollButton>
          </div>

          <div className="relative min-w-0 flex-1">
            {canScrollLeft && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent"
              />
            )}
            {canScrollRight && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent"
              />
            )}

            <div
              ref={scrollRef}
              className="overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="inline-flex w-max items-center gap-1 px-1">
                {dates.map((dateStr) => {
                  const param = formatDateParam(dateStr);
                  const isActive = !isCancellations && activeDate === param;

                  return (
                    <Link
                      key={dateStr}
                      ref={isActive ? activeRef : undefined}
                      href={`/${param}`}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {formatDateTab(dateStr)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center">
            <ScrollButton
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              title="Вперёд"
            >
              <ChevronRight className="h-4 w-4" />
            </ScrollButton>
            <ScrollButton
              onClick={() => scroll("end")}
              disabled={!canScrollRight}
              title="В конец"
            >
              <ChevronsRight className="h-4 w-4" />
            </ScrollButton>
          </div>

          <div className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" />

          <div className="relative shrink-0">
            <input
              ref={dateInputRef}
              type="date"
              value={activeDate ?? ""}
              onChange={(e) => handleDatePick(e.target.value)}
              className="pointer-events-none absolute inset-0 opacity-0"
              tabIndex={-1}
              aria-hidden
            />
            <button
              type="button"
              onClick={openDatePicker}
              title="Перейти к дате"
              aria-label="Перейти к дате"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" />

          <Link
            href="/cancellations"
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:px-4",
              isCancellations
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-600 hover:bg-rose-50",
            )}
          >
            ОТМЕНЫ
          </Link>
        </div>
      </div>
    </div>
  );
}
