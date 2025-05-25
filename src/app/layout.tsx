import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RematesAR - Subastas Online en Argentina",
  description: "La mejor plataforma de subastas online en Argentina. Compra y vende casas, autos, caballos y más.",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RematesAR",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ServiceWorkerRegister />
        <ToastProvider>
          <Navbar />
          <div className="min-h-screen">
            {children}
          </div>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
