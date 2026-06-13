import { useState, useEffect } from 'react';
import {
  ArrowLeft, Clock, Trophy, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  RotateCcw, BookOpen, Award, Target, ArrowRight, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import type { Quiz } from './quizzes';

interface QuizPageProps {
  quiz: Quiz;
  onBack: () => void;
}

type QuizState = 'intro' | 'playing' | 'review' | 'result';

export function QuizPage({ quiz, onBack }: QuizPageProps) {
  const [state, setState] = useState<QuizState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quiz.questions.length).fill(null));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);

  useEffect(() => {
    if (state !== 'playing') return;
    if (timeLeft <= 0) {
      setState('result');
      return;
    }
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [state, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleStart = () => {
    setState('playing');
    setCurrentQ(0);
    setAnswers(Array(quiz.questions.length).fill(null));
    setSelectedOption(null);
    setShowFeedback(false);
    setTimeLeft(quiz.duration * 60);
  };

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
  };

  const handleValidate = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selectedOption;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(answers[currentQ + 1]);
      setShowFeedback(answers[currentQ + 1] !== null);
    } else {
      setState('result');
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelectedOption(answers[currentQ - 1]);
      setShowFeedback(answers[currentQ - 1] !== null);
    }
  };

  const score = answers.reduce<number>(
    (acc, ans, i) => acc + (ans === quiz.questions[i].correctIndex ? 1 : 0),
    0
  );
  const percentage = Math.round((score / quiz.questions.length) * 100);

  const colorClasses: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-700', border: 'border-blue-500', bgLight: 'bg-blue-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', bgLight: 'bg-orange-50' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-500', bgLight: 'bg-purple-50' },
    green: { bg: 'bg-forest-600', text: 'text-forest-700', border: 'border-forest-500', bgLight: 'bg-forest-50' },
    pink: { bg: 'bg-pink-600', text: 'text-pink-700', border: 'border-pink-500', bgLight: 'bg-pink-50' }
  };
  const colors = colorClasses[quiz.color] || colorClasses.blue;

  const question = quiz.questions[currentQ];

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Topbar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Quitter le quiz
          </button>
          {state === 'playing' && (
            <div className={clsx(
              "inline-flex items-center gap-2 font-bold text-sm px-3 py-1.5 rounded-full",
              timeLeft <= 60 ? "bg-orange-100 text-orange-700" : "bg-ink-50 text-ink-700"
            )}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* En-tête du quiz */}
      <header className={clsx('text-white relative overflow-hidden', colors.bg)}>
        <div className="absolute inset-0 bg-stripes opacity-30"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative flex items-center gap-4">
          <span className="text-5xl">{quiz.icon}</span>
          <div>
            <div className="text-[11px] uppercase tracking-[0.15em] font-bold opacity-80 mb-1">{quiz.subject} · {quiz.concours}</div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight">{quiz.title}</h1>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* INTRO */}
        {state === 'intro' && (
          <div className="bg-white border border-ink-100 rounded-2xl p-8 text-center">
            <h2 className="font-display font-bold text-2xl text-ink-900 mb-2">Prêt(e) à vous entraîner ?</h2>
            <p className="text-ink-600 mb-6 max-w-md mx-auto">{quiz.description}</p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
              <div className="bg-ink-50 rounded-xl p-3">
                <BookOpen className="mx-auto mb-1 text-ink-500" size={20} />
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold">Questions</p>
                <p className="font-display font-bold text-lg text-ink-900">{quiz.questions.length}</p>
              </div>
              <div className="bg-ink-50 rounded-xl p-3">
                <Clock className="mx-auto mb-1 text-ink-500" size={20} />
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold">Durée</p>
                <p className="font-display font-bold text-lg text-ink-900">{quiz.duration} min</p>
              </div>
              <div className="bg-ink-50 rounded-xl p-3">
                <Target className="mx-auto mb-1 text-ink-500" size={20} />
                <p className="text-xs text-ink-500 uppercase tracking-wider font-bold">Niveau</p>
                <p className="font-display font-bold text-sm text-ink-900 leading-tight">{quiz.level}</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left max-w-md mx-auto flex gap-2">
              <AlertCircle size={18} className="text-orange-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-900">
                <p className="font-bold mb-1">Règles du quiz :</p>
                <ul className="space-y-0.5 text-xs">
                  <li>• Une seule réponse possible par question</li>
                  <li>• La correction s'affiche après validation</li>
                  <li>• Vous pouvez naviguer entre les questions</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleStart}
              className={clsx(
                'inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white shadow-md transition-transform hover:scale-105',
                colors.bg
              )}
            >
              Démarrer le quiz <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* PLAYING */}
        {state === 'playing' && question && (
          <div className="bg-white border border-ink-100 rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium text-ink-500 mb-2">
                <span>Question {currentQ + 1} / {quiz.questions.length}</span>
                <span>{Math.round(((currentQ + 1) / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full transition-all', colors.bg)}
                  style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-ink-900 mb-6 leading-tight">{question.question}</h2>

            <div className="space-y-3 mb-6">
              {question.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === question.correctIndex;
                const showState = showFeedback;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={showFeedback}
                    className={clsx(
                      'w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3',
                      showState && isCorrect && 'border-forest-500 bg-forest-50',
                      showState && isSelected && !isCorrect && 'border-red-500 bg-red-50',
                      !showState && isSelected && `${colors.border} ${colors.bgLight}`,
                      !showState && !isSelected && 'border-ink-100 hover:border-ink-300 bg-white',
                      showState && !isCorrect && !isSelected && 'border-ink-100 bg-white opacity-60'
                    )}
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      showState && isCorrect && 'bg-forest-500 text-white',
                      showState && isSelected && !isCorrect && 'bg-red-500 text-white',
                      !showState && isSelected && `${colors.bg} text-white`,
                      !showState && !isSelected && 'bg-ink-100 text-ink-600'
                    )}>
                      {showState && isCorrect ? <CheckCircle size={18} /> :
                       showState && isSelected && !isCorrect ? <XCircle size={18} /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <span className={clsx('font-medium', showState && isCorrect && 'text-forest-800', showState && isSelected && !isCorrect && 'text-red-900')}>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {showFeedback && question.explanation && (
              <div className={clsx(
                'p-4 rounded-xl border-l-4 mb-6',
                selectedOption === question.correctIndex ? 'bg-forest-50 border-forest-500' : 'bg-orange-50 border-orange-500'
              )}>
                <p className={clsx(
                  'font-bold mb-1 flex items-center gap-2',
                  selectedOption === question.correctIndex ? 'text-forest-800' : 'text-orange-800'
                )}>
                  {selectedOption === question.correctIndex ? (
                    <><CheckCircle size={18} /> Bonne réponse !</>
                  ) : (
                    <><XCircle size={18} /> Réponse incorrecte</>
                  )}
                </p>
                <p className="text-sm text-ink-700">{question.explanation}</p>
              </div>
            )}

            <div className="flex justify-between items-center gap-3 pt-4 border-t border-ink-100">
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-ink-200 text-ink-700 font-medium hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Précédent
              </button>

              {!showFeedback ? (
                <button
                  onClick={handleValidate}
                  disabled={selectedOption === null}
                  className={clsx(
                    'flex items-center gap-1 px-6 py-2 rounded-full font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    colors.bg
                  )}
                >
                  Valider ma réponse
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className={clsx('flex items-center gap-1 px-6 py-2 rounded-full font-bold text-white transition-colors', colors.bg)}
                >
                  {currentQ === quiz.questions.length - 1 ? 'Voir le résultat' : 'Question suivante'}
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT */}
        {state === 'result' && (
          <div className="bg-white border border-ink-100 rounded-2xl p-8 text-center">
            <div className={clsx(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-white',
              percentage >= 70 ? 'bg-forest-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
            )}>
              {percentage >= 70 ? <Trophy size={48} /> : <Award size={48} />}
            </div>

            <h2 className="font-display font-bold text-3xl text-ink-900 mb-2">
              {percentage >= 70 ? 'Excellent !' : percentage >= 50 ? 'Bien joué !' : 'Continuez à vous entraîner !'}
            </h2>
            <p className="text-ink-600 mb-6">Vous avez terminé le quiz</p>

            <div className="bg-ink-50 rounded-2xl p-8 mb-6 max-w-md mx-auto">
              <div className="font-display text-6xl font-bold text-ink-900 mb-1">{percentage}%</div>
              <div className="text-ink-600 font-medium">
                <span className="font-bold text-ink-900">{score}</span> bonnes réponses sur <span className="font-bold text-ink-900">{quiz.questions.length}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 text-sm">
                <div className="bg-forest-100 rounded-lg p-2">
                  <div className="font-display font-bold text-forest-700 text-lg">{score}</div>
                  <div className="text-xs text-forest-800">Justes</div>
                </div>
                <div className="bg-red-100 rounded-lg p-2">
                  <div className="font-display font-bold text-red-700 text-lg">{answers.filter((a, i) => a !== null && a !== quiz.questions[i].correctIndex).length}</div>
                  <div className="text-xs text-red-800">Erreurs</div>
                </div>
                <div className="bg-ink-100 rounded-lg p-2">
                  <div className="font-display font-bold text-ink-700 text-lg">{answers.filter(a => a === null).length}</div>
                  <div className="text-xs text-ink-600">Sans rép.</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setState('review'); setCurrentQ(0); }}
                className="px-6 py-3 rounded-full border-2 border-ink-200 text-ink-700 font-bold hover:border-ink-900 inline-flex items-center justify-center gap-2"
              >
                <BookOpen size={18} /> Voir les corrections
              </button>
              <button
                onClick={handleStart}
                className={clsx('px-6 py-3 rounded-full font-bold text-white inline-flex items-center justify-center gap-2', colors.bg)}
              >
                <RotateCcw size={18} /> Recommencer
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-full font-bold text-ink-500 hover:text-ink-900"
              >
                Quitter
              </button>
            </div>
          </div>
        )}

        {/* REVIEW */}
        {state === 'review' && question && (
          <div className="bg-white border border-ink-100 rounded-2xl p-6 sm:p-8">
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm font-bold text-ink-500">Correction {currentQ + 1} / {quiz.questions.length}</span>
              <span className={clsx(
                'text-xs font-bold px-2 py-1 rounded',
                answers[currentQ] === question.correctIndex ? 'bg-forest-100 text-forest-800' :
                answers[currentQ] === null ? 'bg-ink-100 text-ink-700' :
                'bg-red-100 text-red-800'
              )}>
                {answers[currentQ] === question.correctIndex ? '✓ Juste' :
                 answers[currentQ] === null ? 'Sans réponse' : '✗ Erreur'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-ink-900 mb-6">{question.question}</h2>

            <div className="space-y-2 mb-6">
              {question.options.map((opt, idx) => {
                const isCorrect = idx === question.correctIndex;
                const wasSelected = answers[currentQ] === idx;
                return (
                  <div
                    key={idx}
                    className={clsx(
                      'p-3 rounded-lg border-2 flex items-center gap-3',
                      isCorrect && 'border-forest-500 bg-forest-50',
                      wasSelected && !isCorrect && 'border-red-500 bg-red-50',
                      !isCorrect && !wasSelected && 'border-ink-100 bg-white opacity-60'
                    )}
                  >
                    <div className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0',
                      isCorrect && 'bg-forest-500 text-white',
                      wasSelected && !isCorrect && 'bg-red-500 text-white',
                      !isCorrect && !wasSelected && 'bg-ink-100 text-ink-600'
                    )}>
                      {isCorrect ? <CheckCircle size={14} /> : wasSelected ? <XCircle size={14} /> : String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-medium text-ink-800">{opt}</span>
                  </div>
                );
              })}
            </div>

            {question.explanation && (
              <div className="bg-forest-50 border-l-4 border-forest-500 p-4 rounded-xl mb-6">
                <p className="font-bold text-forest-800 mb-1">💡 Explication</p>
                <p className="text-sm text-ink-700">{question.explanation}</p>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-full border border-ink-200 text-ink-700 font-medium hover:bg-ink-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              {currentQ < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className={clsx('flex items-center gap-1 px-6 py-2 rounded-full font-bold text-white', colors.bg)}
                >
                  Suivant <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setState('result')}
                  className={clsx('flex items-center gap-1 px-6 py-2 rounded-full font-bold text-white', colors.bg)}
                >
                  Retour au résultat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
