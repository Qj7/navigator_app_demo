import { Header } from "@/components/Header";
import { DateTabs } from "@/components/DateTabs";
import type { SessionUser } from "@/lib/auth";

type AppShellProps = {
  user: SessionUser;
  children: React.ReactNode;
  dates?: string[];
  activeDate?: string;
};

export function AppShell({ user, children, dates, activeDate }: AppShellProps) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-y-auto overscroll-y-contain">
          <Header user={user} />
          <div className="px-4 py-6 sm:px-6">{children}</div>
        </main>
        {dates && dates.length > 0 && (
          <DateTabs dates={dates} activeDate={activeDate} />
        )}
      </div>
    </div>
  );
}
