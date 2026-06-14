import { useState } from 'react';
import {
  ArrowLeft, User as UserIcon, Mail, BellRing, CreditCard,
  LogOut, CheckCircle, Lock, ChevronRight, BookOpen, Save, Shield,
  Settings, KeyRound, Trash2, RefreshCw, Calendar, AlertTriangle,
  Bookmark, MapPin, Briefcase, GraduationCap
} from 'lucide-react';
import clsx from 'clsx';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan: 'gratuit' | 'premium';
  planExpiry?: string; // YYYY-MM-DD
  alertType?: 'emploi' | 'concours' | 'les_deux';
  alertChannels?: { email: boolean };
  preferredSectors?: string[];
  preferredLevel?: string;
}

type Tab = 'profil' | 'preferences' | 'abonnement' | 'securite' | 'favoris';

import type { Listing } from './data';

interface Props {
  user: User | null;
  onUpdate: (u: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onRequestLogin: () => void;
  quizUsedToday: boolean;
  isPaid: boolean;
  initialTab?: Tab;
  savedListings?: Listing[];
  onOpenListing?: (id: string) => void;
  onRemoveSaved?: (id: string) => void;
}

const SECTORS = [
  'Banque et assurance', 'Comptabilité et finance', 'Santé', 'BTP et construction',
  "NTIC et systèmes d'information", 'Ressources humaines', 'Juridique',
  'Commerce et distribution', 'Hôtellerie et restauration', 'Transport et logistique',
  'Éducation et formation', 'Agriculture', 'ONG et organisations internationales'
];

export function AccountPage(props: Props) {
  if (!props.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink-900 mb-2">Connexion requise</h1>
          <p className="text-ink-600 mb-6">Connectez-vous pour accéder à votre espace candidat et gérer vos paramètres.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={props.onRequestLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl"
            >
              Se connecter
            </button>
            <button
              onClick={props.onBack}
              className="w-full border-2 border-ink-200 hover:border-ink-900 text-ink-900 font-bold py-3 rounded-xl"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }
  return <AccountContent {...props} user={props.user} />;
}

function AccountContent({ user, onUpdate, onLogout, onBack, quizUsedToday, isPaid, initialTab, savedListings = [], onOpenListing, onRemoveSaved }: Props & { user: User }) {
  const [tab, setTab] = useState<Tab>(initialTab || 'profil');

  // Profil
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [savedProfile, setSavedProfile] = useState(false);

  // Préférences
  const [alertType, setAlertType] = useState<NonNullable<User['alertType']>>(user.alertType || 'les_deux');
  const [channels] = useState(user.alertChannels || { email: true });
  const [sectors, setSectors] = useState<string[]>(user.preferredSectors || []);
  const [prefLevel, setPrefLevel] = useState(user.preferredLevel || '');
  const [savedPrefs, setSavedPrefs] = useState(false);

  // Sécurité
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Abonnement
  const [renewed, setRenewed] = useState(false);

  const planLabel = { gratuit: 'Gratuit', premium: 'Premium' }[user.plan];
  const planPrice = { gratuit: '0 FCFA', premium: '1 500 FCFA / mois' }[user.plan];
  const expiry = user.planExpiry || (isPaid ? '2026-07-10' : undefined);

  const saveProfile = () => {
    onUpdate({ ...user, name, email, phone });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const savePrefs = () => {
    onUpdate({ ...user, alertType, alertChannels: channels, preferredSectors: sectors, preferredLevel: prefLevel });
    setSavedPrefs(true);
    setTimeout(() => setSavedPrefs(false), 2500);
  };

  const changePassword = () => {
    setPwdError('');
    if (newPwd.length < 4) { setPwdError('Le nouveau mot de passe doit contenir au moins 4 caractères.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Les deux mots de passe ne correspondent pas.'); return; }
    setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    setPwdSaved(true);
    setTimeout(() => setPwdSaved(false), 2500);
  };

  const renewPlan = () => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    onUpdate({ ...user, planExpiry: next.toISOString().slice(0, 10) });
    setRenewed(true);
    setTimeout(() => setRenewed(false), 3000);
  };

  const toggleSector = (s: string) => {
    setSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profil', label: 'Mon profil', icon: <UserIcon size={16} /> },
    { key: 'preferences', label: 'Préférences des offres', icon: <BellRing size={16} /> },
    { key: 'favoris', label: `Mes favoris${savedListings.length ? ` (${savedListings.length})` : ''}`, icon: <Bookmark size={16} /> },
    { key: 'abonnement', label: 'Abonnement', icon: <CreditCard size={16} /> },
    { key: 'securite', label: 'Sécurité', icon: <KeyRound size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Topbar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-900">
            <Settings size={15} className="text-orange-500" /> Paramètres
          </div>
        </div>
      </div>

      {/* En-tête du compte */}
      <header className="bg-white border-b border-ink-100 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-700 text-white flex items-center justify-center font-display font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl text-ink-900 leading-tight truncate">{user.name}</h1>
              <p className="text-ink-500 text-sm truncate">{user.email}</p>
            </div>
            <span className={clsx(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap",
              user.plan === 'gratuit' && "bg-ink-100 text-ink-600",
              user.plan === 'premium' && "bg-orange-100 text-orange-700"
            )}>
              <Shield size={11} /> {planLabel}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">

          {/* Sidebar onglets */}
          <nav className="md:sticky md:top-36 flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
                  tab === t.key
                    ? "bg-ink-900 text-white"
                    : "text-ink-600 hover:bg-white hover:text-ink-900 border border-transparent hover:border-ink-100"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
            <div className="hidden md:block border-t border-ink-100 my-2"></div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-600 hover:bg-orange-50 whitespace-nowrap"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </nav>

          {/* Contenu de l'onglet */}
          <div className="space-y-5 min-w-0">

            {/* ===== PROFIL ===== */}
            {tab === 'profil' && (
              <section className="bg-white border border-ink-100 rounded-2xl p-6 animate-slide-up">
                <h2 className="font-display font-bold text-xl text-ink-900 mb-1 flex items-center gap-2">
                  <UserIcon size={18} className="text-orange-500" /> Mise à jour du profil
                </h2>
                <p className="text-sm text-ink-500 mb-5">Ces informations sont utilisées pour vos alertes et vos candidatures.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Nom complet</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Email</label>
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Téléphone</label>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="07 00 00 00 00"
                      className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={saveProfile}
                    className="inline-flex items-center gap-1.5 bg-ink-900 hover:bg-forest-700 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                  >
                    <Save size={14} /> Enregistrer le profil
                  </button>
                  {savedProfile && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                      <CheckCircle size={14} /> Profil mis à jour
                    </span>
                  )}
                </div>
              </section>
            )}

            {/* ===== PRÉFÉRENCES ===== */}
            {tab === 'preferences' && (
              <>
                <section className="bg-white border border-ink-100 rounded-2xl p-6 animate-slide-up">
                  <h2 className="font-display font-bold text-xl text-ink-900 mb-1 flex items-center gap-2">
                    <BellRing size={18} className="text-orange-500" /> Préférences des offres
                  </h2>
                  <p className="text-sm text-ink-500 mb-5">Personnalisez les opportunités que vous souhaitez recevoir.</p>

                  <div className="mb-5">
                    <div className="text-sm font-bold text-ink-700 mb-2">Type d'opportunités :</div>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { key: 'emploi', label: "Offres d'emploi" },
                        { key: 'concours', label: 'Concours' },
                        { key: 'les_deux', label: 'Les deux' }
                      ] as const).map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => setAlertType(opt.key)}
                          className={clsx(
                            "px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors",
                            alertType === opt.key
                              ? "bg-forest-700 border-forest-700 text-white"
                              : "bg-white border-ink-200 text-ink-700 hover:border-forest-500"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-bold text-ink-700 mb-2">Secteurs qui m'intéressent :</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SECTORS.map(s => (
                        <button
                          key={s}
                          onClick={() => toggleSector(s)}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            sectors.includes(s)
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "bg-white border-ink-200 text-ink-600 hover:border-orange-400"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {sectors.length > 0 && (
                      <div className="text-xs text-ink-500 mt-2">{sectors.length} secteur{sectors.length > 1 ? 's' : ''} sélectionné{sectors.length > 1 ? 's' : ''}</div>
                    )}
                  </div>

                  <div className="mb-5">
                    <div className="text-sm font-bold text-ink-700 mb-2">Mon niveau d'études :</div>
                    <select
                      value={prefLevel}
                      onChange={e => setPrefLevel(e.target.value)}
                      className="w-full sm:w-72 bg-ink-50 border border-ink-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-orange-500 outline-none"
                    >
                      <option value="">Non précisé</option>
                      <option value="CEPE">CEPE</option>
                      <option value="BEPC">BEPC</option>
                      <option value="CAP">CAP / BT</option>
                      <option value="BAC">BAC</option>
                      <option value="BAC+2">BAC+2 / BTS</option>
                      <option value="BAC+3">BAC+3 / Licence</option>
                      <option value="BAC+4">BAC+4</option>
                      <option value="BAC+5">BAC+5 / Master</option>
                    </select>
                  </div>
                </section>

                <section className="bg-white border border-ink-100 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-base text-ink-900 mb-3">Alertes email — lundi et jeudi</h3>

                  {isPaid ? (
                    /* Premium : alertes email envoyées lundi et jeudi */
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-forest-500 bg-forest-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-forest-600 text-white flex items-center justify-center flex-shrink-0">
                          <Mail size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                            Emails lundi et jeudi
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-600 text-white px-1.5 py-0.5 rounded">
                              ✓ Actives
                            </span>
                          </div>
                          <div className="text-xs text-ink-600">
                            Vous recevez un email deux fois par semaine avec les offres et concours correspondant à votre profil — inclus dans votre plan Premium.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Gratuit : doit activer en passant Premium */
                    <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-ink-200 text-ink-500 flex items-center justify-center flex-shrink-0">
                          <Mail size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-ink-900 flex items-center gap-2">
                            Emails lundi et jeudi
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-ink-300 text-ink-700 px-1.5 py-0.5 rounded">
                              Désactivées
                            </span>
                          </div>
                          <div className="text-xs text-ink-500">
                            Recevez deux emails par semaine avec les offres et concours correspondant à votre profil.
                          </div>
                        </div>
                      </div>
                      <a
                        href="#tarifs"
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-xs"
                      >
                        Activer avec Premium — 1 500 FCFA/mois <ChevronRight size={12} />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={savePrefs}
                      className="inline-flex items-center gap-1.5 bg-ink-900 hover:bg-forest-700 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                    >
                      <Save size={14} /> Enregistrer les préférences
                    </button>
                    {savedPrefs && (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                        <CheckCircle size={14} /> Préférences mises à jour
                      </span>
                    )}
                  </div>
                </section>

                <section className="bg-white border border-ink-100 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-base text-ink-900 mb-2 flex items-center gap-2">
                    <BookOpen size={16} className="text-orange-500" /> Mon quiz gratuit
                  </h3>
                  {isPaid ? (
                    <p className="text-sm text-ink-600">
                      <span className="font-bold text-forest-700">Quiz illimités</span> — votre plan {planLabel} vous donne un accès sans limite.
                    </p>
                  ) : (
                    <p className="text-sm text-ink-600">
                      {quizUsedToday
                        ? <>Vous avez <span className="font-bold text-orange-600">utilisé votre quiz gratuit</span>. Passez au plan Premium pour débloquer les quiz illimités.</>
                        : <>Votre quiz gratuit est <span className="font-bold text-forest-700">disponible</span> (1 quiz offert au total).</>}
                    </p>
                  )}
                </section>
              </>
            )}

            {/* ===== FAVORIS ===== */}
            {tab === 'favoris' && (
              <section className="bg-white border border-ink-100 rounded-2xl p-6 animate-slide-up">
                <h2 className="font-display font-bold text-xl text-ink-900 mb-1 flex items-center gap-2">
                  <Bookmark size={18} className="text-orange-500" /> Mes offres sauvegardées
                </h2>
                <p className="text-sm text-ink-500 mb-5">
                  Retrouvez ici les offres et concours que vous avez sauvegardés pour postuler plus tard.
                </p>

                {savedListings.length === 0 ? (
                  <div className="border-2 border-dashed border-ink-200 rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-3">⭐</div>
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-1">Aucune offre sauvegardée</h3>
                    <p className="text-sm text-ink-500 mb-4 max-w-sm mx-auto">
                      Sur la page d'une offre ou d'un concours, cliquez sur le bouton « Sauvegarder » en haut à droite pour le retrouver ici.
                    </p>
                    <button
                      onClick={onBack}
                      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                    >
                      Explorer les opportunités <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedListings.map(l => {
                      const isC = l.type === 'concours';
                      return (
                        <div
                          key={l.id}
                          className="flex items-center gap-3 p-4 rounded-xl border border-ink-100 hover:border-orange-400 transition-colors group"
                        >
                          <div className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isC ? "bg-forest-50 text-forest-700" : "bg-orange-50 text-orange-600"
                          )}>
                            {isC ? <GraduationCap size={18} /> : <Briefcase size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => onOpenListing?.(l.id)}
                              className="font-display font-bold text-sm text-ink-900 hover:text-orange-700 truncate block text-left w-full"
                            >
                              {l.title}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                              <span className="truncate font-medium">{l.company || l.ministry}</span>
                              {l.location && (
                                <span className="inline-flex items-center gap-0.5 truncate">
                                  <MapPin size={10} /> {l.location.split(',')[0]}
                                </span>
                              )}
                              <span className={clsx(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                                l.status === 'Ouvert' ? "bg-forest-100 text-forest-700" : "bg-ink-100 text-ink-500"
                              )}>
                                {l.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => onOpenListing?.(l.id)}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 hover:border-orange-400"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => onRemoveSaved?.(l.id)}
                              className="text-ink-400 hover:text-orange-600 p-1.5"
                              title="Retirer des favoris"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ===== ABONNEMENT ===== */}
            {tab === 'abonnement' && (
              <>
                <section className="bg-white border border-ink-100 rounded-2xl p-6 animate-slide-up">
                  <h2 className="font-display font-bold text-xl text-ink-900 mb-1 flex items-center gap-2">
                    <CreditCard size={18} className="text-orange-500" /> Mon abonnement
                  </h2>
                  <p className="text-sm text-ink-500 mb-5">Gérez votre plan et son renouvellement.</p>

                  <div className={clsx(
                    "rounded-2xl p-5 border-2 mb-5",
                    isPaid ? "border-forest-500 bg-forest-50" : "border-ink-200 bg-ink-50"
                  )}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="font-display font-bold text-2xl text-ink-900">{planLabel}</div>
                        <div className="text-sm text-ink-500">{planPrice}</div>
                      </div>
                      {isPaid && expiry && (
                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-wider font-bold text-ink-500">Expire le</div>
                          <div className="font-bold text-ink-900 inline-flex items-center gap-1.5">
                            <Calendar size={14} className="text-forest-700" />
                            {new Date(expiry).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-ink-200/60 text-sm text-ink-600">
                      {user.plan === 'gratuit' && 'Accès aux offres du jour, recherche et filtres unifiés, 1 quiz offert au total.'}
                      {user.plan === 'premium' && 'Emails lundi et jeudi, coaching individuel, quiz illimités.'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {isPaid ? (
                      <>
                        <button
                          onClick={renewPlan}
                          className="inline-flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                        >
                          <RefreshCw size={14} /> Renouveler 1 mois
                        </button>
                         <a
                           href="#tarifs"
                           onClick={onBack}
                           className="inline-flex items-center gap-1.5 border-2 border-ink-200 hover:border-ink-900 text-ink-900 px-5 py-2.5 rounded-full font-bold text-sm"
                         >
                           Changer de plan <ChevronRight size={14} />
                         </a>
                      </>
                     ) : (
                       <a
                         href="#abonnement=premium"
                         onClick={onBack}
                         className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                       >
                         Passer au Premium — 1 500 FCFA/mois <ChevronRight size={14} />
                       </a>
                     )}
                  </div>
                  {renewed && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                      <CheckCircle size={14} /> Abonnement renouvelé pour 1 mois !
                    </div>
                  )}
                </section>

                <section className="bg-white border border-ink-100 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-base text-ink-900 mb-4">Historique des paiements</h3>
                  {isPaid ? (
                    <div className="divide-y divide-ink-100">
                      {[
                        { date: '2026-06-10', label: `Abonnement ${planLabel}`, amount: '1 500', status: 'Payé' },
                        { date: '2026-05-10', label: `Abonnement ${planLabel}`, amount: '1 500', status: 'Payé' }
                      ].map((p, i) => (
                        <div key={i} className="py-3 flex items-center justify-between text-sm">
                          <div>
                            <div className="font-semibold text-ink-900">{p.label}</div>
                            <div className="text-xs text-ink-500">{new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-ink-900">{p.amount} FCFA</div>
                            <div className="text-[11px] font-bold text-forest-700">{p.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">Aucun paiement — vous utilisez le plan gratuit.</p>
                  )}
                </section>
              </>
            )}

            {/* ===== SÉCURITÉ ===== */}
            {tab === 'securite' && (
              <>
                <section className="bg-white border border-ink-100 rounded-2xl p-6 animate-slide-up">
                  <h2 className="font-display font-bold text-xl text-ink-900 mb-1 flex items-center gap-2">
                    <KeyRound size={18} className="text-orange-500" /> Changer le mot de passe
                  </h2>
                  <p className="text-sm text-ink-500 mb-5">Choisissez un mot de passe robuste pour protéger votre compte.</p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-bold text-ink-700 mb-1 block">Mot de passe actuel</label>
                      <input
                        type="password"
                        value={oldPwd}
                        onChange={e => setOldPwd(e.target.value)}
                        className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-ink-700 mb-1 block">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-ink-700 mb-1 block">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                      />
                    </div>
                    {pwdError && (
                      <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" /> {pwdError}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={changePassword}
                        className="inline-flex items-center gap-1.5 bg-ink-900 hover:bg-forest-700 text-white px-5 py-2.5 rounded-full font-bold text-sm"
                      >
                        <Save size={14} /> Mettre à jour
                      </button>
                      {pwdSaved && (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                          <CheckCircle size={14} /> Mot de passe modifié
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-2xl p-6">
                  <h3 className="font-display font-bold text-base text-ink-900 mb-1 flex items-center gap-2">
                    <Trash2 size={16} className="text-orange-600" /> Supprimer mon compte
                  </h3>
                  <p className="text-sm text-ink-600 mb-4">
                    Cette action est irréversible : vos préférences, alertes et historique seront définitivement effacés.
                  </p>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors"
                    >
                      <Trash2 size={14} /> Supprimer mon compte
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-orange-700">Êtes-vous sûr(e) ?</span>
                      <button
                        onClick={onLogout}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full font-bold text-sm"
                      >
                        Oui, supprimer définitivement
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="border border-ink-300 text-ink-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-white"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
