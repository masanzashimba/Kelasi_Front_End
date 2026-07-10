import React from "react";
import BulletinMINEDUC, { ROWS_MOYEN, ROWS_TERMINAL } from "./BulletinMINEDUC";
import BulletinSecondaire from "./BulletinSecondaire";
import BulletinCTEB, { ROWS_CTEB8 } from "./BulletinCTEB";
import BulletinHumanites from "./BulletinHumanites";

interface BulletinTemplateProps {
  bulletin: any;
  ecole: any;
  anneeScolaire: any;
}

// Numéro d'année primaire (1→6) extrait de l'abréviation ("3P") ou du libellé.
function anneePrimaire(niveau: any): number | null {
  const abrev = String(niveau?.abreviation ?? "").toUpperCase();
  const mAbrev = abrev.match(/^([1-6])\s*P$/);
  if (mAbrev) return Number(mAbrev[1]);
  const lib = String(niveau?.libelle ?? "").toLowerCase();
  if (!lib.includes("primaire")) return null;
  const mLib = lib.match(/([1-6])\s*(?:ère|ere|ème|eme|e)?/);
  return mLib ? Number(mLib[1]) : null;
}

// Détecte la 7ème année (CTEB) via l'abréviation ("7" / "7C") ou le libellé.
function is7emeCTEB(niveau: any): boolean {
  const abrev = String(niveau?.abreviation ?? "").toUpperCase();
  if (/^7/.test(abrev)) return true;
  const lib = String(niveau?.libelle ?? "").toLowerCase();
  return /\b7\s*(?:ème|eme|e)?\b/.test(lib);
}

// Détecte la 8ème année (CTEB) via l'abréviation ("8" / "8C") ou le libellé.
function is8emeCTEB(niveau: any): boolean {
  const abrev = String(niveau?.abreviation ?? "").toUpperCase();
  if (/^8/.test(abrev)) return true;
  const lib = String(niveau?.libelle ?? "").toLowerCase();
  return /\b8\s*(?:ème|eme|e)?\b/.test(lib);
}

// Numéro d'année Humanités (1→4) extrait de l'abréviation ou du libellé.
function anneeHumanites(niveau: any): number | null {
  const abrev = String(niveau?.abreviation ?? "").toUpperCase();
  const mAbrev = abrev.match(/^([1-4])/);
  if (mAbrev) return Number(mAbrev[1]);
  const lib = String(niveau?.libelle ?? "").toLowerCase();
  const mLib = lib.match(/([1-4])\s*(?:ère|ere|ème|eme|e)?/);
  return mLib ? Number(mLib[1]) : null;
}

// Détecte l'option « Électricité » (champ option / section / libellé).
function isElectricite(niveau: any): boolean {
  const opt = `${niveau?.option ?? ""} ${niveau?.section ?? ""} ${niveau?.libelle ?? ""}`.toLowerCase();
  return /[ée]lectr/.test(opt);
}

// Détecte une 1ère année Humanités, à la manière du 8ème (par abréviation "1H"
// ou par sousCycle/libellé). Les options ne sont pas encore renseignées en base ;
// l'unique 1ère Humanités correspond au tronc technique Électricité.
function is1ereHumanites(niveau: any): boolean {
  const abrev = String(niveau?.abreviation ?? "").toUpperCase().replace(/\s/g, "");
  if (/^1\s*H/.test(abrev)) return true;
  const isHum =
    String(niveau?.sousCycle ?? "").toUpperCase() === "HUMANITES" ||
    String(niveau?.libelle ?? "").toLowerCase().includes("humanit");
  return isHum && anneeHumanites(niveau) === 1;
}

const TITRE_MOYEN = (
  <>
    BULLETIN DE L'ELEVE DEGRE MOYEN (3<sup>e</sup>, 4<sup>e</sup> ANNEE)
    <sup>(1)</sup>
  </>
);

const TITRE_TERMINAL_5 = (
  <>
    BULLETIN DE L'ELEVE DEGRE TERMINAL (5<sup>e</sup> ANNEE)
    <sup>(1)</sup>
  </>
);

const TITRE_TERMINAL_6 = (
  <>
    BULLETIN DE L'ELEVE DEGRE TERMINAL (6<sup>e</sup> ANNEE)
    <sup>(1)</sup>
  </>
);

const BulletinTemplate: React.FC<BulletinTemplateProps> = ({ bulletin, ecole, anneeScolaire }) => {
  const niveau = bulletin?.inscription?.classe?.niveau;
  const cycle = niveau?.cycle as string | undefined;

  if (cycle === "PRIMAIRE" || cycle === "MATERNELLE") {
    const annee = anneePrimaire(niveau);

    // 5ème & 6ème primaire → degré terminal (mêmes branches/maxima)
    // La 6ème (année du CEPE) ajoute le bloc RESULTAT FINAL / ENAFEP.
    if (annee === 5 || annee === 6) {
      return (
        <BulletinMINEDUC
          bulletin={bulletin}
          anneeScolaire={anneeScolaire}
          rows={ROWS_TERMINAL}
          titreDegre={annee === 6 ? TITRE_TERMINAL_6 : TITRE_TERMINAL_5}
          resultatFinal={annee === 6}
        />
      );
    }
    // 3ème / 4ème primaire → degré moyen (branches & maxima différents)
    if (annee === 3 || annee === 4) {
      return (
        <BulletinMINEDUC
          bulletin={bulletin}
          anneeScolaire={anneeScolaire}
          rows={ROWS_MOYEN}
          titreDegre={TITRE_MOYEN}
        />
      );
    }
    // 1ère / 2ème primaire (et maternelle) → degré élémentaire (défaut)
    return <BulletinMINEDUC bulletin={bulletin} anneeScolaire={anneeScolaire} />;
  }

  if (cycle === "SECONDAIRE") {
    // 1ère année Humanités (Électricité) → maquette dédiée, détectée comme le
    // 8ème (par abréviation "1H" / sousCycle), ou via l'option si renseignée.
    if (isElectricite(niveau) || is1ereHumanites(niveau)) {
      return (
        <BulletinHumanites
          bulletin={bulletin}
          anneeScolaire={anneeScolaire}
          anneeNumero={anneeHumanites(niveau) ?? 1}
          option={niveau?.option ?? "Electricité Générale"}
        />
      );
    }
    // 7ème année → Cycle Terminal de l'Education de Base (CTEB), maquette dédiée.
    if (is7emeCTEB(niveau)) {
      return <BulletinCTEB bulletin={bulletin} anneeScolaire={anneeScolaire} />;
    }
    // 8ème année → CTEB (réf. IGE/P.S./008) : branches & maxima distincts,
    // + bloc RESULTAT FINAL / TENASOSP (examen de fin de cycle terminal).
    if (is8emeCTEB(niveau)) {
      return (
        <BulletinCTEB
          bulletin={bulletin}
          anneeScolaire={anneeScolaire}
          rows={ROWS_CTEB8}
          anneeNumero={8}
          reference="008"
          maxSemestre={1680}
          maxGeneral={3360}
          resultatFinal
        />
      );
    }
    return <BulletinSecondaire bulletin={bulletin} ecole={ecole} anneeScolaire={anneeScolaire} />;
  }

  // Fallback : cycle absent → format MINEDUC par défaut
  return <BulletinMINEDUC bulletin={bulletin} anneeScolaire={anneeScolaire} />;
};

export default BulletinTemplate;
