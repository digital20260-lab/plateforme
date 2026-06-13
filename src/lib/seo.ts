// ============================================================
// SEO dynamique — met à jour <title>, meta description et
// canonical à chaque changement de page (SPA).
// Les moteurs modernes (Google, Bing) exécutent le JS et
// indexent ces valeurs par URL (#listing=…, #faq, etc.).
// ============================================================

const SITE = 'Emploi Concours CI';
const BASE_URL = 'https://emploi-concours.ci/';

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export interface SeoInput {
  title: string;
  description: string;
  path?: string; // ex. '#listing=c1'
}

/** Applique titre + description + OG + canonical pour la page courante. */
export function applySeo({ title, description, path = '' }: SeoInput) {
  const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`;
  const url = BASE_URL + path;

  document.title = fullTitle;
  setMeta('description', description);
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:url', url, true);
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', description);
  setCanonical(url);
}

/** SEO de la page d'accueil. */
export function homeSeo() {
  applySeo({
    title: `${SITE} — Offres d'emploi et concours en Côte d'Ivoire 2026`,
    description:
      "Toutes les offres d'emploi et concours administratifs de Côte d'Ivoire : INFAS, CAFOP, ENA, Police, Fonction Publique. Mise à jour toutes les 6h, alertes email, anciens sujets et quiz gratuits."
  });
}

/** SEO d'une fiche offre/concours — injecte aussi le JSON-LD JobPosting. */
export function listingSeo(listing: {
  id: string;
  title: string;
  type: string;
  description: string;
  company?: string;
  ministry?: string;
  location?: string;
  deadline?: string;
  contractType?: string;
  publishedAt?: string;
}) {
  const org = listing.company || listing.ministry || "Côte d'Ivoire";
  const kind = listing.type === 'concours' ? 'Concours' : "Offre d'emploi";

  applySeo({
    title: `${listing.title} — ${kind} ${listing.location ? 'à ' + listing.location.split(',')[0] : "en Côte d'Ivoire"}`,
    description: `${kind} : ${listing.title} chez ${org}. ${listing.description.slice(0, 140)}…`,
    path: `#listing=${listing.id}`
  });

  // JSON-LD JobPosting (rich result « Offres d'emploi » de Google)
  injectJsonLd('jobposting-ld', listing.type === 'emploi' ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: listing.title,
    description: listing.description,
    datePosted: listing.publishedAt || undefined,
    validThrough: listing.deadline || undefined,
    employmentType: mapContract(listing.contractType),
    hiringOrganization: {
      '@type': 'Organization',
      name: org
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: listing.location || 'Abidjan',
        addressCountry: 'CI'
      }
    }
  } : null);
}

function mapContract(c?: string): string | undefined {
  if (!c) return undefined;
  const v = c.toUpperCase();
  if (v.includes('CDI')) return 'FULL_TIME';
  if (v.includes('CDD')) return 'CONTRACTOR';
  if (v.includes('STAGE')) return 'INTERN';
  if (v.includes('INTÉRIM') || v.includes('INTERIM')) return 'TEMPORARY';
  return 'OTHER';
}

/** Injecte / remplace / supprime un bloc JSON-LD identifié. */
function injectJsonLd(id: string, data: object | null) {
  let el = document.getElementById(id);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** SEO des pages secondaires. */
export const PAGE_SEO: Record<string, SeoInput> = {
  faq: {
    title: 'FAQ — Questions fréquentes',
    description:
      "Comment postuler, s'inscrire à un concours INFAS ou CAFOP, payer son abonnement par Mobile Money ? Toutes les réponses sur Emploi Concours CI.",
    path: '#faq'
  },
  contact: {
    title: 'Nous contacter',
    description:
      "Contactez l'équipe Emploi Concours CI : questions sur une offre, un concours, un paiement ou signalement d'une annonce suspecte. Réponse sous 24h.",
    path: '#contact'
  },
  cgu: {
    title: "Conditions générales d'utilisation",
    description: "Conditions générales d'utilisation de la plateforme Emploi Concours CI.",
    path: '#cgu'
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    description:
      'Protection de vos données personnelles sur Emploi Concours CI, conformément à la loi ivoirienne n°2013-450 (ARTCI).',
    path: '#confidentialite'
  },
  account: {
    title: 'Mon espace candidat',
    description: "Gérez votre profil, vos préférences d'alertes et votre abonnement.",
    path: '#compte'
  }
};
