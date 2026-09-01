import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTab(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy");
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM");
}

export function formatDateParam(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function parseDateParam(param: string): Date {
  return parseISO(param);
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: ru });
}

const PAID_KEYWORDS = ["оплачено", "paid", "опл", "guide"];

export function isPaidValue(value: string | null | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return PAID_KEYWORDS.some((k) => lower.includes(k));
}

export function formatPickupTime(value: string | null | undefined): string {
  if (!value) return "—";
  const trimmed = value.trim();
  const num = parseFloat(trimmed);
  if (!Number.isNaN(num) && num > 0 && num < 1) {
    const totalMinutes = Math.round(num * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }
  return trimmed;
}

export function formatUsd(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return String(value);
  return `${num}$`;
}

export function formatVnd(value: string | null | undefined): string {
  if (!value) return "—";
  const num = parseFloat(value.replace(/[^\d.]/g, ""));
  if (!Number.isNaN(num) && num > 1000) {
    return new Intl.NumberFormat("vi-VN").format(num);
  }
  return value;
}

export function getPaymentCellClass(value: string | null | undefined): string {
  if (!value) return "";
  if (isPaidValue(value)) return "bg-emerald-100 text-emerald-800 font-medium";
  if (value.includes("$") || /^\d/.test(value.trim())) {
    return "bg-fuchsia-200 text-fuchsia-900 font-semibold";
  }
  return "";
}

export function getNotesCellClass(notes: string | null | undefined): string {
  if (notes && notes.trim()) return "bg-amber-100 text-amber-900";
  return "";
}

export const TOUR_COLORS = [
  "#f97316", // orange - Hue
  "#a855f7", // purple - Evening Danang
  "#eab308", // yellow - Golden Bridge
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#22c55e", // green
  "#6366f1", // indigo
  "#ef4444", // red
] as const;
