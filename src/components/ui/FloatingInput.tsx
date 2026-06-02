"use client";

import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, type = "text", className = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Check if input has value to keep label floated
    // Fallback if uncontrolled input relies purely on CSS :placeholder-shown
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`relative flex flex-col w-full ${className}`}>
        <div className="relative z-[var(--z-content)]">
          <input
            ref={ref}
            type={inputType}
            placeholder=" "
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              peer w-full bg-surface border rounded-xl px-4 pt-6 pb-2 text-text-primary text-base
              outline-none transition-all duration-300 shadow-sm
              ${error ? "border-red-500/50 focus:border-red-500" : success ? "border-accent/50 focus:border-accent" : "border-border focus:border-accent"}
            `}
            {...props}
          />
          
          {/* Floating Label */}
          <label 
            className={`
              absolute left-4 transition-all duration-300 pointer-events-none select-none
              peer-placeholder-shown:top-4 peer-placeholder-shown:text-text-secondary peer-placeholder-shown:text-base
              peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-accent
              top-1.5 text-xs text-text-secondary
              ${error ? "peer-focus:text-red-500" : ""}
            `}
          >
            {label}
          </label>

          {/* Background Glow on Focus */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-xl bg-accent-soft blur-md -z-10 pointer-events-none"
              />
            )}
            {isFocused && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-xl bg-red-500/10 blur-md -z-10 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Action Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">
                <AlertCircle className="w-5 h-5" />
              </motion.div>
            )}
            {success && !error && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent">
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            )}
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="text-red-500 text-sm mt-1 ml-1 overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";
