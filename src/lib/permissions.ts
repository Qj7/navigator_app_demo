import type { Role } from "@prisma/client";
import type { SessionUser } from "./auth";

export type Permissions = {
  canCreateTour: boolean;
  canCreateBooking: boolean;
  canManageCancellations: boolean;
  userName: string;
  userRole: Role;
  isReadOnly: boolean;
};

export function getPermissions(user: SessionUser): Permissions {
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "MANAGER";

  return {
    canCreateTour: isAdmin || isManager,
    canCreateBooking: isAdmin || isManager,
    canManageCancellations: isAdmin,
    userName: user.name,
    userRole: user.role,
    isReadOnly: user.role === "GUIDE",
  };
}

export function namesMatch(a: string | null | undefined, b: string): boolean {
  if (!a) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function canEditTour(
  user: SessionUser,
  tour: { managerName: string | null },
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER") return namesMatch(tour.managerName, user.name);
  return false;
}

export function canAddBookingToTour(
  user: SessionUser,
  tour: { managerName: string | null },
): boolean {
  return canEditTour(user, tour);
}

export function canEditBooking(
  user: SessionUser,
  booking: { managerName: string | null },
  tour?: { managerName: string | null },
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER") {
    if (tour && !canEditTour(user, tour)) return false;
    return namesMatch(booking.managerName, user.name);
  }
  return false;
}

export function canCancelBooking(
  user: SessionUser,
  booking: { managerName: string | null },
  tour?: { managerName: string | null },
): boolean {
  return canEditBooking(user, booking, tour);
}
