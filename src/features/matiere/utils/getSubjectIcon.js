// src/features/matiere/utils/getSubjectIcon.js
import {
  BookOpen,
  Calculator,
  PenLine,
  Languages,
  Atom,
  FlaskConical,
  Leaf,
  Landmark,
  Globe,
  Dumbbell,
  Palette,
  Music,
  Monitor,
  Brain,
  BarChart2,
  Cpu,
} from "lucide-react";

export function getSubjectIcon(nom = "") {
  const n = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (n.includes("math")) return Calculator;
  if (
    n.includes("franc") ||
    n.includes("litter") ||
    n.includes("expression ecrite")
  )
    return PenLine;
  if (
    n.includes("angl") ||
    n.includes("english") ||
    (n.includes("langue") && !n.includes("franc"))
  )
    return Languages;
  if (n.includes("physiq") && !n.includes("sport") && !n.includes("eps"))
    return Atom;
  if (n.includes("chimi")) return FlaskConical;
  if (n.includes("bio") || n.includes("svt") || n.includes("eveil"))
    return Leaf;
  if (n.includes("scien")) return FlaskConical;
  if (n.includes("hist")) return Landmark;
  if (n.includes("geog")) return Globe;
  if (
    n.includes("eps") ||
    n.includes("sport") ||
    n.includes("motric") ||
    n.includes("physique et sportive")
  )
    return Dumbbell;
  if (
    n.includes("art") ||
    n.includes("plastic") ||
    n.includes("dessin") ||
    n.includes("coloriage")
  )
    return Palette;
  if (n.includes("music") || n.includes("musiq") || n.includes("musical"))
    return Music;
  if (n.includes("inform") || n.includes("digit") || n.includes("ntic"))
    return Monitor;
  if (n.includes("philo")) return Brain;
  if (n.includes("econ") || n.includes("gestion") || n.includes("compta"))
    return BarChart2;
  if (n.includes("tech") || n.includes("mecani") || n.includes("travaux"))
    return Cpu;
  return BookOpen;
}
