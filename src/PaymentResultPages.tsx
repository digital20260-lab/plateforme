import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SuccessProps {
  onGoAccount: () => void;
  onGoHome: () => void;
  onRefreshProfile: () => Promise<void>;
  documentTitle?: string;
  onDownloadDocument?: () => Promise<void>;
}

export function PaymentSuccessPage({ onGoAccount, onGoHome, onRefreshProfile, documentTitle, onDownloadDocument }: SuccessProps) {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Récupérer les paramètres depuis l'URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const kind = searchParams.get('kind');
  const paperId = searchParams.get('paperId');
  
  const isDocumentPayment = kind === 'sujet' && !!documentTitle && !!onDownloadDocument;
  const isSubscriptionPayment = kind === 'abonnement';

  // Si pas de paramètre 'kind', c'est que l'utilisateur n'a pas payé - rediriger vers l'accueil
  useEffect(() => {
    if (!kind) {
      onGoHome();
    }
  }, [kind, onGoHome]);

  useEffect(() => {
    const t = window.setTimeout(async () => {
      await onRefreshProfile().catch(() => {});
      setLoading(false);
      // Auto-download document 0.5s after profile refresh if it's a document payment
      if (isDocumentPayment && onDownloadDocument) {
        const downloadTimer = window.setTimeout(async () => {
          setDownloading(true);
          try {
            await onDownloadDocument();
          } catch (err) {
            console.error('Auto-download failed:', err);
          }
          setDownloading(false);
        }, 500);
        return () => window.clearTimeout(downloadTimer);
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [onRefreshProfile, isDocumentPayment, onDownloadDocument]);

  // Redirection automatique après 2 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      onGoAccount();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onGoAccount]);

  // Si pas de kind, ne pas afficher le contenu
  if (!kind) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={42} />
        </div>
        <h1 className="font-display font-bold text-3xl text-ink-900 mb-2">Paiement réussi</h1>
        <p className="text-ink-600 mb-6">
          {isDocumentPayment
            ? <>Votre paiement a été reçu pour <span className="font-bold text-ink-900">{documentTitle}</span>. Vous pouvez télécharger votre document.</>
            : isSubscriptionPayment
            ? <>Bienvenue dans Premium ! 🎉<br /><span className="text-sm">Votre abonnement est activé pour 1 mois. Toutes les fonctionnalités sont maintenant débloquées.</span></>
            : <>Votre paiement a été reçu. Nous actualisons votre profil pour vérifier l'activation de vos avantages.</>}
        </p>

        {isDocumentPayment ? (
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={async () => {
                setDownloading(true);
                await onDownloadDocument().catch(() => alert('Le document n’est pas encore disponible. Si vous venez de payer, patientez quelques instants puis réessayez.'));
                setDownloading(false);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full inline-flex items-center gap-2"
            >
              {downloading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Télécharger le PDF
            </button>
            <button onClick={onGoAccount} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
              Aller à mon espace candidat
            </button>
          </div>
        ) : (
          <button
            onClick={onGoAccount}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full inline-flex items-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Voir mon espace candidat
          </button>
        )}
      </div>
    </div>
  );
}

interface ErrorProps {
  onRetry: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

export function PaymentErrorPage({ onRetry, onBack, onGoHome }: ErrorProps) {
  // Récupérer les paramètres depuis l'URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const kind = searchParams.get('kind');
  
  // Si pas de paramètre 'kind', rediriger vers l'accueil
  useEffect(() => {
    if (!kind) {
      onGoHome();
    }
  }, [kind, onGoHome]);

  // Si pas de kind, ne pas afficher le contenu
  if (!kind) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={42} />
        </div>
        <h1 className="font-display font-bold text-3xl text-ink-900 mb-2">Paiement non finalisé</h1>
        <p className="text-ink-600 mb-6">
          Le paiement n'a pas abouti ou a été annulé. Vous pouvez réessayer sans risque.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full"
          >
            Réessayer
          </button>
          <button
            onClick={onBack}
            className="border-2 border-ink-200 hover:border-ink-900 text-ink-900 font-bold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>
    </div>
  );
}