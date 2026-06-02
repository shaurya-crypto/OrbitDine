"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PerformanceContextType {
  isLowEndMode: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowEndMode: false,
});

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLowEndMode, setIsLowEndMode] = useState(false);

  useEffect(() => {
    // Detect low-end mode on mount
    const isLowEnd =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2);

    setIsLowEndMode(!!isLowEnd);

    if (isLowEnd) {
      document.documentElement.classList.add("low-end-mode");
    } else {
      document.documentElement.classList.remove("low-end-mode");
    }
  }, []);

  return (
    <PerformanceContext.Provider value={{ isLowEndMode }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export const usePerformance = () => useContext(PerformanceContext);
