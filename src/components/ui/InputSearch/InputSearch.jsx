import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { cn } from "../../../utils/cn";

const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};

const SearchInput = forwardRef(
  (
    {
      value = "",
      onChange,
      onSelect,
      fetchSuggestions,
      placeholder = "Rechercher...",
      label,
      variant = "outlined",
      fullWidth = true,
      disabled = false,
      className = "",
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    const wrapperRef = useRef(null);

    const debouncedValue = useDebounce(value, 300);

    const variants = {
      outlined:
        "border-gray-300 bg-white focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]",
      filled:
        "bg-slate-100 border-transparent focus:ring-2 focus:ring-[#0b57cd]/20",
    };

    // FETCH SUGGESTIONS
    useEffect(() => {
      const load = async () => {
        if (!debouncedValue) {
          setSuggestions([]);
          return;
        }

        setLoading(true);

        try {
          const res = await fetchSuggestions?.(debouncedValue);
          setSuggestions(res || []);
          setOpen(true);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [debouncedValue, fetchSuggestions]);

    // CLICK OUTSIDE
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (!wrapperRef.current?.contains(e.target)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // KEYBOARD NAV
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
      }

      if (e.key === "Enter" && activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
    };

    const handleSelect = (item) => {
      onSelect?.(item);
      setOpen(false);
      setActiveIndex(-1);
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
        <div ref={wrapperRef} className="relative">
          <motion.div
            initial={false}
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            {/* INPUT */}
            <motion.input
              ref={ref}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              whileFocus={{
                boxShadow: "0 0 0 4px rgba(11,87,205,0.15)",
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full rounded-lg px-3 pr-10 py-2 text-sm outline-none transition border disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className,
              )}
            />

            {/* RIGHT ICONS */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {/* LOADING ICON */}
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

              {/* SEARCH ICON */}
              {!loading && (
                <div className="text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              )}
            </div>
          </motion.div>

          {/* DROPDOWN */}
          <AnimatePresence>
            {open && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
              >
                {suggestions.map((item, index) => (
                  <motion.li
                    key={index}
                    onClick={() => handleSelect(item)}
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    className={cn(
                      "px-4 py-2 text-sm cursor-pointer transition-colors",
                      activeIndex === index && "bg-slate-100",
                    )}
                  >
                    {item.label || item}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
