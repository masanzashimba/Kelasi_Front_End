// src/components/common/CountrySelect.jsx
// Sélecteur de pays / nationalité avec drapeau, réutilisant la même liste
// que PhoneInput. Émet au parent une chaîne texte :
//   - field="nat"  → la nationalité (ex. « Congolaise »)  [défaut]
//   - field="name" → le nom du pays (ex. « RD Congo »)

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Globe } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, Flag } from "./PhoneInput";

export default function CountrySelect({
  value = "",
  onChange,
  field = "nat",
  placeholder = "Sélectionner…",
  openUp = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  // Pays actuellement sélectionné, déduit de la valeur enregistrée.
  const selected =
    COUNTRIES.find(
      (c) => c[field]?.toLowerCase() === value?.trim().toLowerCase(),
    ) ?? null;

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  const pick = (c) => {
    onChange?.(c[field]);
    setOpen(false);
    setSearch("");
  };

  const filtered = COUNTRIES.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.nat.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.includes(q)
    );
  });

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-10 px-3 flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 transition-all"
      >
        {selected ? (
          <Flag code={selected.code} />
        ) : (
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
        )}
        <span
          className={`flex-1 text-left truncate ${selected ? "text-gray-900" : "text-gray-400"}`}
        >
          {selected ? selected[field] : value || placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 w-full min-w-[16rem] rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden ${
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                className="w-full h-8 pl-8 pr-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-[12px] text-gray-400 text-center">
                Aucun résultat
              </p>
            ) : (
              filtered.map((c) => {
                const active = selected?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => pick(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      active ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Flag code={c.code} />
                    <span
                      className={`flex-1 text-[13px] truncate ${active ? "font-semibold text-[#0c447c]" : "text-gray-700"}`}
                    >
                      {c[field]}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate max-w-[40%]">
                      {field === "nat" ? c.name : c.nat}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
