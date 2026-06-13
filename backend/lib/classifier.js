// ============================================================
// Classification automatique : 'concours' ou 'emploi'
// Basée sur des mots-clés pondérés + l'origine de la source.
// ============================================================

const CONCOURS_KEYWORDS = [
  // Fort signal
  { re: /\bconcours\b/i, w: 5 },
  { re: /admissibilit[ée]/i, w: 4 },
  { re: /\b(épreuves?|composition)\b/i, w: 3 },
  { re: /convocation/i, w: 2 },
  { re: /pr[ée]inscription/i, w: 3 },
  { re: /visite m[ée]dicale/i, w: 2 },
  // Institutions de concours
  { re: /\b(infas|cafop|ens\b|infj|ena\b|injs|insfs|ipnetp|gucaci)\b/i, w: 5 },
  { re: /fonction publique/i, w: 3 },
  { re: /gendarmerie|police nationale|militaire/i, w: 3 },
  { re: /instituteurs?|magistrature/i, w: 3 }
];

const EMPLOI_KEYWORDS = [
  { re: /\brecrute\b/i, w: 4 },
  { re: /offres? d['\u2019]emploi/i, w: 5 },
  { re: /\b(cdi|cdd|stage|int[ée]rim|alternance)\b/i, w: 4 },
  { re: /candidature.*(cv|lettre)/i, w: 3 },
  { re: /poste (de|d['\u2019])/i, w: 2 },
  { re: /\bh\/f\b/i, w: 3 },
  { re: /salaire|r[ée]mun[ée]ration/i, w: 2 },
  { re: /profil recherch[ée]/i, w: 3 }
];

/**
 * Détermine le type d'une annonce.
 * @param {string} text titre + extrait concaténés
 * @param {string} [sourceKind] 'concours' | 'emploi' si la source est typée
 * @returns {'concours' | 'emploi'}
 */
export function classify(text, sourceKind) {
  // Une source officiellement typée impose son type
  if (sourceKind === 'concours' || sourceKind === 'emploi') return sourceKind;

  let scoreConcours = 0;
  let scoreEmploi = 0;

  for (const { re, w } of CONCOURS_KEYWORDS) if (re.test(text)) scoreConcours += w;
  for (const { re, w } of EMPLOI_KEYWORDS) if (re.test(text)) scoreEmploi += w;

  // Égalité ou aucun signal → 'concours' par prudence si "concours" présent, sinon 'emploi'
  if (scoreConcours === scoreEmploi) {
    return /concours/i.test(text) ? 'concours' : 'emploi';
  }
  return scoreConcours > scoreEmploi ? 'concours' : 'emploi';
}

/**
 * Tente d'extraire un secteur normalisé du texte (pour le matching profil).
 */
const SECTOR_PATTERNS = [
  { re: /sant[ée]|infirmier|m[ée]dec|pharma|infas/i, sector: 'Santé' },
  { re: /enseign|[ée]ducation|cafop|instituteur|professeur|ipnetp/i, sector: 'Éducation Nationale' },
  { re: /justice|magistrat|greffe|p[ée]nitentiaire|infj/i, sector: 'Justice' },
  { re: /police|gendarmerie|militaire|d[ée]fense|s[ée]curit[ée]/i, sector: 'Défense et sécurité' },
  { re: /banque|finance|comptab|tr[ée]sor/i, sector: 'Banque et assurance' },
  { re: /informatique|digital|num[ée]rique|d[ée]veloppeur/i, sector: 'NTIC et systèmes d\u2019information' },
  { re: /btp|construction|g[ée]nie civil|chantier/i, sector: 'BTP et construction' },
  { re: /agricult|agro|cacao|caf[ée]|h[ée]v[ée]a/i, sector: 'Agriculture' },
  { re: /transport|logistique|transit/i, sector: 'Transport et logistique' },
  { re: /jeunesse|sport|injs/i, sector: 'Jeunesse et Sports' },
  { re: /social|insfs/i, sector: 'Affaires Sociales' },
  { re: /fonction publique|administratif|ena\b/i, sector: 'Fonction Publique' }
];

export function extractSector(text) {
  for (const { re, sector } of SECTOR_PATTERNS) {
    if (re.test(text)) return sector;
  }
  return 'Autre';
}
