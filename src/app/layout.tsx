import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DateNavigationProvider } from "@/components/DateNavigationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navigator Tour — Журнал туров",
  description: "Управление бронированиями и турами",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-50">
        <DateNavigationProvider>{children}</DateNavigationProvider>
      </body>
    </html>
  );
}
