// src/components/common/DocumentUpload.jsx
// Upload d'un document (PDF ou image) vers /upload/document. Réutilisable.
// Émet l'URL Cloudinary au parent via onUploaded(url).

import { useRef, useState } from "react";
import {
  FileText,
  Loader2,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { getAccessToken } from "../../lib/tokenStorage";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3300/api/v1";

export default function DocumentUpload({ label, value, onUploaded }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.match(/(application\/pdf|image\/(jpeg|jpg|png|webp))/)) {
      setError("Formats : PDF, JPG, PNG, WEBP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Fichier trop lourd (max 10 Mo)");
      return;
    }
    setError("");
    setFileName(file.name);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      const res = await fetch(`${API_BASE}/upload/document`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      onUploaded(data.url);
    } catch (err) {
      setError(`Échec : ${err?.message ?? "Erreur inconnue"}`);
      setFileName("");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onUploaded("");
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasFile = Boolean(value);

  return (
    <div>
      <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">
        {label}
      </label>

      {hasFile ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="flex-1 text-[12px] text-emerald-700 font-medium truncate">
            {fileName || "Document ajouté"}
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
            title="Voir le document"
          >
            <Eye className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Retirer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !loading && inputRef.current?.click()}
          disabled={loading}
          className="w-full h-10 px-3 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-[#0b57cd]/50 hover:text-[#0b57cd] transition-colors disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[12px]">Envoi en cours…</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span className="text-[12px] font-medium">
                Choisir un fichier (PDF, image)
              </span>
              <FileText className="w-3.5 h-3.5 ml-auto opacity-40" />
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
