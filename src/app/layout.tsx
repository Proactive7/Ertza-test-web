import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionTimeout from "@/components/layout/SessionTimeout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ErtzaTest",
  description: "Plataforma de preparación para la oposición de la Ertzaintza",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/* ⏳ Control de sesión automática */}
        <SessionTimeout />
      </body>
    </html>
  );
}