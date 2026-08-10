import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diya Creation - Operations Control",
  description: "Operations control panel for Diya Creation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-obsidian-950 text-obsidian-50">
        {children}
      </body>
    </html>
  );
}
