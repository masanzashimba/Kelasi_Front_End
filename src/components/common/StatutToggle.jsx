// src/components/common/StatutToggle.jsx
// Toggle actif/inactif — même design que la liste des élèves.

export default function StatutToggle({
  actif,
  onToggle,
  titleOn = "Désactiver",
  titleOff = "Activer",
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={disabled}
      title={actif ? titleOn : titleOff}
      aria-label={actif ? titleOn : titleOff}
      className={`relative inline-flex h-4 w-11 items-center rounded-full transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        actif ? "bg-[#0b57cd]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-3 w-4 transform rounded-full bg-white shadow transition-transform ${
          actif ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
