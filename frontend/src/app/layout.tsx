import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diya Creation | Premium Chocolates, Personalized Gifts & Hampers",
  description: "Exquisite handmade chocolates, personalized luxury gifts, and curated celebration hampers. Design your own hamper online with our interactive 3D builder.",
  keywords: "custom hampers, handmade chocolates, personalized gifts, luxury gifting, corporate gifts, wedding favors, Diya Creation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-obsidian-950 text-obsidian-50">
        {children}
      </body>
    </html>
  );
}
