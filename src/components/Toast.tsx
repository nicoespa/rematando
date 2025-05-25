"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg border ${bgColors[type]} ${textColors[type]} shadow-lg animate-fade-in z-50`}
      role="alert"
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Cerrar mensaje"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
} 