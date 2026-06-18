import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Briefcase, GraduationCap, ChevronRight, ChevronLeft,
  MapPin, Filter, Settings as SettingsIcon, Menu,
  FileText, Download, BookOpen, X, CheckCircle, Building2, RotateCcw
} from 'lucide-react';
import { mockListings, ListingType, mockPastPapers, Listing } from './data';
import { mockQuizzes, type Quiz } from './quizzes';
import { QuizPage } from './QuizPage';
import { PaperPage } from './PaperPage';
import { AccountPage, type User } from './AccountPage';
import { SubscribePage } from './SubscribePage';
import { InfoPage, type InfoPageKind } from './InfoPages';
import { ListingDetailsPage } from './ListingDetailsPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { PaymentSuccessPage, PaymentErrorPage } from './PaymentResultPages';
import { usePayment } from './hooks/usePayment';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { applySeo, homeSeo, listingSeo, PAGE_SEO } from './lib/seo';
import { supabase, signIn, signUp, getMyProfile, updateMyProfile, signOut } from './lib/supabaseClient';
import clsx from 'clsx';

const PAGE_SIZE = 9;

// ---------------------------------------------------------
// Mini-routeur par hash : chaque section a sa page dédiée
//   #listing=ID  → page détails offre/concours
//   #quiz=ID     → page quiz
//   #sujet=ID    → page achat sujet
//   #compte      → espace candidat (paramètres)
// ---------------------------------------------------------
type Route =
  | { page: 'home' }
  | { page: 'listing'; id: string }
  | { page: 'quiz'; id: string }
  | { page: 'paper'; id: string }
  | { page: 'subscribe'; plan: 'premium' }
  | { page: 'info'; kind: InfoPageKind }
  | { page: 'reset-password' }
  | { page: 'payment-success' }
  | { page: 'payment-error' }
  | { page: 'account' };

type HomeSection = 'accueil' | 'offres' | 'preparation' | 'tarifs';

