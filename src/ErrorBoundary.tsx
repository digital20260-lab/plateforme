import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Ne jamais afficher ni logger de détails techniques côté navigateur.
    // En production, brancher un SDK Sentry frontend avec DSN public si nécessaire.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              !
            </div>
            <h1 className="font-display font-bold text-2xl text-ink-900 mb-2">Une erreur est survenue</h1>
            <p className="text-ink-600 mb-6">
              La page n'a pas pu s'afficher correctement. Vous pouvez recharger l'application.
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}