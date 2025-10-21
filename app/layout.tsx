import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemeinschaftsgetragen",
  description:
    "Nachbarschaftszentrum Hainfeld – gemeinschaftlich getragenes Projekt mit transparenten Kosten und Aufgaben."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="de">
      <body className="bg-[#f8f9fa] text-slate-900 antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
