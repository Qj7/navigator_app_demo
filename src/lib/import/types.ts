export type ParsedBooking = {
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
  sortOrder: number;
};

export type ParsedTour = {
  name: string;
  guideName: string | null;
  date: Date;
  color: string;
  sortOrder: number;
  bookings: ParsedBooking[];
};

export type ParsedSheet = {
  sheetName: string;
  date: Date;
  tours: ParsedTour[];
};

export type ParseResult = {
  sheets: ParsedSheet[];
  skippedSheets: string[];
};

export type ColumnMap = {
  hotel: number;
  room: number;
  guestName: number;
  adults: number;
  children: number;
  phone: number;
  pickupTime: number;
  costUsd: number;
  deposit: number;
  balanceUsd: number;
  balanceVnd: number;
  hotelAddress: number;
  billNumber: number;
  managerName: number;
  remark: number;
};
