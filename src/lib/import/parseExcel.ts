import * as XLSX from "xlsx";
import { TOUR_COLORS } from "@/lib/utils";
import type {
  ColumnMap,
  ParsedBooking,
  ParsedSheet,
  ParsedTour,
  ParseResult,
} from "./types";

const DEFAULT_COLUMN_MAP: ColumnMap = {
  hotel: 1,
  room: 2,
  guestName: 3,
  adults: 4,
  children: 5,
  phone: 6,
  pickupTime: 7,
  costUsd: 8,
  deposit: 9,
  balanceUsd: 10,
  balanceVnd: 11,
  hotelAddress: 12,
  billNumber: 13,
  managerName: 14,
  remark: 15,
};

const HEADER_ALIASES: Record<keyof ColumnMap, string[]> = {
  hotel: ["отель"],
  room: ["комната", "комн"],
  guestName: ["имя"],
  adults: ["взр"],
  children: ["дет"],
  phone: ["телефон"],
  pickupTime: ["выезд"],
  costUsd: ["стоим"],
  deposit: ["депозит"],
  balanceUsd: ["остаток гиду ($)", "остаток ($)", "($)"],
  balanceVnd: ["остаток гиду (vnd)", "остаток (vnd)", "(vnd)"],
  hotelAddress: ["адрес отеля", "адрес"],
  billNumber: ["bill", "bills"],
  managerName: ["менеджер"],
  remark: ["примечание"],
};

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getRowValues(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  maxCol = 20,
): string[] {
  const values: string[] = [];
  for (let col = 0; col <= maxCol; col++) {
    const addr = XLSX.utils.encode_cell({ r: rowIndex, c: col });
    values.push(cellToString(sheet[addr]?.v));
  }
  return values;
}

function getCell(row: string[], index: number): string {
  return row[index]?.trim() ?? "";
}

function matchHeader(text: string, aliases: string[]): boolean {
  const normalized = normalizeHeader(text);
  return aliases.some(
    (alias) => normalized === alias || normalized.includes(alias),
  );
}

function detectColumnMap(sheet: XLSX.WorkSheet): {
  columnMap: ColumnMap;
  dataStartRow: number;
} {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  const maxScanRow = Math.min(range.e.r, 8);

  for (let row = 0; row <= maxScanRow; row++) {
    const rowValues = getRowValues(sheet, row);
    const nextRowValues =
      row + 1 <= maxScanRow ? getRowValues(sheet, row + 1) : [];

    const hotelIdx = rowValues.findIndex((cell) =>
      matchHeader(cell, HEADER_ALIASES.hotel),
    );
    if (hotelIdx < 0) continue;

    const columnMap = { ...DEFAULT_COLUMN_MAP };
    const combinedHeaders = rowValues.map((cell, idx) => {
      const sub = nextRowValues[idx] ?? "";
      return normalizeHeader(`${cell} ${sub}`.trim());
    });

    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
      keyof ColumnMap,
      string[],
    ][]) {
      const idx = combinedHeaders.findIndex((header) =>
        aliases.some((alias) => header.includes(alias)),
      );
      if (idx >= 0) {
        columnMap[field] = idx;
      }
    }

    return { columnMap, dataStartRow: row + (nextRowValues.some(Boolean) ? 2 : 1) };
  }

  return { columnMap: DEFAULT_COLUMN_MAP, dataStartRow: 2 };
}

