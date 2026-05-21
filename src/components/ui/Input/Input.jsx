import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "../../../utils/cn";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      value = "",
      placeholder = "",
      error,
      success,
      loading = false,
      helperText,
      leftIcon,
      rightIcon,
      variant = "outlined",
      fullWidth = true,
      maxLength,
      className = "",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const variants = {
      outlined:
        "border-gray-300 bg-white focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]",
      filled:
        "bg-slate-100 border-transparent focus:ring-2 focus:ring-[#0b57cd]/20",
    };

    return (
      <div className={cn(fullWidth ? "w-full" : "w-auto")}>
        {/* LABEL ANIMÉ */}
        <AnimatePresence>
          {label && (
            <motion.label
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="block mb-1 text-sm font-medium text-slate-700"
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {/* WRAPPER */}
        <motion.div
          initial={false}
          animate={{
            scale: error ? 1 : 1,
          }}
          whileFocus={{ scale: 1.01 }}
          className="relative"
        >
          {/* LEFT ICON */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          {/* INPUT */}
          <motion.input
            ref={ref}
            value={value}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled || loading}
            maxLength={maxLength}
            whileFocus={{
              boxShadow: "0 0 0 4px rgba(11,87,205,0.15)",
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              `
              w-full
              rounded-lg
              px-3
              py-2
              text-sm
              outline-none
              transition
              border
              disabled:opacity-50
              disabled:cursor-not-allowed
              `,
              leftIcon && "pl-10",
              variants[variant],
              error && "border-red-500 focus:ring-red-200",
              success && "border-emerald-500 focus:ring-emerald-200",
              className,
            )}
            {...props}
          />

          {/* RIGHT ICONS */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* LOADING */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUCCESS */}
            <AnimatePresence>
              {success && !loading && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PASSWORD TOGGLE */}
            {isPassword && (
              <motion.button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                whileTap={{ scale: 0.9 }}
                className="text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}

            {rightIcon}
          </div>
        </motion.div>

        {/* HELPERS */}
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          {helperText && <span>{helperText}</span>}

          {maxLength && (
            <span>
              {String(value || "").length}/{maxLength}
            </span>
          )}
        </div>

        {/* ERROR TEXT ANIMÉ */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
