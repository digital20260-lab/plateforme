import { useState } from 'react';
import {
  ArrowLeft, Mail, Smartphone, MapPin, Send, CheckCircle,
  ChevronDown, MessageCircle, Shield, FileText, HelpCircle
} from 'lucide-react';
import clsx from 'clsx';

export type InfoPageKind = 'contact' | 'faq' | 'cgu' | 'confidentialite';

interface Props {
  kind: InfoPageKind;
  onBack: () => void;
}

export function InfoPage({ kind, onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Topbar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>
        </div>
      </div>

      {kind === 'contact' && <ContactSection />}
      {kind === 'faq' && <FaqSection />}
      {kind === 'cgu' && <CguSection />}
      {kind === 'confidentialite' && <PrivacySection />}
    </div>
  );
}

/* ============================================================
   NOUS CONTACTER
============================================================ */
function ContactSection() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const canSend = name.trim() && email.trim() && message.trim();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSent(true);
  };

  return (
    <>
      <PageHeader
        icon={<MessageCircle size={26} />}
        kicker="Support"
        title="Nous contacter"
        subtitle="Une question, un problème, une suggestion ? Notre équipe vous répond sous 24h ouvrées."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">
          {/* Formulaire */}
          <section className="bg-white border border-ink-100 rounded-2xl p-6">
            {sent ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={30} />
                </div>
                <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Message envoyé !</h2>
                <p className="text-ink-600 mb-6">
                  Merci {name.split(' ')[0]}, nous avons bien reçu votre message.<br />
                  Une réponse vous sera adressée à <span className="font-semibold">{email}</span>.
                </p>
                <button
                  onClick={() => { setSent(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
                  className="text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Nom complet *</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-ink-700 mb-1 block">Sujet</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="">Choisir un sujet…</option>
                    <option>Question sur une offre d'emploi</option>
                    <option>Question sur un concours</option>
                    <option>Problème de paiement / abonnement</option>
                    <option>Problème technique</option>
                    <option>Signaler une offre suspecte</option>
                    <option>Partenariat / entreprise</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-ink-700 mb-1 block">Message *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500 resize-y"
                    placeholder="Décrivez votre demande…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-full"
                >
                  <Send size={15} /> Envoyer le message
                </button>
              </form>
            )}
          </section>

          {/* Coordonnées */}
          <aside className="space-y-4">
            <div className="bg-white border border-ink-100 rounded-2xl p-5">
              <h3 className="font-display font-bold text-base text-ink-900 mb-4">Coordonnées</h3>
              <div className="space-y-3 text-sm">
                <a href="mailto:contact@emploi-concours.ci" className="flex items-start gap-2.5 text-ink-700 hover:text-orange-600">
                  <Mail size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium break-all">contact@emploi-concours.ci</span>
                </a>
                <div className="flex items-start gap-2.5 text-ink-700">
                  <Smartphone size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">+225 07 00 00 00 00<br /><span className="text-xs text-ink-500">Lun–Ven, 8h–17h</span></span>
                </div>
                <div className="flex items-start gap-2.5 text-ink-700">
                  <MapPin size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Cocody, Abidjan<br />Côte d'Ivoire</span>
                </div>
              </div>
            </div>

            <div className="bg-forest-700 text-white rounded-2xl p-5">
              <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-orange-300 mb-1">WhatsApp</div>
              <p className="text-sm text-forest-100 mb-3">Réponse plus rapide via notre canal WhatsApp.</p>
              <a
                href="https://wa.me/2250700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full"
              >
                <MessageCircle size={14} /> Écrire sur WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   FAQ
============================================================ */
const FAQ_ITEMS: { cat: string; q: string; a: string }[] = [
  { cat: 'Général', q: "Qu'est-ce qu'Emploi Concours CI ?", a: "Emploi Concours CI est la plateforme qui centralise en un seul endroit les offres d'emploi (public et privé) et les concours administratifs de Côte d'Ivoire. Notre base est mise à jour automatiquement toutes les 6 heures à partir des sources officielles." },
  { cat: 'Général', q: "L'inscription est-elle gratuite ?", a: "Oui, l'inscription est 100% gratuite. Le compte gratuit donne accès aux offres du jour, aux concours, à la recherche avec filtres et à 1 quiz de préparation offert au total." },
  { cat: 'Général', q: "Les offres publiées sont-elles vérifiées ?", a: "Oui. Nous ne publions que des offres dont l'employeur et le canal de candidature (email officiel) sont identifiés. Les concours renvoient systématiquement vers leurs sites web officiels. Si vous repérez une offre suspecte, signalez-la via la page Nous contacter." },
  { cat: 'Candidature', q: "Comment postuler à une offre d'emploi ?", a: "Ouvrez la fiche de l'offre : le panneau « Envoyez votre candidature » affiche l'adresse email officielle du recruteur. Cliquez dessus pour ouvrir votre messagerie avec l'objet pré-rempli, joignez votre CV et votre lettre de motivation, puis envoyez." },
  { cat: 'Candidature', q: "Comment m'inscrire à un concours ?", a: "Chaque fiche concours détaille les conditions, le calendrier, les frais et le dossier à fournir. La section « Site web officiel » contient le lien direct vers la plateforme d'inscription du concours (ex. infas.ciconcours.com). L'inscription se fait toujours sur le site officiel du concours, jamais sur notre plateforme." },
  { cat: 'Candidature', q: "Emploi Concours CI prélève-t-il des frais sur les candidatures ?", a: "Non, jamais. Postuler à une offre ou consulter un concours est entièrement gratuit. Seuls les services optionnels (abonnements, sujets d'anciens concours) sont payants." },
  { cat: 'Abonnements', q: "Quelle est la différence entre Gratuit et Premium ?", a: "Gratuit : accès aux offres du jour, recherche et filtres unifiés, 1 quiz de préparation offert au total. Premium (1 500 FCFA/mois) : tout le plan Gratuit + emails d'opportunités chaque lundi et jeudi, coaching individuel et quiz illimités." },
  { cat: 'Abonnements', q: "Comment payer mon abonnement ?", a: "Le paiement s'effectue par Mobile Money (Orange Money, MTN MoMo ou Wave) via la plateforme sécurisée GeniusPay. Aucune carte bancaire n'est requise et aucune donnée bancaire n'est stockée chez nous." },
  { cat: 'Abonnements', q: "Puis-je annuler mon abonnement ?", a: "Oui, à tout moment et sans frais. L'abonnement est sans engagement : il reste actif jusqu'à la fin du mois payé, puis votre compte repasse simplement au plan Gratuit." },
  { cat: 'Quiz & Préparation', q: "Comment fonctionnent les quiz ?", a: "Les quiz sont des QCM corrigés (culture générale, mathématiques, français, logique, santé) inspirés des épreuves de concours. Chaque réponse est expliquée. Le compte gratuit donne droit à 1 seul quiz offert ; le plan Premium donne un accès illimité." },
  { cat: 'Quiz & Préparation', q: "Comment télécharger un sujet d'ancien concours ?", a: "Rendez-vous dans la section Préparation, choisissez votre sujet, puis cliquez sur « Obtenir ». Après paiement Mobile Money de 1 000 FCFA, le PDF est immédiatement téléchargeable et reste accessible à vie." },
  { cat: 'Compte', q: "Comment modifier mes informations ou mes alertes ?", a: "Une fois connecté, cliquez sur votre avatar en haut à droite pour ouvrir les Paramètres : mise à jour du profil, préférences des offres (secteurs, niveau, canaux d'alerte), abonnement et sécurité." },
  { cat: 'Compte', q: "J'ai oublié mon mot de passe, que faire ?", a: "Sur l'écran de connexion, utilisez le lien « Mot de passe oublié » pour recevoir un lien de réinitialisation par email. Si le problème persiste, contactez-nous via la page Nous contacter." }
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const cats = Array.from(new Set(FAQ_ITEMS.map(i => i.cat)));

  return (
    <>
      <PageHeader
        icon={<HelpCircle size={26} />}
        kicker="Aide"
        title="Foire aux questions"
        subtitle="Les réponses aux questions les plus fréquentes de nos candidats."
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {cats.map(cat => (
          <section key={cat}>
            <h2 className="font-display font-bold text-lg text-ink-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-orange-500"></span> {cat}
            </h2>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => item.cat === cat && (
                <div key={idx} className="bg-white border border-ink-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpen(open === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left"
                  >
                    <span className="font-bold text-sm text-ink-900">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={clsx("text-orange-500 flex-shrink-0 transition-transform", open === idx && "rotate-180")}
                    />
                  </button>
                  {open === idx && (
                    <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed animate-slide-up">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="bg-forest-700 text-white rounded-2xl p-6 text-center">
          <h3 className="font-display font-bold text-xl mb-1">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-forest-100 text-sm mb-4">Notre équipe support est là pour vous aider.</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-full text-sm"
          >
            <MessageCircle size={14} /> Nous contacter
          </a>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   CONDITIONS GÉNÉRALES
============================================================ */
function CguSection() {
  return (
    <>
      <PageHeader
        icon={<FileText size={26} />}
        kicker="Légal"
        title="Conditions générales d'utilisation"
        subtitle="Dernière mise à jour : 10 juin 2026"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <LegalBody sections={[
          {
            t: '1. Objet',
            c: ["Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Emploi Concours CI (ci-après « la Plateforme »), accessible via le site emploi-concours.ci, qui centralise des offres d'emploi et des informations sur les concours administratifs en Côte d'Ivoire.", "En créant un compte ou en utilisant la Plateforme, vous acceptez sans réserve les présentes CGU."]
          },
          {
            t: '2. Services proposés',
            c: ["La Plateforme propose : (a) la consultation gratuite d'offres d'emploi et d'avis de concours ; (b) des emails d'opportunités chaque lundi et jeudi pour les abonnés Premium ; (c) des quiz d'entraînement aux concours ; (d) la vente de sujets d'anciens concours au format PDF ; (e) des services de coaching pour les abonnés Premium.", "Emploi Concours CI est un service d'information et de mise en relation. La Plateforme n'est ni un employeur, ni un organisme organisateur de concours."]
          },
          {
            t: '3. Compte utilisateur',
            c: ["La création d'un compte est gratuite et requiert un nom, une adresse email ou un numéro de téléphone valide. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte.", "Tout compte créé avec des informations fausses ou usurpées pourra être suspendu sans préavis."]
          },
          {
            t: '4. Abonnements et paiements',
            c: ["L'abonnement Premium (1 500 FCFA/mois) est payable par Mobile Money via le prestataire GeniusPay. L'abonnement est sans engagement et valable un mois à compter du paiement.", "Les sujets d'anciens concours sont vendus à l'unité (1 000 FCFA). Tout achat de contenu numérique est définitif après livraison du fichier ; aucun remboursement ne pourra être exigé une fois le téléchargement disponible, sauf défaut avéré du fichier."]
          },
          {
            t: '5. Exactitude des informations',
            c: ["Les offres et avis de concours sont collectés à partir de sources publiques et officielles, puis vérifiés dans la mesure du possible. Malgré nos contrôles, Emploi Concours CI ne peut garantir l'exhaustivité ni l'exactitude permanente des informations (dates, frais, conditions), celles-ci pouvant être modifiées par les organismes émetteurs.", "Pour les concours, seules les informations publiées sur les sites officiels des institutions font foi. Les candidats sont invités à toujours vérifier sur le site officiel indiqué dans chaque fiche."]
          },
          {
            t: '6. Bon usage de la Plateforme',
            c: ["Il est interdit : de publier ou diffuser de fausses offres ; d'extraire massivement les données de la Plateforme ; d'utiliser la Plateforme à des fins frauduleuses (collecte de frais de candidature illicites, usurpation d'identité d'employeur, etc.) ; de tenter de contourner les limitations techniques (quota de quiz, contenus payants).", "Important : aucun recruteur légitime ne demande de l'argent pour étudier une candidature. Signalez-nous immédiatement toute demande de paiement suspecte liée à une offre."]
          },
          {
            t: '7. Propriété intellectuelle',
            c: ["La marque, le logo, l'interface et les contenus produits par Emploi Concours CI (quiz, fiches synthétiques, textes) sont protégés. Toute reproduction sans autorisation est interdite. Les contenus émanant des institutions (avis officiels de concours) demeurent la propriété de leurs auteurs respectifs."]
          },
          {
            t: '8. Responsabilité',
            c: ["Emploi Concours CI ne saurait être tenu responsable : des décisions de recrutement des employeurs ; des résultats aux concours ; des modifications de calendrier décidées par les institutions ; des interruptions temporaires de service pour maintenance.", "L'utilisateur reste seul responsable des candidatures qu'il envoie et des informations qu'il transmet aux recruteurs."]
          },
          {
            t: '9. Résiliation',
            c: ["Vous pouvez supprimer votre compte à tout moment depuis Paramètres → Sécurité. Emploi Concours CI se réserve le droit de suspendre tout compte contrevenant aux présentes CGU."]
          },
          {
            t: '10. Droit applicable',
            c: ["Les présentes CGU sont régies par le droit ivoirien. Tout litige sera soumis aux tribunaux compétents d'Abidjan, après tentative de résolution amiable via notre support."]
          }
        ]} />
      </div>
    </>
  );
}

/* ============================================================
   CONFIDENTIALITÉ
============================================================ */
function PrivacySection() {
  return (
    <>
      <PageHeader
        icon={<Shield size={26} />}
        kicker="Légal"
        title="Politique de confidentialité"
        subtitle="Dernière mise à jour : 10 juin 2026"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <LegalBody sections={[
          {
            t: '1. Données collectées',
            c: ["Lors de la création de votre compte et de l'utilisation de la Plateforme, nous collectons : votre nom, votre adresse email, votre numéro de téléphone (facultatif), vos préférences de recherche (secteurs, niveau d'études, type d'opportunités) et vos données d'utilisation (quiz réalisés, offres consultées).", "Nous ne collectons aucune donnée bancaire : les paiements sont entièrement traités par le prestataire agréé GeniusPay."]
          },
          {
            t: '2. Finalités du traitement',
            c: ["Vos données servent exclusivement à : (a) créer et gérer votre compte ; (b) personnaliser les opportunités et alertes qui vous sont proposées ; (c) envoyer les alertes email que vous avez activées ; (d) traiter vos achats et abonnements ; (e) améliorer la qualité du service via des statistiques anonymisées."]
          },
          {
            t: '3. Partage des données',
            c: ["Vos données personnelles ne sont jamais vendues. Elles ne sont partagées qu'avec : GeniusPay (traitement des paiements), notre prestataire d'envoi d'emails (uniquement les coordonnées nécessaires à l'envoi), et les autorités si la loi l'exige.", "Lorsque vous postulez à une offre, vous envoyez vous-même votre candidature directement à l'employeur par email : nous ne transmettons pas votre dossier aux recruteurs."]
          },
          {
            t: '4. Durée de conservation',
            c: ["Vos données de compte sont conservées tant que votre compte est actif. En cas de suppression de compte, l'ensemble de vos données personnelles est effacé dans un délai de 30 jours, à l'exception des données de facturation conservées pour les durées légales."]
          },
          {
            t: '5. Sécurité',
            c: ["Les échanges avec la Plateforme sont chiffrés (HTTPS). Les mots de passe sont stockés sous forme hachée (bcrypt). Les accès aux données sont limités au personnel habilité, et des sauvegardes quotidiennes sont effectuées."]
          },
          {
            t: '6. Vos droits',
            c: ["Conformément à la loi ivoirienne n°2013-450 relative à la protection des données à caractère personnel (ARTCI), vous disposez d'un droit d'accès, de rectification, d'opposition et de suppression de vos données.", "Vous pouvez exercer ces droits directement depuis vos Paramètres (modification du profil, suppression de compte) ou en nous écrivant à privacy@emploi-concours.ci. Une réponse vous sera apportée sous 30 jours."]
          },
          {
            t: '7. Cookies et stockage local',
            c: ["La Plateforme utilise le stockage local de votre navigateur pour maintenir votre session et mémoriser vos préférences (plan, quiz utilisé). Aucun cookie publicitaire tiers n'est utilisé."]
          },
          {
            t: '8. Contact',
            c: ["Pour toute question relative à vos données personnelles : privacy@emploi-concours.ci ou via la page Nous contacter."]
          }
        ]} />
      </div>
    </>
  );
}

/* ============================================================
   Composants partagés
============================================================ */
function PageHeader({ icon, kicker, title, subtitle }: { icon: React.ReactNode; kicker: string; title: string; subtitle: string }) {
  return (
    <header className="bg-forest-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-stripes opacity-30"></div>
      <div className="absolute top-0 inset-x-0 h-1 bg-ci-flag"></div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-orange-300 mb-1">{kicker}</div>
            <h1 className="font-display font-bold text-3xl leading-tight">{title}</h1>
            <p className="text-forest-100 text-sm mt-1">{subtitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function LegalBody({ sections }: { sections: { t: string; c: string[] }[] }) {
  return (
    <div className="bg-white border border-ink-100 rounded-2xl p-6 sm:p-8 space-y-7">
      {sections.map(s => (
        <section key={s.t}>
          <h2 className="font-display font-bold text-lg text-ink-900 mb-2 pb-1.5 border-b-2 border-orange-200">
            {s.t}
          </h2>
          <div className="space-y-2.5">
            {s.c.map((p, i) => (
              <p key={i} className="text-[15px] text-ink-700 leading-relaxed">{p}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
