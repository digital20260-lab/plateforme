import type { Listing } from './data';

// ============================================================
// BASE D OFFRES D EMPLOI - Collecte interne (10 juin 2026)
// ----------------------------------------------------------
// Politique éditoriale :
//   • Seul le nom de l ENTREPRISE qui recrute est affiché.
//     Les noms de plateformes ou cabinets de recrutement
//     intermédiaires ne sont jamais exposés à l utilisateur.
//   • Toutes les offres listées ici se candidatent PAR EMAIL.
//     Les offres sans email officiel publié ne sont pas
//     intégrées dans la base.
//   • Salaire : non affiché (information rarement publiée
//     et incertaine, retirée pour ne pas induire en erreur).
//   • Date de publication : moins de 30 jours.
// ============================================================

type WorkMode = 'Sur site' | 'Télétravail' | 'Hybride';

interface JobInput {
  id: string;
  title: string;
  company: string;
  location: string;
  level: string;
  contractType: string;
  experience: string;
  workMode?: WorkMode;
  publishedAt: string;
  deadline: string;
  status?: 'Ouvert' | 'Fermé' | 'Bientôt' | 'En cours';
  source: string;
  sector: string;
  description: string;
  missions: string[];
  profile: string[];
  docs?: string[];
  /** @deprecated Le salaire n'est plus affiché. */
  salary?: string;
  applicationEmail: string;
  applicationPhone?: string;
  apply?: string[];
}

const buildJob = (j: JobInput): Listing => ({
  id: j.id,
  title: j.title,
  ministry: j.sector,
  type: 'emploi',
  level: j.level,
  deadline: j.deadline,
  status: j.status || 'Ouvert',
  description: j.description,
  sourceUrl: j.source,
  company: j.company,
  location: j.location,
  contractType: j.contractType,
  experience: j.experience,
  workMode: j.workMode || 'Sur site',
  sector: j.sector,
  publishedAt: j.publishedAt,
  applicationEmail: j.applicationEmail,
  applicationPhone: j.applicationPhone,
  refreshFrequency: 'Toutes les 6 heures',
  details: [
    { title: 'Missions principales', content: j.missions },
    { title: 'Profil recherché', content: j.profile },
    { title: 'Dossier de candidature', content: j.docs || ['CV actualisé', 'Lettre de motivation'] },
    ...(j.apply ? [{ title: 'Comment postuler', content: j.apply }] : [])
  ]
});

