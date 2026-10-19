'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { JourneyQuestion as Question } from '@/lib/jardin';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastQuestionId = useRef<string | null>(null);

  // Une seule vue à la fois : on remonte en haut du parcours, le focus suit le contenu
  useEffect(() => {
    if (activeQuestion) {
      rootRef.current?.scrollIntoView({ block: 'start' });
      headingRef.current?.focus({ preventScroll: true });
    } else if (lastQuestionId.current) {
      document.getElementById(`q-${lastQuestionId.current}`)?.focus();
    }
  }, [activeQuestion]);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic text-lg">
          Ce chemin est encore vierge.
        </p>
      </div>
    );
  }

  const activeLetters = activeQuestion
    ? letters.filter(l => activeQuestion.letters.includes(l.id))
    : [];

  return (
    <div ref={rootRef} className="w-full min-h-[50vh] scroll-mt-[var(--header-offset)]">
      <div key={activeQuestion?.id ?? 'questions'} className="journey-view">
        {!activeQuestion ? (
          <>
            <div className="text-center mb-16">
              <p className="text-lg md:text-xl text-[var(--ink-light)] font-[family-name:var(--font-lora)] italic">
                Qu’est-ce qui résonne en vous aujourd’hui&nbsp;?
              </p>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto">
              {questions.map((q) => (
                <h2 key={q.id} className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light leading-snug">
                  <button
                    id={`q-${q.id}`}
                    type="button"
                    onClick={() => {
                      lastQuestionId.current = q.id;
                      setActiveQuestion(q);
                    }}
                    className="block w-full text-left p-8 md:p-12 border border-[var(--border)] hover:border-[var(--ochre)]/50 hover:bg-[var(--ochre)]/5 active:scale-[0.99] transition-[border-color,background-color,box-shadow,scale] duration-200 rounded-sm cursor-pointer bg-[var(--white)] shadow-sm hover:shadow-md text-[var(--ink)] hover:text-[var(--ochre)]"
                  >
                    {q.question}
                  </button>
                </h2>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setActiveQuestion(null)}
              className="caption text-[var(--ink-light)] hover:text-[var(--ochre)] hover:underline inline-block mb-12 transition-colors duration-200"
            >
              ← Retour aux questions
            </button>

            <div className="mb-16">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-3xl md:text-4xl font-[family-name:var(--font-cormorant)] font-light italic text-[var(--ochre)] leading-snug mb-8 focus:outline-none"
              >
                «&nbsp;{activeQuestion.question}&nbsp;»
              </h2>

              <div className="pl-6 border-l border-[var(--ochre)]/30">
                <p className="text-lg md:text-xl text-[var(--ink)] font-[family-name:var(--font-lora)] leading-relaxed italic">
                  {activeQuestion.reponse}
                </p>
              </div>
            </div>

            <div className="text-center mb-16">
              <span className="inline-block w-px h-16 bg-gradient-to-b from-[var(--ochre)] to-transparent opacity-50 mb-8"></span>
              <p className="text-lg text-[var(--ink-light)] font-[family-name:var(--font-lora)]">
                Plongez dans les lettres qui font écho à cette quête&nbsp;:
              </p>
            </div>

            <ul className="flex flex-col gap-12">
              {activeLetters.length === 0 ? (
                <li className="text-center text-[var(--ink-light)] italic">Aucune lettre trouvée pour cette question.</li>
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
                        className="block no-underline hover:no-underline transition-[border-color,box-shadow] duration-200 bg-[var(--white)] border border-[var(--border)] hover:border-[var(--ochre)]/50 p-6 md:p-10 rounded-sm shadow-sm hover:shadow-md"
                      >
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-4">
                          <time className="caption text-[var(--ochre)] shrink-0" dateTime={letter.date}>
                            {formattedDate}
                          </time>
                          <h3 className="text-2xl md:text-3xl font-[family-name:var(--font-cormorant)] font-light text-[var(--ink)] group-hover:text-[var(--ochre)] transition-colors duration-200">
                            {letter.title}
                          </h3>
                        </div>
                        {letter.excerpt && (
                          <p className="text-[var(--ink-light)] font-[family-name:var(--font-lora)] leading-relaxed italic md:pl-[calc(4rem+1vw)]">
                            «&nbsp;{letter.excerpt}&nbsp;»
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
