import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TourGroup, AddTourButton } from "@/components/TourGroup";
import { DaySummary } from "@/components/DaySummary";
import { serializeTour } from "@/lib/types";
import { getDatesWithTours, getDayData, getTourFormOptions } from "@/lib/actions/tours";
import { getSession } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";
import { formatDateParam, formatDisplayDate, parseDateParam } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ date: string }>;
};

export default async function DayPage({ params }: PageProps) {
  const user = await getSession();
  if (!user) notFound();

  const permissions = getPermissions(user);
  const { date: dateParam } = await params;

  let date: Date;
  try {
    date = parseDateParam(dateParam);
    if (Number.isNaN(date.getTime())) notFound();
  } catch {
    notFound();
  }

  const [dates, tours, tourFormOptions] = await Promise.all([
    getDatesWithTours(),
    getDayData(dateParam),
    getTourFormOptions(),
  ]);

  const dateStrings = dates.map((d) => d.toISOString());
  const serializedTours = tours.map((t) => serializeTour(t, user));

  return (
    <AppShell user={user} dates={dateStrings} activeDate={dateParam}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">
            {formatDisplayDate(date)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tours.length}{" "}
            {tours.length === 1
              ? "тур"
              : tours.length < 5
                ? "тура"
                : "туров"}
            {permissions.isReadOnly && (
              <span className="ml-2 text-indigo-600">· только просмотр</span>
            )}
          </p>
        </div>
        <DaySummary tours={tours} />
      </div>

      <div className="min-w-0 space-y-5">
        {serializedTours.map((tour) => (
          <TourGroup
            key={tour.id}
            tour={tour}
            dateParam={dateParam}
            permissions={permissions}
            tourFormOptions={tourFormOptions}
          />
        ))}
        <AddTourButton
          dateParam={dateParam}
          permissions={permissions}
          tourFormOptions={tourFormOptions}
        />
      </div>
    </AppShell>
  );
}