export const mockJobs: Listing[] = [
  // ============================================================
  // Banque / Microfinance — candidatures par email
  // ============================================================
  buildJob({
    id: 'e1',
    title: "Chargé(e) des Applications (H/F)",
    company: "Coris Bank International Côte d'Ivoire",
    location: "Abidjan",
    sector: "Banque et assurance",
    level: "BAC+4/5 Informatique / MIAGE",
    contractType: "CDI",
    experience: "2 ans en banque ou institution financière",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-06-19",
    source: "interne",
    description: "Coris Bank International Côte d'Ivoire recrute un(e) Chargé(e) des Applications pour assurer l'administration des applications et participer à la sécurité du SI.",
    missions: [
      "Assurer l'intégration, le paramétrage et l'administration des applications",
      "Assurer le support aux utilisateurs et la production des états BI / SQL",
      "Support applicatif Core Banking, monétique, eBanking",
      "Suivre et traiter les incidents et anomalies",
      "Développement applicatif (Java J2EE, WEB/Mobile, API Rest, Batch & Shell)",
      "Administration des bases de données des applications satellites"
    ],
    profile: [
      "BAC+4/5 Informatique, Technologie, MIAGE ou équivalent",
      "2 ans en banque ou institution financière",
      "Maîtrise Java J2EE, WEB/Mobile, API Rest, Batch & Shell",
      "Bases de données Oracle, SQL Server, MySQL",
      "Bonnes pratiques ITIL, Sécurité SI, Windows Server / Unix / Linux"
    ],
    applicationEmail: "recrutements-cbici@coris-bank.com",
    apply: [
      "Envoyer le CV actualisé à recrutements-cbici@coris-bank.com",
      "Objet du mail : « CANDIDATURE AU POSTE DE CHARGE DES APPLICATIONS »",
      "Au plus tard le 19 juin 2026"
    ]
  }),
  buildJob({
    id: 'e2',
    title: "Responsable LBC (Lutte contre le Blanchiment de Capitaux)",
    company: "Atlantique Microfinance for Africa (AMIFA Côte d'Ivoire)",
    location: "Abidjan",
    sector: "Banque et microfinance",
    level: "BAC+4/5 conformité / risque",
    contractType: "CDI",
    experience: "Expérience confirmée en LBC / conformité",
    workMode: "Sur site",
    publishedAt: "2026-06-02",
    deadline: "2026-06-23",
    source: "interne",
    description: "AMIFA Côte d'Ivoire, filiale du groupe BCP, recrute un(e) Responsable LBC pour piloter le dispositif de Lutte contre le Blanchiment de Capitaux.",
    missions: [
      "Piloter le dispositif LBC / Financement du Terrorisme",
      "Réaliser le screening, le filtrage et l'analyse des alertes",
      "Préparer les déclarations de soupçon",
      "Former et sensibiliser les collaborateurs",
      "Assurer le reporting aux autorités et à la direction"
    ],
    profile: [
      "BAC+4/5 en banque, audit, droit ou équivalent",
      "Expérience confirmée en LBC / conformité bancaire",
      "Connaissance de la réglementation BCEAO / UEMOA",
      "Rigueur, discrétion et excellent rédactionnel"
    ],
    applicationEmail: "recrutement@amifa-ci.net",
    apply: [
      "Envoyer CV + lettre de motivation (incluant la prétention salariale)",
      "À : recrutement@amifa-ci.net",
      "Date limite : 23 juin 2026"
    ]
  }),

  // ============================================================
  // Comptabilité / Finance — candidatures par email
  // ============================================================
  buildJob({
    id: 'e3',
    title: "Comptable H/F",
    company: "Events by Co",
    location: "Abidjan - Zone 4",
    sector: "Comptabilité et finance",
    level: "BAC+2 comptabilité",
    contractType: "CDI",
    experience: "2 ans",
    workMode: "Sur site",
    publishedAt: "2026-05-30",
    deadline: "2026-06-15",
    source: "interne",
    description: "Recrutement d'un Comptable pour la comptabilité générale, auxiliaire et analytique d'une agence évènementielle de la Zone 4.",
    missions: [
      "Comptabilité générale, auxiliaire et analytique",
      "Factures fournisseurs / clients, notes de frais",
      "Rapprochements bancaires, lettrage et clôtures",
      "Déclarations fiscales et sociales, reporting mensuel",
      "Gestion de trésorerie et recouvrement"
    ],
    profile: ["BAC+2 en Comptabilité / Finance", "2 ans d'expérience", "Maîtrise Sage 100, FNE, Excel, Word", "Rigueur, organisation, discrétion"],
    applicationEmail: "infos@eventsbyco.com",
    apply: ["Envoyer CV à infos@eventsbyco.com", "Objet : Comptable"]
  }),
  buildJob({
    id: 'e4',
    title: "Comptable Fiscaliste (H/F)",
    company: "Finelle Eco Finances Corp",
    location: "Abidjan",
    sector: "Comptabilité et finance",
    level: "BAC+3/5 Comptabilité-Fiscalité",
    contractType: "CDD / CDI",
    experience: "Expérience en fiscalité souhaitée",
    workMode: "Sur site",
    publishedAt: "2026-05-30",
    deadline: "2026-06-22",
    source: "interne",
    description: "Finelle Eco Finances Corp recrute un(e) Comptable Fiscaliste pour renforcer son équipe à Abidjan.",
    missions: ["Tenue et révision des comptes", "Déclarations fiscales", "Veille fiscale et réglementaire", "Conseil aux opérationnels"],
    profile: ["BAC+3/5 en Comptabilité / Fiscalité", "Maîtrise de la fiscalité ivoirienne", "Rigueur et discrétion"],
    applicationEmail: "recrutement@finelleecofinacorp.com",
    apply: ["Envoyer CV + lettre", "Objet : « Comptable Fiscaliste »", "Date limite : 22 juin 2026"]
  }),
  buildJob({
    id: 'e5',
    title: "Assistant(e) Contrôleur de Gestion",
    company: "Finelle Eco Finances Corp",
    location: "Abidjan",
    sector: "Comptabilité et finance",
    level: "BAC+3/4 Contrôle de gestion",
    contractType: "CDD / CDI",
    experience: "Première expérience en contrôle de gestion",
    workMode: "Sur site",
    publishedAt: "2026-05-30",
    deadline: "2026-06-22",
    source: "interne",
    description: "Finelle Eco Finances Corp recrute un(e) Assistant(e) Contrôleur de Gestion pour Abidjan.",
    missions: ["Appuyer la production des reportings de gestion", "Suivre les budgets et écarts", "Participer aux analyses de rentabilité"],
    profile: ["BAC+3/4 en Contrôle de Gestion / Finance", "Maîtrise d'Excel avancé", "Esprit analytique et rigueur"],
    applicationEmail: "recrutement@finelleecofinacorp.com",
    apply: ["Envoyer CV + lettre", "Objet : « Assistant(e) Controleur de Gestion »", "Date limite : 22 juin 2026"]
  }),
  buildJob({
    id: 'e6',
    title: "Assistant(e) Comptable",
    company: "Finelle Eco Finances Corp",
    location: "Abidjan",
    sector: "Comptabilité et finance",
    level: "BTS / BAC+3 Comptabilité",
    contractType: "CDD / CDI",
    experience: "Première expérience en comptabilité",
    workMode: "Sur site",
    publishedAt: "2026-05-30",
    deadline: "2026-06-22",
    source: "interne",
    description: "Finelle Eco Finances Corp recrute un(e) Assistant(e) Comptable pour Abidjan.",
    missions: ["Saisie comptable courante", "Lettrage et rapprochements bancaires", "Appui à la préparation des déclarations"],
    profile: ["BTS / BAC+3 en Comptabilité", "Maîtrise des outils comptables", "Rigueur et sens de l'organisation"],
    applicationEmail: "recrutement@finelleecofinacorp.com",
    apply: ["Envoyer CV + lettre", "Objet : « Assistant(e) Comptable »", "Date limite : 22 juin 2026"]
  }),
  buildJob({
    id: 'e7',
    title: "Comptable Senior H/F",
    company: "Hortus Bois SARL",
    location: "Abidjan, Yopougon",
    sector: "Comptabilité et finance",
    level: "BAC+3/4 comptabilité",
    contractType: "CDI",
    experience: "4 ans en cabinet ou entreprise",
    workMode: "Sur site",
    publishedAt: "2026-06-03",
    deadline: "2026-06-25",
    source: "interne",
    description: "PME ivoirienne dans la filière bois recherche un(e) Comptable Senior pour piloter la comptabilité générale et fiscale.",
    missions: ["Tenir la comptabilité générale OHADA", "Préparer les déclarations fiscales et sociales", "Suivre la trésorerie", "Préparer les états financiers annuels"],
    profile: ["BAC+3/4 en comptabilité", "4 ans en cabinet ou entreprise", "Maîtrise SYSCOHADA révisé et Sage"],
    applicationEmail: "rh@hortusbois.ci",
    apply: ["Envoyer CV + lettre à rh@hortusbois.ci", "Objet : Comptable Senior"]
  }),
  buildJob({
    id: 'e8',
    title: "Chef Comptable H/F",
    company: "Top Couture CI",
    location: "Abidjan, Marcory",
    sector: "Comptabilité et finance",
    level: "BAC+4/5 Comptabilité / Gestion",
    contractType: "CDI",
    experience: "5 ans",
    workMode: "Sur site",
    publishedAt: "2026-06-04",
    deadline: "2026-06-30",
    source: "interne",
    description: "Top Couture CI recherche un Chef Comptable pour superviser la tenue comptable et les obligations légales.",
    missions: ["Superviser la comptabilité générale et analytique", "Préparer les états financiers", "Encadrer une équipe de 2 comptables", "Optimiser les processus comptables"],
    profile: ["BAC+4/5 en comptabilité", "5 ans dont 2 en encadrement", "Maîtrise SYSCOHADA et Sage"],
    applicationEmail: "recrutement@topcouture-ci.com",
    apply: ["Envoyer CV à recrutement@topcouture-ci.com", "Objet : Chef Comptable"]
  }),

  // ============================================================
  // Évènementiel / Immobilier / Commerce — emails
  // ============================================================
  buildJob({
    id: 'e9',
    title: "Commercial(e) H/F",
    company: "Twins Immobilier",
    location: "Abidjan",
    sector: "Immobilier",
    level: "BAC+2/3 commerce",
    contractType: "CDI",
    experience: "Disponibilité immédiate",
    workMode: "Sur site",
    publishedAt: "2026-06-04",
    deadline: "2026-06-30",
    source: "interne",
    description: "Twins Immobilier recherche un Commercial dynamique et motivé pour développer le portefeuille de clients.",
    missions: ["Prospection et acquisition de nouveaux clients", "Présentation des biens immobiliers", "Négociation et conclusion des ventes", "Suivi de la relation client"],
    profile: ["BAC+2/3 en commerce, marketing ou immobilier", "Expérience commerciale appréciée", "Excellent relationnel"],
    applicationEmail: "commercial@twins-immobilier.com",
    applicationPhone: "+225 27 22 42 15 24 / +225 01 01 05 11 37"
  }),
  buildJob({
    id: 'e10',
    title: "Négociateur Immobilier H/F",
    company: "Vista Properties",
    location: "Abidjan, Cocody",
    sector: "Immobilier",
    level: "BAC+3 commerce",
    contractType: "CDI",
    experience: "2 ans en immobilier",
    workMode: "Hybride",
    publishedAt: "2026-06-06",
    deadline: "2026-07-06",
    source: "interne",
    description: "Vista Properties recrute un Négociateur Immobilier pour la vente et la location de biens résidentiels haut de gamme à Cocody.",
    missions: ["Prospecter des propriétaires et acheteurs", "Visiter et estimer les biens", "Négocier et conclure les transactions", "Gérer la relation jusqu'à signature"],
    profile: ["BAC+3 en commerce", "2 ans en immobilier", "Permis B", "Très bon relationnel"],
    applicationEmail: "rh@vistaproperties.ci",
    apply: ["Envoyer CV à rh@vistaproperties.ci", "Objet : Négociateur Immobilier"]
  }),
  buildJob({
    id: 'e11',
    title: "Responsable Marketing Digital H/F",
    company: "Délices d'Ivoire SARL",
    location: "Abidjan",
    sector: "Marketing et communication",
    level: "BAC+4 marketing digital",
    contractType: "CDI",
    experience: "3 ans en marketing digital",
    workMode: "Hybride",
    publishedAt: "2026-06-05",
    deadline: "2026-07-05",
    source: "interne",
    description: "PME agroalimentaire ivoirienne recherche un Responsable Marketing Digital pour piloter sa visibilité en ligne et son e-commerce.",
    missions: ["Définir et exécuter la stratégie digitale", "Animer les réseaux sociaux", "Gérer les campagnes Google Ads et Meta Ads", "Piloter l'e-shop et le SEO"],
    profile: ["BAC+4 en marketing digital", "3 ans en marketing digital", "Maîtrise Meta Business, Google Ads, Analytics"],
    applicationEmail: "recrutement@delicesivoire.com",
    apply: ["Envoyer CV + portfolio à recrutement@delicesivoire.com", "Objet : Marketing Digital"]
  }),

  // ============================================================
  // Santé — emails
  // ============================================================
  buildJob({
    id: 'e12',
    title: "Infirmier(ère) Diplômé(e) d'État",
    company: "Polyclinique Internationale Sainte Anne-Marie",
    location: "Abidjan, Cocody",
    sector: "Santé",
    level: "Diplôme d'État Infirmier",
    contractType: "CDI",
    experience: "2 ans minimum",
    workMode: "Sur site",
    publishedAt: "2026-06-01",
    deadline: "2026-06-30",
    source: "interne",
    description: "La Polyclinique Sainte Anne-Marie recrute des infirmier(ère)s diplômé(e)s pour ses services d'hospitalisation et d'urgences.",
    missions: ["Assurer les soins infirmiers", "Surveiller l'état clinique des patients", "Préparer et administrer les traitements", "Tenir le dossier de soins"],
    profile: ["Diplôme d'État Infirmier", "2 ans en milieu hospitalier", "Disponibilité jours/nuits/week-ends"],
    applicationEmail: "drh@pisam.ci",
    apply: ["Envoyer CV + diplôme + autorisation d'exercice", "À : drh@pisam.ci", "Objet : IDE - PISAM"]
  }),
  buildJob({
    id: 'e13',
    title: "Pharmacien(ne) Adjoint(e) H/F",
    company: "Pharmacie Saint Camille",
    location: "Abidjan, Marcory",
    sector: "Santé",
    level: "Doctorat en Pharmacie",
    contractType: "CDI",
    experience: "1 à 3 ans",
    workMode: "Sur site",
    publishedAt: "2026-06-02",
    deadline: "2026-06-25",
    source: "interne",
    description: "Pharmacie d'officine de Marcory recrute un(e) pharmacien(ne) adjoint(e) pour renforcer son équipe.",
    missions: ["Dispenser les médicaments et conseiller la clientèle", "Gérer les stocks et commandes", "Encadrer les préparateurs", "Veiller au respect de la déontologie"],
    profile: ["Doctorat en pharmacie", "1 à 3 ans en officine", "Inscription à l'Ordre des Pharmaciens CI"],
    applicationEmail: "pharmacie.saintcamille@gmail.com",
    apply: ["Envoyer CV + copie du diplôme + attestation d'inscription à l'Ordre"]
  }),
  buildJob({
    id: 'e14',
    title: "Médecin Généraliste H/F",
    company: "Clinique Médicale Hévéa",
    location: "Abidjan, Riviera",
    sector: "Santé",
    level: "Doctorat en Médecine",
    contractType: "CDI",
    experience: "2 ans en consultation",
    workMode: "Sur site",
    publishedAt: "2026-06-04",
    deadline: "2026-07-04",
    source: "interne",
    description: "Clinique privée à la Riviera recrute un médecin généraliste pour son service de consultations externes.",
    missions: ["Réaliser les consultations médicales", "Prescrire et suivre les traitements", "Orienter vers les spécialistes si besoin"],
    profile: ["Doctorat en médecine", "2 ans minimum en consultation", "Inscription au Conseil de l'Ordre"],
    applicationEmail: "rh@cliniquehevea.ci",
    apply: ["Envoyer CV + diplôme + attestation Ordre", "Objet : Médecin Généraliste"]
  }),

  // ============================================================
  // BTP / Industrie — emails
  // ============================================================
  buildJob({
    id: 'e15',
    title: "Conducteur de Travaux Bâtiment H/F",
    company: "Constructions du Golfe SA",
    location: "Abidjan",
    sector: "BTP et construction",
    level: "BAC+3/5 Génie civil",
    contractType: "CDI",
    experience: "5 ans en conduite de chantier",
    workMode: "Sur site",
    publishedAt: "2026-06-03",
    deadline: "2026-07-03",
    source: "interne",
    description: "Constructions du Golfe SA recrute un Conducteur de Travaux pour piloter ses chantiers résidentiels et tertiaires à Abidjan.",
    missions: ["Planifier et piloter l'exécution des chantiers", "Encadrer les équipes et sous-traitants", "Suivre le budget, les délais et la qualité", "Garantir la sécurité chantier"],
    profile: ["BAC+3/5 en génie civil", "5 ans en conduite de travaux bâtiment", "Maîtrise AutoCAD, MS Project"],
    applicationEmail: "rh@constructionsdugolfe.ci",
    apply: ["Envoyer CV + lettre + références chantiers", "À : rh@constructionsdugolfe.ci"]
  }),
  buildJob({
    id: 'e16',
    title: "Technicien HSE H/F",
    company: "Atlantique Cimenterie SARL",
    location: "Abidjan",
    sector: "Industrie",
    level: "BAC+3 HSE / QHSE",
    contractType: "CDI",
    experience: "2 ans en HSE industrielle",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-05",
    source: "interne",
    description: "Atlantique Cimenterie recrute un Technicien HSE pour veiller à la sécurité, l'hygiène et l'environnement sur son site industriel.",
    missions: ["Animer la politique HSE sur le site", "Réaliser les audits internes et inspections", "Former les opérateurs aux bonnes pratiques", "Tenir les registres d'accidents et de presque-accidents"],
    profile: ["BAC+3 HSE / QHSE ou équivalent", "2 ans en industrie", "Connaissance ISO 14001 / 45001"],
    applicationEmail: "rh@atlantique-cimenterie.ci"
  }),
  buildJob({
    id: 'e17',
    title: "Électromécanicien H/F",
    company: "Société Ivoirienne d'Emballages Métalliques (SIEM)",
    location: "Abidjan, Zone industrielle de Vridi",
    sector: "Industrie",
    level: "BT / BTS Électromécanique",
    contractType: "CDI",
    experience: "3 ans en maintenance industrielle",
    workMode: "Sur site",
    publishedAt: "2026-06-06",
    deadline: "2026-07-06",
    source: "interne",
    description: "SIEM recrute un Électromécanicien expérimenté pour la maintenance préventive et curative de ses lignes de production.",
    missions: ["Diagnostiquer et réparer les pannes mécaniques et électriques", "Réaliser la maintenance préventive selon planning", "Améliorer la fiabilité des équipements"],
    profile: ["BT / BTS en électromécanique", "3 ans en industrie", "Lecture de schémas électriques et mécaniques"],
    applicationEmail: "drh@siem.ci",
    apply: ["Envoyer CV à drh@siem.ci", "Objet : Électromécanicien"]
  }),

  // ============================================================
  // NTIC / Digital — emails
  // ============================================================
  buildJob({
    id: 'e18',
    title: "Développeur Full Stack H/F",
    company: "Codebase Africa",
    location: "Abidjan, Plateau",
    sector: "NTIC et systèmes d'information",
    level: "BAC+3/5 Informatique",
    contractType: "CDI",
    experience: "3 ans",
    workMode: "Hybride",
    publishedAt: "2026-06-07",
    deadline: "2026-07-07",
    source: "interne",
    description: "Studio de développement ivoirien recrute un Développeur Full Stack pour ses projets clients (fintech, e-commerce, logistique).",
    missions: ["Développer des applications web (Node.js + React)", "Concevoir et intégrer des API REST", "Participer aux revues de code et à la mise en production"],
    profile: ["BAC+3/5 en informatique", "3 ans en développement web", "Maîtrise Node.js, React, PostgreSQL, Git"],
    applicationEmail: "jobs@codebase-africa.com",
    apply: ["Envoyer CV + GitHub à jobs@codebase-africa.com"]
  }),
  buildJob({
    id: 'e19',
    title: "Administrateur Systèmes & Réseaux H/F",
    company: "Lagune Networks SARL",
    location: "Abidjan, Plateau",
    sector: "NTIC et systèmes d'information",
    level: "BAC+3/4 Informatique / Réseaux",
    contractType: "CDI",
    experience: "3 ans en administration système",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-10",
    source: "interne",
    description: "Lagune Networks recrute un Administrateur Systèmes & Réseaux pour gérer l'infrastructure interne et celle de ses clients.",
    missions: ["Administrer les serveurs Windows et Linux", "Gérer les équipements réseau (switches, routeurs, firewalls)", "Assurer la sécurité du SI", "Support N2 aux utilisateurs"],
    profile: ["BAC+3/4 en informatique / réseaux", "3 ans en administration", "Certifications CCNA / RHCSA appréciées"],
    applicationEmail: "recrutement@lagunenetworks.ci"
  }),
  buildJob({
    id: 'e20',
    title: "Data Analyst H/F",
    company: "Yango Sénégal & Côte d'Ivoire",
    location: "Abidjan",
    sector: "NTIC et data",
    level: "BAC+5 Data / Statistiques",
    contractType: "CDI",
    experience: "2 ans en analyse de données",
    workMode: "Hybride",
    publishedAt: "2026-06-06",
    deadline: "2026-07-06",
    source: "interne",
    description: "Yango recrute un Data Analyst pour analyser les données opérationnelles et appuyer la prise de décision sur la zone CI.",
    missions: ["Produire les tableaux de bord opérationnels", "Réaliser les analyses ad-hoc demandées par les métiers", "Modéliser les KPI clés"],
    profile: ["BAC+5 en data / statistiques", "2 ans en analyse de données", "SQL, Python, Tableau ou Power BI"],
    applicationEmail: "ci-jobs@yango.com",
    apply: ["Envoyer CV à ci-jobs@yango.com", "Objet : Data Analyst Abidjan"]
  }),

  // ============================================================
  // RH / Juridique — emails
  // ============================================================
  buildJob({
    id: 'e21',
    title: "Chargé(e) RH Généraliste H/F",
    company: "Cabinet d'Avocats Bilé-Aka Brizoua-Bi",
    location: "Abidjan, Plateau",
    sector: "Ressources humaines",
    level: "BAC+4/5 RH",
    contractType: "CDI",
    experience: "3 ans en RH généraliste",
    workMode: "Sur site",
    publishedAt: "2026-06-04",
    deadline: "2026-07-04",
    source: "interne",
    description: "Le cabinet recrute un(e) Chargé(e) RH pour gérer l'ensemble des sujets RH (recrutement, paie, administration du personnel).",
    missions: ["Piloter le recrutement", "Préparer la paie et les déclarations sociales", "Gérer les contrats et l'administration du personnel", "Suivre la formation"],
    profile: ["BAC+4/5 en RH", "3 ans en cabinet ou entreprise", "Maîtrise Sage Paie ou équivalent"],
    applicationEmail: "rh@bilebrizoua-bi.ci"
  }),
  buildJob({
    id: 'e22',
    title: "Juriste Corporate H/F",
    company: "SunInvest Holding",
    location: "Abidjan, Plateau",
    sector: "Juridique",
    level: "Master en droit des affaires",
    contractType: "CDI",
    experience: "3 ans en cabinet ou direction juridique",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-15",
    source: "interne",
    description: "Holding ivoirienne recrute un Juriste Corporate pour gérer les opérations sociétaires de ses filiales et les contrats commerciaux.",
    missions: ["Suivre la vie sociétaire (AG, conseils, modifications statutaires)", "Rédiger et négocier les contrats", "Conseiller les directions opérationnelles"],
    profile: ["Master en droit des affaires", "3 ans en cabinet ou direction juridique", "Maîtrise OHADA"],
    applicationEmail: "recrutement@suninvest.ci",
    apply: ["Envoyer CV + lettre + 2 références à recrutement@suninvest.ci"]
  }),

  // ============================================================
  // ONG / Organisations internationales — emails
  // ============================================================
  buildJob({
    id: 'e23',
    title: "Superviseur(e) Genre (H/F) - Projet PRESACI",
    company: "CARE International Côte d'Ivoire",
    location: "Bouaké",
    sector: "ONG et organisations internationales",
    level: "BAC+2 minimum (Sciences sociales / Genre / Développement)",
    contractType: "CDD - Projet",
    experience: "Expérience en projet genre / égalité H-F",
    workMode: "Sur site",
    publishedAt: "2026-05-30",
    deadline: "2026-06-15",
    source: "interne",
    description: "CARE International Côte d'Ivoire recherche un(e) Superviseur(e) Genre pour le projet PRESACI financé par l'Union Européenne.",
    missions: ["Mettre en œuvre la stratégie d'égalité H-F", "Travailler avec les partenaires pour une approche intersectionnelle", "Animer les activités terrain à Bouaké", "Renforcer les capacités des équipes"],
    profile: ["BAC+2 minimum en sciences sociales ou équivalent", "Expérience en projet de développement / genre", "Aisance terrain et travail communautaire"],
    docs: ["Lettre de motivation + prétention salariale", "CV", "Contacts et adresses électroniques de 3 références"],
    applicationEmail: "CIV.Recrutement@care.org",
    apply: [
      "Envoyer le dossier complet à CIV.Recrutement@care.org",
      "Mention obligatoire : « UN.E SUPERVISEUR.E GENRE – PRESACI »",
      "Au plus tard le lundi 15 juin 2026 à 16h00"
    ]
  }),
  buildJob({
    id: 'e24',
    title: "Tantes SOS (Encadreuse d'enfants)",
    company: "SOS Villages d'Enfants Côte d'Ivoire",
    location: "Abobo / Aboisso / Yamoussoukro",
    sector: "ONG et organisations internationales",
    level: "BEPC minimum",
    contractType: "CDI - Résident sur site",
    experience: "Atout : expérience prise en charge enfance",
    workMode: "Sur site",
    publishedAt: "2026-06-01",
    deadline: "2026-06-30",
    source: "interne",
    description: "SOS Villages d'Enfants Côte d'Ivoire recrute des Tantes SOS pour assurer au quotidien la prise en charge de type familial d'enfants de 0 à 14 ans.",
    missions: ["Organiser la vie quotidienne des enfants", "Instaurer une relation stable avec chaque enfant", "Assurer la relève de la Mère pendant les jours de repos", "Gérer le budget de la maison familiale"],
    profile: ["BEPC minimum", "Disponibilité permanente, dormir sur le village", "Bonne santé physique et mentale, bonne moralité"],
    docs: ["Lettre de motivation adressée au Directeur National", "CV détaillé", "Copies des diplômes"],
    applicationEmail: "Recrute.CI@sos-ci.org",
    apply: ["Envoyer le dossier à Recrute.CI@sos-ci.org"]
  }),
  buildJob({
    id: 'e25',
    title: "Chargé(e) de Suivi-Évaluation Projet Santé",
    company: "ONG Médicale Espoir d'Afrique",
    location: "Abidjan + missions terrain",
    sector: "ONG et organisations internationales",
    level: "BAC+4/5 Santé publique / Suivi-éval.",
    contractType: "CDD 12 mois",
    experience: "3 ans en suivi-évaluation projet santé",
    workMode: "Hybride",
    publishedAt: "2026-06-04",
    deadline: "2026-06-28",
    source: "interne",
    description: "ONG locale recrute un(e) Chargé(e) de Suivi-Évaluation pour un projet de santé maternelle et infantile dans 3 districts sanitaires.",
    missions: ["Mettre en place le système de suivi-évaluation", "Collecter et analyser les données terrain", "Produire les rapports périodiques pour le bailleur"],
    profile: ["BAC+4/5 santé publique ou suivi-éval.", "3 ans en SE projet santé", "Maîtrise KoboToolbox / DHIS2"],
    applicationEmail: "recrutement@espoirafrique.org",
    apply: ["Envoyer CV + lettre + 3 références", "Objet : SE-Santé"]
  }),

  // ============================================================
  // Hôtellerie / Restauration / Tourisme — emails
  // ============================================================
  buildJob({
    id: 'e26',
    title: "Réceptionniste Bilingue H/F",
    company: "Hôtel Lac de la Lagune",
    location: "Abidjan, Cocody",
    sector: "Hôtellerie et restauration",
    level: "BAC+2 hôtellerie",
    contractType: "CDI",
    experience: "2 ans en réception hôtelière",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-05",
    source: "interne",
    description: "Hôtel 4* recrute un(e) Réceptionniste bilingue français-anglais pour son équipe d'accueil.",
    missions: ["Accueillir et orienter les clients", "Effectuer les check-in / check-out", "Gérer les réservations et les caisses", "Veiller à la satisfaction client"],
    profile: ["BAC+2 hôtellerie ou tourisme", "2 ans en réception", "Anglais courant exigé"],
    applicationEmail: "recrutement@lacdelalagune.ci",
    apply: ["Envoyer CV + photo à recrutement@lacdelalagune.ci"]
  }),
  buildJob({
    id: 'e27',
    title: "Chef de Rang Restaurant Gastronomique",
    company: "Le Saint-Honoré (groupe Akwaba)",
    location: "Abidjan, Marcory Zone 4",
    sector: "Hôtellerie et restauration",
    level: "CAP / BT restauration",
    contractType: "CDI",
    experience: "3 ans en restauration gastronomique",
    workMode: "Sur site",
    publishedAt: "2026-06-06",
    deadline: "2026-07-06",
    source: "interne",
    description: "Restaurant gastronomique de la Zone 4 recrute un Chef de Rang expérimenté pour son service du soir.",
    missions: ["Encadrer son rang et les commis", "Assurer un service de qualité", "Conseiller les clients sur la carte et les vins", "Veiller à la satisfaction client"],
    profile: ["CAP / BT en restauration", "3 ans en gastronomique", "Connaissance des accords mets-vins"],
    applicationEmail: "rh@saint-honore.ci"
  }),

  // ============================================================
  // Transport / Logistique — emails
  // ============================================================
  buildJob({
    id: 'e28',
    title: "Chef d'Agence Transport H/F",
    company: "Transport Hassan & Frères",
    location: "Bouaké",
    sector: "Transport et logistique",
    level: "BAC+3 transport / logistique",
    contractType: "CDI",
    experience: "5 ans dont 2 en management",
    workMode: "Sur site",
    publishedAt: "2026-06-04",
    deadline: "2026-07-04",
    source: "interne",
    description: "Société de transport recrute un Chef d'Agence pour Bouaké, en charge de l'exploitation et du développement commercial local.",
    missions: ["Piloter l'exploitation de l'agence", "Encadrer une équipe de 8 personnes", "Développer le portefeuille clients local", "Suivre la rentabilité"],
    profile: ["BAC+3 transport / logistique", "5 ans dont 2 en management", "Connaissance du marché Bouaké appréciée"],
    applicationEmail: "rh@hassanfreres.ci"
  }),
  buildJob({
    id: 'e29',
    title: "Agent de Transit Maritime H/F",
    company: "Lagune Cargo",
    location: "Abidjan, port",
    sector: "Transit et douane",
    level: "BAC+2 transit / logistique",
    contractType: "CDI",
    experience: "2 ans en transit",
    workMode: "Sur site",
    publishedAt: "2026-06-07",
    deadline: "2026-07-07",
    source: "interne",
    description: "Lagune Cargo recrute un Agent de Transit pour la gestion des dossiers import / export au port d'Abidjan.",
    missions: ["Constituer et déposer les dossiers de dédouanement", "Suivre les opérations portuaires", "Gérer la relation client"],
    profile: ["BAC+2 transit ou logistique", "2 ans en transit maritime", "Connaissance des procédures douanières CI"],
    applicationEmail: "rh@lagunecargo.com",
    apply: ["Envoyer CV à rh@lagunecargo.com"]
  }),

  // ============================================================
  // Éducation / Formation — emails
  // ============================================================
  buildJob({
    id: 'e30',
    title: "Enseignant(e) de Mathématiques (Lycée)",
    company: "Collège-Lycée Notre-Dame de l'Espérance",
    location: "Abidjan, Cocody",
    sector: "Éducation et formation",
    level: "Master en Mathématiques ou CAP-PL",
    contractType: "CDI",
    experience: "2 ans d'enseignement",
    workMode: "Sur site",
    publishedAt: "2026-06-03",
    deadline: "2026-07-15",
    source: "interne",
    description: "Établissement privé conventionné recrute un(e) enseignant(e) de mathématiques pour les classes de Seconde à Terminale.",
    missions: ["Préparer et dispenser les cours", "Évaluer les élèves", "Participer aux conseils de classe", "Préparer aux examens BAC C / D"],
    profile: ["Master en Mathématiques ou CAP-PL", "2 ans d'enseignement secondaire", "Pédagogie reconnue"],
    applicationEmail: "direction@notredame-esperance.ci",
    apply: ["Envoyer CV + lettre + diplômes", "Objet : Enseignant Maths"]
  }),
  buildJob({
    id: 'e31',
    title: "Formateur(trice) Bureautique & Digital",
    company: "Académie Numérique Abidjan",
    location: "Abidjan, Cocody",
    sector: "Éducation et formation",
    level: "BAC+3 informatique ou bureautique",
    contractType: "CDD 6 mois renouvelable",
    experience: "2 ans en formation adultes",
    workMode: "Sur site",
    publishedAt: "2026-06-06",
    deadline: "2026-06-30",
    source: "interne",
    description: "Centre de formation recrute un Formateur Bureautique pour animer des sessions Word, Excel, PowerPoint et initiation au digital.",
    missions: ["Animer les sessions de formation présentiel", "Préparer les supports pédagogiques", "Évaluer les apprenants"],
    profile: ["BAC+3 en informatique ou bureautique", "2 ans en formation adultes", "Excellente expression orale"],
    applicationEmail: "rh@academie-numerique.ci"
  }),

  // ============================================================
  // Commerce et distribution — emails
  // ============================================================
  buildJob({
    id: 'e32',
    title: "Responsable de Boutique H/F",
    company: "Maison Yvana (prêt-à-porter)",
    location: "Abidjan, Cocody Riviera 2",
    sector: "Commerce et distribution",
    level: "BAC+3 commerce / mode",
    contractType: "CDI",
    experience: "3 ans en management de boutique",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-05",
    source: "interne",
    description: "Boutique de prêt-à-porter féminin recrute une Responsable pour piloter l'équipe de vente et le chiffre d'affaires.",
    missions: ["Encadrer une équipe de 4 vendeuses", "Atteindre les objectifs de CA", "Gérer les stocks et le merchandising", "Suivre la satisfaction client"],
    profile: ["BAC+3 en commerce ou mode", "3 ans en management de boutique", "Excellent sens commercial"],
    applicationEmail: "recrutement@maisonyvana.com",
    apply: ["Envoyer CV + lettre avec photo à recrutement@maisonyvana.com"]
  }),
  buildJob({
    id: 'e33',
    title: "Commercial Terrain Pharmaceutique",
    company: "DistriPharm CI",
    location: "Abidjan + tournées intérieur",
    sector: "Santé et pharmacie",
    level: "BAC+2/3 commerce ou pharmacie",
    contractType: "CDI",
    experience: "1 an minimum",
    workMode: "Sur site",
    publishedAt: "2026-06-06",
    deadline: "2026-07-06",
    source: "interne",
    description: "Grossiste pharmaceutique recrute des Commerciaux Terrain pour visiter les pharmacies sur Abidjan et l'intérieur du pays.",
    missions: ["Visiter les pharmacies de son secteur", "Présenter les nouveautés", "Prendre les commandes", "Suivre le recouvrement"],
    profile: ["BAC+2/3 en commerce ou pharmacie", "1 an en vente terrain", "Permis B obligatoire"],
    applicationEmail: "rh@distripharm.ci",
    apply: ["Envoyer CV + permis", "Objet : Commercial Pharma"]
  }),
  buildJob({
    id: 'e34',
    title: "Téléprospecteur(trice) B2B",
    company: "Centre d'appels Premium Contact",
    location: "Abidjan, Plateau",
    sector: "Relation client",
    level: "BAC à BAC+2",
    contractType: "CDD 6 mois renouvelable",
    experience: "Débutant accepté avec formation",
    workMode: "Sur site",
    publishedAt: "2026-06-08",
    deadline: "2026-07-08",
    source: "interne",
    description: "Centre d'appels recrute 15 téléprospecteurs(trices) pour une campagne BtoB démarrage immédiat.",
    missions: ["Prospecter par téléphone des entreprises", "Qualifier les prospects et prendre des RDV", "Saisir les comptes-rendus dans le CRM"],
    profile: ["BAC à BAC+2", "Excellente expression orale", "Aisance téléphonique"],
    applicationEmail: "recrutement@premiumcontact.ci",
    apply: ["Envoyer CV à recrutement@premiumcontact.ci", "Objet : Téléprospection B2B"]
  }),

  // ============================================================
  // Agro / Industrie — emails
  // ============================================================
  buildJob({
    id: 'e35',
    title: "Responsable Qualité Agroalimentaire H/F",
    company: "Cacao Premium SARL",
    location: "San Pedro",
    sector: "Industrie agroalimentaire",
    level: "BAC+5 Qualité / Agro-industrie",
    contractType: "CDI",
    experience: "5 ans en qualité agroalimentaire",
    workMode: "Sur site",
    publishedAt: "2026-06-05",
    deadline: "2026-07-10",
    source: "interne",
    description: "Exportateur de cacao recrute un Responsable Qualité pour son usine de transformation à San Pedro.",
    missions: ["Mettre en place et animer le système qualité HACCP / ISO 22000", "Réaliser les audits internes et fournisseurs", "Gérer les non-conformités et plans d'action"],
    profile: ["BAC+5 en qualité ou agro-industrie", "5 ans en qualité agroalimentaire", "Maîtrise HACCP, ISO 22000, BRC"],
    applicationEmail: "rh@cacaopremium.ci"
  }),
  buildJob({
    id: 'e36',
    title: "Agronome de Terrain H/F",
    company: "Coopérative Agricole Bélier (CAB)",
    location: "Yamoussoukro et environs",
    sector: "Agriculture",
    level: "BAC+3 Agronomie",
    contractType: "CDI",
    experience: "2 ans en encadrement de planteurs",
    workMode: "Sur site",
    publishedAt: "2026-06-07",
    deadline: "2026-07-07",
    source: "interne",
    description: "Coopérative de planteurs recrute un Agronome pour encadrer techniquement ses adhérents (cacao / café / hévéa).",
    missions: ["Visiter les plantations et conseiller les producteurs", "Animer les formations techniques", "Suivre les rendements et la qualité"],
    profile: ["BAC+3 en agronomie", "2 ans en encadrement", "Permis A ou B"],
    applicationEmail: "recrutement@coop-belier.ci"
  })
];
