import type { Booking, Tour } from "@prisma/client";
import type { Permissions } from "./permissions";
import {
  canEditBooking,
  canCancelBooking,
  canEditTour,
  canAddBookingToTour,
} from "./permissions";
import type { SessionUser } from "./auth";

/** Plain booking shape safe to pass from Server → Client Components */
export type SerializedBooking = {
  id: string;
  tourId: string;
  hotel: string;
  room: string | null;
  guestName: string;
  adults: number;
  children: number;
  phone: string | null;
  pickupTime: string | null;
  costUsd: number | null;
  deposit: string | null;
  balanceUsd: string | null;
  balanceVnd: string | null;
  hotelAddress: string | null;
  billNumber: string | null;
  managerName: string | null;
  remark: string | null;
  notes: string | null;
  isCancelled: boolean;
  cancelledAt: string | null;
  sortOrder: number;
  canEdit: boolean;
  canCancel: boolean;
};

export type SerializedTour = {
  id: string;
  name: string;
  date: string;
  guideName: string | null;
  managerName: string | null;
  color: string;
  sortOrder: number;
  canEdit: boolean;
  canDelete: boolean;
  canAddBooking: boolean;
  bookings: SerializedBooking[];
};

export type SerializedBookingWithTour = SerializedBooking & {
  tour: SerializedTourBase;
};

export function serializeBooking(
  booking: Booking,
  user: SessionUser,
  tour?: { managerName: string | null },
): SerializedBooking {
  return {
    id: booking.id,
    tourId: booking.tourId,
    hotel: booking.hotel,
    room: booking.room,
    guestName: booking.guestName,
    adults: booking.adults,
    children: booking.children,
    phone: booking.phone,
    pickupTime: booking.pickupTime,
    costUsd: booking.costUsd != null ? Number(booking.costUsd) : null,
    deposit: booking.deposit,
    balanceUsd: booking.balanceUsd,
    balanceVnd: booking.balanceVnd,
    hotelAddress: booking.hotelAddress,
    billNumber: booking.billNumber,
    managerName: booking.managerName,
    remark: booking.remark,
    notes: booking.notes,
    isCancelled: booking.isCancelled,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    sortOrder: booking.sortOrder,
    canEdit: canEditBooking(user, booking, tour),
    canCancel: canCancelBooking(user, booking, tour),
  };
}

export function serializeTour(
  tour: Tour & { bookings: Booking[] },
  user: SessionUser,
): SerializedTour {
  const tourMeta = { managerName: tour.managerName };
  return {
    id: tour.id,
    name: tour.name,
    date: tour.date.toISOString(),
    guideName: tour.guideName,
    managerName: tour.managerName,
    color: tour.color,
    sortOrder: tour.sortOrder,
    canEdit: canEditTour(user, tourMeta),
    canDelete: canEditTour(user, tourMeta),
    canAddBooking: canAddBookingToTour(user, tourMeta),
    bookings: tour.bookings.map((b) => serializeBooking(b, user, tourMeta)),
  };
}

export type SerializedTourBase = Omit<
  SerializedTour,
  "bookings" | "canEdit" | "canDelete" | "canAddBooking"
>;

export function serializeTourBase(tour: Tour): SerializedTourBase {
  return {
    id: tour.id,
    name: tour.name,
    date: tour.date.toISOString(),
    guideName: tour.guideName,
    managerName: tour.managerName,
    color: tour.color,
    sortOrder: tour.sortOrder,
  };
}

export function serializeBookingWithTour(
  booking: Booking & { tour: Tour },
  user: SessionUser,
): SerializedBookingWithTour {
  const tourMeta = { managerName: booking.tour.managerName };
  return {
    ...serializeBooking(booking, user, tourMeta),
    tour: serializeTourBase(booking.tour),
  };
}

export type BookingFormData = {
  hotel: string;
  room: string;
  guestName: string;
  adults: number;
  children: number;
  phone: string;
  pickupTime: string;
  costUsd: string;
  deposit: string;
  balanceUsd: string;
  balanceVnd: string;
  hotelAddress: string;
  billNumber: string;
  managerName: string;
  remark: string;
  notes: string;
};

export const emptyBookingForm = (
  managerName = "",
): BookingFormData => ({
  hotel: "",
  room: "",
  guestName: "",
  adults: 1,
  children: 0,
  phone: "",
  pickupTime: "",
  costUsd: "",
  deposit: "",
  balanceUsd: "",
  balanceVnd: "",
  hotelAddress: "",
  billNumber: "",
  managerName,
  remark: "",
  notes: "",
});

export function bookingToForm(booking: SerializedBooking): BookingFormData {
  return {
    hotel: booking.hotel,
    room: booking.room ?? "",
    guestName: booking.guestName,
    adults: booking.adults,
    children: booking.children,
    phone: booking.phone ?? "",
    pickupTime: booking.pickupTime ?? "",
    costUsd: booking.costUsd != null ? String(booking.costUsd) : "",
    deposit: booking.deposit ?? "",
    balanceUsd: booking.balanceUsd ?? "",
    balanceVnd: booking.balanceVnd ?? "",
    hotelAddress: booking.hotelAddress ?? "",
    billNumber: booking.billNumber ?? "",
    managerName: booking.managerName ?? "",
    remark: booking.remark ?? "",
    notes: booking.notes ?? "",
  };
}

/** Server-side type for pages that compute totals before serialization */
export type TourWithBookings = Tour & { bookings: Booking[] };

export type BookingWithTour = Booking & { tour: Tour };

export type { Permissions };
