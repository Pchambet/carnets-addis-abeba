'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Question {
  question: string;
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
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);

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
  const activeLetters = activeQuestionIndex !== null
    ? letters.filter(l => questions[activeQuestionIndex].letters.includes(l.id))
    : [];

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <p className="text-lg md:text-xl text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
          Qu'est-ce qui résonne en vous aujourd'hui ?
        </p>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-6 md:gap-8 mb-24 max-w-4xl mx-auto">
        {questions.map((q, idx) => {
          const isActive = activeQuestionIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveQuestionIndex(isActive ? null : idx)}
              className={`text-left p-6 md:p-10 border transition-all duration-500 rounded-sm
                ${isActive 
                  ? 'border-[var(--ochre)] bg-[var(--ochre)]/5 transform scale-[1.02]' 
                  : 'border-[var(--border)] hover:border-[var(--ochre)]/50 hover:bg-[var(--white)]/50'
                }`}
            >
              <h3 className={`text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light leading-snug transition-colors duration-500
                ${isActive ? 'text-[var(--ochre)] italic' : 'text-[var(--ink)]'}
              `}>
                {q.question}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Révélation (Letters) */}
      <div 
        className={`transition-all duration-1000 ease-in-out overflow-hidden max-w-3xl mx-auto
          ${activeQuestionIndex !== null ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}
        `}
      >
        <div className="text-center mb-16">
          <span className="inline-block w-px h-16 bg-gradient-to-b from-[var(--ochre)] to-transparent opacity-50 mb-8"></span>
          <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
            Claire a traversé cette même quête. Voici ses mots...
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
                    className="block no-underline hover:no-underline transition-all duration-500 bg-[var(--white)] border border-transparent hover:border-[var(--border)] p-6 md:p-8 rounded-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-4">
                      <time className="caption text-[var(--ochre)] opacity-80 shrink-0" dateTime={letter.date}>
                        {formattedDate}
                      </time>
                      <h4 className="text-2xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors">
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
    </div>
  );
}
