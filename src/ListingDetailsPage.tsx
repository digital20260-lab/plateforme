import { useState } from 'react';
import {
  ArrowLeft, Building2, MapPin, Calendar, Briefcase, GraduationCap,
  Mail, Smartphone, BellRing, CheckCircle, FileText, Share2, Bookmark,
  Clock, ChevronRight, ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import type { Listing } from './data';

interface Props {
  listing: Listing;
  onBack: () => void;
  onActivateAlert: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

/**
 * Détecte les URLs (https://... ou www....) dans un texte
 * et les transforme en liens cliquables ouvrant un nouvel onglet.
 */
function LinkifiedText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(/^https?:\/\//) || part.match(/^www\./)) {
          const href = part.startsWith('http') ? part : `https://${part}`;
          // retirer la ponctuation finale éventuelle du lien affiché
          const clean = part.replace(/[.,;)]+$/, '');
          const cleanHref = href.replace(/[.,;)]+$/, '');
          return (
            <a
              key={i}
              href={cleanHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 font-semibold underline decoration-orange-300 underline-offset-2 hover:text-orange-700 hover:decoration-orange-500 break-all inline-flex items-center gap-0.5"
            >
              {clean}
              <ExternalLink size={12} className="inline flex-shrink-0" />
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ListingDetailsPage({ listing, onBack, onActivateAlert, isSaved, onToggleSave }: Props) {
  const isConcours = listing.type === 'concours';
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const getShareUrl = () => {
    if (typeof window === 'undefined') return `https://emploi-concours.ci/#listing=${listing.id}`;
    return `${window.location.origin}${window.location.pathname}#listing=${listing.id}`;
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback pour certains navigateurs / previews non HTTPS.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!ok) throw new Error('copy_failed');
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const text = `${listing.title} — Emploi Concours CI`;

    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text, url });
      } else {
        await copyToClipboard(url);
      }
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 2500);
    } catch (error) {
      // L'annulation du partage natif ne doit pas afficher une erreur.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('error');
      window.setTimeout(() => setShareStatus('idle'), 2500);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${listing.title}\n${getShareUrl()}`)}`;

  const deadlineFormatted = new Date(listing.deadline).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(listing.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Bandeau de navigation contextuel */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Retour aux opportunités
          </button>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:flex items-center gap-2">
              <button
                onClick={handleShare}
                className={clsx(
                  "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors",
                  shareStatus === 'copied'
                    ? "text-forest-700 border-forest-300 bg-forest-50"
                    : shareStatus === 'error'
                      ? "text-orange-700 border-orange-300 bg-orange-50"
                      : "text-ink-600 hover:text-orange-600 border-ink-200 hover:border-orange-400"
                )}
                title="Copier le lien ou ouvrir le partage natif"
              >
                {shareStatus === 'copied' ? <CheckCircle size={14} /> : <Share2 size={14} />}
                {shareStatus === 'copied' ? 'Lien copié' : shareStatus === 'error' ? 'Réessayez' : 'Partager'}
              </button>
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-white border border-forest-300 hover:bg-forest-600 px-3 py-1.5 rounded-full transition-colors"
                title="Partager sur WhatsApp"
              >
                WhatsApp
              </a>
            </div>
            <button
              onClick={onToggleSave || onActivateAlert}
              className={clsx(
                "inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full transition-colors",
                isSaved
                  ? "bg-forest-600 text-white hover:bg-forest-700"
                  : "bg-ink-900 text-white hover:bg-orange-600"
              )}
            >
              <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
              {isSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* En-tête de la page */}
      <header className="relative overflow-hidden border-b border-ink-100">
        <div className="absolute inset-0 -z-10 bg-grain opacity-30"></div>
        <div className={clsx(
          "absolute top-0 left-0 right-0 h-1",
          isConcours ? "bg-forest-600" : "bg-orange-500"
        )}></div>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl -z-10 opacity-30 bg-orange-300"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Badges en haut */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={clsx(
              "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
              isConcours ? "bg-forest-100 text-forest-700" : "bg-orange-100 text-orange-700"
            )}>
              {isConcours ? <GraduationCap size={12} /> : <Briefcase size={12} />}
              {isConcours ? 'Concours' : "Offre d'emploi"}
            </span>
            <span className={clsx(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider stamp",
              listing.status === 'Ouvert' && "text-forest-600",
              listing.status === 'En cours' && "text-orange-600",
              listing.status === 'Bientôt' && "text-orange-500",
              listing.status === 'Fermé' && "text-ink-400"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full",
                listing.status === 'Ouvert' && "bg-forest-500 animate-pulse",
                listing.status === 'En cours' && "bg-orange-500 animate-pulse",
                listing.status === 'Bientôt' && "bg-orange-400",
                listing.status === 'Fermé' && "bg-ink-300"
              )}></span>
              {listing.status}
            </span>
            {listing.type === 'emploi' && listing.workMode && (
              <span className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium",
                listing.workMode === 'Télétravail' && "bg-forest-100 text-forest-700",
                listing.workMode === 'Hybride' && "bg-orange-100 text-orange-700",
                listing.workMode === 'Sur site' && "bg-ink-100 text-ink-600"
              )}>
                {listing.workMode === 'Télétravail' && '🏠'}
                {listing.workMode === 'Hybride' && '🔁'}
                {listing.workMode === 'Sur site' && '🏢'}
                {' '}{listing.workMode}
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink-900 tracking-tight leading-tight mb-4 max-w-3xl">
            {listing.title}
          </h1>

          {listing.type === 'emploi' && listing.company && (
            <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-forest-700 mb-4">
              <Building2 size={20} /> {listing.company}
            </div>
          )}
          {listing.type === 'concours' && (
            <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-forest-700 mb-4">
              <Building2 size={20} /> {listing.ministry}
            </div>
          )}

          {/* Mini-info grid */}
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-ink-600 mt-6">
            <div className="inline-flex items-center gap-2">
              <MapPin size={16} className="text-orange-500" />
              <span className="font-medium">{listing.location || listing.ministry}</span>
            </div>
            {listing.type === 'emploi' && listing.contractType && (
              <div className="inline-flex items-center gap-2">
                <Briefcase size={16} className="text-orange-500" />
                <span className="font-medium">{listing.contractType}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2">
              <GraduationCap size={16} className="text-orange-500" />
              <span className="font-medium">{listing.level}</span>
            </div>
            {listing.publishedAt && (
              <div className="inline-flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span className="font-medium">
                  Publié le {new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal — layout en 2 colonnes */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">

          {/* Colonne principale : contenu détaillé */}
          <div className="space-y-8 min-w-0">

            {/* Résumé / description */}
            <section>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-3">Description</h2>
              <p className="text-base text-ink-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </section>

            {/* Sections détaillées */}
            {listing.details && listing.details.length > 0 && (
              <div className="space-y-6">
                {listing.details.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-ink-900 mb-4 pb-2 border-b-2 border-orange-200">
                      {section.title}
                    </h2>

                    <div className="space-y-4">
                      {section.content && (
                        <ul className="space-y-2.5">
                          {section.content.map((item) => (
                            <li key={item} className="flex gap-2.5 text-[15px] text-ink-700 leading-relaxed">
                              <CheckCircle size={18} className="text-forest-600 mt-0.5 flex-shrink-0" />
                              <span><LinkifiedText text={item} /></span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {section.table && (
                        <div className="overflow-x-auto rounded-xl border border-ink-100 -mx-1">
                          <table className="min-w-full divide-y divide-ink-100 text-sm">
                            <thead className="bg-forest-700 text-white">
                              <tr>
                                {section.table.headers.map((header) => (
                                  <th key={header} className="px-4 py-3 text-left font-bold whitespace-nowrap">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-100 bg-white">
                              {section.table.rows.map((row) => (
                                <tr key={row.join('-')} className="hover:bg-orange-50/40">
                                  {row.map((cell, cellIndex) => (
                                    <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-ink-700 align-top">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {section.note && (
                        <div className="text-sm text-orange-900 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                          <span className="font-bold">⚠ </span>{section.note}
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {isConcours && (
              <section className="bg-orange-50 border border-orange-200 rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-ink-900 mb-1">Aidez un proche à ne pas rater ce concours</h2>
                    <p className="text-sm text-ink-700 leading-relaxed">
                      Partagez cette page avec un ami, un frère, une sœur ou un camarade qui prépare aussi les concours en Côte d'Ivoire.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 text-white px-4 py-2.5 rounded-full text-sm font-bold"
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full text-sm font-bold"
                    >
                      <Share2 size={14} /> Copier le lien
                    </button>
                  </div>
                </div>
                {shareStatus === 'copied' && (
                  <div className="mt-3 text-sm font-semibold text-forest-700 flex items-center gap-1.5">
                    <CheckCircle size={15} /> Lien copié. Vous pouvez maintenant l'envoyer à une connaissance.
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Colonne droite : sidebar sticky avec infos clés et CTA */}
          <aside className="lg:sticky lg:top-32 lg:self-start space-y-4">
            {/* Carte deadline */}
            <div className={clsx(
              "rounded-2xl p-5 border-2",
              daysLeft <= 7 && listing.status !== 'Fermé' ? "bg-orange-50 border-orange-500" : "bg-white border-ink-100"
            )}>
              <div className="text-[11px] uppercase tracking-wider font-bold text-ink-500 mb-1">Date limite</div>
              <div className="font-display font-bold text-2xl text-ink-900 mb-2">{deadlineFormatted}</div>
              {listing.status !== 'Fermé' && (
                <div className={clsx(
                  "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full",
                  daysLeft <= 7 ? "bg-orange-500 text-white" : "bg-forest-100 text-forest-700"
                )}>
                  <Calendar size={12} />
                  {daysLeft === 0 ? "Aujourd'hui" : daysLeft === 1 ? "Demain" : `Dans ${daysLeft} jours`}
                </div>
              )}
              {listing.status === 'Fermé' && (
                <div className="text-xs font-medium text-ink-500">Candidatures clôturées</div>
              )}
            </div>

            {/* Carte récapitulative */}
            <div className="bg-white border border-ink-100 rounded-2xl p-5 space-y-4">
              {listing.type === 'emploi' && listing.company && (
                <InfoRow label="Entreprise" value={listing.company} icon={<Building2 size={14} />} />
              )}
              {listing.type === 'concours' && (
                <InfoRow label="Ministère" value={listing.ministry} icon={<Building2 size={14} />} />
              )}
              <InfoRow label={listing.type === 'emploi' ? 'Localisation' : 'Région concernée'} value={listing.location || "Côte d'Ivoire"} icon={<MapPin size={14} />} />
              <InfoRow label="Niveau requis" value={listing.level} icon={<GraduationCap size={14} />} />
              {listing.type === 'emploi' && listing.contractType && (
                <InfoRow label="Type de contrat" value={listing.contractType} icon={<Briefcase size={14} />} />
              )}
              {listing.type === 'emploi' && listing.workMode && (
                <InfoRow
                  label="Mode de travail"
                  value={`${listing.workMode === 'Télétravail' ? '🏠 ' : listing.workMode === 'Hybride' ? '🔁 ' : '🏢 '}${listing.workMode}`}
                  icon={<Briefcase size={14} />}
                />
              )}
              {listing.type === 'emploi' && listing.experience && (
                <InfoRow label="Expérience" value={listing.experience} icon={<Clock size={14} />} />
              )}
              {listing.type === 'emploi' && listing.sector && (
                <InfoRow label="Secteur" value={listing.sector} icon={<Briefcase size={14} />} />
              )}
              {listing.publishedAt && (
                <InfoRow
                  label="Publiée le"
                  value={new Date(listing.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  icon={<Calendar size={14} />}
                />
              )}
              {listing.type === 'concours' && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-ink-50 text-ink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">Site officiel</div>
                    <a
                      href={listing.sourceUrl.startsWith('http') ? listing.sourceUrl : `https://${listing.sourceUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-orange-600 hover:text-orange-700 underline decoration-orange-300 underline-offset-2 break-all leading-snug inline-flex items-center gap-1"
                    >
                      {listing.sourceUrl}
                      <ExternalLink size={11} className="flex-shrink-0" />
                    </a>
                  </div>
                </div>
              )}
              {listing.fee && (
                <div className="pt-3 mt-3 border-t border-ink-100">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-ink-500 mb-1">Frais indiqués</div>
                  <div className="font-display font-bold text-xl text-orange-600">{listing.fee}</div>
                </div>
              )}
            </div>

            {/* Bloc Comment postuler */}
            {listing.type === 'emploi' && (listing.applicationEmail || listing.applicationPhone || listing.applicationAddress) && (
              <div className="bg-forest-700 text-white rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-orange-300 mb-1">Postuler</div>
                <h4 className="font-display font-bold text-lg mb-3">Envoyez votre candidature</h4>
                <div className="space-y-2.5 text-sm">
                  {listing.applicationEmail && (
                    <a
                      href={`mailto:${listing.applicationEmail}?subject=Candidature - ${encodeURIComponent(listing.title)}`}
                      className="flex items-start gap-2 break-all hover:text-orange-300 transition-colors"
                    >
                      <Mail size={16} className="mt-0.5 flex-shrink-0 text-orange-300" />
                      <span className="font-medium underline">{listing.applicationEmail}</span>
                    </a>
                  )}
                  {listing.applicationPhone && (
                    <div className="flex items-start gap-2">
                      <Smartphone size={16} className="mt-0.5 flex-shrink-0 text-orange-300" />
                      <span className="font-medium">{listing.applicationPhone}</span>
                    </div>
                  )}
                  {listing.applicationAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0 text-orange-300" />
                      <span className="font-medium">{listing.applicationAddress}</span>
                    </div>
                  )}
                </div>
                {listing.applicationEmail && (
                  <a
                    href={`mailto:${listing.applicationEmail}?subject=Candidature - ${encodeURIComponent(listing.title)}`}
                    className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-bold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    Postuler par email <ChevronRight size={14} />
                  </a>
                )}
              </div>
            )}

            {/* Bloc Concours → CTA sujets */}
            {listing.type === 'concours' && (
              <a
                href="#preparation"
                onClick={onBack}
                className="block bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-5 text-center transition-colors"
              >
                <div className="text-[11px] uppercase tracking-[0.15em] font-bold mb-1 opacity-90">Préparation</div>
                <div className="font-display font-bold text-lg mb-1">Voir les sujets du concours</div>
                <div className="text-sm opacity-90">Téléchargez les anciens sujets pour vous entraîner</div>
              </a>
            )}

            {/* Alerte */}
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <BellRing className="text-forest-700 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="font-display font-bold text-ink-900 text-base">Recevoir des alertes similaires</p>
                  <p className="text-xs text-ink-600 mt-0.5">Recevez les opportunités par email chaque lundi et jeudi.</p>
                </div>
              </div>
              <button
                onClick={onActivateAlert}
                className="w-full bg-forest-700 hover:bg-forest-800 text-white px-4 py-2.5 rounded-lg font-bold text-sm"
              >
                Activer les alertes
              </button>
            </div>
          </aside>
        </div>

        {/* Bouton retour en bas */}
        <div className="mt-12 pt-6 border-t border-ink-100">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour aux opportunités
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon, valueClass }: { label: string; value: string; icon: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-md bg-ink-50 text-ink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mb-0.5">{label}</div>
        <div className={clsx("font-semibold text-sm text-ink-900 leading-snug", valueClass)}>{value}</div>
      </div>
    </div>
  );
}
