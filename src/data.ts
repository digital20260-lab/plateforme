import { mockJobs } from './jobs';

export type ListingType = 'emploi' | 'concours';

export interface DetailTable {
  headers: string[];
  rows: string[][];
}

export interface DetailSection {
  title: string;
  content?: string[];
  table?: DetailTable;
  note?: string;
}

export interface Listing {
  id: string;
  title: string;
  ministry: string;
  type: ListingType;
  level: string;
  deadline: string;
  status: 'Ouvert' | 'Fermé' | 'Bientôt' | 'En cours';
  description: string;
  sourceUrl: string;
  fee?: string;
  company?: string;
  location?: string;
  contractType?: string;
  experience?: string;
  refreshFrequency?: string;
  // Champs spécifiques aux offres d'emploi
  sector?: string;
  publishedAt?: string;
  workMode?: 'Sur site' | 'Télétravail' | 'Hybride';
  applicationEmail?: string;
  applicationAddress?: string;
  applicationPhone?: string;
  details?: DetailSection[];
}

export const mockListings: Listing[] = [
  {
    id: 'c1',
    title: 'Concours INFAS 2026',
    ministry: 'Santé, Hygiène Publique et CMU',
    type: 'concours',
    level: 'BEPC / BAC',
    deadline: '2026-06-22',
    status: 'Ouvert',
    description: "Institut National de Formation des Agents de Santé. Concours ouvert aux filières Infirmiers, Sages-Femmes, TSS, Secrétaires Médicaux et Auxiliaires de Santé.",
    sourceUrl: 'infas.ciconcours.com',
    fee: '40 000 FCFA',
    details: [
      {
        title: "Filières et conditions d'accès",
        table: {
          headers: ['Filière', 'Diplôme requis', 'Âge au 31/12/2026'],
          rows: [
            ['Infirmiers / Infirmières', 'BAC A,B,C,D,E,F,G1,G2 / BT Sciences Médico-Sociales', '18 à 32 ans'],
            ['Sages-Femmes / Maïeuticiens', 'BAC A,B,C,D,E,F,G1,G2 / BT Sciences Médico-Sociales', '18 à 32 ans'],
            ['TSS Biologie Médicale', 'BAC B,C,D,E,F', '18 à 32 ans'],
            ['TSS Biomédicale', 'BAC B,C,D,E,F / BT Électronique', '18 à 32 ans'],
            ['TSS Hygiène et Assainissement', 'BAC B,C,D,E,F', '18 à 32 ans'],
            ['TSS Imagerie Médicale', 'BAC B,C,D,E,F', '18 à 32 ans'],
            ['TSS Masso-Kinésithérapie', 'BAC B,C,D,E,F', '18 à 32 ans'],
            ['TSS Préparateurs en Pharmacie', 'BAC B,C,D,E,F', '18 à 32 ans'],
            ['Secrétaires Médicaux', 'BAC G1 / BT Secrétariat Bureautique', '18 à 32 ans'],
            ['Auxiliaires de Santé', 'BEPC / CAP Sanitaire et Social', '18 à 35 ans']
          ]
        },
        note: "Aucun autre BT ni équivalence non cités n'est autorisé. Aucune candidature sous réserve de BEPC ou BAC n'est acceptée."
      },
      {
        title: "Frais d'inscription",
        content: ['Frais d inscription : 28 000 FCFA', 'Frais de concours : 12 000 FCFA', 'Total : 40 000 FCFA', 'Paiement en ligne unique via Mobile Money']
      },
      {
        title: 'Calendrier 2026',
        table: {
          headers: ['Étape', 'Période', 'Lieux'],
          rows: [
            ['Préinscription en ligne', '22 mai au 22 juin 2026', 'www.infas.ci'],
            ['Inscription et visite médicale', '02 juin au 15 juillet 2026', 'Abidjan, Palais des Sports de Treichville'],
            ['Inscriptions délocalisées', '08 juin au 10 juillet 2026', 'Agboville, Aboisso, Abengourou, Bouaké, Daloa, Korhogo, Man']
          ]
        }
      },
      {
        title: 'Dossier à fournir',
        content: [
          'Formulaire renseigné et imprimé sur le site www.infas.ci',
          "Certificat médical d'aptitude délivré par un médecin mandaté INFAS",
          'Photocopie du relevé de notes ou attestation + original',
          "Photocopie CNI recto-verso + original ou attestation d'identité en cours de validité",
          'Photo numérique intégrée à la base lors de la visite médicale',
          "Carte CMU ou récépissé d'enrôlement + original"
        ]
      },
      {
        title: 'Site web officiel',
        content: ['Inscription et informations : https://infas.ciconcours.com', 'Plateforme officielle de gestion du concours']
      }
    ]
  },
  {
    id: 'c2',
    title: 'Concours INFJ 2026',
    ministry: 'Justice',
    type: 'concours',
    level: 'Variable par grade',
    deadline: '2026-04-30',
    status: 'Fermé',
    description: "Institut National de Formation Judiciaire. Concours directs, concours professionnels et concours professionnels spéciaux.",
    sourceUrl: 'infj.ciconcours.com',
    fee: 'Non précisé, paiement en ligne selon concours',
    details: [
      {
        title: 'Présentation',
        content: ["L'INFJ organise 3 types de concours : Directs ouverts à tous, Professionnels pour fonctionnaires en activité et Professionnels Spéciaux.", "La procédure d'inscription varie selon le type de concours choisi."]
      },
      {
        title: 'Concours Directs - Liste et calendrier',
        table: {
          headers: ['Grade / Poste', 'Inscription en ligne', 'Dépôt dossiers'],
          rows: [
            ['Administrateur des Greffes et Parquets', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Administrateur des Services Pénitentiaires', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Agent d Encadrement des Établissements Pénitentiaires', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Attaché des Greffes et Parquets', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Attaché des Services Pénitentiaires', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Conseiller Protection Judiciaire Enfance/Jeunesse', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Contrôleur des Établissements Pénitentiaires', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Inspecteur Protection Judiciaire Enfance/Jeunesse', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['MAGISTRATURE Direct', '12/02 au 19/03/2026', '19/02 au 03/04/2026'],
            ['Maître ou Maîtresse Protection Judiciaire Enfance/Jeunesse', '12/02 au 30/04/2026', '19/02 au 30/04/2026'],
            ['Secrétaire des Greffes et Parquets', '12/02 au 30/04/2026', '19/02 au 30/04/2026']
          ]
        }
      },
      {
        title: 'Concours Professionnels',
        table: {
          headers: ['Grade / Poste', 'Inscription en ligne', 'Dépôt dossiers'],
          rows: [
            ['Administrateur des Greffes et Parquets', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Administrateur des Services Pénitentiaires', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Attaché des Greffes et Parquets', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Attaché des Services Pénitentiaires', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Conseiller Protection Judiciaire Enfance/Jeunesse', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Contrôleur des Établissements Pénitentiaires', '12/02 au 31/03/2026', '19/02 au 30/04/2026'],
            ['Inspecteur Protection Judiciaire Enfance/Jeunesse', '12/02 au 31/03/2026', '19/02 au 30/04/2026']
          ]
        }
      },
      {
        title: 'Concours Professionnels Spéciaux',
        table: {
          headers: ['Étape', 'Période'],
          rows: [
            ['Inscription aux cours de préparation', '12/02 au 12/03/2026'],
            ['Inscription en ligne', '27/04 au 27/05/2026'],
            ['Dépôt de dossiers', '27/04 au 29/05/2026']
          ]
        }
      },
      {
        title: "Procédure d'inscription - Concours Directs",
        content: [
          'Inscription en ligne sur www.infj.org.ci',
          "Paiement des frais de visite médicale à l'agence comptable de l'INFJ",
          'Visite médicale à jeun : urines, radio pulmonaire, examens physiques + photo numérique',
          'Paiement en ligne des frais de concours + chargement du dossier en ligne',
          'Constitution et dépôt physique du dossier complet'
        ]
      },
      {
        title: "Procédure d'inscription - Concours Professionnels",
        content: ['Inscription en ligne', 'Paiement en ligne des frais de concours via Orange, MTN, Moov, Wave ou TrésorMoney', 'Constitution et dépôt physique du dossier']
      },
      {
        title: 'Site web officiel',
        content: ['Inscription et informations : https://www.infj.org.ci', 'Plateforme de candidature : https://infj.ciconcours.com']
      }
    ]
  },
  {
    id: 'c3',
    title: 'Concours ENS Abidjan 2026',
    ministry: 'Enseignement Supérieur et Recherche Scientifique',
    type: 'concours',
    level: 'DEUG / Licence / Master',
    deadline: '2026-05-15',
    status: 'En cours',
    description: "École Normale Supérieure. Concours directs Éducateurs, Professeurs de Collège CAP-PC et Professeurs de Lycée CAP-PL.",
    sourceUrl: 'ens.mesrs-ci.net',
    fee: '12 000 FCFA',
    details: [
      {
        title: 'Présentation',
        content: ["L'ENS ouvre 3 concours directs : Éducateurs, Professeurs de Collège CAP-PC et Professeurs de Lycée CAP-PL.", 'Les convocations aux épreuves écrites sont disponibles sur le site officiel.']
      },
      {
        title: 'Concours 1 - Éducateurs',
        content: [
          'Conditions : nationalité ivoirienne',
          'Diplôme requis : DEUG, Licence ou diplôme admis en équivalence',
          'Âge : être né(e) après le 31 décembre 1988',
          'Frais : droit de concours 10 000 FCFA + pochette dossier 2 000 FCFA, total 12 000 FCFA',
          'Dossier : fiche de candidature imprimée, extrait de naissance ou jugement supplétif 2025/2026 + original, photocopie CNI recto-verso + original, photocopies BAC et diplômes requis + originaux, carte CMU + original, pochette à retirer au Service des Examens et Concours'
        ]
      },
      {
        title: "Concours 2 - Professeurs de Collège CAP-PC",
        table: {
          headers: ['Bloc ou discipline', "Profil d'entrée requis"],
          rows: [
            ['Anglais / EPS', 'Anglais'],
            ['Lettres Modernes / Histoire-Géographie', 'Géographie et/ou Histoire'],
            ['Lettres Modernes / Éducation aux Droits Humains', 'Lettres Modernes'],
            ['Mathématiques / TIC', 'Mathématiques'],
            ['SVT / Sciences Physiques', 'SVT ou Sciences Physiques'],
            ['Espagnol', 'Espagnol']
          ]
        }
      },
      {
        title: 'Conditions et dossier CAP-PC',
        content: [
          'Nationalité ivoirienne',
          "Licence dans la discipline indiquée au profil d'entrée, né(e) après le 31/12/1988",
          'Pour Maths et Sciences Physiques : DEUG respectivement en Mathématiques et Sciences Physiques, né(e) après le 31/12/1988',
          'Pour Maths : Master en Sciences Économiques avec note BAC au moins 10/20 en C ou 12/20 en D, né(e) après le 31/12/1988',
          'Frais : droit de concours 10 000 FCFA + pochette dossier 2 000 FCFA, total 12 000 FCFA',
          'Dossier : fiche imprimée, extrait de naissance ou jugement supplétif 2025/2026 + original, CNI + original, BAC et diplômes + originaux, carte CMU + original, pochette, relevé BAC pour les titulaires d un Master en Sciences Économiques'
        ]
      },
      {
        title: 'Concours 3 - Professeurs de Lycée CAP-PL',
        content: [
          'Disciplines ouvertes : Allemand, Anglais, Espagnol, Histoire-Géographie, Lettres Modernes, Mathématiques, Philosophie, Physique-Chimie, SVT',
          'Conditions : nationalité ivoirienne, Licence + Master dans une spécialité de la discipline, né(e) après le 31/12/1985',
          'Pour Maths et Physique-Chimie : Licence + Maîtrise ou Master dans une spécialité de Maths, Physique ou Chimie, né(e) après le 31/12/1985',
          'Frais : droit de concours 10 000 FCFA + pochette dossier 2 000 FCFA, total 12 000 FCFA',
          'Dossier : fiche de candidature imprimée, extrait de naissance ou jugement supplétif 2025/2026 + original, CNI + original, BAC et diplômes requis + originaux, carte CMU + original, pochette à retirer au Service des Examens et Concours'
        ]
      }
    ]
  },
  {
    id: 'c4',
    title: 'Concours INSFS 2026',
    ministry: 'Affaires Sociales / Emploi',
    type: 'concours',
    level: 'BEPC / BAC / BAC+2',
    deadline: '2026-09-04',
    status: 'Ouvert',
    description: "Institut National Supérieur de Formation Sociale. Filières EPA, EP, MESP et ES.",
    sourceUrl: 'insfs.ciconcours.com',
    fee: '43 500 à 48 500 FCFA',
    details: [
      {
        title: "Filières et conditions d'accès",
        table: {
          headers: ['Filière', 'Durée', 'Diplôme requis', 'Âge au 31/12/2026'],
          rows: [
            ['Éducateur Préscolaire Adjoint EPA', '2 ans', 'BEPC ou CAP Sanitaire et Social', '18 à 36 ans'],
            ['Éducateur Préscolaire EP', '3 ans', 'BAC ou BT Sciences Médico-Sociales', '18 à 36 ans'],
            ["Maître d'Éducation Spécialisée MESP", '3 ans', 'BAC ou BT Sciences Médico-Sociales', '18 à 36 ans'],
            ['Éducateur Spécialisé ES', '2 ans', 'BAC+2 : DEUG2, DUEL2, DUT, Licence2, BTS', '18 à 36 ans']
          ]
        },
        note: "L'admissibilité au BTS n'est pas acceptée. Pour Licence 2, une attestation de réussite ou un relevé de notes est requis."
      },
      {
        title: "Frais d'inscription 2026",
        table: {
          headers: ['Concours', 'Frais visite médicale', 'Frais inscription', 'Total'],
          rows: [
            ['EPA', '33 000 FCFA unique', '10 500 FCFA', '43 500 FCFA'],
            ['EP', 'Inclus ci-dessus', '12 500 FCFA', '45 500 FCFA'],
            ['MESP', 'Inclus ci-dessus', '12 500 FCFA', '45 500 FCFA'],
            ['ES', 'Inclus ci-dessus', '15 500 FCFA', '48 500 FCFA']
          ]
        },
        note: 'Les frais de visite médicale sont payables une seule fois même si le candidat s inscrit à plusieurs concours. Paiement uniquement via TrésorPay-TrésorMoney.'
      },
      {
        title: 'Calendrier 2026',
        table: {
          headers: ['Étape', 'Période'],
          rows: [
            ['Préinscriptions en ligne', '11 mai au 04 septembre 2026'],
            ['Visite médicale à jeun', "19 mai au 09 septembre 2026 à l'INSFS"],
            ['Dépôt physique des dossiers', "25 mai au 14 septembre 2026 à l'INSFS"],
            ['Épreuves écrites MESP', 'Samedi 03 octobre 2026'],
            ['Épreuves écrites ES', 'Dimanche 04 octobre 2026'],
            ['Épreuves écrites EP', 'Samedi 10 octobre 2026'],
            ['Épreuves écrites EPA', 'Dimanche 11 octobre 2026']
          ]
        }
      },
      {
        title: 'Dossier à fournir',
        content: [
          "Extrait d'acte de naissance ou jugement supplétif de moins de 1 an + original",
          'Certificat de nationalité ivoirienne de moins de 5 ans + original',
          'Casier judiciaire de moins de 3 mois, original',
          'Certificat de visite médicale délivré par les médecins agréés INSFS',
          'Diplôme ou titre exigé légalisé de moins de 1 an + original',
          "Carte CMU ou récépissé d'enrôlement + original",
          "CNI, récépissé CNI ou attestation d'identité valide + original",
          'Tous les reçus de paiement des droits'
        ]
      },
      {
        title: 'Site web officiel',
        content: ['Inscription et informations : https://insfs.ciconcours.com', "Adresse de l'institut : Cocody Mermoz, Abidjan"]
      }
    ]
  },
  {
    id: 'c6',
    title: 'Fonction Publique MEMFPMA / ENA 2026',
    ministry: 'Fonction Publique et Modernisation de l Administration',
    type: 'concours',
    level: 'CEPE à BAC+5',
    deadline: '2026-05-08',
    status: 'Fermé',
    description: "Concours administratifs de la Fonction Publique et École Nationale d'Administration. Inscriptions closes, convocations disponibles.",
    sourceUrl: 'gucaci.ciconcours.com',
    fee: 'Non précisé',
    details: [
      {
        title: 'Situation 2026',
        content: ['Le portail regroupe la Direction des Concours du MEMFPMA et l ENA.', 'Les inscriptions sont closes depuis le 08/05/2026.', 'Les convocations aux épreuves sont disponibles depuis le 10/06/2026.']
      },
      {
        title: 'Types de concours MEMFPMA',
        table: {
          headers: ['Type', 'Qui peut candidater'],
          rows: [
            ['Concours Direct', "Personnes non fonctionnaires titulaires d'un diplôme général, technique ou professionnel : CEPE, BEPC, BEP, CAP, BAC, BT, BTS, DUT"],
            ['Concours Recrutement', "Personnes non fonctionnaires titulaires d'un diplôme de qualification : CAP, BT, BTS, DUT, Licence, Master, Ingénieur"],
            ['Concours Professionnel', "Fonctionnaires en activité remplissant les conditions d'ancienneté"],
            ['Concours Professionnel Exceptionnel', 'Fonctionnaires en activité avec ancienneté + diplôme du grade visé'],
            ['Concours Agents de Santé', 'Agents de santé issus de l INFAS ou de facultés de médecine'],
            ['Concours Diaspora', "Ivoiriens résidant hors de Côte d'Ivoire titulaires du diplôme de fin de formation"],
            ['Concours Recrutement Exceptionnel National', 'Ivoiriens résidant sur le territoire national titulaires du diplôme requis'],
            ['Concours Recrutement Exceptionnel Spécifique', 'Agents contractuels en service dans le ministère visé avec ancienneté et attestation de travail DRH']
          ]
        }
      },
      {
        title: 'Dispositions avant inscription',
        content: [
          "Vérifier les conditions figurant sur le communiqué ou l'arrêté d'ouverture du concours visé",
          'Disposer d un compte Mobile Money Orange ou MTN, Wave ou Trésor Pay avec fonds suffisants',
          "Avoir une pièce d'identité valide : CNI ou passeport",
          'Avoir un extrait de naissance valide',
          "Pour diplôme étranger : fournir le diplôme + l'équivalence reconnue",
          "Disposer d'un document prouvant l'enrôlement à la CMU : carte ou récépissé"
        ],
        note: "Tous les paiements se font uniquement dans l'espace candidat. Le téléphone et tout moyen de communication sont interdits sur le site de composition."
      },
      {
        title: 'Informations ENA',
        content: ['Les convocations pour la phase d admissibilité sont disponibles.', 'Les candidats dont les dossiers ont été validés peuvent les consulter dans leur espace candidat.', 'Présence en salle au plus tard à 07h00 avec convocation et CNI ou passeport valide.']
      },
      {
        title: 'Sites web officiels',
        content: ['Guichet unique des concours : https://gucaci.ciconcours.com', "Ministère de la Fonction Publique : https://www.fonctionpublique.gouv.ci", "École Nationale d'Administration : https://ena.ci"]
      }
    ]
  },
  {
    id: 'c7',
    title: 'Concours Défense / Gendarmerie 2026',
    ministry: 'Défense',
    type: 'concours',
    level: 'Variable par corps',
    deadline: '2026-06-14',
    status: 'Fermé',
    description: "Concours d'entrée dans les Écoles Militaires et de Gendarmerie. Résultats d'admissibilité disponibles pour la Gendarmerie.",
    sourceUrl: 'defense.ciconcours.net',
    fee: 'Non précisé',
    details: [
      {
        title: 'Situation 2026',
        content: ['Les inscriptions sont closes.', "Les résultats d'admissibilité pour les concours de Gendarmerie sont disponibles.", 'Les candidats admissibles doivent payer les frais de visite médicale depuis leur espace candidat.']
      },
      {
        title: 'Dispositions avant inscription',
        content: [
          "Vérifier les conditions figurant sur le communiqué ou l'arrêté d'ouverture",
          'Disposer d un compte Mobile Money Orange ou MTN, ou Wave avec fonds suffisants',
          "Avoir une pièce d'identité valide",
          "Avoir une copie intégrale de l'acte de naissance",
          "Disposer d'un document CMU : carte d'assuré ou récépissé d'enrôlement"
        ]
      },
      {
        title: 'Procédure et phases du concours',
        content: [
          'Inscription et paiement en ligne des frais de dossier + prise de rendez-vous + impression de la fiche',
          'Admissibilité, résultats disponibles pour la Gendarmerie',
          'Visite médicale après admissibilité avec paiement en ligne des frais',
          "Dépôt de dossier et prise de vue. Pour les filles Gendarmerie : retrait de l'avis d'engagement du 06 au 14 juillet 2026"
        ],
        note: "Tous les paiements se font uniquement dans l'espace candidat. La Fiche de Renseignements Modèle 1 et la Déclaration sur l'Honneur 2026 sont disponibles sur defense.ciconcours.net."
      },
      {
        title: 'Site web officiel',
        content: ['Inscription et informations : https://defense.ciconcours.net', "Téléchargement des formulaires officiels (Fiche Modèle 1, Déclaration sur l'Honneur)"]
      }
    ]
  },
  {
    id: 'c8',
    title: 'Concours Police Nationale ENP',
    ministry: 'Intérieur et Sécurité',
    type: 'concours',
    level: 'Variable par grade',
    deadline: '2024-10-04',
    status: 'Fermé',
    description: "École Nationale de Police. Session 2024 : lauréats en cours de convocation pour intégrer les écoles de formation.",
    sourceUrl: 'police.ciconcours.com',
    fee: 'Non précisé',
    details: [
      {
        title: 'Situation affichée sur le site',
        content: ['Le site affiche la session 2024.', 'Les lauréats sont en cours de convocation pour intégrer les écoles de formation à Abidjan et Korhogo.', 'Le 2ème rassemblement est prévu le 23 juin 2025.']
      },
      {
        title: 'Concours Directs disponibles',
        table: {
          headers: ['Grade', 'Période inscription', 'Dépôt dossiers'],
          rows: [
            ['Commissaires de Police', '10/06/2024 au 24/07/2024', '08/07/2024 au 13/09/2024'],
            ['Officiers de Police', '10/06/2024 au 04/10/2024', '08/07/2024 au 04/10/2024'],
            ['Sous-Officiers de Police', '10/06/2024 au 01/10/2024', '08/07/2024 au 23/10/2024']
          ]
        }
      },
      {
        title: "Procédure d'inscription",
        content: [
          'Inscription et paiement en ligne via Orange Money ou MTN Mobile Money + impression de la fiche de candidature',
          'Prise de vue numérique et dépôt physique du dossier complet',
          'Visite médicale après validation du dossier avec paiement en ligne des frais de visite',
          'Épreuves sportives pour les candidats déclarés aptes à la visite médicale',
          'Compositions écrites pour les candidats aptes aux épreuves sportives'
        ],
        note: "Le certificat de position militaire n'est plus exigé pour être candidat aux concours de la Police Nationale."
      },
      {
        title: 'Dispositions avant inscription',
        content: ['Vérifier les conditions de candidature sur le communiqué d ouverture', 'Disposer d un compte Mobile Money Orange, MTN ou Wave avec fonds suffisants', "Avoir une pièce d'identité valide"]
      },
      {
        title: 'Site web officiel',
        content: ['Inscription et informations : https://police.ciconcours.com', "Convocations et résultats accessibles depuis l'espace candidat"]
      }
    ]
  },
  {
    id: 'c9',
    title: 'Concours INJS 2025',
    ministry: 'Jeunesse et Sports',
    type: 'concours',
    level: 'BAC 2021-2025',
    deadline: '2025-10-10',
    status: 'Fermé',
    description: "Institut National de la Jeunesse et du Sport. Préinscriptions session 2025, condition générale de 18 à 30 ans.",
    sourceUrl: 'concours.injsabidjan.com',
    fee: 'Frais visite via TrésorPay',
    details: [
      {
        title: 'Présentation',
        content: ['Les inscriptions pour la session 2025 se sont déroulées du 04 août au 10 octobre 2025.', 'Condition générale : avoir entre 18 et 30 ans au 31/12/2025.', 'Ne pas avoir de tatouage sur le corps.']
      },
      {
        title: 'Concours disponibles',
        table: {
          headers: ['Concours', 'Diplôme requis', 'Âge'],
          rows: [
            ['Professeur de Collège EPS PC-EPS', 'BAC 2021-2025 toutes séries', '18 à 30 ans'],
            ['Professeur de Collège Éducation Permanente PC-EP', 'BAC 2021-2025 toutes séries', '18 à 30 ans'],
            ['Professeur de Collège Éducation Permanente Entrepreneuriat PC-EP-ENT', 'BAC G2 2021-2025 ou BAC + BTS Gestion/Finance/Transport ou BAC + Licence Sciences de Gestion 2021-2025', '18 à 30 ans'],
            ['Professeur de Collège Sport PC-PS', "BAC 2021-2025 toutes séries + pratique d'une discipline sportive", '18 à 30 ans']
          ]
        },
        note: 'Disciplines sportives acceptées pour PC-PS : Basketball, Football, Handball, Volleyball, Athlétisme, Judo, Natation, Taekwondo.'
      },
      {
        title: 'Procédure en 4 étapes',
        content: [
          'Lire le communiqué officiel disponible sur concours.injsabidjan.com',
          'Passer la visite médicale : paiement des frais sur pay.tresor.gouv.ci puis visite au Centre de Médecine du Sport CMS de l INJS',
          'Choisir le ou les concours uniquement après avoir été déclaré apte à la visite médicale',
          'Déposer le dossier physique à l INJS + imprimer les reçus de paiement en 3 exemplaires'
        ]
      },
      {
        title: 'Dossier à fournir',
        content: [
          "Fiche d'inscription imprimée depuis l'espace candidat",
          "Demande d'inscription adressée au Directeur Général de l'INJS",
          'Certificat de visite médicale du Centre de Médecine du Sport INJS',
          "Reçus de paiement des frais d'inscription en 3 exemplaires imprimés depuis pay.tresor.gouv.ci",
          "Certificat de nationalité et casier judiciaire, pouvant être fournis plus tard en cas d'admission définitive",
          "Pour PC-PS : justificatif de pratique d'une discipline sportive agréée"
        ],
        note: 'Tous les paiements se font uniquement en ligne. La visite médicale comprend une radio pulmonaire contre-indiquée pour les femmes enceintes.'
      },
      {
        title: 'Sites web officiels',
        content: ['Inscription : https://concours.injsabidjan.com', 'Paiement en ligne : https://pay.tresor.gouv.ci', 'Site institutionnel : https://www.injsabidjan.com']
      }
    ]
  },
  {
    id: 'c5',
    title: 'Concours CAFOP 2026',
    ministry: 'Éducation Nationale',
    type: 'concours',
    level: 'BEPC',
    deadline: '2026-02-18',
    status: 'Fermé',
    description: "Centre d'Animation et de Formation Pédagogique. La plateforme CAFOP gère la visite médicale obligatoire préalable au concours d'instituteur.",
    sourceUrl: 'cafop.ciconcours.com',
    fee: '28 000 FCFA + 2 000 FCFA photo',
    details: [
      {
        title: 'Présentation',
        content: ['Le site CAFOP gère uniquement la visite médicale obligatoire VME.', "Le concours principal d'instituteur nécessite d'abord de passer et valider cette visite médicale via le site de la DMOSS : www.dmoss-ci.net."]
      },
      {
        title: 'Conditions de candidature',
        content: ['Être de nationalité ivoirienne', "Être titulaire du Brevet d'Étude du Premier Cycle BEPC", 'Avoir entre 18 et 38 ans au 31 décembre 2026']
      },
      {
        title: 'Frais de la visite médicale',
        content: ['Frais de visite médicale : 28 000 FCFA', 'Paiement uniquement via Orange Money, MTN Money ou Wave Money sur www.dmoss-ci.net', 'Prévoir 2 000 FCFA pour la photo numérique le jour de la visite']
      },
      {
        title: 'Calendrier de la visite médicale 2026',
        table: {
          headers: ['Ville / Site', 'Lieu', 'Période'],
          rows: [
            ['Abidjan', 'École de Police', '05 janvier au 27 février 2026'],
            ['Yamoussoukro', 'CAFOP Supérieur', '12 janvier au 20 février 2026'],
            ['Korhogo', 'CAFOP Supérieur', '26 janvier au 20 février 2026']
          ]
        }
      },
      {
        title: 'Calendrier des inscriptions et attestations',
        table: {
          headers: ['Étape', 'Période'],
          rows: [
            ['Inscription et paiement en ligne sur DMOSS', '08 décembre 2025 au 18 février 2026'],
            ['Mise en ligne attestations Abidjan', '08 janvier au 02 mars 2026'],
            ['Mise en ligne attestations Yamoussoukro', '15 janvier au 27 février 2026'],
            ['Mise en ligne attestations Korhogo', '29 janvier au 27 février 2026']
          ]
        }
      },
      {
        title: 'Procédure complète',
        content: [
          'Phase 1 en ligne sur www.dmoss-ci.net : inscription en ligne, paiement des frais, prise de rendez-vous, impression des documents',
          "Documents à imprimer : fiche d'inscription + bulletins de consultation Ophtalmologie, ORL, Radiologie, Biologie, Examen clinique et Visa de passage",
          'Phase 2 le jour du rendez-vous : Photo Numérique, Biologie, Radiologie, Ophtalmologie, ORL, Examen Clinique'
        ]
      },
      {
        title: 'Consignes importantes',
        content: [
          'Se présenter à jeun dès 07h00 le jour du rendez-vous',
          "Avoir une pièce d'identité valide avec photo : CNI, attestation ou passeport",
          "Avoir une preuve d'enrôlement à la CMU",
          'Prévoir 2 000 FCFA pour la photo numérique sur site',
          'Déposer le Visa de passage à l atelier Dépôt Visa en fin de visite',
          'Consulter son espace candidat après 5 jours ouvrables pour le résultat',
          "Aucun remboursement ni remplacement en cas de désistement. Si APTE : imprimer l'Attestation d'Aptitude à la fonction enseignante. Si EN ATTENTE : se rendre au Secrétariat Médical."
        ]
      },
      {
        title: 'Sites web officiels',
        content: ['Inscription et paiement : https://www.dmoss-ci.net', 'Suivi visite médicale CAFOP : https://cafop.ciconcours.com', "Ministère de l'Éducation : https://www.education.gouv.ci"]
      }
    ]
  },
  ...mockJobs
];

// Anciennes données d'emploi retirées au profit de mockJobs (voir src/jobs.ts).
const _removedLegacyJobs: unknown[] = [];
void _removedLegacyJobs;

const _archivedJobsOld = [
  {
    id: 'e2',
    title: 'Conseillers Emploi Jeunes',
    ministry: 'Emploi et insertion',
    type: 'emploi',
    level: 'BAC+2 / BAC+3',
    deadline: '2026-07-30',
    status: 'Ouvert',
    description: "Recrutement de conseillers pour l'accueil, l'orientation et le suivi des jeunes demandeurs d'emploi.",
    sourceUrl: 'agenceemploijeunes.ci',
    company: 'Agence Emploi Jeunes',
    location: 'Abidjan, Bouaké, Korhogo, Daloa',
    contractType: 'CDD',
    experience: '1 an en accompagnement ou insertion souhaité',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Accueillir et orienter les demandeurs d emploi', 'Aider à la rédaction de CV et lettres de motivation', 'Suivre les placements en stage, apprentissage ou emploi']
      },
      {
        title: 'Profil recherché',
        content: ['BAC+2 minimum en ressources humaines, psychologie, droit, communication ou gestion', 'Bonne capacité d écoute et de conseil', 'Maîtrise des outils bureautiques']
      },
      {
        title: 'Dossier de candidature',
        content: ['CV', 'Lettre de motivation', 'Copies des diplômes', 'CNI ou attestation d identité']
      }
    ]
  },
  {
    id: 'e3',
    title: 'Commerciaux Terrain - Grande Distribution',
    ministry: 'Commerce et distribution',
    type: 'emploi',
    level: 'BAC+2 commerce',
    deadline: '2026-08-10',
    status: 'Ouvert',
    description: "Prospection, vente terrain, animation de portefeuille clients et remontée des informations commerciales.",
    sourceUrl: 'rmo-jobcenter.com',
    company: 'RMO Côte d Ivoire pour un client grande distribution',
    location: 'Abidjan et intérieur du pays',
    contractType: 'CDI / CDD selon profil',
    experience: '1 à 2 ans en vente terrain souhaité',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Prospecter les points de vente et développer le portefeuille client', 'Assurer la disponibilité des produits', 'Remonter les informations terrain et les actions concurrentes']
      },
      {
        title: 'Profil recherché',
        content: ['BAC+2 en commerce, marketing ou gestion', 'Expérience commerciale souhaitée', 'Goût du terrain et sens du résultat']
      },
      {
        title: 'Dossier de candidature',
        content: ['CV détaillé', 'Lettre de motivation', 'Copie du diplôme', 'Références professionnelles si disponibles']
      }
    ]
  },
  {
    id: 'e4',
    title: 'Assistants Administratifs et RH',
    ministry: 'Administration et ressources humaines',
    type: 'emploi',
    level: 'BTS / Licence',
    deadline: '2026-08-18',
    status: 'Bientôt',
    description: "Recrutement d'assistants administratifs pour appuyer la gestion du personnel, le classement et le suivi des dossiers.",
    sourceUrl: 'rmo-jobcenter.com',
    company: 'RMO Côte d Ivoire pour un client tertiaire',
    location: 'Abidjan',
    contractType: 'CDD renouvelable',
    experience: '6 mois à 1 an en assistanat souhaité',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Préparer et classer les dossiers administratifs', 'Suivre les contrats, absences et documents RH', 'Assurer l accueil téléphonique et physique']
      },
      {
        title: 'Profil recherché',
        content: ['BTS ou Licence en RH, assistanat, gestion ou droit', 'Bonne maîtrise de Word, Excel et Outlook', 'Discrétion et sens de l organisation']
      },
      {
        title: 'Dossier de candidature',
        content: ['CV', 'Lettre de motivation', 'Diplômes et attestations de travail']
      }
    ]
  },
  {
    id: 'e5',
    title: 'Développeurs Web Junior',
    ministry: 'Technologie et digital',
    type: 'emploi',
    level: 'BAC+2 / BAC+3 informatique',
    deadline: '2026-09-05',
    status: 'Ouvert',
    description: "Développement d'interfaces web, intégration API et maintenance applicative pour une équipe produit basée à Abidjan.",
    sourceUrl: 'linkedin.com/jobs/cote-divoire',
    company: 'Entreprise Tech à Abidjan',
    location: 'Abidjan / hybride possible',
    contractType: 'CDI junior',
    experience: 'Stage ou premier emploi accepté',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Développer des interfaces web responsive', 'Intégrer des API REST', 'Corriger les bugs et participer aux tests fonctionnels']
      },
      {
        title: 'Profil recherché',
        content: ['BAC+2 ou BAC+3 en informatique', 'Bases solides en HTML, CSS, JavaScript et React', 'Git et notions API REST appréciés']
      },
      {
        title: 'Dossier de candidature',
        content: ['CV', 'Portfolio ou lien GitHub si disponible', 'Lettre de motivation courte']
      }
    ]
  },
  {
    id: 'e6',
    title: 'Chargés Clientèle Mobile Money',
    ministry: 'Télécoms et fintech',
    type: 'emploi',
    level: 'BAC+2',
    deadline: '2026-08-25',
    status: 'Ouvert',
    description: "Traitement des réclamations, accompagnement des utilisateurs Mobile Money et suivi des incidents clients.",
    sourceUrl: 'linkedin.com/jobs/cote-divoire',
    company: 'Opérateur télécom ou fintech partenaire',
    location: 'Abidjan',
    contractType: 'CDD / CDI',
    experience: 'Expérience relation client appréciée',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Traiter les réclamations clients', 'Accompagner les utilisateurs Mobile Money', 'Suivre les incidents et remonter les anomalies']
      },
      {
        title: 'Profil recherché',
        content: ['BAC+2 en commerce, banque, assurance, gestion ou communication', 'Excellent relationnel', 'Bonne expression orale et écrite']
      },
      {
        title: 'Dossier de candidature',
        content: ['CV', 'Lettre de motivation', 'Copie du diplôme', 'CNI ou attestation']
      }
    ]
  },
  {
    id: 'e7',
    title: 'Agents de Guichet Banque et Microfinance',
    ministry: 'Banque et microfinance',
    type: 'emploi',
    level: 'BAC+2 banque / finance',
    deadline: '2026-09-12',
    status: 'Bientôt',
    description: "Accueil clientèle, opérations courantes de guichet, conformité des pièces et suivi qualité de service.",
    sourceUrl: 'pages carrières entreprises CI',
    company: 'Banque ou microfinance partenaire',
    location: 'Abidjan et agences régionales',
    contractType: 'CDD avec possibilité CDI',
    experience: 'Débutant accepté, stage caisse apprécié',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Accueillir et orienter les clients', 'Réaliser les opérations courantes de guichet', 'Assurer la conformité des pièces et la qualité de service']
      },
      {
        title: 'Profil recherché',
        content: ['BAC+2 en banque, finance, comptabilité ou gestion', 'Rigueur, honnêteté et sens du service', 'Une première expérience en caisse est un atout']
      }
    ]
  },
  {
    id: 'e8',
    title: 'Techniciens Maintenance Électricité',
    ministry: 'Industrie et énergie',
    type: 'emploi',
    level: 'BT / BTS électrotechnique',
    deadline: '2026-09-20',
    status: 'Ouvert',
    description: "Maintenance préventive et corrective, diagnostic de pannes électriques et application des procédures HSE.",
    sourceUrl: 'pages carrières entreprises CI',
    company: 'Entreprise industrielle ou énergie',
    location: 'Abidjan / zones industrielles',
    contractType: 'CDI / mission technique',
    experience: '1 an en maintenance souhaité',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Assurer la maintenance préventive et corrective', 'Diagnostiquer les pannes électriques', 'Respecter les procédures HSE et rédiger les rapports d intervention']
      },
      {
        title: 'Profil recherché',
        content: ['BT ou BTS électrotechnique, maintenance industrielle ou équivalent', 'Lecture de schémas électriques', 'Disponibilité pour travail en horaires décalés']
      }
    ]
  },
  {
    id: 'e9',
    title: 'Comptables Juniors',
    ministry: 'Comptabilité et finance',
    type: 'emploi',
    level: 'BTS / Licence comptabilité',
    deadline: '2026-08-29',
    status: 'Ouvert',
    description: "Offres entreprises et cabinets : saisie comptable, rapprochements bancaires, déclarations fiscales et archivage.",
    sourceUrl: 'pages carrières entreprises CI',
    company: 'PME ou cabinet comptable à Abidjan',
    location: 'Abidjan',
    contractType: 'Stage pré-emploi / CDD',
    experience: 'Débutant accepté',
    refreshFrequency: 'Toutes les 6 heures',
    details: [
      {
        title: 'Missions principales',
        content: ['Saisir les pièces comptables', 'Effectuer les rapprochements bancaires', 'Préparer les déclarations fiscales sous supervision']
      },
      {
        title: 'Profil recherché',
        content: ['BTS ou Licence en comptabilité, finance ou audit', 'Maîtrise d Excel', 'Notions SYSCOHADA appréciées']
      },
      {
        title: 'Dossier de candidature',
         content: ['CV', 'Lettre de motivation', 'Diplômes', 'Attestations de stage ou emploi']
      }
    ]
  }
];
void _archivedJobsOld;