const parseRoute = (): Route => {
  if (typeof window === 'undefined') return { page: 'home' };
  if (window.location.pathname === '/paiement/succes') return { page: 'payment-success' };
  if (window.location.pathname === '/paiement/echec') return { page: 'payment-error' };
  const h = window.location.hash.replace(/^#/, '');
  if (h === 'compte') return { page: 'account' };
  if (h.startsWith('listing=')) return { page: 'listing', id: h.slice(8) };
  if (h.startsWith('quiz=')) return { page: 'quiz', id: h.slice(5) };
  if (h.startsWith('sujet=')) return { page: 'paper', id: h.slice(6) };
  if (h === 'abonnement=premium' || h === 'abonnement=essentiel') return { page: 'subscribe', plan: 'premium' };
  if (h === 'contact') return { page: 'info', kind: 'contact' };
  if (h === 'faq') return { page: 'info', kind: 'faq' };
  if (h === 'cgu') return { page: 'info', kind: 'cgu' };
  if (h === 'confidentialite') return { page: 'info', kind: 'confidentialite' };
  if (h === 'reset-password') return { page: 'reset-password' };
  return { page: 'home' };
};

const routeToHash = (r: Route): string => {
  switch (r.page) {
    case 'account': return '#compte';
    case 'listing': return `#listing=${r.id}`;
    case 'quiz': return `#quiz=${r.id}`;
    case 'paper': return `#sujet=${r.id}`;
    case 'subscribe': return `#abonnement=${r.plan}`;
    case 'info': return `#${r.kind}`;
    case 'reset-password': return '#reset-password';
    case 'payment-success': return '/paiement/succes';
    case 'payment-error': return '/paiement/echec';
    case 'home': return '/';
    default: return '/';
  }
};

const STORAGE_QUIZ_USAGE = 'ecci.quizUsage';

interface QuizUsage {
  quizIds: string[];
}

const loadQuizUsage = (): QuizUsage => {
  try {
    const raw = localStorage.getItem(STORAGE_QUIZ_USAGE);
    if (raw) return JSON.parse(raw) as QuizUsage;
  } catch { /* noop */ }
  return { quizIds: [] };
};

function App() {
  const [activeTab, setActiveTab] = useState<'tous' | ListingType>('tous');
  const [searchQuery, setSearchQuery] = useState('');

  // ----- Routing -----
  const [route, setRouteState] = useState<Route>(parseRoute);

  const navigate = (r: Route) => {
    setRouteState(r);
    if (typeof window !== 'undefined') {
      const hash = routeToHash(r);
      window.history.pushState({}, '', hash || window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  // Synchroniser avec navigation back/forward et liens ancres
  useEffect(() => {
    const onPop = () => setRouteState(parseRoute());
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  // Entités dérivées de la route
  const selectedListing = route.page === 'listing' ? mockListings.find(l => l.id === route.id) || null : null;
  const routeQuiz = route.page === 'quiz' ? mockQuizzes.find(q => q.id === route.id) || null : null;
  const routePaper = route.page === 'paper' ? mockPastPapers.find(p => p.id === route.id) || null : null;
  const successPaperId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('paperId') : null;
  const successPaper = successPaperId ? mockPastPapers.find(p => p.id === successPaperId) || null : null;
  const { downloadDocument } = usePayment();

  // ----- SEO dynamique : titre + description + JSON-LD par page -----
  useEffect(() => {
    if (route.page === 'listing' && selectedListing) {
      listingSeo(selectedListing);
    } else if (route.page === 'quiz' && routeQuiz) {
      applySeo({
        title: `${routeQuiz.title} — Quiz de préparation gratuit`,
        description: `Entraînez-vous gratuitement : ${routeQuiz.description}`,
        path: `#quiz=${routeQuiz.id}`
      });
    } else if (route.page === 'paper' && routePaper) {
      applySeo({
        title: `${routePaper.title} — Ancien sujet ${routePaper.concours} ${routePaper.year}`,
        description: `Téléchargez le sujet officiel ${routePaper.concours} session ${routePaper.year} en PDF pour préparer votre concours.`,
        path: `#sujet=${routePaper.id}`
      });
    } else if (route.page === 'info') {
      const seo = PAGE_SEO[route.kind];
      if (seo) applySeo(seo);
    } else if (route.page === 'account') {
      applySeo(PAGE_SEO.account);
    } else if (route.page === 'reset-password') {
      applySeo({
        title: 'Réinitialiser mon mot de passe',
        description: 'Recevez par email un lien sécurisé pour réinitialiser votre mot de passe Emploi Concours CI.',
        path: '#reset-password'
      });
    } else if (route.page === 'payment-success') {
      applySeo({
        title: 'Paiement réussi',
        description: 'Votre paiement a été reçu. Votre abonnement ou document sera activé après validation du webhook.',
        path: 'paiement/succes'
      });
    } else if (route.page === 'payment-error') {
      applySeo({
        title: 'Paiement échoué',
        description: 'Le paiement n’a pas abouti. Vous pouvez réessayer en toute sécurité.',
        path: 'paiement/echec'
      });
    } else {
      homeSeo();
    }
  }, [route, selectedListing, routeQuiz, routePaper]);

  // Wrapper rétro-compatible utilisé par les cartes / hero
  const setSelectedListing = (l: Listing | null) =>
    navigate(l ? { page: 'listing', id: l.id } : { page: 'home' });

  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHomeSection, setActiveHomeSection] = useState<HomeSection>('accueil');
  const [accountTab, setAccountTab] = useState<'profil' | 'preferences' | 'abonnement' | 'securite' | 'favoris'>('profil');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const scrollToHomeSection = (section: HomeSection) => {
    setActiveHomeSection(section);
    if (section === 'accueil') {
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.getElementById(section);
    if (target) {
      window.history.replaceState({}, '', `#${section}`);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHomeNav = (section: HomeSection) => {
    setMobileMenuOpen(false);
    if (route.page !== 'home') {
      navigate({ page: 'home' });
      window.setTimeout(() => scrollToHomeSection(section), 80);
    } else {
      scrollToHomeSection(section);
    }
  };

  const headerNavClass = (section: HomeSection) => clsx(
    'px-3 py-2 text-sm font-semibold transition-colors underline-offset-8 decoration-2',
    activeHomeSection === section
      ? 'text-forest-700 underline decoration-forest-600'
      : 'text-ink-600 hover:text-forest-700 hover:underline hover:decoration-forest-600'
  );

  const mobileNavClass = (section: HomeSection) => clsx(
    'flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold transition-colors text-left',
    activeHomeSection === section
      ? 'bg-forest-50 text-forest-700 underline decoration-forest-600 underline-offset-4'
      : 'text-ink-800 hover:bg-orange-50 hover:text-orange-700'
  );

  // Bloquer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Mettre à jour l'onglet actif pendant le scroll de la home.
  useEffect(() => {
    if (route.page !== 'home') return;
    const onScroll = () => {
      const y = window.scrollY + 140;
      const positions: Array<[HomeSection, number]> = [
        ['accueil', 0],
        ['offres', document.getElementById('offres')?.offsetTop ?? Number.POSITIVE_INFINITY],
        ['preparation', document.getElementById('preparation')?.offsetTop ?? Number.POSITIVE_INFINITY],
        ['tarifs', document.getElementById('tarifs')?.offsetTop ?? Number.POSITIVE_INFINITY]
      ];
      let current: HomeSection = 'accueil';
      for (const [section, top] of positions) {
        if (y >= top) current = section;
      }
      setActiveHomeSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [route.page]);

  // Fermer le menu paramètres au clic en dehors (fiable, sans overlay)
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [userMenuOpen]);



  // Authentification + tracking quiz
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isHydrating, setIsHydrating] = useState(true); // Prevent auth flash on refresh
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ----- Offres / concours sauvegardés (favoris) -----
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ecci.saved');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch { return []; }
  });

  const toggleSave = (id: string) => {
    if (!currentUser) {
      setAuthModal('register');
      return;
    }
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('ecci.saved', JSON.stringify(next));
      return next;
    });
  };
  const [quizUsage, setQuizUsage] = useState<QuizUsage>(loadQuizUsage);
  const [quizLimitInfo, setQuizLimitInfo] = useState<{ type: 'auth' | 'limit'; quizTitle: string } | null>(null);

  const mapSupabaseUser = async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const profile = await getMyProfile().catch(() => null);
    return {
      id: user.id,
      name: profile?.name || user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      phone: profile?.phone || '',
      plan: profile?.plan === 'premium' ? 'premium' : 'gratuit',
      planExpiry: profile?.plan_expiry || undefined,
      alertType: profile?.alert_type || 'les_deux',
      alertChannels: { email: profile?.alert_email !== false },
      preferredSectors: profile?.preferred_sectors || [],
      preferredLevel: profile?.preferred_level || ''
    };
  };

  // Session Supabase réelle uniquement (aucune connexion locale/démo).
  useEffect(() => {
    localStorage.removeItem('ecci.user'); // Nettoyage des anciennes sessions locales
    if (!supabase) {
      setIsHydrating(false);
      return;
    }

    // Check initial session
    mapSupabaseUser()
      .then(user => {
        setCurrentUser(user);
        setIsHydrating(false);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsHydrating(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        setIsHydrating(false);
        return;
      }
      const mapped = await mapSupabaseUser().catch(() => null);
      setCurrentUser(mapped);
      setIsHydrating(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Déconnexion automatique après 10 minutes d'inactivité (seulement si connecté)
  useInactivityLogout({
    timeoutMinutes: 10,
    onLogout: async () => {
      if (isAuthenticated) {
        await handleLogout();
        setAuthInfo('Votre session a expiré en raison d\'une inactivité prolongée.');
        navigate({ page: 'home' });
      }
    }
  });

  const isAuthenticated = !!currentUser;
  const isPaid = currentUser?.plan === 'premium';

  // Logique : 1 seul quiz pour le plan gratuit, illimité pour le plan Premium
  const canAttemptQuiz = (): { ok: boolean; reason?: 'auth' | 'limit' } => {
    if (!isAuthenticated) return { ok: false, reason: 'auth' };
    if (isPaid) return { ok: true };
    if (quizUsage.quizIds.length >= 1) return { ok: false, reason: 'limit' };
    return { ok: true };
  };

  const handleStartQuiz = (quiz: Quiz) => {
    const check = canAttemptQuiz();
    if (!check.ok) {
      setQuizLimitInfo({ type: check.reason!, quizTitle: quiz.title });
      return;
    }
    // Enregistrer la consommation (non-payant uniquement)
    if (!isPaid && !quizUsage.quizIds.includes(quiz.id)) {
      const updated: QuizUsage = {
        quizIds: [...quizUsage.quizIds, quiz.id]
      };
      setQuizUsage(updated);
      localStorage.setItem(STORAGE_QUIZ_USAGE, JSON.stringify(updated));
    }
    navigate({ page: 'quiz', id: quiz.id });
  };

  const handleAuthSubmit = async (mode: 'login' | 'register') => {
    setAuthError('');
    setAuthInfo('');

    if (!supabase) {
      setAuthError('Une erreur est survenue');
      return;
    }

    const nameInput = (document.getElementById('auth-name') as HTMLInputElement | null)?.value || 'Candidat';
    const emailInput = (document.getElementById('auth-email') as HTMLInputElement | null)?.value || '';
    const passwordInput = (document.getElementById('auth-password') as HTMLInputElement | null)?.value || '';

    try {
      setAuthLoading(true);
      if (mode === 'register') {
        const data = await signUp(emailInput, passwordInput, nameInput);
        if (!data.session) {
          setAuthInfo('Vérifiez votre email pour confirmer votre compte.');
          return;
        }
      } else {
        await signIn(emailInput, passwordInput);
      }

      const mapped = await mapSupabaseUser();
      if (mapped) setCurrentUser(mapped);
      setAuthModal(null);
    } catch (err: any) {
      const errorMessage = err?.message || '';
      if (mode === 'login') {
        if (errorMessage.includes('Invalid login credentials')) {
          setAuthError('Identifiant ou mot de passe incorrect.');
        } else if (errorMessage.includes('Email not confirmed')) {
          setAuthError('Veuillez confirmer votre email avant de vous connecter.');
        } else {
          setAuthError('Erreur de connexion. Veuillez réessayer.');
        }
      } else {
        if (errorMessage.includes('already registered')) {
          setAuthError('Cet email est déjà utilisé.');
        } else if (errorMessage.includes('password')) {
          setAuthError('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
          setAuthError('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut().catch(() => {});
    setCurrentUser(null);
  };

  // Abonnement : si connecté → page de paiement, sinon → inscription
  // (avec mémorisation du plan voulu pour rediriger après connexion)
  const [pendingPlan, setPendingPlan] = useState<'premium' | null>(null);

  const handleSubscribe = (plan: 'premium') => {
    if (currentUser) {
      navigate({ page: 'subscribe', plan });
    } else {
      setPendingPlan(plan);
      setAuthModal('register');
    }
  };

  const handleAccountUpdate = (updated: User) => {
    setCurrentUser(updated);
    if (supabase) {
      updateMyProfile({
        name: updated.name,
        phone: updated.phone,
        alert_type: updated.alertType,
        alert_email: updated.alertChannels?.email,
        preferred_sectors: updated.preferredSectors,
        preferred_level: updated.preferredLevel
      }).catch(() => {
        // Ne pas exposer le détail technique à l'utilisateur.
      });
    }
  };

  // Après connexion, si un plan était en attente, on va directement au paiement
  useEffect(() => {
    if (currentUser && pendingPlan) {
      const plan = pendingPlan;
      setPendingPlan(null);
      navigate({ page: 'subscribe', plan });
    }
  }, [currentUser, pendingPlan]);

  // Si on arrive sur la page d'abonnement sans être connecté :
  // proposer l'inscription et mémoriser le plan pour y revenir après
  useEffect(() => {
    if (route.page === 'subscribe' && !currentUser) {
      setPendingPlan(route.plan);
      setAuthModal('register');
    }
  }, [route, currentUser]);

  // Filtres avancés (principalement pour les emplois)
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterContract, setFilterContract] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterExperience, setFilterExperience] = useState<string>('');
  const [filterPublishedWithin, setFilterPublishedWithin] = useState<string>(''); // '7', '14', '30' jours
  const [sortBy, setSortBy] = useState<'date' | 'deadline'>('date');
  const [currentPage, setCurrentPage] = useState(1);

  // Construire les options de filtres depuis les données
  const sectorOptions = useMemo(() => {
    const s = new Set<string>();
    mockListings.filter(l => l.type === 'emploi').forEach(l => l.sector && s.add(l.sector));
    return Array.from(s).sort();
  }, []);
  const contractOptions = useMemo(() => {
    const s = new Set<string>();
    mockListings.filter(l => l.type === 'emploi').forEach(l => l.contractType && s.add(l.contractType));
    return Array.from(s).sort();
  }, []);
  const locationOptions = useMemo(() => {
    const s = new Set<string>();
    mockListings.filter(l => l.type === 'emploi').forEach(l => l.location && s.add(l.location));
    return Array.from(s).sort();
  }, []);


  const filteredListings = useMemo(() => {
    const list = mockListings.filter(listing => {
      const matchesTab = activeTab === 'tous' || listing.type === activeTab;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.ministry.toLowerCase().includes(q) ||
        (listing.company?.toLowerCase().includes(q) ?? false) ||
        (listing.location?.toLowerCase().includes(q) ?? false) ||
        (listing.sector?.toLowerCase().includes(q) ?? false);

      // Filtres avancés (s'appliquent surtout aux emplois)
      const matchesSector = !filterSector || listing.sector === filterSector;
      const matchesContract = !filterContract || listing.contractType === filterContract;
      const matchesLocation = !filterLocation || listing.location === filterLocation;
      const matchesLevel = !filterLevel || listing.level.toLowerCase().includes(filterLevel.toLowerCase());
      const matchesExp = !filterExperience || (listing.experience?.toLowerCase().includes(filterExperience.toLowerCase()) ?? false);
      // Filtre par période de publication (7 / 14 / 30 jours)
      let matchesPublished = true;
      if (filterPublishedWithin && listing.publishedAt) {
        // Date de référence : "aujourd hui" = 10 juin 2026 (cohérent avec les données)
        const referenceDate = new Date('2026-06-10');
        const publishedDate = new Date(listing.publishedAt);
        const diffDays = Math.floor((referenceDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
        matchesPublished = diffDays >= 0 && diffDays <= parseInt(filterPublishedWithin, 10);
      } else if (filterPublishedWithin && !listing.publishedAt) {
        matchesPublished = false;
      }

      return matchesTab && matchesSearch && matchesSector && matchesContract && 
             matchesLocation && matchesLevel && matchesExp && matchesPublished;
    });

    // Tri
    list.sort((a, b) => {
      if (sortBy === 'date') {
        const da = a.publishedAt || '1970-01-01';
        const db = b.publishedAt || '1970-01-01';
        return db.localeCompare(da);
      }
      return a.deadline.localeCompare(b.deadline);
    });

    return list;
  }, [activeTab, searchQuery, filterSector, filterContract, filterLocation, filterLevel, filterExperience, filterPublishedWithin, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const paginatedListings = filteredListings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterSector, filterContract, filterLocation, filterLevel, filterExperience, filterPublishedWithin, sortBy]);

  const resetFilters = () => {
    setFilterSector('');
    setFilterContract('');
    setFilterLocation('');
    setFilterLevel('');
    setFilterExperience('');
    setFilterPublishedWithin('');
    setSortBy('date');
  };

  const activeFiltersCount = [filterSector, filterContract, filterLocation, filterLevel, filterExperience, filterPublishedWithin].filter(Boolean).length;

  return (
    <div className="min-h-screen text-[#14130d]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-ink-100">
        {/* Bandeau drapeau ivoirien discret */}
        <div className="h-1 bg-ci-flag"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => handleHomeNav('accueil')} className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Logo Emploi Concours CI"
                  className="w-10 h-10 rounded-xl shadow-sm"
                />
              </div>
              <div className="hidden sm:block leading-none">
                <div className="font-display font-bold text-[15px] text-ink-900 tracking-tight">Emploi Concours</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-500 font-semibold">Côte d'Ivoire</div>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-1">
              <button onClick={() => handleHomeNav('accueil')} className={headerNavClass('accueil')}>Accueil</button>
              <button onClick={() => handleHomeNav('offres')} className={headerNavClass('offres')}>Opportunités</button>
              <button onClick={() => handleHomeNav('preparation')} className={headerNavClass('preparation')}>Préparation</button>
              <button onClick={() => handleHomeNav('tarifs')} className={headerNavClass('tarifs')}>Abonnements</button>
            </nav>

            <div className="flex items-center gap-2">
              {isHydrating ? (
                // Afficher un skeleton/placeholder pendant le chargement pour éviter le flicker
                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full bg-ink-50 border-ink-100 h-9 w-24 animate-pulse"></div>
              ) : currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 border rounded-full transition-colors",
                      currentUser.plan === 'premium'
                        ? "bg-orange-50 hover:bg-orange-100 border-orange-300 hover:border-orange-500"
                        : "bg-forest-50 hover:bg-forest-100 border-forest-200 hover:border-forest-500"
                    )}
                    title="Paramètres du compte"
                  >
                    <div className={clsx(
                      "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center",
                      currentUser.plan === 'premium' ? "bg-orange-500" : "bg-forest-600"
                    )}>
                      {currentUser.plan === 'premium' ? '👑' : currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="leading-tight text-left hidden sm:block">
                      <div className="text-xs font-bold text-ink-900 max-w-[8rem] truncate">{currentUser.name}</div>
                      <div className={clsx(
                        "text-[10px] uppercase tracking-wider font-bold",
                        currentUser.plan === 'premium' ? "text-orange-600" : "text-forest-700"
                      )}>
                        {currentUser.plan === 'premium' ? '★ Premium' : 'Paramètres'}
                      </div>
                    </div>
                    <SettingsIcon size={14} className={currentUser.plan === 'premium' ? "text-orange-600" : "text-forest-600"} />
                  </button>

                  {/* Menu déroulant paramètres */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-ink-100 rounded-2xl shadow-sticker-lg z-50 overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-ink-100 bg-ink-50">
                        <div className="text-sm font-bold text-ink-900 truncate">{currentUser.name}</div>
                        <div className="text-xs text-ink-500 truncate">{currentUser.email}</div>
                        <span className={clsx(
                          "inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          currentUser.plan === 'gratuit' && "bg-ink-200 text-ink-700",
                          currentUser.plan === 'premium' && "bg-orange-100 text-orange-700"
                        )}>
                          {currentUser.plan === 'premium' ? '👑 Plan Premium' : 'Plan Gratuit'}
                        </span>
                      </div>
                      <nav className="py-1.5">
                        {[
                          { label: 'Mise à jour du profil', icon: '👤', tab: 'profil' },
                          { label: 'Préférences des offres', icon: '🔔', tab: 'preferences' },
                          { label: 'Mes offres sauvegardées', icon: '⭐', tab: 'favoris' },
                          { label: 'Abonnement / Renouvellement', icon: '💳', tab: 'abonnement' },
                          { label: 'Sécurité du compte', icon: '🔐', tab: 'securite' }
                        ].map(item => (
                          <button
                            key={item.tab}
                            onClick={() => {
                              setUserMenuOpen(false);
                              setAccountTab(item.tab as typeof accountTab);
                              navigate({ page: 'account' });
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2.5"
                          >
                            <span>{item.icon}</span> {item.label}
                            {item.tab === 'favoris' && savedIds.length > 0 && (
                              <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                                {savedIds.length}
                              </span>
                            )}
                          </button>
                        ))}
                      </nav>
                      <div className="border-t border-ink-100 py-1.5">
                        <button
                          onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                          className="w-full text-left px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-2.5"
                        >
                          <span>🚪</span> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal('login')}
                    className="hidden sm:block px-3 py-2 text-sm font-semibold text-ink-900 hover:text-forest-600"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => setAuthModal('register')}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    S'inscrire
                    <ChevronRight size={14} />
                  </button>
                </>
              )}

              {/* Bouton hamburger — mobile et tablette uniquement */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl border border-ink-200 hover:border-orange-500 flex items-center justify-center text-ink-900 hover:text-orange-600 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ====== Menu mobile plein écran ====== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Fond sombre */}
          <div
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Panneau latéral */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-sticker-lg flex flex-col animate-slide-up overflow-y-auto">
            <div className="h-1 bg-ci-flag"></div>

            {/* En-tête du panneau */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Logo Emploi Concours CI" className="w-9 h-9 rounded-xl" />
                <div className="leading-none">
                  <div className="font-display font-bold text-sm text-ink-900">Emploi Concours</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-ink-500 font-semibold">Côte d'Ivoire</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-ink-50 flex items-center justify-center text-ink-500 hover:text-orange-600"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Carte utilisateur si connecté */}
            {currentUser && (
              <div className={clsx(
                "mx-5 mt-4 p-4 rounded-2xl border",
                currentUser.plan === 'premium' ? "bg-orange-50 border-orange-200" : "bg-forest-50 border-forest-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-full text-white text-sm font-bold flex items-center justify-center",
                    currentUser.plan === 'premium' ? "bg-orange-500" : "bg-forest-600"
                  )}>
                    {currentUser.plan === 'premium' ? '👑' : currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink-900 truncate">{currentUser.name}</div>
                    <div className={clsx(
                      "text-[10px] uppercase tracking-wider font-bold",
                      currentUser.plan === 'premium' ? "text-orange-600" : "text-forest-700"
                    )}>
                      {currentUser.plan === 'premium' ? '★ Plan Premium' : 'Plan Gratuit'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sections principales */}
            <nav className="px-3 py-4">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-400 px-3 mb-2">Navigation</div>
              {[
                { label: 'Accueil', icon: '🏠', section: 'accueil' as HomeSection },
                { label: 'Opportunités', icon: '💼', section: 'offres' as HomeSection },
                { label: 'Préparation & Quiz', icon: '📚', section: 'preparation' as HomeSection },
                { label: 'Abonnements', icon: '💳', section: 'tarifs' as HomeSection }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => handleHomeNav(item.section)}
                  className={mobileNavClass(item.section)}
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>

            {/* Espace candidat si connecté */}
            {currentUser && (
              <nav className="px-3 pb-4 border-t border-ink-100 pt-4">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-400 px-3 mb-2">Mon espace</div>
                {[
                  { label: 'Mise à jour du profil', icon: '👤', tab: 'profil' },
                  { label: 'Préférences des offres', icon: '🔔', tab: 'preferences' },
                  { label: `Mes favoris${savedIds.length ? ` (${savedIds.length})` : ''}`, icon: '⭐', tab: 'favoris' },
                  { label: 'Abonnement', icon: '💳', tab: 'abonnement' },
                  { label: 'Sécurité', icon: '🔐', tab: 'securite' }
                ].map(item => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAccountTab(item.tab as typeof accountTab);
                      navigate({ page: 'account' });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold text-ink-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
                  >
                    <span className="text-lg">{item.icon}</span> {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Aide */}
            <nav className="px-3 pb-4 border-t border-ink-100 pt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-400 px-3 mb-2">Aide</div>
              {([
                { label: 'Nous contacter', icon: '✉️', kind: 'contact' as InfoPageKind },
                { label: 'FAQ', icon: '❓', kind: 'faq' as InfoPageKind }
              ]).map(item => (
                <button
                  key={item.kind}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate({ page: 'info', kind: item.kind });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] font-semibold text-ink-800 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
                >
                  <span className="text-lg">{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>

            {/* Pied du panneau : connexion / déconnexion */}
            <div className="mt-auto px-5 py-5 border-t border-ink-100">
              {currentUser ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full py-3 border-2 border-orange-500 text-orange-600 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                >
                  🚪 Déconnexion
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthModal('register'); }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full"
                  >
                    S'inscrire gratuitement
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setAuthModal('login'); }}
                    className="w-full py-3 border-2 border-ink-200 hover:border-ink-900 text-ink-900 font-bold rounded-full"
                  >
                    Connexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pages dédiées : détails, quiz, sujet, espace candidat — sinon la home */}
      {(route.page === 'listing' || selectedListing) && selectedListing ? (
        <ListingDetailsPage
          listing={selectedListing}
          onBack={() => navigate({ page: 'home' })}
          onActivateAlert={() => {
            if (!currentUser) setAuthModal('register');
          }}
          isSaved={savedIds.includes(selectedListing.id)}
          onToggleSave={() => toggleSave(selectedListing.id)}
        />
      ) : route.page === 'quiz' && routeQuiz ? (
        <QuizPage
          quiz={routeQuiz}
          onBack={() => navigate({ page: 'home' })}
        />
      ) : route.page === 'paper' && routePaper ? (
        <PaperPage
          paper={routePaper}
          user={currentUser}
          onBack={() => navigate({ page: 'home' })}
          onLogin={() => setAuthModal('login')}
        />
      ) : route.page === 'subscribe' && currentUser ? (
        <SubscribePage
          plan={route.plan}
          user={currentUser}
          onBack={() => navigate({ page: 'home' })}
        />
      ) : route.page === 'info' ? (
        <InfoPage
          kind={route.kind}
          onBack={() => navigate({ page: 'home' })}
        />
      ) : route.page === 'reset-password' ? (
        <ResetPasswordPage
          onBack={() => navigate({ page: 'home' })}
          onLogin={() => {
            navigate({ page: 'home' });
            setAuthModal('login');
          }}
        />
      ) : route.page === 'payment-success' ? (
        <PaymentSuccessPage
          onGoAccount={() => navigate({ page: 'account' })}
          onGoHome={() => navigate({ page: 'home' })}
          onRefreshProfile={async () => {
            const mapped = await mapSupabaseUser().catch(() => null);
            if (mapped) setCurrentUser(mapped);
          }}
          documentTitle={successPaper?.title}
          onDownloadDocument={successPaper ? () => downloadDocument(successPaper) : undefined}
        />
      ) : route.page === 'payment-error' ? (
        <PaymentErrorPage
          onRetry={() => successPaper ? navigate({ page: 'paper', id: successPaper.id }) : navigate({ page: 'subscribe', plan: 'premium' })}
          onBack={() => navigate({ page: 'home' })}
          onGoHome={() => navigate({ page: 'home' })}
        />
      ) : route.page === 'account' ? (
        <AccountPage
          key={accountTab}
          user={currentUser}
          onUpdate={handleAccountUpdate}
          onLogout={() => { handleLogout(); navigate({ page: 'home' }); }}
          onBack={() => navigate({ page: 'home' })}
          onRequestLogin={() => setAuthModal('login')}
          quizUsedToday={quizUsage.quizIds.length >= 1}
          isPaid={isPaid}
          initialTab={accountTab}
          savedListings={mockListings.filter(l => savedIds.includes(l.id))}
          onOpenListing={(id) => navigate({ page: 'listing', id })}
          onRemoveSaved={(id) => toggleSave(id)}
        />
      ) : (
      <>

      {/* Hero Section - Format magazine compact */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-12 sm:pb-14 bg-white">
        <div className="absolute inset-0 -z-10 bg-grain opacity-30"></div>
        <div className="absolute top-0 -left-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-72 bg-forest-200/40 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">

            {/* Colonne gauche : pitch + recherche */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-700 text-white rounded-full text-[11px] font-semibold mb-5">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
                {mockListings.filter(l => l.publishedAt && (new Date('2026-06-10').getTime() - new Date(l.publishedAt).getTime()) / (1000 * 60 * 60 * 24) <= 7).length} nouvelles offres cette semaine
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.5rem] tracking-tight text-ink-900 leading-[1] mb-4">
                Votre prochaine{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">opportunité</span>
                  <span className="absolute inset-x-0 bottom-1 h-2.5 bg-orange-300 -z-0 -skew-x-6"></span>
                </span>{' '}
                est ici.
              </h1>

              <p className="text-base sm:text-lg text-ink-600 mb-6 leading-relaxed max-w-xl">
                Emplois & concours en <span className="italic font-serif text-forest-700">Côte d'Ivoire</span> — centralisés, vérifiés, mis à jour chaque jour.
              </p>

              {/* Barre de recherche compacte */}
              <div className="bg-white rounded-xl shadow-sticker-lg p-1.5 flex gap-1.5 border border-ink-100 max-w-xl">
                <div className="flex-grow flex items-center px-3">
                  <Search className="text-ink-400 mr-2 flex-shrink-0" size={18} />
                  <input
                    type="text"
                    placeholder="Métier, entreprise, concours..."
                    className="bg-transparent border-none w-full text-ink-900 focus:ring-0 placeholder-ink-400 text-sm outline-none py-2.5"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <a
                  href="#offres"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  Explorer <ChevronRight size={16} />
                </a>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 text-sm">
                <span className="text-ink-400 text-xs mr-1">Populaire :</span>
                {['INFAS', 'Comptable', 'Banque', 'ENA'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 bg-white border border-ink-200 hover:border-orange-500 hover:bg-orange-50 text-ink-600 hover:text-orange-700 rounded-full text-[11px] font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Stats inline */}
              <div className="flex items-center gap-6 sm:gap-8 mt-6 pt-6 border-t border-ink-100">
                {[
                  { num: mockListings.filter(l => l.type === 'emploi').length + '+', label: 'Offres', color: 'text-orange-600' },
                  { num: mockListings.filter(l => l.type === 'concours').length, label: 'Concours', color: 'text-forest-700' },
                  { num: mockQuizzes.length, label: 'Quiz gratuits', color: 'text-ink-900' }
                ].map((s) => (
                  <div key={s.label}>
                    <div className={clsx("font-display font-bold text-2xl sm:text-3xl leading-none", s.color)}>{s.num}</div>
                    <div className="text-[11px] text-ink-500 font-medium mt-1 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : aperçu live des dernières offres */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-3 -left-3 right-8 h-full bg-orange-300/60 rounded-2xl -z-10 rotate-1"></div>
              <div className="absolute -bottom-2 -right-2 left-8 h-full bg-forest-300/50 rounded-2xl -z-20 -rotate-1"></div>

              <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sticker-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-ink-700">En direct</span>
                  </div>
                  <span className="text-[11px] text-ink-400 font-medium">Dernières publications</span>
                </div>

                <div className="space-y-2.5">
                  {[...mockListings]
                    .filter(l => l.publishedAt)
                    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
                    .slice(0, 4)
                    .map((l) => {
                      const isC = l.type === 'concours';
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedListing(l)}
                          className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-ink-100 hover:bg-ink-50 transition-all group"
                        >
                          <div className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-base",
                            isC ? "bg-forest-50 text-forest-700" : "bg-orange-50 text-orange-600"
                          )}>
                            {isC ? <GraduationCap size={18} /> : <Briefcase size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-bold text-sm text-ink-900 truncate group-hover:text-orange-700">
                              {l.title}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-0.5">
                              <span className="truncate font-medium">{l.company || l.ministry}</span>
                              {l.location && <><span>·</span><span className="truncate">{l.location.split(',')[0]}</span></>}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-ink-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </button>
                      );
                    })}
                </div>

                <a
                  href="#offres"
                  className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700"
                >
                  Voir toutes les opportunités
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content - Listings */}
      <main id="offres" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-orange-500"></div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-ink-600">Le marché en direct</span>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-ink-900 tracking-tight leading-tight max-w-2xl">
              Opportunités{' '}
              <span className="italic text-forest-700 font-serif">récentes</span>
            </h2>
          </div>

          <div className="inline-flex bg-ink-900 p-1 rounded-full self-start lg:self-end">
            {[
              { key: 'tous', label: 'Tout' },
              { key: 'emploi', label: 'Emplois', icon: Briefcase },
              { key: 'concours', label: 'Concours', icon: GraduationCap }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'tous' | ListingType)}
                  className={clsx(
                    "px-5 py-2 rounded-full font-semibold transition-all text-sm inline-flex items-center gap-1.5",
                    active ? "bg-orange-500 text-white" : "text-white/70 hover:text-orange-300"
                  )}
                >
                  {Icon && <Icon size={15} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Barre de filtres avancés */}
        {(activeTab === 'emploi' || activeTab === 'tous') && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 bg-white border border-ink-200 hover:border-orange-500 hover:text-orange-700 px-4 py-2.5 rounded-full font-semibold text-ink-900 text-sm transition-colors"
              >
                <Filter size={16} />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="inline-flex items-center gap-2 text-sm">
                <span className="text-ink-500 font-medium">Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'deadline')}
                  className="bg-white border border-ink-200 rounded-full px-4 py-2 text-sm font-medium text-ink-900 focus:border-orange-500 outline-none cursor-pointer"
                >
                  <option value="date">Plus récentes</option>
                  <option value="deadline">Échéance proche</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="bg-white border border-ink-100 rounded-2xl p-5 sm:p-6 animate-slide-up shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Secteur', value: filterSector, set: setFilterSector, options: sectorOptions, all: 'Tous les secteurs' },
                    { label: 'Type de contrat', value: filterContract, set: setFilterContract, options: contractOptions, all: 'Tous les contrats' },
                    { label: 'Lieu', value: filterLocation, set: setFilterLocation, options: locationOptions, all: 'Tous les lieux' }
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                      <select
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-orange-500 outline-none"
                      >
                        <option value="">{f.all}</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Niveau d études</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-orange-500 outline-none"
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="CEPE">CEPE / Sans diplôme</option>
                      <option value="BEPC">BEPC</option>
                      <option value="CAP">CAP / BT</option>
                      <option value="BAC">BAC</option>
                      <option value="BAC+2">BAC+2 / BTS</option>
                      <option value="BAC+3">BAC+3 / Licence</option>
                      <option value="BAC+4">BAC+4</option>
                      <option value="BAC+5">BAC+5 / Master</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Expérience</label>
                    <select
                      value={filterExperience}
                      onChange={(e) => setFilterExperience(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-orange-500 outline-none"
                    >
                      <option value="">Toutes les expériences</option>
                      <option value="Débutant">Débutant accepté</option>
                      <option value="1 an">1 an</option>
                      <option value="2 ans">2 ans</option>
                      <option value="3 ans">3 ans</option>
                      <option value="5 ans">5 ans et +</option>
                      <option value="10 ans">10 ans et +</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Publiées dans les</label>
                    <select
                      value={filterPublishedWithin}
                      onChange={(e) => setFilterPublishedWithin(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-orange-500 outline-none"
                    >
                      <option value="">Toutes les périodes</option>
                      <option value="3">3 derniers jours</option>
                      <option value="7">7 derniers jours</option>
                      <option value="14">14 derniers jours</option>
                      <option value="30">30 derniers jours</option>
                    </select>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <div className="flex justify-end mt-4 pt-4 border-t border-ink-100">
                    <button
                      onClick={resetFilters}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                    >
                      <X size={14} /> Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compteur de résultats */}
        <div className="mb-6 flex items-baseline gap-2">
          <span className="font-display font-bold text-2xl text-ink-900">{filteredListings.length}</span>
          <span className="text-sm text-ink-500 font-medium">
            opportunité{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
            {totalPages > 1 && <> · page {currentPage}/{totalPages}</>}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedListings.map(listing => {
            const isConcours = listing.type === 'concours';
            const accentClass = isConcours ? 'bg-forest-600' : 'bg-orange-500';
            return (
              <article
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className="group bg-white rounded-2xl border border-ink-100 hover:border-orange-500 hover:shadow-sticker transition-all overflow-hidden flex flex-col cursor-pointer relative"
              >
                {/* Accent latéral coloré */}
                <div className={clsx("absolute top-0 left-0 bottom-0 w-1", accentClass)}></div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className={clsx(
                      "text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-md",
                      isConcours ? "bg-forest-100 text-forest-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {isConcours ? 'Concours' : 'Emploi'}
                    </span>
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider stamp",
                      listing.status === 'Ouvert' && "text-forest-600",
                      listing.status === 'En cours' && "text-orange-600",
                      listing.status === 'Bientôt' && "text-orange-500",
                      listing.status === 'Fermé' && "text-ink-400"
                    )}>
                      {listing.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-[19px] text-ink-900 leading-tight mb-2 group-hover:underline decoration-orange-400 decoration-2 underline-offset-4 line-clamp-2">
                    {listing.title}
                  </h3>

                  {listing.type === 'emploi' && listing.company && (
                    <div className="flex items-center text-sm font-semibold text-forest-700 mb-3">
                      <Building2 size={13} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">{listing.company}</span>
                    </div>
                  )}

                  <p className="text-sm text-ink-600 mb-5 line-clamp-2 leading-relaxed flex-1">
                    {listing.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ink-50 border border-ink-100 rounded-md text-xs text-ink-600">
                      <MapPin size={11} />
                      {listing.type === 'emploi' ? listing.location || "Côte d'Ivoire" : listing.ministry}
                    </span>
                    {listing.type === 'emploi' && listing.contractType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ink-50 border border-ink-100 rounded-md text-xs text-ink-600">
                        <Briefcase size={11} />
                        {listing.contractType}
                      </span>
                    )}
                    {listing.type === 'emploi' && listing.workMode && (
                      <span className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ink-50 border border-ink-100 rounded-md text-xs text-ink-600">
                      <GraduationCap size={11} />
                      {listing.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-ink-100 mt-auto gap-2">
                    <div className="text-xs">
                      <div className="text-ink-400 uppercase tracking-wider font-semibold mb-0.5 text-[10px]">Clôture</div>
                      <div className="font-bold text-ink-900">
                        {new Date(listing.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 group-hover:text-orange-700">
                      Voir
                      <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className="bg-white border-2 border-dashed border-ink-200 rounded-2xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
              <Search size={28} className="text-orange-500" />
            </div>
            <h3 className="font-display font-bold text-2xl text-ink-900 mb-2">Aucun résultat</h3>
            <p className="text-ink-500 mb-5 max-w-sm mx-auto">Vos critères sont peut-être trop précis. Essayez d'élargir votre recherche.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold"
            >
              <RotateCcw size={14} /> Réinitialiser
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-ink-500">
              <span className="font-bold text-ink-900">{(currentPage - 1) * PAGE_SIZE + 1}</span>–<span className="font-bold text-ink-900">{Math.min(currentPage * PAGE_SIZE, filteredListings.length)}</span> sur <span className="font-bold text-ink-900">{filteredListings.length}</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-white border border-ink-100 rounded-full p-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center text-ink-900 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="inline-flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-ink-400 text-xs">···</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={clsx(
                        "min-w-[36px] h-9 rounded-full font-bold text-sm transition-colors",
                        currentPage === p
                          ? "bg-orange-500 text-white"
                          : "text-ink-900 hover:bg-orange-50"
                      )}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-full inline-flex items-center justify-center text-ink-900 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Preparation Section */}
      <section id="preparation" className="py-20 sm:py-24 bg-forest-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-40"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-orange-400"></div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-orange-300">Préparation</span>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-tight mb-4">
              Préparez-vous comme un{' '}
              <span className="italic font-serif text-orange-300">champion</span>.
            </h2>
            <p className="text-lg text-forest-100 leading-relaxed">
              Téléchargez les sujets officiels des concours et entraînez-vous gratuitement avec nos quiz corrigés.
            </p>
          </div>

          {/* Sujets de concours */}
          <div className="mb-16">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                <FileText size={24} className="text-orange-300" />
                Anciens sujets de concours
              </h3>
              <span className="text-sm text-forest-200">{mockPastPapers.length} disponibles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockPastPapers.map((paper) => (
                <div key={paper.id} className="bg-forest-800/60 backdrop-blur border border-forest-600 rounded-2xl p-5 hover:border-orange-400 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                      <FileText size={18} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 stamp px-2 py-0.5">
                      {paper.year}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-forest-200 mb-1.5">{paper.concours}</div>
                  <h4 className="font-display font-bold text-base text-white mb-4 leading-snug flex-1">{paper.title}</h4>
                  <div className="flex items-center justify-between pt-4 border-t border-forest-600">
                    <div>
                      <div className="font-display font-bold text-xl text-orange-300">{paper.price}</div>
                      <div className="text-[10px] text-forest-200 uppercase tracking-wider">FCFA</div>
                    </div>
                    <button
                      onClick={() => navigate({ page: 'paper', id: paper.id })}
                      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Download size={13} /> Obtenir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz gratuits avec compteur de limite */}
          <div id="quiz" className="mb-16 scroll-mt-24">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
              <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                <BookOpen size={24} className="text-orange-300" />
                Quiz d'entraînement
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white px-2 py-1 rounded-md">Gratuit</span>
              </h3>
              <span className="text-sm text-forest-200">{mockQuizzes.length} quiz · corrections incluses</span>
            </div>

            {/* Bandeau d'état utilisateur quiz */}
            <div className={clsx(
              "mb-5 rounded-xl p-4 border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between",
              !isAuthenticated && "bg-orange-50 border-orange-300 text-ink-900",
              isAuthenticated && !isPaid && "bg-white border-orange-300 text-ink-900",
              isAuthenticated && isPaid && "bg-orange-500 border-orange-600 text-white"
            )}>
              <div className="flex items-start gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  !isAuthenticated && "bg-orange-500 text-white",
                  isAuthenticated && !isPaid && "bg-orange-100 text-orange-700",
                  isAuthenticated && isPaid && "bg-white text-orange-600"
                )}>
                  {isAuthenticated && isPaid ? '∞' : '1x'}
                </div>
                <div>
                  {!isAuthenticated && (
                    <>
                      <div className="font-display font-bold text-base">Connectez-vous pour démarrer un quiz</div>
                      <div className="text-sm opacity-80">L'inscription est gratuite — 1 quiz offert au total avec le compte gratuit.</div>
                    </>
                  )}
                  {isAuthenticated && !isPaid && (
                    <>
                      <div className="font-display font-bold text-base">
                        {quizUsage.quizIds.length === 0
                          ? "Votre quiz gratuit vous attend"
                          : `Vous avez utilisé votre quiz gratuit`}
                      </div>
                      <div className="text-sm opacity-80">
                        {quizUsage.quizIds.length === 0
                          ? `Limite : 1 seul quiz avec le plan gratuit. Plan Premium = quiz illimités.`
                          : `Passez au plan Premium pour débloquer les quiz illimités.`}
                      </div>
                    </>
                  )}
                  {isAuthenticated && isPaid && (
                    <>
                      <div className="font-display font-bold text-base">Quiz illimités activés ✨</div>
                      <div className="text-sm opacity-90">Vous êtes abonné(e) {currentUser?.plan}. Entraînez-vous autant que vous voulez.</div>
                    </>
                  )}
                </div>
              </div>
              {!isAuthenticated && (
                <button
                  onClick={() => setAuthModal('register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  S'inscrire gratuitement <ChevronRight size={14} />
                </button>
              )}
              {isAuthenticated && !isPaid && (
                <a href="#tarifs" className="bg-ink-900 hover:bg-ink-800 text-white px-4 py-2 rounded-full text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap">
                  Passer Premium <ChevronRight size={14} />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockQuizzes.map((quiz) => {
                const usedFreeQuiz = !isPaid && quizUsage.quizIds.length >= 1;
                const lockedByLimit = isAuthenticated && usedFreeQuiz;
                const lockedByAuth = !isAuthenticated;
                const locked = lockedByAuth || lockedByLimit;
                return (
                  <button
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz)}
                    className={clsx(
                      "text-left bg-white text-ink-900 rounded-2xl overflow-hidden transition-all group flex flex-col border-2 relative",
                      locked ? "border-transparent opacity-75 hover:opacity-100" : "border-transparent hover:border-orange-400 hover:shadow-sticker"
                    )}
                  >
                    {locked && (
                      <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-ink-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {lockedByAuth ? '🔒 Connexion' : '🔒 Limite atteinte'}
                      </div>
                    )}
                    {usedFreeQuiz && !lockedByAuth && (
                      <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-forest-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        ✓ Quiz utilisé
                      </div>
                    )}
                    <div className="p-5 pb-3 flex items-start gap-3">
                      <div className="text-4xl">{quiz.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1">{quiz.subject}</div>
                        <h4 className="font-display font-bold text-base text-ink-900 leading-tight">{quiz.title}</h4>
                      </div>
                    </div>
                    <p className="px-5 text-sm text-ink-600 leading-relaxed line-clamp-2 mb-4">{quiz.description}</p>
                    <div className="mt-auto px-5 pb-5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-ink-500">
                        <span className="inline-flex items-center gap-1"><BookOpen size={12} />{quiz.questions.length}q</span>
                        <span className="inline-flex items-center gap-1">⏱ {quiz.duration}min</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-bold text-orange-600 group-hover:text-orange-700">
                        {locked ? 'Voir' : 'Démarrer'} <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coaching Banner */}
          <div className="bg-forest-800/60 backdrop-blur border border-forest-600 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-300">Coaching sur-mesure</span>
              </div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2 leading-tight">
                Un expert relit votre dossier
              </h3>
              <p className="text-forest-100 max-w-xl">
                Correction CV, lettre de motivation, simulation d'oraux : maximisez vos chances de réussite avec un accompagnement personnalisé.
              </p>
            </div>
            <a href="#tarifs" className="whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2 shadow-sm">
              Voir le Premium <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-[2px] bg-orange-500"></div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-ink-600">Abonnements</span>
              <div className="w-8 h-[2px] bg-forest-500"></div>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-ink-900 tracking-tight leading-tight mb-4">
              Investissez en{' '}
              <span className="italic font-serif text-forest-700">vous-même</span>.
            </h2>
            <p className="text-lg text-ink-600">À partir du prix d'un café par mois.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white rounded-3xl border border-ink-100 p-7 flex flex-col">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-ink-500 mb-2">Découverte</div>
              <h3 className="font-display font-bold text-2xl text-ink-900 mb-3">Gratuit</h3>
              <div className="mb-6">
                <span className="font-display font-bold text-5xl text-ink-900">0</span>
                <span className="text-ink-500 ml-1 font-medium">FCFA</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm flex-1">
                {['Accès aux offres du jour', 'Recherche et filtres unifiés', '1 quiz de préparation offert'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-ink-600">
                    <CheckCircle size={16} className="text-forest-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => currentUser ? navigate({ page: 'account' }) : setAuthModal('register')}
                className="w-full py-3 border-2 border-ink-900 text-ink-900 font-bold rounded-full hover:bg-ink-900 hover:text-white transition-colors"
              >
                {currentUser && currentUser.plan === 'gratuit' ? 'Votre plan actuel' : currentUser ? 'Voir mon compte' : 'Créer un compte'}
              </button>
            </div>

            {/* Premium - HIGHLIGHTED en orange */}
            <div className="bg-orange-500 rounded-3xl p-7 flex flex-col text-white relative md:scale-105 md:shadow-sticker-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink-900 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                ★ Recommandé
              </div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 mb-2">Premium</div>
              <h3 className="font-display font-bold text-2xl mb-3">Pour les sérieux</h3>
              <div className="mb-6">
                <span className="font-display font-bold text-5xl">1 500</span>
                <span className="text-white/80 ml-1 font-medium">FCFA / mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm flex-1">
                {['Accès aux offres du jour', 'Recherche et filtres unifiés', 'Emails lundi et jeudi', 'Coaching individuel', 'Quiz illimités'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/90">
                    <CheckCircle size={16} className="text-white flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleSubscribe('premium')} className="w-full py-3 bg-white hover:bg-ink-50 text-orange-600 font-bold rounded-full transition-colors">
                {currentUser?.plan === 'premium' ? 'Renouveler mon plan' : "S'abonner — 1 500 FCFA/mois"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-300 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-30"></div>
        <div className="h-1 bg-ci-flag absolute top-0 inset-x-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Logo Emploi Concours CI" className="w-9 h-9 rounded-lg" />
                <div className="leading-none">
                  <div className="font-display font-bold text-lg text-white">Emploi Concours</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-semibold">Côte d'Ivoire</div>
                </div>
              </div>
              <p className="text-sm text-ink-300 mb-6 max-w-md leading-relaxed">
                Centralisez votre recherche : concours administratifs, offres d'emploi privées, anciens sujets et quiz gratuits, le tout sur une seule plateforme.
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold stamp text-orange-400 px-2 py-1">Vérifié</span>
                <span className="text-[10px] uppercase tracking-wider font-bold stamp text-forest-300 px-2 py-1">100% CI</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-display font-bold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => handleHomeNav('accueil')} className={clsx('transition-colors underline-offset-4', activeHomeSection === 'accueil' ? 'text-forest-300 underline decoration-forest-300' : 'hover:text-forest-300')}>Accueil</button></li>
                <li><button onClick={() => handleHomeNav('offres')} className={clsx('transition-colors underline-offset-4', activeHomeSection === 'offres' ? 'text-forest-300 underline decoration-forest-300' : 'hover:text-forest-300')}>Opportunités</button></li>
                <li><button onClick={() => handleHomeNav('preparation')} className={clsx('transition-colors underline-offset-4', activeHomeSection === 'preparation' ? 'text-forest-300 underline decoration-forest-300' : 'hover:text-forest-300')}>Préparation</button></li>
                <li><button onClick={() => handleHomeNav('tarifs')} className={clsx('transition-colors underline-offset-4', activeHomeSection === 'tarifs' ? 'text-forest-300 underline decoration-forest-300' : 'hover:text-forest-300')}>Abonnements</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-display font-bold mb-4 text-sm uppercase tracking-wider">Aide</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => navigate({ page: 'info', kind: 'contact' })} className="hover:text-orange-400 transition-colors">Nous contacter</button></li>
                <li><button onClick={() => navigate({ page: 'info', kind: 'faq' })} className="hover:text-orange-400 transition-colors">FAQ</button></li>
                <li><button onClick={() => navigate({ page: 'info', kind: 'cgu' })} className="hover:text-orange-400 transition-colors">Conditions générales</button></li>
                <li><button onClick={() => navigate({ page: 'info', kind: 'confidentialite' })} className="hover:text-orange-400 transition-colors">Confidentialité</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-ink-700 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-ink-400">
            <div>© 2026 Emploi Concours CI · Tous droits réservés.</div>
            <div className="font-medium">Fait avec ❤️ à Abidjan</div>
          </div>
        </div>
      </footer>

      </>
      )}

      {/* Auth Modal */}
      {authModal && !isHydrating && (
        <div className="fixed inset-0 bg-ink-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-sticker-lg w-full max-w-md overflow-hidden animate-slide-up">
            <div className="h-1 bg-ci-flag"></div>
            <div className="px-6 py-4 flex justify-between items-center border-b border-ink-100">
              <h3 className="font-display font-bold text-xl text-ink-900">
                {authModal === 'login' ? 'Connexion' : 'Créer un compte'}
              </h3>
              <button onClick={() => setAuthModal(null)} className="text-ink-400 hover:text-orange-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex bg-ink-50 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setAuthModal('login')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                    authModal === 'login' ? "bg-white text-orange-600 shadow-sm" : "text-ink-500"
                  )}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setAuthModal('register')}
                  className={clsx(
                    "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                    authModal === 'register' ? "bg-white text-orange-600 shadow-sm" : "text-ink-500"
                  )}
                >
                  Inscription
                </button>
              </div>

              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); handleAuthSubmit(authModal); }}>
                {authModal === 'register' && (
                  <div>
                    <label className="text-sm font-bold text-ink-700 mb-1 block">Nom complet</label>
                    <input id="auth-name" required className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500" placeholder="Votre nom" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-bold text-ink-700 mb-1 block">Email</label>
                  <input id="auth-email" type="email" required className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500" placeholder="exemple@email.com" />
                </div>
                <div>
                  <label className="text-sm font-bold text-ink-700 mb-1 block">Mot de passe</label>
                  <input id="auth-password" type="password" required minLength={6} className="w-full p-3 border border-ink-200 rounded-lg outline-none focus:border-orange-500" placeholder="Votre mot de passe" />
                </div>

                {authError && (
                  <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    {authError}
                  </div>
                )}
                {authInfo && (
                  <div className="text-sm text-forest-700 bg-forest-50 border border-forest-200 rounded-lg p-3">
                    {authInfo}
                  </div>
                )}

                <button type="submit" disabled={authLoading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-sm">
                  {authLoading ? 'Veuillez patienter...' : (authModal === 'login' ? 'Se connecter' : "S'inscrire gratuitement")}
                  <ChevronRight size={16} />
                </button>
              </form>

              {authModal === 'login' && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setAuthModal(null);
                      navigate({ page: 'reset-password' });
                    }}
                    className="text-sm sm:text-base text-orange-600 hover:text-orange-700 underline font-bold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-ink-500 mt-5">
                {authModal === 'login' ? "Pas encore de compte ? " : 'Déjà inscrit ? '}
                <button
                  onClick={() => setAuthModal(authModal === 'login' ? 'register' : 'login')}
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  {authModal === 'login' ? "S'inscrire" : 'Se connecter'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modale de limite quiz */}
      {quizLimitInfo && (
        <div className="fixed inset-0 bg-ink-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-sticker-lg w-full max-w-md overflow-hidden animate-slide-up">
            <div className="h-1 bg-ci-flag"></div>
            <div className="p-6 sm:p-8">
              <button onClick={() => setQuizLimitInfo(null)} className="absolute top-5 right-5 text-ink-400 hover:text-orange-600">
                <X size={20} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 text-2xl">
                {quizLimitInfo.type === 'auth' ? '🔒' : '⏰'}
              </div>

              <h3 className="font-display font-bold text-2xl text-ink-900 mb-2">
                {quizLimitInfo.type === 'auth' ? 'Connexion requise' : 'Quiz gratuit déjà utilisé'}
              </h3>
              <p className="text-ink-600 mb-6 leading-relaxed">
                {quizLimitInfo.type === 'auth' ? (
                  <>Pour démarrer <span className="font-bold text-ink-900">« {quizLimitInfo.quizTitle} »</span>, vous devez d'abord vous connecter. L'inscription est gratuite et instantanée.</>
                ) : (
                  <>Le plan gratuit permet <span className="font-bold text-ink-900">1 seul quiz</span>. Vous l'avez déjà utilisé. Passez au plan Premium pour des quiz illimités.</>
                )}
              </p>

              <div className="flex flex-col gap-2">
                {quizLimitInfo.type === 'auth' ? (
                  <>
                    <button
                      onClick={() => { setQuizLimitInfo(null); setAuthModal('register'); }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl inline-flex items-center justify-center gap-2"
                    >
                      S'inscrire gratuitement <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => { setQuizLimitInfo(null); setAuthModal('login'); }}
                      className="w-full border-2 border-ink-200 hover:border-ink-900 text-ink-900 font-bold py-3 rounded-xl"
                    >
                      J'ai déjà un compte
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="#tarifs"
                      onClick={() => setQuizLimitInfo(null)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl inline-flex items-center justify-center gap-2"
                    >
                      Passer au plan Premium <ChevronRight size={16} />
                    </a>
                    <button
                      onClick={() => setQuizLimitInfo(null)}
                      className="w-full border-2 border-ink-200 hover:border-ink-900 text-ink-900 font-bold py-3 rounded-xl"
                    >
                      Fermer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;