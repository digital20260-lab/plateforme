import { useState } from 'react';
import {
  ArrowLeft, FileText, Download, CheckCircle, ShieldCheck, CreditCard
} from 'lucide-react';
import type { PastPaper } from './data';
import type { User } from './AccountPage';
import { usePayment } from './hooks/usePayment';

interface Props {
  paper: PastPaper;
  user: User | null;
  onBack: () => void;
  onLogin: () => void;
}

type Step = 'details' | 'processing' | 'success';

export function PaperPage({ paper, user, onBack, onLogin }: Props) {
  const [step, setStep] = useState<Step>('details');
  const { buyDocument, downloadDocument } = usePayment();

  const handlePay = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setStep('processing');
    try {
      const result = await buyDocument(user, paper);
      if (result?.already_purchased) {
        await downloadDocument(paper);
        setStep('success');
      }
    } catch (err: any) {
      const errorMsg = err?.message || '';
      if (errorMsg.includes('already')) {
        alert('Vous avez déjà acheté ce document.');
      } else if (errorMsg.includes('network')) {
        alert('Erreur réseau. Veuillez vérifier votre connexion et réessayer.');
      } else {
        alert('Erreur lors du paiement. Veuillez réessayer.');
      }
      setStep('details');
    }
  };

  const handleDownload = async () => {
    if (!user) {
      onLogin();
      return;
    }
    try {
      await downloadDocument(paper);
    } catch {
      alert('Le document n’est pas encore disponible. Si vous venez de payer, patientez quelques instants puis réessayez.');
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
            <ArrowLeft size={16} /> Retour à la préparation
          </button>
        </div>
      </div>

      {/* En-tête */}
      <header className="bg-forest-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-30"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText size={26} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.15em] font-bold text-orange-300 mb-1">
                {paper.concours} · Session {paper.year}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight max-w-xl">{paper.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Colonne gauche : ce que vous obtenez */}
          <div className="space-y-5">
            <section className="bg-white border border-ink-100 rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-ink-900 mb-4">Ce que vous obtenez</h2>
              <ul className="space-y-3">
                {[
                  'Le sujet officiel complet de la session ' + paper.year,
                  'Document PDF haute qualité, téléchargeable immédiatement',
                  'Lisible sur téléphone, tablette et ordinateur',
                  'Imprimable pour travailler sur papier',
                  'Accès à vie — re-téléchargeable à tout moment'
                ].map(item => (
                  <li key={item} className="flex gap-2.5 text-[15px] text-ink-700">
                    <CheckCircle size={18} className="text-forest-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-ink-100 rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-ink-900 mb-4">Pourquoi s'entraîner sur les anciens sujets ?</h2>
              <p className="text-[15px] text-ink-700 leading-relaxed">
                Travailler sur les sujets des sessions précédentes est la méthode la plus efficace pour
                comprendre le format des épreuves, identifier les thèmes récurrents et gérer votre temps
                le jour du concours. Les candidats qui s'entraînent sur d'anciens sujets multiplient
                significativement leurs chances de réussite.
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
              <ShieldCheck size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <span className="font-bold">Paiement 100% sécurisé</span> via GeniusPay.
                Aucune donnée bancaire n'est stockée sur notre plateforme.
              </div>
            </div>
          </div>

          {/* Colonne droite : paiement */}
          <aside className="md:sticky md:top-32">
            <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sticker">
              <div className="h-1 bg-ci-flag"></div>

              {step === 'details' && (
                <div className="p-6">
                  <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-ink-100">
                    <span className="text-sm font-semibold text-ink-600">Montant total</span>
                    <div>
                      <span className="font-display font-bold text-3xl text-ink-900">{paper.price}</span>
                      <span className="text-ink-500 text-sm font-medium ml-1">FCFA</span>
                    </div>
                  </div>

                  <div className="mb-5 rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-900">
                    Vous allez être redirigé vers GeniusPay pour choisir votre moyen de paiement (Orange Money, MTN, Wave ou carte).
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full bg-forest-700 hover:bg-forest-800 text-white font-bold py-3.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} /> Payer {paper.price} FCFA
                  </button>
                  <p className="text-center text-xs text-ink-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Sécurisé par GeniusPay
                  </p>
                </div>
              )}

              {step === 'processing' && (
                <div className="p-6 py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 border-4 border-ink-100 border-t-forest-600 rounded-full animate-spin mb-5"></div>
                  <h3 className="font-display font-bold text-xl text-ink-900 mb-1">Validation en cours</h3>
                  <p className="text-sm text-ink-500 max-w-xs">
                    Consultez votre téléphone et saisissez votre code secret pour valider le paiement.
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="p-6 py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mb-4 text-forest-600">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-ink-900 mb-1">Paiement réussi !</h3>
                  <p className="text-sm text-ink-500 mb-6">Votre document est débloqué.</p>
                  <button
                    onClick={handleDownload}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl inline-flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Télécharger le PDF (2.4 Mo)
                  </button>
                  <button
                    onClick={onBack}
                    className="mt-3 text-sm font-semibold text-ink-500 hover:text-ink-900"
                  >
                    Retour à la préparation
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
