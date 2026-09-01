"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canEditTour } from "@/lib/permissions";
import { formatDateParam } from "@/lib/utils";
import { uniquePersonNames } from "@/lib/personNames";

function revalidateDate(date: Date) {
  revalidatePath(`/${formatDateParam(date)}`);
  revalidatePath("/");
  revalidatePath("/cancellations");
}

function resolveTourManagerName(
  user: Awaited<ReturnType<typeof requireAuth>>,
  managerName?: string,
): string | null {
  if (user.role === "MANAGER") return user.name;
  if (user.role === "ADMIN") return managerName?.trim() || null;
  return null;
}

export async function getTourFormOptions() {
  await requireAuth();

  const [managers, guideUsers, guideTours] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MANAGER" },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "GUIDE" },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.tour.findMany({
      select: { guideName: true },
      distinct: ["guideName"],
      where: { guideName: { not: null } },
      orderBy: { guideName: "asc" },
    }),
  ]);

  const guides = uniquePersonNames([
    ...guideUsers.map((user) => ({ name: user.name, fromUser: true })),
    ...guideTours.map((tour) => ({ name: tour.guideName ?? "" })),
  ]);

  return {
    managers: uniquePersonNames(
      managers.map((manager) => ({ name: manager.name, fromUser: true })),
    ),
    guides,
  };
}

export async function createTour(data: {
  name: string;
  date: string;
  guideName?: string;
  managerName?: string;
  color?: string;
}) {
  const user = await requireAuth();
  if (user.role === "GUIDE") {
    throw new Error("FORBIDDEN");
  }

  const date = new Date(`${data.date}T00:00:00.000Z`);
  const maxOrder = await prisma.tour.aggregate({
    where: { date },
    _max: { sortOrder: true },
  });

  const tour = await prisma.tour.create({
    data: {
      name: data.name,
      date,
      guideName: data.guideName?.trim() || null,
      managerName: resolveTourManagerName(user, data.managerName),
      color: data.color || "#6366f1",
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidateDate(date);
  return tour;
}

export async function updateTour(
  id: string,
  data: {
    name?: string;
    guideName?: string;
    managerName?: string;
    color?: string;
  },
) {
  const user = await requireAuth();

  const existing = await prisma.tour.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  if (!canEditTour(user, existing)) throw new Error("FORBIDDEN");

  const tour = await prisma.tour.update({
    where: { id },
    data: {
      name: data.name,
      guideName: data.guideName?.trim() || null,
      ...(user.role === "ADMIN" && data.managerName !== undefined
        ? { managerName: data.managerName.trim() || null }
        : {}),
      color: data.color,
    },
  });

  revalidateDate(tour.date);
  return tour;
}

export async function deleteTour(id: string) {
  const user = await requireAuth();

  const existing = await prisma.tour.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");
  if (!canEditTour(user, existing)) throw new Error("FORBIDDEN");

  const tour = await prisma.tour.delete({ where: { id } });
  revalidateDate(tour.date);
}

export async function getDatesWithTours() {
  await requireAuth();

  const tours = await prisma.tour.findMany({
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "asc" },
  });
  return tours.map((t) => t.date);
}

export async function getDayData(dateStr: string) {
  await requireAuth();

  const date = new Date(`${dateStr}T00:00:00.000Z`);

  const tours = await prisma.tour.findMany({
    where: { date },
    include: {
      bookings: {
        where: { isCancelled: false },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return tours;
}

export async function getCancelledBookings(month?: number, year?: number) {
  await requireAuth();

  const where: { isCancelled: boolean; cancelledAt?: { gte: Date; lte: Date } } =
    { isCancelled: true };

  if (month !== undefined && year !== undefined) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    where.cancelledAt = { gte: start, lte: end };
  }

  return prisma.booking.findMany({
    where,
    include: { tour: true },
    orderBy: { cancelledAt: "desc" },
  });
}
