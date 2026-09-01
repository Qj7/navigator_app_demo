import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "demo123";

async function main() {
  await prisma.booking.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@navigator.com",
        passwordHash,
        name: "Админ",
        role: "ADMIN",
      },
      {
        email: "valera@navigator.com",
        passwordHash,
        name: "Валера",
        role: "MANAGER",
      },
      {
        email: "dasha@navigator.com",
        passwordHash,
        name: "Даша",
        role: "MANAGER",
      },
      {
        email: "vova@navigator.com",
        passwordHash,
        name: "VOVA",
        role: "GUIDE",
      },
    ],
  });

  const d2608 = new Date("2026-08-26");
  const d3008 = new Date("2026-08-30");
  const d3108 = new Date("2026-08-31");
  const d0109 = new Date("2026-09-01");

  const tourHue = await prisma.tour.create({
    data: {
      name: "ХЮЭ",
      date: d3008,
      guideName: "SERGEI",
      color: "#f97316",
      sortOrder: 0,
    },
  });

  const tourEvening = await prisma.tour.create({
    data: {
      name: "Вечерний Дананг",
      date: d3008,
      guideName: "ZHENYA 2",
      color: "#a855f7",
      sortOrder: 1,
    },
  });

  const tourGolden3008 = await prisma.tour.create({
    data: {
      name: "Золотой мост",
      date: d3008,
      guideName: "VUGAR",
      color: "#eab308",
      sortOrder: 2,
    },
  });

  const tourHoiAn3108 = await prisma.tour.create({
    data: {
      name: "Дневной Хойан",
      date: d3108,
      guideName: "VOVA",
      color: "#06b6d4",
      sortOrder: 0,
    },
  });

  const tourHeaven = await prisma.tour.create({
    data: {
      name: "НЕБЕСНЫЕ ВРАТА",
      date: d3108,
      guideName: "IVAN",
      color: "#ec4899",
      sortOrder: 1,
    },
  });

  const tourGolden0109 = await prisma.tour.create({
    data: {
      name: "ЗОЛОТОЙ МОСТ",
      date: d0109,
      guideName: "SERGEI",
      color: "#eab308",
      sortOrder: 0,
    },
  });

  const tourHoiAn0109 = await prisma.tour.create({
    data: {
      name: "дневной Хойан",
      date: d0109,
      guideName: "VOVA",
      color: "#06b6d4",
      sortOrder: 1,
    },
  });

  await prisma.tour.create({
    data: {
      name: "Тестовый тур",
      date: d2608,
      guideName: "TEST",
      color: "#6366f1",
      sortOrder: 0,
    },
  });

  await prisma.booking.createMany({
    data: [
      {
        tourId: tourHue.id,
        hotel: "Meliá Vinpearl Danang Riverfront",
        room: "1205",
        guestName: "Анна",
        adults: 2,
        children: 0,
        phone: "+84901234567",
        pickupTime: "7:30",
        costUsd: 134,
        deposit: "Оплачено",
        balanceUsd: "опл",
        hotelAddress: "341 Tran Hung Dao, Son Tra, Da Nang",
        billNumber: "6965",
        managerName: "Валера",
        sortOrder: 0,
      },
      {
        tourId: tourHue.id,
        hotel: "Novotel Danang Premier Han River",
        room: "803",
        guestName: "Дмитрий",
        adults: 3,
        children: 1,
        phone: "+84987654321",
        pickupTime: "7:30",
        costUsd: 268,
        deposit: "Оплачено",
        balanceUsd: "PAID",
        hotelAddress: "36 Bach Dang, Hai Chau, Da Nang",
        billNumber: "1825",
        managerName: "Даша",
        sortOrder: 1,
      },
      {
        tourId: tourEvening.id,
        hotel: "Hyatt Regency Danang",
        room: "501",
        guestName: "Елена",
        adults: 2,
        children: 0,
        phone: "+84911223344",
        pickupTime: "13:40",
        costUsd: 90,
        deposit: "Оплачено",
        balanceUsd: "оплачено",
        hotelAddress: "5 Truong Sa, Ngu Hanh Son, Da Nang",
        billNumber: "7330",
        managerName: "никита",
        sortOrder: 0,
      },
      {
        tourId: tourGolden3008.id,
        hotel: "The Sail Hotel Danang",
        room: "101",
        guestName: "Оксана",
        adults: 2,
        children: 0,
        phone: "+84955667788",
        pickupTime: "8:00",
        costUsd: 65,
        deposit: "20$",
        balanceUsd: "45$",
        balanceVnd: "1,200,000",
        hotelAddress: "12 Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "5102",
        managerName: "Валера",
        remark: "Написать время",
        sortOrder: 0,
      },
      {
        tourId: tourGolden3008.id,
        hotel: "Chicland Danang Beach Hotel",
        room: "305",
        guestName: "Павел",
        adults: 2,
        children: 0,
        phone: "+84999887766",
        pickupTime: "8:00",
        costUsd: 65,
        deposit: "Оплачено",
        balanceUsd: "GUIDE",
        hotelAddress: "04 Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "5103",
        managerName: "Юра",
        sortOrder: 1,
      },
      {
        tourId: tourHoiAn3108.id,
        hotel: "Premier Village Danang",
        room: "210",
        guestName: "Мария",
        adults: 2,
        children: 1,
        phone: "+84944332211",
        pickupTime: "7:30",
        costUsd: 130,
        deposit: "Оплачено",
        balanceUsd: "100$",
        balanceVnd: "4,869,000",
        hotelAddress: "99 Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "6201",
        managerName: "Анастасия",
        sortOrder: 0,
      },
      {
        tourId: tourHeaven.id,
        hotel: "InterContinental Danang",
        room: "1502",
        guestName: "Игорь",
        adults: 2,
        children: 0,
        phone: "+84966778899",
        pickupTime: "8:00",
        costUsd: 360,
        deposit: "Оплачено",
        balanceUsd: "PAID",
        hotelAddress: "Bai Bac, Son Tra Peninsula, Da Nang",
        billNumber: "6202",
        managerName: "Руслан",
        notes: "Paid via QR in Nha Trang on 22.08",
        sortOrder: 0,
      },
      {
        tourId: tourGolden0109.id,
        hotel: "The Sail Hotel Danang",
        room: "201",
        guestName: "Светлана",
        adults: 2,
        children: 0,
        phone: "+84901234000",
        pickupTime: "8:00",
        costUsd: 65,
        deposit: "Оплачено",
        balanceUsd: "опл",
        hotelAddress: "12 Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "8101",
        managerName: "Валера",
        sortOrder: 0,
      },
      {
        tourId: tourGolden0109.id,
        hotel: "Mikazuki Japanese Resort",
        room: "412",
        guestName: "Алексей",
        adults: 3,
        children: 0,
        phone: "+84901234001",
        pickupTime: "8:00",
        costUsd: 97,
        deposit: "Оплачено",
        balanceUsd: "опл",
        hotelAddress: "Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "8102",
        managerName: "Даша",
        sortOrder: 1,
      },
      {
        tourId: tourGolden0109.id,
        hotel: "Novotel Danang",
        room: "701",
        guestName: "Наталья",
        adults: 2,
        children: 0,
        phone: "+84901234002",
        pickupTime: "8:00",
        costUsd: 65,
        deposit: "20$",
        balanceUsd: "45$",
        hotelAddress: "36 Bach Dang, Hai Chau, Da Nang",
        billNumber: "8103",
        managerName: "Валера",
        sortOrder: 2,
      },
      {
        tourId: tourGolden0109.id,
        hotel: "Hyatt Regency Danang",
        room: "302",
        guestName: "Виктор",
        adults: 2,
        children: 0,
        phone: "+84901234003",
        pickupTime: "8:00",
        costUsd: 65,
        deposit: "Оплачено",
        balanceUsd: "опл",
        hotelAddress: "5 Truong Sa, Ngu Hanh Son, Da Nang",
        billNumber: "8104",
        managerName: "никита",
        sortOrder: 3,
      },
      {
        tourId: tourHoiAn0109.id,
        hotel: "Chicland Danang Beach Hotel",
        room: "508",
        guestName: "Ольга",
        adults: 2,
        children: 0,
        phone: "+84901234004",
        pickupTime: "7:30",
        costUsd: 65,
        deposit: "Оплачено",
        balanceUsd: "опл",
        hotelAddress: "04 Vo Nguyen Giap, Son Tra, Da Nang",
        billNumber: "8201",
        managerName: "Даша",
        sortOrder: 0,
      },
    ],
  });

  console.log("Seed completed successfully");
  console.log(`Demo password for all users: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
