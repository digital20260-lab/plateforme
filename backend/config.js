// ============================================================
// CONFIGURATION DU COLLECTEUR — Emploi Concours CI
//
// ⚠ SÉCURITÉ : aucune clé en dur dans ce fichier.
//   Tous les secrets proviennent de variables d'environnement
//   chargées depuis .env (jamais commité — cf. .gitignore).
// ============================================================
import 'dotenv/config';

export const CONFIG = {
  // Fréquence : toutes les 6 heures (modifiable via la variable d'env COLLECT_CRON)
  // Pour 1 fois/jour à 6h du matin : '0 6 * * *'
  cron: process.env.COLLECT_CRON || '0 */6 * * *',

  // Timeout réseau par requête (ms)
  httpTimeout: 20000,

  // Nombre de tentatives par source avant de logger une erreur
  retries: 3,

  // User-Agent honnête
  userAgent: 'EmploiConcoursCI-Collector/1.0 (+https://emploi-concours.ci/bot)',

  // ---------------------------------------------------------
  // RESEND pour les emails candidats (lundi et jeudi)
  // Identifiants UNIQUEMENT via variables d'environnement.
  // ---------------------------------------------------------
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'Emploi Concours CI <alertes@emploi-concours.ci>'
  },

  // Planning d'envoi du digest email : lundi et jeudi à 8h.
  emailDigestCron: process.env.EMAIL_DIGEST_CRON || '0 8 * * 1,4',

  // Mettre à true pour ne PAS envoyer de vrais emails (tests)
  dryRunEmails: process.env.DRY_RUN_EMAILS !== 'false'
};

// ------------------------------------------------------------
// SOURCES OFFICIELLES DE CONCOURS
// La plupart partagent la plateforme *.ciconcours.com,
// le scraper générique sait les traiter de façon uniforme.
// ------------------------------------------------------------
export const CONCOURS_SOURCES = [
  { id: 'infas',    name: 'INFAS — Agents de Santé',              url: 'https://infas.ciconcours.com',          ministry: 'Santé' },
  { id: 'cafop',    name: 'CAFOP — Instituteurs',                 url: 'https://cafop.ciconcours.com',          ministry: 'Éducation Nationale' },
  { id: 'ens',      name: 'ENS Abidjan',                          url: 'https://ens.mesrs-ci.net',              ministry: 'Enseignement Supérieur' },
  { id: 'infj',     name: 'INFJ — Formation Judiciaire',          url: 'https://infj.ciconcours.com',           ministry: 'Justice' },
  { id: 'police',   name: 'Police Nationale (ENP)',               url: 'https://police.ciconcours.com',         ministry: 'Intérieur et Sécurité' },
  { id: 'defense',  name: 'Défense / Gendarmerie / AFA',          url: 'https://defense.ciconcours.net',        ministry: 'Défense' },
  { id: 'injs',     name: 'INJS — Jeunesse et Sport',             url: 'https://concours.injsabidjan.com',      ministry: 'Jeunesse et Sports' },
  { id: 'insfs',    name: 'INSFS — Formation Sociale',            url: 'https://insfs.ciconcours.com',          ministry: 'Affaires Sociales' },
  { id: 'ipnetp',   name: 'IPNETP — Enseignement Technique',      url: 'https://ipnetp.ciconcours.com',         ministry: 'Enseignement Technique' },
  { id: 'memfpma',  name: 'MEMFPMA / ENA — Fonction Publique',    url: 'https://gucaci.ciconcours.com',         ministry: 'Fonction Publique' }
];

// ------------------------------------------------------------
// SOURCES D'OFFRES D'EMPLOI PUBLIC
// ------------------------------------------------------------
export const EMPLOI_SOURCES = [
  { id: 'aej',   name: 'Agence Emploi Jeunes', url: 'https://www.agenceemploijeunes.ci/site/offres-emplois' },
  { id: 'fp',    name: 'Fonction Publique CI', url: 'https://www.fonctionpublique.gouv.ci' }
];

// ------------------------------------------------------------
// GOOGLE NEWS — flux RSS par mots-clés
// ------------------------------------------------------------
export const GOOGLE_NEWS_QUERIES = [
  'concours Côte d\u2019Ivoire 2026',
  'offre emploi public Côte d\u2019Ivoire',
  'recrutement Côte d\u2019Ivoire'
];

export const googleNewsRssUrl = (query) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=CI&ceid=CI:fr`;
