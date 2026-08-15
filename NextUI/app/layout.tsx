import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata = {
  title: "Oknitech Serve | Professional Services, Delivered Digitally",
  description:
    "Discover services, book consultations, and manage your entire client journey through our secure digital portal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-white font-sans text-on-background antialiased selection:bg-primary-fixed selection:text-[#001452]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
