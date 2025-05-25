import { Suspense } from 'react';
import AuctionsList from './AuctionsList';

export default function AuctionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <p className="text-gray-500 text-lg">Cargando subastas...</p>
    </div>}>
      <AuctionsList />
    </Suspense>
  );
} 