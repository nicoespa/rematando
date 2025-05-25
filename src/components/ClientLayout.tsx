"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/context/ToastContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ServiceWorkerRegister />
      <ToastProvider>
        <Navbar />
        <div className="min-h-screen">
          {children}
        </div>
        <Footer />
      </ToastProvider>
    </>
  );
} 