export interface MonitoredSource {
  name: string;
  category: 'emploi' | 'concours' | 'mixte';
  refreshFrequency: string;
}

export const monitoredSources: MonitoredSource[] = [
  { name: 'Agence Emploi Jeunes', category: 'emploi', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'RMO Job Center Côte d Ivoire', category: 'emploi', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'LinkedIn Jobs Côte d Ivoire', category: 'emploi', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'Go Africa Online', category: 'emploi', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'Pages carrières des entreprises en Côte d Ivoire', category: 'emploi', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'Fonction Publique / GUCACI', category: 'concours', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'INFAS, INFJ, ENS, INSFS, CAFOP, AFA, EMPT, Police, Défense, INJS', category: 'concours', refreshFrequency: 'Toutes les 6 heures' },
  { name: 'SIVOP et Journal Officiel', category: 'mixte', refreshFrequency: 'Toutes les 6 heures' }
];

export interface PastPaper {
  id: string;
  concours: string;
  year: number;
  title: string;
  price: number;
  documentUrl?: string;
}

export const mockPastPapers: PastPaper[] = [
  {
    id: 'p1',
    concours: 'INFAS',
    year: 2025,
    title: 'Sujets INFAS - Concours Direct Infirmiers et Sages-Femmes',
    price: 1000,
    documentUrl: '/documents/infas-2025.pdf'
  },
  {
    id: 'p2',
    concours: 'Fonction Publique',
    year: 2025,
    title: 'Sujets de Culture Générale - Concours Administratifs',
    price: 1000,
    documentUrl: '/documents/ordre-general-2024.pdf'
  },
  {
    id: 'p3',
    concours: 'CAFOP',
    year: 2024,
    title: 'Sujets CAFOP - Mathématiques et Français',
    price: 1000,
    documentUrl: '/documents/cafop-2024.pdf'
  },
  {
    id: 'p4',
    concours: 'ENS Abidjan',
    year: 2023,
    title: 'Sujets ENS - CAP-PC et CAP-PL toutes filières',
    price: 1000,
    documentUrl: '/documents/ens-2023.pdf'
  }
];