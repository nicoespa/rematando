"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('Service Worker registration successful');
          },
          function(err) {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);
  return null;
} 