import type { Metadata } from "next";
import { Montserrat, League_Spartan } from "next/font/google";
import "./globals.css";
import AuthModal from "@/components/AuthModal";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-league-spartan",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Tyes — Dashboard",
  description: "Tyes AI Photo Retouching Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${leagueSpartan.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        {children}
        <AuthModal />
      </body>
    </html>
  );
}
