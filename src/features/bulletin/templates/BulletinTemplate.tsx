import React from "react";
import BulletinMINEDUC, { ROWS_MOYEN, ROWS_TERMINAL } from "./BulletinMINEDUC";
import BulletinSecondaire from "./BulletinSecondaire";
import BulletinCTEB from "./BulletinCTEB";

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
    // 7ème année → Cycle Terminal de l'Education de Base (CTEB), maquette dédiée.
    if (is7emeCTEB(niveau)) {
      return <BulletinCTEB bulletin={bulletin} anneeScolaire={anneeScolaire} />;
    }
    return <BulletinSecondaire bulletin={bulletin} ecole={ecole} anneeScolaire={anneeScolaire} />;
  }

  // Fallback : cycle absent → format MINEDUC par défaut
  return <BulletinMINEDUC bulletin={bulletin} anneeScolaire={anneeScolaire} />;
};

export default BulletinTemplate;
