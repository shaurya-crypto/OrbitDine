"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: ConfirmOptions & { defaultValue?: string }) => Promise<string | null>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions & { defaultValue?: string; isPrompt?: boolean }>({ title: "", message: "" });
  const [promptValue, setPromptValue] = useState("");
  const resolver = useRef<((value: any) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions({ ...opts, isPrompt: false });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const promptDialog = useCallback((opts: ConfirmOptions & { defaultValue?: string }) => {
    setOptions({ ...opts, isPrompt: true });
    setPromptValue(opts.defaultValue || "");
    setIsOpen(true);
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleClose = (value: any) => {
    setIsOpen(false);
    if (resolver.current) {
      resolver.current(value);
      resolver.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt: promptDialog }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => handleClose(options.isPrompt ? null : false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-serif text-white mb-2">{options.title}</h2>
                <p className="text-zinc-400 text-sm mb-6">{options.message}</p>
                
                {options.isPrompt && (
                  <div className="mb-6">
                    <input
                      autoFocus
                      type="text"
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleClose(promptValue);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                  <button
                    onClick={() => handleClose(options.isPrompt ? null : false)}
                    className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    {options.cancelText || "Cancel"}
                  </button>
                  <button
                    onClick={() => handleClose(options.isPrompt ? promptValue : true)}
                    className={`px-4 py-2 rounded-xl font-medium text-white transition-colors ${
                      options.isDanger ? "bg-red-500 hover:bg-red-600" : "bg-accent hover:bg-accent/90"
                    }`}
                  >
                    {options.confirmText || "Confirm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
