import React from "react";
import BulletinMINEDUC from "./BulletinMINEDUC";
import BulletinSecondaire from "./BulletinSecondaire";

interface BulletinTemplateProps {
  bulletin: any;
  ecole: any;
  anneeScolaire: any;
}

const BulletinTemplate: React.FC<BulletinTemplateProps> = ({ bulletin, ecole, anneeScolaire }) => {
  const cycle = bulletin?.inscription?.classe?.niveau?.cycle as string | undefined;

  if (cycle === "PRIMAIRE" || cycle === "MATERNELLE") {
    return <BulletinMINEDUC bulletin={bulletin} anneeScolaire={anneeScolaire} />;
  }

  if (cycle === "SECONDAIRE") {
    return <BulletinSecondaire bulletin={bulletin} ecole={ecole} anneeScolaire={anneeScolaire} />;
  }

  // Fallback : cycle absent → format MINEDUC par défaut
  return <BulletinMINEDUC bulletin={bulletin} anneeScolaire={anneeScolaire} />;
};

export default BulletinTemplate;
