import { redirect } from "next/navigation";
import { formatDateParam } from "@/lib/utils";
import { getDatesWithTours } from "@/lib/actions/tours";

export default async function HomePage() {
  const dates = await getDatesWithTours();

  if (dates.length > 0) {
    const today = formatDateParam(new Date());
    const hasToday = dates.some((d) => formatDateParam(d) === today);
    redirect(hasToday ? `/${today}` : `/${formatDateParam(dates[dates.length - 1])}`);
  }

  redirect(`/${formatDateParam(new Date())}`);
}
