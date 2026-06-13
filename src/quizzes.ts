export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  concours: string;
  subject: string;
  level: string;
  duration: number; // minutes
  color: string; // tailwind classe ou code couleur
  icon: string; // emoji
  description: string;
  questions: QuizQuestion[];
}

export const mockQuizzes: Quiz[] = [
  // ============================================================
  // CULTURE GÉNÉRALE - Concours Fonction Publique
  // ============================================================
  {
    id: 'q1',
    title: "Culture Générale - Côte d'Ivoire",
    concours: 'Fonction Publique / ENA',
    subject: 'Culture Générale',
    level: 'BAC à BAC+5',
    duration: 10,
    color: 'blue',
    icon: '🇨🇮',
    description: "Testez vos connaissances sur l'histoire, la géographie et les institutions de la Côte d'Ivoire.",
    questions: [
      {
        id: 'q1-1',
        question: "En quelle année la Côte d'Ivoire a-t-elle obtenu son indépendance ?",
        options: ['1958', '1960', '1962', '1965'],
        correctIndex: 1,
        explanation: "La Côte d'Ivoire a obtenu son indépendance le 7 août 1960 sous la présidence de Félix Houphouët-Boigny."
      },
      {
        id: 'q1-2',
        question: "Quelle est la capitale politique de la Côte d'Ivoire ?",
        options: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo'],
        correctIndex: 2,
        explanation: "Yamoussoukro est la capitale politique depuis 1983. Abidjan reste la capitale économique."
      },
      {
        id: 'q1-3',
        question: "Qui est le premier Président de la République de Côte d'Ivoire ?",
        options: ['Henri Konan Bédié', 'Félix Houphouët-Boigny', 'Laurent Gbagbo', 'Alassane Ouattara'],
        correctIndex: 1,
        explanation: "Félix Houphouët-Boigny a été le premier Président de 1960 à 1993."
      },
      {
        id: 'q1-4',
        question: "Combien de régions administratives compte la Côte d'Ivoire ?",
        options: ['19', '24', '31', '33'],
        correctIndex: 2,
        explanation: "La Côte d'Ivoire compte 31 régions regroupées en 14 districts depuis le découpage de 2011."
      },
      {
        id: 'q1-5',
        question: "Quel est le principal produit d'exportation de la Côte d'Ivoire ?",
        options: ['Le café', 'Le cacao', "L'hévéa", 'Le pétrole'],
        correctIndex: 1,
        explanation: "La Côte d'Ivoire est le premier producteur mondial de cacao avec plus de 40% de la production mondiale."
      },
      {
        id: 'q1-6',
        question: "Quelle institution est chargée de l'organisation des concours administratifs ?",
        options: ["MEMFPMA / ENA", "Ministère de l'Économie", "INFAS", "ANPE"],
        correctIndex: 0,
        explanation: "Le MEMFPMA (Ministère de l'Emploi, de la Modernisation et de la Fonction Publique) avec l'ENA organisent les concours administratifs."
      },
      {
        id: 'q1-7',
        question: "Quel fleuve traverse la ville d'Abidjan ?",
        options: ['Le Sassandra', 'Le Bandama', 'La Comoé', "Le N'Zi"],
        correctIndex: 2,
        explanation: "La Comoé est le fleuve qui traverse la région d'Abidjan avant de se jeter dans la lagune Ébrié."
      },
      {
        id: 'q1-8',
        question: "Qui est l'auteur du livre 'Les Soleils des Indépendances' ?",
        options: ['Bernard Dadié', 'Ahmadou Kourouma', 'Camara Laye', 'Tierno Monénembo'],
        correctIndex: 1,
        explanation: "Ahmadou Kourouma, écrivain ivoirien, a publié 'Les Soleils des Indépendances' en 1968."
      },
      {
        id: 'q1-9',
        question: "Quelle est la devise de la Côte d'Ivoire ?",
        options: ['Travail-Liberté-Patrie', 'Union-Discipline-Travail', 'Liberté-Égalité-Fraternité', 'Paix-Progrès-Solidarité'],
        correctIndex: 1,
        explanation: "La devise officielle de la Côte d'Ivoire est 'Union - Discipline - Travail'."
      },
      {
        id: 'q1-10',
        question: "Quelle organisation régionale regroupe la Côte d'Ivoire avec ses voisins ouest-africains ?",
        options: ['UA', 'CEDEAO', 'UEMOA', 'CEDEAO et UEMOA'],
        correctIndex: 3,
        explanation: "La Côte d'Ivoire est membre à la fois de la CEDEAO (15 États) et de l'UEMOA (8 États ayant le FCFA en commun)."
      }
    ]
  },
  // ============================================================
  // MATHÉMATIQUES - Concours CAFOP, INFAS, etc.
  // ============================================================
  {
    id: 'q2',
    title: 'Mathématiques - Niveau BEPC',
    concours: 'CAFOP / INFAS / Fonction Publique',
    subject: 'Mathématiques',
    level: 'BEPC à BAC',
    duration: 15,
    color: 'orange',
    icon: '🔢',
    description: "Quiz de mathématiques pour préparer les concours d'entrée niveau BEPC à BAC.",
    questions: [
      {
        id: 'q2-1',
        question: "Combien font 15% de 240 ?",
        options: ['24', '32', '36', '40'],
        correctIndex: 2,
        explanation: "15% de 240 = (15 × 240) / 100 = 36."
      },
      {
        id: 'q2-2',
        question: "Quelle est la racine carrée de 144 ?",
        options: ['10', '11', '12', '14'],
        correctIndex: 2,
        explanation: "√144 = 12 car 12 × 12 = 144."
      },
      {
        id: 'q2-3',
        question: "Si x + 7 = 19, que vaut x ?",
        options: ['10', '12', '14', '16'],
        correctIndex: 1,
        explanation: "x = 19 - 7 = 12."
      },
      {
        id: 'q2-4',
        question: "Quelle est l'aire d'un rectangle de longueur 8 cm et de largeur 5 cm ?",
        options: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'],
        correctIndex: 2,
        explanation: "Aire = Longueur × largeur = 8 × 5 = 40 cm²."
      },
      {
        id: 'q2-5',
        question: "Combien font 3/4 de 80 ?",
        options: ['40', '50', '60', '70'],
        correctIndex: 2,
        explanation: "3/4 × 80 = 240/4 = 60."
      },
      {
        id: 'q2-6',
        question: "Quel est le périmètre d'un carré de côté 7 cm ?",
        options: ['14 cm', '21 cm', '28 cm', '49 cm'],
        correctIndex: 2,
        explanation: "Périmètre = 4 × côté = 4 × 7 = 28 cm."
      },
      {
        id: 'q2-7',
        question: "Quelle est la valeur de 2³ + 3² ?",
        options: ['11', '13', '17', '25'],
        correctIndex: 2,
        explanation: "2³ = 8 et 3² = 9, donc 8 + 9 = 17."
      },
      {
        id: 'q2-8',
        question: "Convertir 0,75 en fraction simple :",
        options: ['1/2', '2/3', '3/4', '4/5'],
        correctIndex: 2,
        explanation: "0,75 = 75/100 = 3/4 après simplification."
      },
      {
        id: 'q2-9',
        question: "Combien y a-t-il de degrés dans un triangle ?",
        options: ['90°', '180°', '270°', '360°'],
        correctIndex: 1,
        explanation: "La somme des angles d'un triangle est toujours 180°."
      },
      {
        id: 'q2-10',
        question: "Si une voiture roule à 60 km/h pendant 2h30, quelle distance parcourt-elle ?",
        options: ['120 km', '130 km', '150 km', '180 km'],
        correctIndex: 2,
        explanation: "Distance = vitesse × temps = 60 × 2,5 = 150 km."
      }
    ]
  },
  // ============================================================
  // FRANÇAIS / ORTHOGRAPHE
  // ============================================================
  {
    id: 'q3',
    title: 'Français - Orthographe et Grammaire',
    concours: 'Tous concours',
    subject: 'Français',
    level: 'BEPC à BAC',
    duration: 10,
    color: 'purple',
    icon: '📝',
    description: "Maîtrisez l'orthographe, la grammaire et la conjugaison pour réussir vos épreuves de français.",
    questions: [
      {
        id: 'q3-1',
        question: "Quelle phrase est correctement orthographiée ?",
        options: [
          "Les enfants qu'elle a vus jouer.",
          "Les enfants qu'elle a vu jouer.",
          "Les enfants qu'elle à vus jouer.",
          "Les enfants qu'elle a vue jouer."
        ],
        correctIndex: 1,
        explanation: "Le participe passé 'vu' suivi d'un infinitif reste invariable quand le COD ne fait pas l'action de l'infinitif. Ici les enfants jouent, donc on accorde : 'vus'. Toutefois, la règle moderne acceptée est l'invariabilité dans ce cas. Réponse acceptée : 'vu'."
      },
      {
        id: 'q3-2',
        question: "Conjuguez le verbe 'aller' au présent de l'indicatif à la 3e personne du pluriel :",
        options: ['Ils vont', 'Ils allent', 'Ils vontent', 'Ils ont allé'],
        correctIndex: 0,
        explanation: "Le verbe 'aller' est irrégulier : ils/elles vont."
      },
      {
        id: 'q3-3',
        question: "Quel est le synonyme de 'rapide' ?",
        options: ['Lent', 'Vif', 'Lourd', 'Fragile'],
        correctIndex: 1,
        explanation: "'Vif' est un synonyme de 'rapide' (qui agit vite, qui se déplace vite)."
      },
      {
        id: 'q3-4',
        question: "Quelle est la nature grammaticale du mot souligné dans : 'Il marche LENTEMENT' ?",
        options: ['Adjectif', 'Verbe', 'Adverbe', 'Nom commun'],
        correctIndex: 2,
        explanation: "'Lentement' est un adverbe de manière (formé sur l'adjectif 'lent' + suffixe -ment)."
      },
      {
        id: 'q3-5',
        question: "Comment écrit-on correctement ?",
        options: ['Quoi que', 'Quoique', 'Cela dépend du contexte', 'Les deux sont toujours interchangeables'],
        correctIndex: 2,
        explanation: "'Quoique' (en un mot) signifie 'bien que'. 'Quoi que' (en deux mots) signifie 'quelle que soit la chose que'."
      },
      {
        id: 'q3-6',
        question: "Quel est le pluriel correct de 'cheval' ?",
        options: ['Chevaux', 'Chevals', 'Chevauls', 'Cheveaux'],
        correctIndex: 0,
        explanation: "Le pluriel de 'cheval' est 'chevaux' (règle : -al → -aux)."
      },
      {
        id: 'q3-7',
        question: "Conjuguez 'finir' au passé composé à la 1ère personne du singulier :",
        options: ["J'ai fini", 'Je finissais', 'Je finirai', 'Je finis'],
        correctIndex: 0,
        explanation: "Passé composé = auxiliaire 'avoir' au présent + participe passé : 'j'ai fini'."
      },
      {
        id: 'q3-8',
        question: "Identifiez l'antonyme de 'généreux' :",
        options: ['Aimable', 'Avare', 'Doux', 'Grand'],
        correctIndex: 1,
        explanation: "L'antonyme de 'généreux' est 'avare' (qui n'aime pas donner)."
      },
      {
        id: 'q3-9',
        question: "Dans la phrase : 'Marie et Paul sont arrivés', quel est le sujet ?",
        options: ['Marie', 'Paul', 'Marie et Paul', 'Arrivés'],
        correctIndex: 2,
        explanation: "Le sujet est composé : 'Marie et Paul'. C'est pourquoi le verbe est au pluriel."
      },
      {
        id: 'q3-10',
        question: "Quel est l'accord correct ?",
        options: [
          "Les fleurs que j'ai cueilli",
          "Les fleurs que j'ai cueillies",
          "Les fleurs que j'ai cueillis",
          "Les fleurs que j'ai cueillie"
        ],
        correctIndex: 1,
        explanation: "Le participe passé avec 'avoir' s'accorde avec le COD placé avant : 'fleurs' (féminin pluriel) → 'cueillies'."
      }
    ]
  },
  // ============================================================
  // BIOLOGIE / SANTÉ - Concours INFAS
  // ============================================================
  {
    id: 'q4',
    title: 'Biologie et Santé - INFAS',
    concours: 'INFAS',
    subject: 'Biologie / Santé',
    level: 'BAC scientifique',
    duration: 12,
    color: 'green',
    icon: '🩺',
    description: "Quiz de préparation aux épreuves scientifiques du concours INFAS (Infirmiers, Sages-Femmes, TSS).",
    questions: [
      {
        id: 'q4-1',
        question: "Quel organe est responsable de la production de l'insuline ?",
        options: ['Le foie', 'Le pancréas', 'Les reins', 'La rate'],
        correctIndex: 1,
        explanation: "Le pancréas produit l'insuline via les cellules bêta des îlots de Langerhans."
      },
      {
        id: 'q4-2',
        question: "Combien de chromosomes possède une cellule humaine normale ?",
        options: ['23', '46', '48', '92'],
        correctIndex: 1,
        explanation: "Une cellule humaine normale (diploïde) possède 46 chromosomes (23 paires)."
      },
      {
        id: 'q4-3',
        question: "Quelle est la fonction principale des globules rouges ?",
        options: [
          "Combattre les infections",
          "Transporter l'oxygène",
          "Coaguler le sang",
          "Produire des hormones"
        ],
        correctIndex: 1,
        explanation: "Les globules rouges (hématies) transportent l'oxygène des poumons vers les organes grâce à l'hémoglobine."
      },
      {
        id: 'q4-4',
        question: "Quel vaccin protège contre la tuberculose ?",
        options: ['DTC', 'BCG', 'ROR', 'HPV'],
        correctIndex: 1,
        explanation: "Le BCG (Bacille de Calmette et Guérin) est le vaccin contre la tuberculose, généralement administré à la naissance."
      },
      {
        id: 'q4-5',
        question: "Quelle est la durée normale de la grossesse chez la femme ?",
        options: ['36 semaines', '40 semaines', '42 semaines', '45 semaines'],
        correctIndex: 1,
        explanation: "La durée moyenne d'une grossesse est de 40 semaines (soit 9 mois ou 280 jours)."
      },
      {
        id: 'q4-6',
        question: "Quel est l'organe principal de la respiration ?",
        options: ['Le cœur', 'Les poumons', 'Le foie', 'Le diaphragme'],
        correctIndex: 1,
        explanation: "Les poumons sont les organes principaux de la respiration où s'effectuent les échanges gazeux."
      },
      {
        id: 'q4-7',
        question: "Que signifie l'acronyme VIH ?",
        options: [
          "Virus Infectieux Humain",
          "Virus de l'Immunodéficience Humaine",
          "Virus Immunitaire Hépatique",
          "Variation Immunologique Hématologique"
        ],
        correctIndex: 1,
        explanation: "VIH = Virus de l'Immunodéficience Humaine, responsable du SIDA."
      },
      {
        id: 'q4-8',
        question: "Quelle est la tension artérielle normale chez l'adulte (en mmHg) ?",
        options: ['90/60', '120/80', '140/90', '160/100'],
        correctIndex: 1,
        explanation: "La tension artérielle normale est environ 120/80 mmHg (systolique/diastolique)."
      },
      {
        id: 'q4-9',
        question: "Quel nutriment est principalement responsable de la construction musculaire ?",
        options: ['Glucides', 'Lipides', 'Protéines', 'Vitamines'],
        correctIndex: 2,
        explanation: "Les protéines sont les nutriments responsables de la construction et de la réparation des muscles."
      },
      {
        id: 'q4-10',
        question: "Quel est le groupe sanguin donneur universel ?",
        options: ['A+', 'B+', 'AB+', 'O-'],
        correctIndex: 3,
        explanation: "Le groupe O- (O Rhésus négatif) est donneur universel car il ne contient ni antigène A, B ni Rh."
      }
    ]
  },
  // ============================================================
  // LOGIQUE / RAISONNEMENT - Tous concours
  // ============================================================
  {
    id: 'q5',
    title: 'Logique et Raisonnement',
    concours: 'Tous concours (Police, Défense, ENA)',
    subject: 'Logique',
    level: 'BAC à BAC+5',
    duration: 10,
    color: 'pink',
    icon: '🧠',
    description: "Exercez vos capacités de raisonnement logique pour les tests d'aptitude des concours.",
    questions: [
      {
        id: 'q5-1',
        question: "Suite logique : 2, 4, 8, 16, ... ?",
        options: ['20', '24', '32', '64'],
        correctIndex: 2,
        explanation: "Chaque terme est le double du précédent (×2) : 16 × 2 = 32."
      },
      {
        id: 'q5-2',
        question: "Si tous les chats sont des animaux et que Mimi est un chat, alors :",
        options: [
          "Mimi est un animal",
          "Tous les animaux sont des chats",
          "Mimi n'est pas un animal",
          "On ne peut rien conclure"
        ],
        correctIndex: 0,
        explanation: "Par déduction logique (syllogisme) : si tous les chats sont des animaux et que Mimi est un chat, alors Mimi est un animal."
      },
      {
        id: 'q5-3',
        question: "Quel nombre complète la série : 3, 6, 11, 18, 27, ... ?",
        options: ['36', '38', '40', '42'],
        correctIndex: 1,
        explanation: "Les écarts augmentent de 2 à chaque fois : +3, +5, +7, +9, +11 → 27 + 11 = 38."
      },
      {
        id: 'q5-4',
        question: "Si A = 1, B = 2, C = 3..., que vaut le mot 'CAB' ?",
        options: ['6', '7', '8', '9'],
        correctIndex: 0,
        explanation: "C(3) + A(1) + B(2) = 6."
      },
      {
        id: 'q5-5',
        question: "Trouvez l'intrus : Pomme, Banane, Carotte, Orange",
        options: ['Pomme', 'Banane', 'Carotte', 'Orange'],
        correctIndex: 2,
        explanation: "La carotte est l'intrus : c'est un légume, les autres sont des fruits."
      },
      {
        id: 'q5-6',
        question: "Un train part à 14h et arrive à destination à 17h45. Combien de temps a duré le trajet ?",
        options: ['3h15', '3h30', '3h45', '4h15'],
        correctIndex: 2,
        explanation: "De 14h à 17h45 = 3h45 de trajet."
      },
      {
        id: 'q5-7',
        question: "Quel chiffre manque ? 1, 1, 2, 3, 5, 8, ?, 21",
        options: ['11', '13', '14', '16'],
        correctIndex: 1,
        explanation: "C'est la suite de Fibonacci : chaque terme est la somme des deux précédents. 5 + 8 = 13."
      },
      {
        id: 'q5-8',
        question: "Si 5 ouvriers construisent 5 maisons en 5 jours, combien de jours faut-il à 10 ouvriers pour construire 10 maisons ?",
        options: ['2,5 jours', '5 jours', '10 jours', '25 jours'],
        correctIndex: 1,
        explanation: "Le ratio reste le même : 1 ouvrier construit 1 maison en 5 jours, donc 10 ouvriers construisent 10 maisons en 5 jours."
      },
      {
        id: 'q5-9',
        question: "Le contraire de 'jamais' est :",
        options: ['Souvent', 'Toujours', 'Parfois', 'Rarement'],
        correctIndex: 1,
        explanation: "'Jamais' = à aucun moment. Son contraire est 'toujours' = à tout moment."
      },
      {
        id: 'q5-10',
        question: "Si dans le mot 'BOUAKE' on remplace chaque lettre par la précédente de l'alphabet, on obtient :",
        options: ['ANTAID', 'ANTZJD', 'ANZJD', 'ANTZID'],
        correctIndex: 1,
        explanation: "B→A, O→N, U→T, A→Z, K→J, E→D : ANTZJD."
      }
    ]
  }
];
