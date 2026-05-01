import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "VolleyStats Women",
  description:
    "Resultados, clubes e estatísticas das principais ligas de voleibol feminino.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Header />
        <main className="pb-16 pt-24">{children}</main>
      </body>
    </html>
  );
}
