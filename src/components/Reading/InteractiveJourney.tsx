'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  reponse: string;
  letters: string[];
}

interface Letter {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
}

interface InteractiveJourneyProps {
  questions: Question[];
  letters: Letter[];
}

export default function InteractiveJourney({ questions, letters }: InteractiveJourneyProps) {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-lg">
          Ce chemin est encore vierge.
        </p>
      </div>
    );
  }

  // Get letters for the active question
  const activeLetters = activeQuestion
    ? letters.filter(l => activeQuestion.letters.includes(l.id))
    : [];

  return (
    <div className="w-full relative min-h-[50vh]">
      {/* ── Vue 1 : Liste des questions ── */}
      <div 
        className={`transition-all duration-700 ease-in-out absolute w-full top-0 left-0
          ${activeQuestion ? 'opacity-0 pointer-events-none translate-y-8 blur-sm' : 'opacity-100 translate-y-0'}
        `}
      >
        <div className="text-center mb-16">
          <p className="text-lg md:text-xl text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
            Qu'est-ce qui résonne en vous aujourd'hui ?
          </p>
        </div>

        <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                window.scrollTo({ top: window.scrollY + 200, behavior: 'smooth' });
                setActiveQuestion(q);
              }}
              className="text-left p-8 md:p-12 border border-[var(--border)] hover:border-[var(--ochre)]/50 hover:bg-[var(--ochre)]/5 transition-all duration-500 rounded-sm group cursor-pointer bg-[var(--white)] shadow-sm hover:shadow-md"
            >
              <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] leading-snug group-hover:text-[var(--ochre)] transition-colors duration-500">
                {q.question}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* ── Vue 2 : Détail de la question (Révélation) ── */}
      <div 
        className={`transition-all duration-700 ease-in-out w-full
          ${activeQuestion ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 pointer-events-none translate-y-8 absolute top-0 left-0'}
        `}
      >
        {activeQuestion && (
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setActiveQuestion(null)}
              className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] hover:underline inline-block mb-12 transition-all duration-250"
            >
              ← Retour aux questions
            </button>

            <div className="mb-16">
              <h3 className="text-3xl md:text-4xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ochre)] leading-snug mb-8">
                « {activeQuestion.question} »
              </h3>
              
              <div className="pl-6 border-l border-[var(--ochre)]/30">
                <p className="text-lg md:text-xl text-[var(--ink)] font-[family-name:var(--font-lora)] leading-relaxed italic">
                  {activeQuestion.reponse}
                </p>
              </div>
            </div>

            <div className="text-center mb-16">
              <span className="inline-block w-px h-16 bg-gradient-to-b from-[var(--ochre)] to-transparent opacity-50 mb-8"></span>
              <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)]">
                Plongez dans les lettres qui font écho à cette quête :
              </p>
            </div>

            <ul className="flex flex-col gap-12">
              {activeLetters.length === 0 ? (
                <p className="text-center text-[var(--ink-light)] italic">Aucune lettre trouvée pour cette question.</p>
              ) : (
                activeLetters.map((letter) => {
                  const formattedDate = new Date(letter.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <li key={letter.id} className="group relative">
                      <Link
                        href={`/letters/${letter.id}`}
                        className="block no-underline hover:no-underline transition-all duration-500 bg-[var(--white)] border border-[var(--border)] hover:border-[var(--ochre)]/50 p-6 md:p-10 rounded-sm shadow-sm hover:shadow-md"
                      >
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-4">
                          <time className="caption text-[var(--ochre)] opacity-80 shrink-0" dateTime={letter.date}>
                            {formattedDate}
                          </time>
                          <h4 className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors">
                            {letter.title}
                          </h4>
                        </div>
                        {letter.excerpt && (
                          <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed italic md:pl-[calc(4rem+1vw)]">
                            « {letter.excerpt} »
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
