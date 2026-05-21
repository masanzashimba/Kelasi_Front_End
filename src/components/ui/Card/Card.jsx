import { forwardRef } from "react";
import { cn } from "../../../utils/cn";

const Card = forwardRef(
  (
    {
      children,
      title,
      subtitle,
      footer,

      hover = true,
      padding = "md",

      size = "md",
      height = "auto", // 👈 NEW

      className = "",

      ...props
    },
    ref,
  ) => {
    const paddings = {
      sm: "p-3",
      md: "p-5",
      lg: "p-6",
      none: "p-0",
    };

    // WIDTH SYSTEM
    const sizes = {
      sm: "w-64",
      md: "w-80",
      lg: "w-[28rem]",
      xl: "w-[32rem]",
      full: "w-full",
    };

    // HEIGHT SYSTEM 💡 BONUS (SENIOR TIP)
    const heights = {
      auto: "h-auto",
      sm: "h-40",
      md: "h-60",
      lg: "h-80",
      xl: "h-[32rem]",
      full: "h-full",
    };

    const baseStyles =
      "bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 overflow-hidden";

    const hoverStyles = hover ? "hover:shadow-md hover:-translate-y-1" : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          hoverStyles,

          paddings[padding],

          sizes[size],

          heights[height], // 👈 APPLY HEIGHT

          className,
        )}
        {...props}
      >
        {/* HEADER */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {/* CONTENT */}
        <div>{children}</div>

        {/* FOOTER */}
        {footer && (
          <div className="mt-5 pt-4 border-t border-slate-100">{footer}</div>
        )}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
