import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CancellationsList } from "@/components/CancellationsList";
import { serializeBookingWithTour } from "@/lib/types";
import { getDatesWithTours, getCancelledBookings } from "@/lib/actions/tours";
import { getSession } from "@/lib/auth";
import { getPermissions } from "@/lib/permissions";

export default async function CancellationsPage() {
  const user = await getSession();
  if (!user) notFound();

  const permissions = getPermissions(user);

  const [dates, bookings] = await Promise.all([
    getDatesWithTours(),
    getCancelledBookings(),
  ]);

  const dateStrings = dates.map((d) => d.toISOString());
  const serializedBookings = bookings.map((b) =>
    serializeBookingWithTour(b, user),
  );

  return (
    <AppShell user={user} dates={dateStrings}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rose-700">Отмены</h1>
        <p className="mt-1 text-sm text-slate-500">
          {bookings.length} отменённых бронирований
        </p>
      </div>

      <CancellationsList
        bookings={serializedBookings}
        permissions={permissions}
      />
    </AppShell>
  );
}
