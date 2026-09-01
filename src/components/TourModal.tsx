"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { Permissions, SerializedTourBase } from "@/lib/types";
import { createTour, updateTour } from "@/lib/actions/tours";
import { matchPersonName } from "@/lib/personNames";
import { TOUR_COLORS } from "@/lib/utils";

export type TourFormOptions = {
  managers: string[];
  guides: string[];
};

type TourModalProps = {
  dateParam: string;
  permissions: Permissions;
  options: TourFormOptions;
  tour?: Pick<
    SerializedTourBase,
    "id" | "name" | "guideName" | "managerName" | "color"
  >;
  onClose: () => void;
};

const selectClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function TourModal({
  dateParam,
  permissions,
  options,
  tour,
  onClose,
}: TourModalProps) {
  const isEdit = !!tour;
  const isAdmin = permissions.userRole === "ADMIN";
  const isManager = permissions.userRole === "MANAGER";

  const guideOptions = options.guides;
  const managerOptions = options.managers;

  const [name, setName] = useState(tour?.name ?? "");
  const [guideName, setGuideName] = useState(() =>
    matchPersonName(tour?.guideName, guideOptions),
  );
  const [managerName, setManagerName] = useState(() => {
    if (tour?.managerName) {
      return matchPersonName(tour.managerName, managerOptions);
    }
    if (isManager) {
      return matchPersonName(permissions.userName, managerOptions);
    }
    return "";
  });
  const [color, setColor] = useState(tour?.color ?? TOUR_COLORS[0]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название тура");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name: name.trim(),
          guideName: guideName || undefined,
          managerName: isAdmin ? managerName || undefined : undefined,
          color,
        };

        if (isEdit && tour) {
          await updateTour(tour.id, payload);
        } else {
          await createTour({
            ...payload,
            date: dateParam,
          });
        }
        onClose();
      } catch {
        setError("Ошибка сохранения");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Редактировать тур" : "Новый тур"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Название тура *
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={selectClass}
              placeholder="Золотой мост"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Гид
            </span>
            <select
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              className={selectClass}
            >
              <option value="">— не выбран —</option>
              {guideOptions.map((guide) => (
                <option key={guide} value={guide}>
                  {guide}
                </option>
              ))}
            </select>
          </label>

          {isAdmin ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Менеджер
              </span>
              <select
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className={selectClass}
              >
                <option value="">— не выбран —</option>
                {managerOptions.map((manager) => (
                  <option key={manager} value={manager}>
                    {manager}
                  </option>
                ))}
              </select>
            </label>
          ) : isManager ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Менеджер
              </span>
              <input
                value={permissions.userName}
                readOnly
                className={`${selectClass} bg-slate-50 text-slate-500`}
              />
            </label>
          ) : null}

          <div>
            <span className="mb-2 block text-xs font-medium text-slate-600">
              Цвет группы
            </span>
            <div className="flex flex-wrap gap-2">
              {TOUR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "3px solid #0f172a" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

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
              {isPending ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
