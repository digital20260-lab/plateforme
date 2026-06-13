import { useState } from 'react';
import { ArrowLeft, CheckCircle, Mail, Send, XCircle } from 'lucide-react';
import { requestPasswordReset } from './lib/supabaseClient';

interface Props {
  onBack: () => void;
  onLogin: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ResetPasswordPage({ onBack, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const sendReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      await requestPasswordReset(email.trim());
      setStatus('success');
    } catch {
      // Ne jamais exposer le détail technique à l'utilisateur.
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Retour
          </button>
        </div>
      </div>

      <header className="bg-forest-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-30"></div>
        <div className="absolute top-0 inset-x-0 h-1 bg-ci-flag"></div>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <Mail size={28} />
          </div>
          <h1 className="font-display font-bold text-3xl leading-tight mb-2">Mot de passe oublié ?</h1>
          <p className="text-forest-100 text-sm">
            Entrez l'email associé à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <section className="bg-white border border-ink-100 rounded-2xl p-6 shadow-sm">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-forest-100 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Lien envoyé</h2>
              <p className="text-ink-600 text-sm mb-6">
                Si un compte existe avec <span className="font-bold text-ink-900">{email}</span>, un lien de réinitialisation a été envoyé.
              </p>
              <button
                onClick={onLogin}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={sendReset} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-ink-700 mb-1 block">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500"
                />
              </div>

              {status === 'error' && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm p-3 rounded-lg flex gap-2">
                  <XCircle size={16} className="flex-shrink-0 mt-0.5" />
                  Une erreur est survenue
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl inline-flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>

            </form>
          )}
        </section>
      </main>
    </div>
  );
}