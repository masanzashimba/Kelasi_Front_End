// src/components/common/PhoneInput.jsx
// Champ téléphone international : sélecteur de pays avec drapeau + indicatif.
// Sans dépendance externe. Drapeaux servis par flagcdn (rendu fiable sur tous
// les OS, contrairement aux emojis-drapeaux invisibles sous Windows).
//
// Valeur émise au parent : chaîne « +243 812345678 » (ou "" si numéro vide).

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Phone } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY } from "./countries";

// Ré-export pour les composants qui importaient depuis PhoneInput.
export { COUNTRIES, DEFAULT_COUNTRY };

// Indicatifs triés du plus long au plus court pour un matching fiable.
const DIALS_BY_LENGTH = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

export const Flag = ({ code, className = "" }) => (
  <img
    src={`https://flagcdn.com/w40/${code}.png`}
    srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
    alt=""
    loading="lazy"
    className={`w-5 h-[15px] rounded-sm object-cover shrink-0 ${className}`}
  />
);

// Retrouve le pays correspondant au préfixe d'une valeur enregistrée.
function findCountry(value) {
  if (!value) return null;
  const v = value.replace(/\s+/g, "");
  return DIALS_BY_LENGTH.find((c) => v.startsWith(c.dial)) ?? null;
}

// Retire l'indicatif pour n'obtenir que le numéro local.
function stripDial(value, country) {
  if (!value) return "";
  const trimmed = value.trimStart();
  if (country && trimmed.replace(/\s+/g, "").startsWith(country.dial)) {
    // On retire l'indicatif du début (avec ou sans espace).
    const idx = trimmed.indexOf(country.dial);
    return trimmed.slice(idx + country.dial.length).trim();
  }
  return value.trim();
}

export default function PhoneInput({
  value = "",
  onChange,
  placeholder = "81 234 5678",
  inputClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState(
    () => findCountry(value) ?? DEFAULT_COUNTRY,
  );
  const [number, setNumber] = useState(() =>
    stripDial(value, findCountry(value) ?? DEFAULT_COUNTRY),
  );

  const lastEmitted = useRef(value ?? "");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  // Resync si la valeur change de l'extérieur (mode édition).
  useEffect(() => {
    if ((value ?? "") === lastEmitted.current) return;
    const c = findCountry(value) ?? DEFAULT_COUNTRY;
    setCountry(c);
    setNumber(stripDial(value, c));
    lastEmitted.current = value ?? "";
  }, [value]);

  // Fermeture au clic extérieur.
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

  const emit = (c, n) => {
    const clean = n.trim();
    const full = clean ? `${c.dial} ${clean}` : "";
    lastEmitted.current = full;
    onChange?.(full);
  };

  const selectCountry = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch("");
    emit(c, number);
  };

  const handleNumber = (e) => {
    // On garde chiffres, espaces et quelques séparateurs courants.
    const n = e.target.value.replace(/[^\d\s().+-]/g, "");
    setNumber(n);
    emit(country, n);
  };

  const filtered = COUNTRIES.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.includes(q)
    );
  });

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-stretch gap-2">
        {/* Sélecteur pays */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-10 shrink-0 flex items-center gap-1.5 px-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
        >
          <Flag code={country.code} />
          <span className="text-[13px] font-semibold text-gray-700">
            {country.dial}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Numéro */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="tel"
            inputMode="tel"
            className={`w-full h-10 pl-9 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20 focus:border-[#0b57cd]/50 focus:bg-white transition-all ${inputClassName}`}
            placeholder={placeholder}
            value={number}
            onChange={handleNumber}
          />
        </div>
      </div>

      {/* Dropdown pays (ouvre vers le haut car le champ est bas dans le form) */}
      {open && (
        <div className="absolute z-50 bottom-full mb-1.5 left-0 w-72 max-w-[calc(100vw-3rem)] rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                className="w-full h-8 pl-8 pr-2 rounded-lg bg-gray-50 border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0b57cd]/20"
                placeholder="Rechercher un pays…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-[12px] text-gray-400 text-center">
                Aucun pays trouvé
              </p>
            ) : (
              filtered.map((c) => {
                const active = c.code === country.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      active ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Flag code={c.code} />
                    <span
                      className={`flex-1 text-[13px] truncate ${active ? "font-semibold text-[#0c447c]" : "text-gray-700"}`}
                    >
                      {c.name}
                    </span>
                    <span className="text-[12px] text-gray-400 font-medium">
                      {c.dial}
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
