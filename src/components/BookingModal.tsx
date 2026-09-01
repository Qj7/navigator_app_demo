"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { Permissions, SerializedBooking } from "@/lib/types";
import { createBooking, updateBooking } from "@/lib/actions/bookings";
import {
  bookingToForm,
  emptyBookingForm,
  type BookingFormData,
} from "@/lib/types";

type BookingModalProps = {
  tourId: string;
  booking?: SerializedBooking;
  permissions: Permissions;
  onClose: () => void;
};

export function BookingModal({
  tourId,
  booking,
  permissions,
  onClose,
}: BookingModalProps) {
  const isEdit = !!booking;
  const isManager = permissions.userRole === "MANAGER";
  const isAdmin = permissions.userRole === "ADMIN";

  const [form, setForm] = useState<BookingFormData>(
    booking
      ? bookingToForm(booking)
      : emptyBookingForm(isManager ? permissions.userName : ""),
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function set(field: keyof BookingFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hotel.trim() || !form.guestName.trim()) {
      setError("Заполните отель и имя гостя");
      return;
    }

    const payload = {
      tourId,
      hotel: form.hotel.trim(),
      room: form.room.trim() || undefined,
      guestName: form.guestName.trim(),
      adults: Number(form.adults) || 1,
      children: Number(form.children) || 0,
      phone: form.phone.trim() || undefined,
      pickupTime: form.pickupTime.trim() || undefined,
      costUsd: form.costUsd ? parseFloat(form.costUsd) : null,
      deposit: form.deposit.trim() || undefined,
      balanceUsd: form.balanceUsd.trim() || undefined,
      balanceVnd: form.balanceVnd.trim() || undefined,
      hotelAddress: form.hotelAddress.trim() || undefined,
      billNumber: form.billNumber.trim() || undefined,
      managerName: isAdmin ? form.managerName.trim() || undefined : undefined,
      remark: form.remark.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    startTransition(async () => {
      try {
        if (isEdit && booking) {
          await updateBooking(booking.id, payload);
        } else {
          await createBooking(payload);
        }
        onClose();
      } catch {
        setError("Ошибка сохранения. Проверьте права доступа.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Редактировать бронь" : "Новая бронь"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Отель *" className="sm:col-span-2">
              <input
                value={form.hotel}
                onChange={(e) => set("hotel", e.target.value)}
                className={inputClass}
                placeholder="The Sail Hotel Danang"
              />
            </Field>
            <Field label="Комната">
              <input
                value={form.room}
                onChange={(e) => set("room", e.target.value)}
                className={inputClass}
                placeholder="101"
              />
            </Field>
            <Field label="Имя *">
              <input
                value={form.guestName}
                onChange={(e) => set("guestName", e.target.value)}
                className={inputClass}
                placeholder="Оксана"
              />
            </Field>
            <Field label="Взрослые">
              <input
                type="number"
                min={0}
                value={form.adults}
                onChange={(e) => set("adults", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Дети">
              <input
                type="number"
                min={0}
                value={form.children}
                onChange={(e) => set("children", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Телефон">
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
                placeholder="+84..."
              />
            </Field>
            <Field label="Выезд">
              <input
                value={form.pickupTime}
                onChange={(e) => set("pickupTime", e.target.value)}
                className={inputClass}
                placeholder="8:00"
              />
            </Field>
            <Field label="Стоимость ($)">
              <input
                value={form.costUsd}
                onChange={(e) => set("costUsd", e.target.value)}
                className={inputClass}
                placeholder="65"
              />
            </Field>
            <Field label="Bill's number">
              <input
                value={form.billNumber}
                onChange={(e) => set("billNumber", e.target.value)}
                className={inputClass}
                placeholder="6965"
              />
            </Field>
            <Field label="Менеджер">
              <input
                value={form.managerName}
                onChange={(e) => set("managerName", e.target.value)}
                readOnly={isManager}
                className={`${inputClass} ${isManager ? "bg-slate-50 text-slate-500" : ""}`}
                placeholder="Валера"
              />
            </Field>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">Оплата</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Депозит">
                <input
                  value={form.deposit}
                  onChange={(e) => set("deposit", e.target.value)}
                  className={inputClass}
                  placeholder="Оплачено / 20$"
                />
              </Field>
              <Field label="Остаток гиду ($)">
                <input
                  value={form.balanceUsd}
                  onChange={(e) => set("balanceUsd", e.target.value)}
                  className={inputClass}
                  placeholder="45$"
                />
              </Field>
              <Field label="Остаток гиду (VND)">
                <input
                  value={form.balanceVnd}
                  onChange={(e) => set("balanceVnd", e.target.value)}
                  className={inputClass}
                  placeholder="1,200,000"
                />
              </Field>
            </div>
          </div>

          <Field label="Адрес отеля">
            <textarea
              value={form.hotelAddress}
              onChange={(e) => set("hotelAddress", e.target.value)}
              className={`${inputClass} min-h-[60px] resize-y`}
              placeholder="92 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng"
            />
          </Field>

          <Field label="Примечание">
            <textarea
              value={form.remark}
              onChange={(e) => set("remark", e.target.value)}
              className={`${inputClass} min-h-[50px] resize-y`}
              placeholder="Написать время"
            />
          </Field>

          <Field label="Заметки по оплате">
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className={`${inputClass} min-h-[50px] resize-y`}
              placeholder="Paid via QR in Nha Trang..."
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
