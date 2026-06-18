import { useState } from 'react';
import {
  ArrowLeft, CheckCircle, ShieldCheck, CreditCard, Crown
} from 'lucide-react';
import type { User } from './AccountPage';
import { usePayment } from './hooks/usePayment';

type PaidPlan = 'premium';
type Step = 'details' | 'processing';

interface Props {
  plan: PaidPlan;
  user: User;
  onBack: () => void;
}

const PLANS: Record<PaidPlan, {
  label: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
}> = {
  premium: {
    label: 'Premium',
    price: 1500,
    icon: <Crown size={26} />,
    features: [
      'Accès aux offres du jour',
      'Recherche et filtres unifiés',
      'Emails d\'opportunités lundi et jeudi',
      'Coaching individuel',
      'Quiz illimités'
    ]
  }
};

export function SubscribePage({ plan, user, onBack }: Props) {
  const [step, setStep] = useState<Step>('details');
  const { subscribeToPremium } = usePayment();

  const info = PLANS[plan];
  const alreadyOnPlan = user.plan === plan;

  const handlePay = async () => {
    setStep('processing');
    
    try {
      await subscribeToPremium(user);
      // L'utilisateur est redirigé vers GeniusPay pour payer.
      // Après paiement réussi, il sera redirigé vers /paiement/succes
      // qui affichera le message de succès.
    } catch (err: any) {
      const errorMsg = err?.message || '';
      if (errorMsg.includes('already')) {
        alert('Vous avez déjà un abonnement actif.');
      } else {
        alert('Erreur lors du paiement. Veuillez réessayer.');
      }
      setStep('details');
    }
  };

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Topbar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>

      {/* En-tête */}
      <header className="text-white relative overflow-hidden bg-forest-700">
        <div className="absolute inset-0 bg-stripes opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-orange-500">
              {info.icon}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-bold opacity-80 mb-1">
                Abonnement
              </div>
              <h1 className="font-display font-bold text-3xl leading-tight">Plan {info.label}</h1>
              <div className="mt-1 font-semibold">
                <span className="font-display font-bold text-xl">{info.price.toLocaleString('fr-FR')}</span> FCFA / mois
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Colonne gauche : récap des avantages */}
          <div className="space-y-5">
            <section className="bg-white border border-ink-100 rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-ink-900 mb-4">Ce que vous débloquez</h2>
              <ul className="space-y-3">
                {info.features.map(f => (
                  <li key={f} className="flex gap-2.5 text-[15px] text-ink-700">
                    <CheckCircle size={18} className="text-forest-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-ink-100 rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-ink-900 mb-3">Compte abonné</h2>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-ink-900 truncate">{user.name}</div>
                  <div className="text-sm text-ink-500 truncate">{user.email}</div>
                </div>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-ink-100 text-ink-600 px-2 py-1 rounded-full whitespace-nowrap">
                  Actuel : {user.plan}
                </span>
              </div>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
              <ShieldCheck size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <span className="font-bold">Paiement 100% sécurisé</span> via GeniusPay.
                Sans engagement — annulable à tout moment depuis votre espace candidat.
              </div>
            </div>
          </div>

          {/* Colonne droite : paiement */}
          <aside className="md:sticky md:top-32">
            <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sticker">
              <div className="h-1 bg-ci-flag"></div>

              {alreadyOnPlan && step === 'details' ? (
                <div className="p-6 text-center py-10">
                  <div className="w-14 h-14 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={26} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink-900 mb-1">Vous êtes déjà abonné(e)</h3>
                  <p className="text-sm text-ink-500 mb-5">Votre plan actuel est déjà {info.label}.</p>
                  <button
                    onClick={handlePay}
                    className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3 rounded-xl mb-2"
                  >
                    Renouveler 1 mois — {info.price.toLocaleString('fr-FR')} FCFA
                  </button>
                  <button onClick={onBack} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
                    Retour
                  </button>
                </div>
              ) : step === 'details' ? (
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-ink-100">
                    <span className="text-sm font-semibold text-ink-600">Montant mensuel</span>
                    <div>
                      <span className="font-display font-bold text-3xl text-ink-900">{info.price.toLocaleString('fr-FR')}</span>
                      <span className="text-ink-500 text-sm font-medium ml-1">FCFA</span>
                    </div>
                  </div>

                  <div className="mb-5 rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-900">
                    Vous allez être redirigé vers la page de paiement GeniusPay pour choisir votre moyen de paiement (Orange Money, MTN, Wave ou carte).
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} /> Payer {info.price.toLocaleString('fr-FR')} FCFA
                  </button>
                  <p className="text-center text-xs text-ink-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Sécurisé par GeniusPay
                  </p>
                </div>
              ) : null}

              {step === 'processing' && (
                <div className="p-6 py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 border-4 border-ink-100 border-t-forest-600 rounded-full animate-spin mb-5"></div>
                  <h3 className="font-display font-bold text-xl text-ink-900 mb-1">Validation en cours</h3>
                  <p className="text-sm text-ink-500 max-w-xs">
                    Consultez votre téléphone et saisissez votre code secret pour valider le paiement.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
