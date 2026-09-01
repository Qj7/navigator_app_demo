"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canCancelBooking, canEditBooking, canAddBookingToTour } from "@/lib/permissions";
import { formatDateParam } from "@/lib/utils";

function revalidateForTour(tourId: string) {
  return prisma.tour.findUnique({ where: { id: tourId } }).then((tour) => {
    if (tour) {
      revalidatePath(`/${formatDateParam(tour.date)}`);
      revalidatePath("/");
      revalidatePath("/cancellations");
    }
  });
}

export type BookingInput = {
  tourId: string;
  hotel: string;
  room?: string;
  guestName: string;
  adults?: number;
  children?: number;
  phone?: string;
  pickupTime?: string;
  costUsd?: number | null;
  deposit?: string;
  balanceUsd?: string;
  balanceVnd?: string;
  hotelAddress?: string;
  billNumber?: string;
  managerName?: string;
  remark?: string;
  notes?: string;
};

export async function createBooking(data: BookingInput) {
  const user = await requireAuth();
  if (user.role === "GUIDE") {
    throw new Error("FORBIDDEN");
  }

  const tour = await prisma.tour.findUnique({ where: { id: data.tourId } });
  if (!tour) throw new Error("NOT_FOUND");
  if (!canAddBookingToTour(user, tour)) throw new Error("FORBIDDEN");

  const managerName =
    user.role === "MANAGER"
      ? user.name
      : data.managerName?.trim() || null;

  const maxOrder = await prisma.booking.aggregate({
    where: { tourId: data.tourId },
    _max: { sortOrder: true },
  });

  const booking = await prisma.booking.create({
    data: {
      tourId: data.tourId,
      hotel: data.hotel,
      room: data.room || null,
      guestName: data.guestName,
      adults: data.adults ?? 1,
      children: data.children ?? 0,
      phone: data.phone || null,
      pickupTime: data.pickupTime || null,
      costUsd: data.costUsd ?? null,
      deposit: data.deposit || null,
      balanceUsd: data.balanceUsd || null,
      balanceVnd: data.balanceVnd || null,
      hotelAddress: data.hotelAddress || null,
      billNumber: data.billNumber || null,
      managerName,
      remark: data.remark || null,
      notes: data.notes || null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  await revalidateForTour(data.tourId);
  return booking;
}

export async function updateBooking(id: string, data: Partial<BookingInput>) {
  const user = await requireAuth();

  const existing = await prisma.booking.findUnique({
    where: { id },
    include: { tour: true },
  });
  if (!existing) throw new Error("NOT_FOUND");
  if (!canEditBooking(user, existing, existing.tour)) throw new Error("FORBIDDEN");

  const { tourId, costUsd, managerName, ...rest } = data;
  void tourId;

  let resolvedManagerName: string | null | undefined = undefined;
  if (user.role === "ADMIN" && managerName !== undefined) {
    resolvedManagerName = managerName.trim() || null;
  } else if (user.role === "MANAGER") {
    resolvedManagerName = user.name;
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      ...rest,
      costUsd: costUsd === undefined ? undefined : costUsd,
      managerName: resolvedManagerName,
      room: rest.room === undefined ? undefined : rest.room || null,
      phone: rest.phone === undefined ? undefined : rest.phone || null,
      pickupTime:
        rest.pickupTime === undefined ? undefined : rest.pickupTime || null,
      deposit: rest.deposit === undefined ? undefined : rest.deposit || null,
      balanceUsd:
        rest.balanceUsd === undefined ? undefined : rest.balanceUsd || null,
      balanceVnd:
        rest.balanceVnd === undefined ? undefined : rest.balanceVnd || null,
      hotelAddress:
        rest.hotelAddress === undefined ? undefined : rest.hotelAddress || null,
      billNumber:
        rest.billNumber === undefined ? undefined : rest.billNumber || null,
      remark: rest.remark === undefined ? undefined : rest.remark || null,
      notes: rest.notes === undefined ? undefined : rest.notes || null,
    },
  });

  await revalidateForTour(booking.tourId);
  return booking;
}

export async function cancelBooking(id: string) {
  const user = await requireAuth();

  const existing = await prisma.booking.findUnique({
    where: { id },
    include: { tour: true },
  });
  if (!existing) throw new Error("NOT_FOUND");
  if (!canCancelBooking(user, existing, existing.tour)) throw new Error("FORBIDDEN");

  const booking = await prisma.booking.update({
    where: { id },
    data: { isCancelled: true, cancelledAt: new Date() },
  });
  await revalidateForTour(booking.tourId);
  return booking;
}

export async function restoreBooking(id: string) {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  const booking = await prisma.booking.update({
    where: { id },
    data: { isCancelled: false, cancelledAt: null },
  });
  await revalidateForTour(booking.tourId);
  return booking;
}

export async function deleteBooking(id: string) {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  const booking = await prisma.booking.delete({ where: { id } });
  await revalidateForTour(booking.tourId);
}
