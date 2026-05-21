import { forwardRef, useState } from "react";

import { Loader2, Check } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { cn } from "../../../utils/cn";

const MotionButton = motion.create("button");

const Button = forwardRef(
  (
    {
      children,

      variant = "primary",
      size = "md",

      loading = false,
      success = false,
      error = false,

      disabled = false,

      leftIcon,
      rightIcon,

      rounded = false,
      fullWidth = true,

      ripple = true,
      floating = true,

      className = "",
      type = "button",

      onClick,

      ...props
    },
    ref,
  ) => {
    const [ripples, setRipples] = useState([]);

    const isDisabled = disabled || loading;

    const createRipple = (e) => {
      if (!ripple) return;

      const rect = e.currentTarget.getBoundingClientRect();

      const size = Math.max(rect.width, rect.height);

      const rippleData = {
        id: Date.now(),

        x: e.clientX - rect.left - size / 2,

        y: e.clientY - rect.top - size / 2,

        size,
      };

      setRipples((prev) => [...prev, rippleData]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleData.id));
      }, 600);
    };

    const handleClick = (e) => {
      createRipple(e);

      onClick?.(e);
    };

    const baseStyles =
      "relative overflow-hidden inline-flex items-center justify-center gap-2 border font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#0b57cd] text-white border-transparent hover:bg-[#0947ab] focus:ring-[#0b57cd]",

      secondary: "bg-white text-slate-700 border-slate-200 hover:bg-slate-100",

      outline:
        "border-[#0b57cd] text-[#0b57cd] bg-transparent hover:bg-blue-50",

      success: "bg-emerald-600 text-white",

      danger: "bg-red-600 text-white",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",

      md: "px-4 py-3 text-sm",

      lg: "px-6 py-4 text-base",

      icon: "h-11 w-11 p-0",
    };

    return (
      <MotionButton
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={handleClick}
        whileHover={
          floating && !isDisabled
            ? {
                y: -2,
                scale: 1.02,
              }
            : {}
        }
        whileTap={{
          scale: 0.97,
        }}
        animate={
          error
            ? {
                x: [0, -5, 5, -5, 0],
              }
            : {}
        }
        transition={{
          duration: 0.2,
        }}
        className={cn(
          baseStyles,
          variants[success ? "success" : variant],

          sizes[size],

          rounded ? "rounded-full" : "rounded-lg",

          fullWidth ? "w-full" : "w-auto",

          className,
        )}
        {...props}
      >
        {/* RIPPLE */}

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{
                scale: 0,
                opacity: 0.5,
              }}
              animate={{
                scale: 4,
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="
                  absolute
                  rounded-full
                  bg-white/40
                "
              style={{
                left: ripple.x,

                top: ripple.y,

                width: ripple.size,

                height: ripple.size,
              }}
            />
          ))}
        </AnimatePresence>

        {/* ICON */}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat: Infinity,

                duration: 1,

                ease: "linear",
              }}
            >
              <Loader2 className="w-4 h-4" />
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{
                scale: 0,
              }}
              animate={{
                scale: 1,
              }}
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            leftIcon
          )}
        </AnimatePresence>

        {/* TEXT */}

        <motion.span layout>{success ? "Succès" : children}</motion.span>

        {!loading && !success && rightIcon}
      </MotionButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
