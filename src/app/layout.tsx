import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "فيكسورا — إصلاح موبايلك في بيتك",
    template: "%s · فيكسورا",
  },
  description:
    "إصلاح الموبايل في المنزل بفنيين معتمدين وقطع أصلية وضمان 90 يوم. بالإضافة إلى اكسسوارات وشواحن وقطع غيار موبايلات عالية الجودة بتوصيل سريع.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0E8C89",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}