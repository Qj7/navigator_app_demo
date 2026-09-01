import type { TourWithBookings } from "@/lib/types";

type DaySummaryProps = {
  tours: TourWithBookings[];
};

export function DaySummary({ tours }: DaySummaryProps) {
  const allBookings = tours.flatMap((t) => t.bookings);
  const totalAdults = allBookings.reduce((s, b) => s + b.adults, 0);
  const totalChildren = allBookings.reduce((s, b) => s + b.children, 0);
  const totalCost = allBookings.reduce(
    (s, b) => s + (b.costUsd ? Number(b.costUsd) : 0),
    0,
  );
  const totalBookings = allBookings.length;

  if (totalBookings === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      <Stat label="Броней" value={String(totalBookings)} />
      <Stat label="Взрослых" value={String(totalAdults)} />
      <Stat label="Детей" value={String(totalChildren)} />
      {totalCost > 0 && (
        <Stat label="Сумма" value={`${totalCost}$`} highlight />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-2.5 ${
        highlight
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`text-lg font-bold ${
          highlight ? "text-indigo-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