function parseSheetDate(sheetName: string): Date | null {
  const trimmed = sheetName.trim();

  const dotted = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const [, day, month, year] = dotted;
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`);
  }

  const dashed = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashed) {
    return new Date(`${trimmed}T00:00:00.000Z`);
  }

  return null;
}

function isSkippedSheet(sheetName: string): boolean {
  const lower = sheetName.toLowerCase();
  return lower.includes("отмен") || lower.includes("cancel");
}

function getRowText(row: string[]): string {
  return row.map((cell) => cell.trim()).filter(Boolean).join(" ").trim();
}

function parseTourHeader(text: string): { name: string; guideName: string | null } | null {
  const trimmed = text.trim();
  if (!trimmed || /^итого/i.test(trimmed)) return null;

  const withGuide = trimmed.match(
    /^(.+?)\s+\d{1,2}\/\d{1,2}(?:\s*\(\d+\))?\s*[-–—]\s*(.+)$/i,
  );
  if (withGuide) {
    return {
      name: withGuide[1].trim(),
      guideName: withGuide[2].trim() || null,
    };
  }

  const dashParts = trimmed.split(/\s[-–—]\s/);
  if (dashParts.length >= 2 && /\d{1,2}\/\d{1,2}/.test(trimmed)) {
    const name = dashParts[0]
      .replace(/\s+\d{1,2}\/\d{1,2}(?:\s*\(\d+\))?/i, "")
      .trim();
    const guideName = dashParts[dashParts.length - 1].trim();
    if (name) {
      return { name, guideName: guideName || null };
    }
  }

  return null;
}

function isTotalRow(row: string[], columnMap: ColumnMap): boolean {
  const guestName = getCell(row, columnMap.guestName);
  const hotel = getCell(row, columnMap.hotel);
  return /^итого/i.test(guestName) || /^итого/i.test(hotel);
}

function isTourHeaderRow(
  row: string[],
  columnMap: ColumnMap,
): { name: string; guideName: string | null } | null {
  const candidates = [
    getCell(row, columnMap.hotel),
    getCell(row, columnMap.guestName),
    getRowText(row),
  ].filter(Boolean);

  for (const text of candidates) {
    const parsed = parseTourHeader(text);
    if (!parsed) continue;

    const guestName = getCell(row, columnMap.guestName);
    const hotel = getCell(row, columnMap.hotel);
    const adults = getCell(row, columnMap.adults);
    const phone = getCell(row, columnMap.phone);

    const looksLikeHeader =
      !adults &&
      !phone &&
      (!guestName ||
        guestName === text ||
        guestName === hotel ||
        Boolean(parseTourHeader(guestName)));

    if (looksLikeHeader) {
      return parsed;
    }
  }

  return null;
}

function parseNumber(value: string): number | null {
  if (!value) return null;
  const num = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isNaN(num) ? null : num;
}

function parseIntSafe(value: string, fallback: number): number {
  const num = parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isNaN(num) ? fallback : num;
}

function parseBookingRow(
  row: string[],
  columnMap: ColumnMap,
  sortOrder: number,
): ParsedBooking | null {
  const hotel = getCell(row, columnMap.hotel);
  const guestName = getCell(row, columnMap.guestName);

  if (!hotel || /^итого/i.test(guestName) || /^итого/i.test(hotel)) {
    return null;
  }

  if (parseTourHeader(hotel) && !guestName) {
    return null;
  }

  const adults = parseIntSafe(getCell(row, columnMap.adults), 1);
  const children = parseIntSafe(getCell(row, columnMap.children), 0);

  const deposit = getCell(row, columnMap.deposit) || null;
  const balanceUsd = getCell(row, columnMap.balanceUsd) || null;
  const balanceVnd = getCell(row, columnMap.balanceVnd) || null;

  let notes: string | null = null;
  for (const value of [deposit, balanceUsd, balanceVnd]) {
    if (value && value.length > 30) {
      notes = value;
      break;
    }
  }

  return {
    hotel,
    room: getCell(row, columnMap.room) || null,
    guestName: guestName || hotel,
    adults,
    children,
    phone: getCell(row, columnMap.phone) || null,
    pickupTime: getCell(row, columnMap.pickupTime) || null,
    costUsd: parseNumber(getCell(row, columnMap.costUsd)),
    deposit: notes ? null : deposit,
    balanceUsd: notes ? null : balanceUsd,
    balanceVnd: notes ? null : balanceVnd,
    hotelAddress: getCell(row, columnMap.hotelAddress) || null,
    billNumber: getCell(row, columnMap.billNumber) || null,
    managerName: getCell(row, columnMap.managerName) || null,
    remark: getCell(row, columnMap.remark) || null,
    notes,
    sortOrder,
  };
}

function tourColor(name: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TOUR_COLORS[Math.abs(hash + index) % TOUR_COLORS.length];
}

function parseSheet(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  date: Date,
): ParsedSheet {
  const { columnMap, dataStartRow } = detectColumnMap(sheet);
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");

  const tours: ParsedTour[] = [];
  let currentTour: ParsedTour | null = null;
  let bookingSortOrder = 0;

  for (let row = dataStartRow; row <= range.e.r; row++) {
    const rowValues = getRowValues(sheet, row);
    if (!rowValues.some(Boolean)) continue;

    if (isTotalRow(rowValues, columnMap)) continue;

    const tourHeader = isTourHeaderRow(rowValues, columnMap);
    if (tourHeader) {
      currentTour = {
        name: tourHeader.name,
        guideName: tourHeader.guideName,
        date,
        color: tourColor(tourHeader.name, tours.length),
        sortOrder: tours.length,
        bookings: [],
      };
      tours.push(currentTour);
      bookingSortOrder = 0;
      continue;
    }

    if (!currentTour) continue;

    const booking = parseBookingRow(rowValues, columnMap, bookingSortOrder);
    if (booking) {
      currentTour.bookings.push(booking);
      bookingSortOrder += 1;
    }
  }

  return { sheetName, date, tours: tours.filter((t) => t.bookings.length > 0) };
}

export function parseExcelBuffer(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheets: ParsedSheet[] = [];
  const skippedSheets: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    if (isSkippedSheet(sheetName)) {
      skippedSheets.push(sheetName);
      continue;
    }

    const date = parseSheetDate(sheetName);
    if (!date) {
      skippedSheets.push(sheetName);
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const parsed = parseSheet(sheet, sheetName, date);
    if (parsed.tours.length > 0) {
      sheets.push(parsed);
    } else {
      skippedSheets.push(sheetName);
    }
  }

  return { sheets, skippedSheets };
}
