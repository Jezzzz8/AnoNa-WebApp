// components/LoadingSpinner.jsx
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#F5FEF7]">
      <Loader2 className="animate-spin text-[#52B788]" size={40} />
      <p className="mt-4 text-sm text-[#84A98C]">{text}</p>
    </div>
  );
}