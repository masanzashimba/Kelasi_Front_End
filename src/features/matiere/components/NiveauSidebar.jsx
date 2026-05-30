// src/features/matiere/components/NiveauSidebar.jsx
import { useState } from "react";
import { BookOpen, ChevronRight, BookMarked, GraduationCap, Baby } from "lucide-react";

const GROUP_META = {
  MATERNELLE:   { label: "Maternelle",    color: "#D97706", Icon: Baby          },
  PRIMAIRE:     { label: "Primaire",      color: "#2563EB", Icon: BookMarked    },
  TRONC_COMMUN: { label: "Tronc Commun", color: "#0891B2", Icon: GraduationCap },
  HUMANITES:    { label: "Humanités",    color: "#7C3AED", Icon: GraduationCap },
};

const GROUP_ORDER = ["MATERNELLE", "PRIMAIRE", "TRONC_COMMUN", "HUMANITES"];

function groupNiveaux(niveaux) {
  const g = { MATERNELLE: [], PRIMAIRE: [], TRONC_COMMUN: [], HUMANITES: [] };
  niveaux.forEach((n) => {
    if (n.cycle === "MATERNELLE") {
      g.MATERNELLE.push(n);
    } else if (n.cycle === "PRIMAIRE") {
      g.PRIMAIRE.push(n);
    } else if (n.sousCycle === "TRONC_COMMUN") {
      g.TRONC_COMMUN.push(n);
    } else if (n.sousCycle === "HUMANITES") {
      g.HUMANITES.push(n);
    } else if (n.cycle === "SECONDAIRE") {
      g.TRONC_COMMUN.push(n); // fallback secondaire sans sous-cycle
    }
  });
  // Trier par ordre
  Object.keys(g).forEach((k) => g[k].sort((a, b) => a.ordre - b.ordre));
  return g;
}

// ─── Single niveau row ────────────────────────────────────────
const NiveauItem = ({ niveau, active, count, onSelect, color }) => (
  <button
    onClick={onSelect}
    className={`w-full flex items-start gap-2.5 pl-8 pr-3 py-2 transition-colors relative text-left group ${
      active ? "" : "hover:bg-gray-50"
    }`}
    style={active ? { background: `${color}08` } : {}}
  >
    {/* Barre active */}
    {active && (
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
        style={{ background: color }}
      />
    )}

    {/* Badge abréviation */}
    <span
      className="mt-0.5 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap"
      style={{
        background: active ? `${color}18` : "#F3F4F6",
        color:      active ? color : "#9CA3AF",
        minWidth:   "2rem",
        textAlign:  "center",
      }}
    >
      {niveau.abreviation || "—"}
    </span>

    {/* Libellé + compteur */}
    <div className="flex-1 min-w-0">
      <p
        className={`text-[12px] leading-snug truncate ${
          active ? "font-semibold" : "font-medium text-gray-500 group-hover:text-gray-700"
        }`}
        style={active ? { color } : {}}
      >
        {niveau.libelle}
      </p>
      <p
        className={`text-[10px] mt-0.5 font-mono ${active ? "" : "text-gray-400"}`}
        style={active ? { color: `${color}99` } : {}}
      >
        {count} cours
      </p>
    </div>
  </button>
);

// ─── Main sidebar ─────────────────────────────────────────────
const NiveauSidebar = ({
  niveaux,
  selectedNiveauId,
  onSelect,
  niveauMatiereCount,
  globalMode,
  onGlobalMode,
}) => {
  const groups = groupNiveaux(niveaux);

  const [openGroups, setOpenGroups] = useState({
    MATERNELLE:   true,
    PRIMAIRE:     true,
    TRONC_COMMUN: true,
    HUMANITES:    true,
  });

  const totalCount = niveaux.reduce(
    (a, n) => a + (niveauMatiereCount[n.id] ?? 0),
    0,
  );

  return (
    <div className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
      {/* ── Toutes les matières ── */}
      <button
        onClick={onGlobalMode}
        className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 transition-colors text-left ${
          globalMode
            ? "bg-[#2563EB]/5 text-[#2563EB]"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        <span className="text-[13px] font-semibold">Toutes les matières</span>
        <span
          className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
            globalMode
              ? "bg-[#2563EB]/10 text-[#2563EB]"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* ── Navigation par groupe ── */}
      <div className="flex-1 overflow-y-auto py-1">
        {GROUP_ORDER.map((groupKey) => {
          const meta    = GROUP_META[groupKey];
          const items   = groups[groupKey] ?? [];
          if (!items.length) return null;
          const isOpen  = openGroups[groupKey];

          return (
            <div key={groupKey}>
              {/* En-tête de groupe */}
              <button
                onClick={() =>
                  setOpenGroups((p) => ({ ...p, [groupKey]: !p[groupKey] }))
                }
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
                <meta.Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: meta.color }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
                <span
                  className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${meta.color}12`, color: meta.color }}
                >
                  {items.length}
                </span>
              </button>

              {/* Lignes niveau */}
              {isOpen &&
                items.map((n) => (
                  <NiveauItem
                    key={n.id}
                    niveau={n}
                    active={selectedNiveauId === n.id}
                    count={niveauMatiereCount[n.id] ?? 0}
                    onSelect={() => onSelect(n.id)}
                    color={meta.color}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NiveauSidebar;
