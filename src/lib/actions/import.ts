"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { parseExcelBuffer } from "@/lib/import/parseExcel";
import type { ParsedBooking } from "@/lib/import/types";
import { formatDateParam } from "@/lib/utils";

export type ImportState = {
  ok: boolean;
  error?: string;
  sheetsProcessed?: number;
  toursCreated?: number;
  bookingsCreated?: number;
  dates?: string[];
  skippedSheets?: string[];
};

function assertAdmin(role: string) {
  if (role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
}

function inferManagerName(bookings: ParsedBooking[]): string | null {
  const counts = new Map<string, number>();
  for (const b of bookings) {
    const name = b.managerName?.trim();
    if (name && name !== "-") {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }
  return best;
}

export async function importExcelAction(
  _prev: ImportState | null,
  formData: FormData,
): Promise<ImportState> {
  try {
    const user = await requireAuth();
    assertAdmin(user.role);

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Выберите файл Excel (.xlsx или .xls)" };
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (
      !allowedTypes.includes(file.type) &&
      ext !== "xlsx" &&
      ext !== "xls"
    ) {
      return { ok: false, error: "Поддерживаются только файлы .xlsx и .xls" };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { ok: false, error: "Файл слишком большой (максимум 50 МБ)" };
    }

    const replaceExisting = formData.get("replaceExisting") === "on";
    const buffer = Buffer.from(await file.arrayBuffer());
    const { sheets, skippedSheets } = parseExcelBuffer(buffer);

    if (sheets.length === 0) {
      return {
        ok: false,
        error:
          "Не найдено данных для импорта. Убедитесь, что вкладки названы датами (например, 30.08.2026).",
        skippedSheets,
      };
    }

    const dates = [...new Set(sheets.map((s) => s.date.toISOString()))];
    let toursCreated = 0;
    let bookingsCreated = 0;

    await prisma.$transaction(async (tx) => {
      if (replaceExisting) {
        for (const dateIso of dates) {
          const date = new Date(dateIso);
          await tx.tour.deleteMany({ where: { date } });
        }
      }

      for (const sheet of sheets) {
        for (const tourData of sheet.tours) {
          const tour = await tx.tour.create({
            data: {
              name: tourData.name,
              date: tourData.date,
              guideName: tourData.guideName,
              managerName: inferManagerName(tourData.bookings),
              color: tourData.color,
              sortOrder: tourData.sortOrder,
            },
          });
          toursCreated += 1;

          if (tourData.bookings.length > 0) {
            await tx.booking.createMany({
              data: tourData.bookings.map((b) => ({
                tourId: tour.id,
                hotel: b.hotel,
                room: b.room,
                guestName: b.guestName,
                adults: b.adults,
                children: b.children,
                phone: b.phone,
                pickupTime: b.pickupTime,
                costUsd: b.costUsd,
                deposit: b.deposit,
                balanceUsd: b.balanceUsd,
                balanceVnd: b.balanceVnd,
                hotelAddress: b.hotelAddress,
                billNumber: b.billNumber,
                managerName: b.managerName,
                remark: b.remark,
                notes: b.notes,
                sortOrder: b.sortOrder,
              })),
            });
            bookingsCreated += tourData.bookings.length;
          }
        }
      }
    });

    for (const dateIso of dates) {
      revalidatePath(`/${formatDateParam(dateIso)}`);
    }
    revalidatePath("/");
    revalidatePath("/import");

    return {
      ok: true,
      sheetsProcessed: sheets.length,
      toursCreated,
      bookingsCreated,
      dates: dates.map((d) => formatDateParam(d)),
      skippedSheets,
    };
  } catch (error) {
    console.error("Import failed:", error);
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { ok: false, error: "Недостаточно прав для импорта" };
    }
    return {
      ok: false,
      error: "Ошибка при импорте. Проверьте формат файла и попробуйте снова.",
    };
  }
}
