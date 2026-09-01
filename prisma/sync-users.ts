import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "demo123";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => CYRILLIC_TO_LATIN[c] ?? c)
    .join("");
}

function toEmail(name: string, usedEmails: Set<string>): string {
  let slug = transliterate(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  if (!slug) slug = "user";

  let email = `${slug}@navigator.com`;
  let counter = 2;
  while (usedEmails.has(email)) {
    email = `${slug}-${counter}@navigator.com`;
    counter += 1;
  }
  usedEmails.add(email);
  return email;
}

function isValidManagerName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "-") return false;
  if (trimmed.length < 2) return false;
  return true;
}

function isValidGuideName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return false;
  if (/^\d{2}\/\d{2}/.test(trimmed)) return false;
  if (/^\d{2}\/\d{2}\s/.test(trimmed)) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

function normalizeGuideName(name: string): string {
  return name.trim().toUpperCase();
}

async function findUserByName(name: string) {
  const users = await prisma.user.findMany();
  const lower = name.trim().toLowerCase();
  return users.find((u) => u.name.trim().toLowerCase() === lower) ?? null;
}

function inferTourManager(
  bookings: { managerName: string | null }[],
): string | null {
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

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const existingUsers = await prisma.user.findMany();
  const usedEmails = new Set(existingUsers.map((u) => u.email));

  const managerRows = await prisma.booking.findMany({
    select: { managerName: true },
    distinct: ["managerName"],
    where: { managerName: { not: null } },
  });

  const guideRows = await prisma.tour.findMany({
    select: { guideName: true },
    distinct: ["guideName"],
    where: { guideName: { not: null } },
  });

  let managersCreated = 0;
  let guidesCreated = 0;

  for (const row of managerRows) {
    const name = row.managerName!.trim();
    if (!isValidManagerName(name)) continue;
    if (await findUserByName(name)) continue;

    await prisma.user.create({
      data: {
        email: toEmail(name, usedEmails),
        passwordHash,
        name,
        role: "MANAGER",
      },
    });
    managersCreated += 1;
    console.log(`+ Manager: ${name}`);
  }

  for (const row of guideRows) {
    const raw = row.guideName!.trim();
    if (!isValidGuideName(raw)) continue;

    const name = normalizeGuideName(raw);
    if (await findUserByName(name)) continue;
    if (await findUserByName(raw)) continue;

    await prisma.user.create({
      data: {
        email: toEmail(name, usedEmails),
        passwordHash,
        name,
        role: "GUIDE",
      },
    });
    guidesCreated += 1;
    console.log(`+ Guide: ${name}`);
  }

  const tours = await prisma.tour.findMany({
    include: {
      bookings: {
        select: { managerName: true },
        where: { managerName: { not: null } },
      },
    },
  });

  let toursUpdated = 0;
  for (const tour of tours) {
    const managerName = inferTourManager(tour.bookings);
    if (managerName && tour.managerName !== managerName) {
      await prisma.tour.update({
        where: { id: tour.id },
        data: { managerName },
      });
      toursUpdated += 1;
    }
  }

  const totalUsers = await prisma.user.count();
  console.log("\n--- Summary ---");
  console.log(`Managers created: ${managersCreated}`);
  console.log(`Guides created: ${guidesCreated}`);
  console.log(`Tours backfilled with managerName: ${toursUpdated}`);
  console.log(`Total users: ${totalUsers}`);
  console.log(`Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
