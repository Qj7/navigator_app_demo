"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Loader2 } from "lucide-react";

type DateNavigationContextValue = {
  isNavigating: boolean;
  startNavigation: () => void;
};

const DateNavigationContext = createContext<DateNavigationContextValue | null>(
  null,
);

export function useDateNavigation() {
  const context = useContext(DateNavigationContext);
  if (!context) {
    throw new Error("useDateNavigation must be used within DateNavigationProvider");
  }
  return context;
}

export function DateNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  return (
    <DateNavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
      {isNavigating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-label="Загрузка"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-xl">
            <Loader2
              className="h-8 w-8 animate-spin text-indigo-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-700">
              Загрузка даты…
            </p>
          </div>
        </div>
      )}
    </DateNavigationContext.Provider>
  );
}
