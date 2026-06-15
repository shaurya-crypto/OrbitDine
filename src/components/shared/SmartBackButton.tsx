"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SmartBackButtonProps {
  fallbackRoute: string;
  label?: string;
  className?: string;
}

export function SmartBackButton({ 
  fallbackRoute, 
  label, 
  className = "inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-6 group" 
}: SmartBackButtonProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if there is history to go back to
    setCanGoBack(window.history.length > 2); // >2 is safer for Next.js internal history stack
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  };

  return (
    <button onClick={handleBack} className={className} title="Go Back">
      <ArrowLeft className={`transition-transform group-hover:-translate-x-1 ${label ? 'w-4 h-4 mr-2' : 'w-5 h-5'}`} />
      {label && <span>{label}</span>}
    </button>
  );
}
