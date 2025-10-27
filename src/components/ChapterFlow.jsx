import { useMemo, useState } from 'react';
import { BookOpen, HelpCircle, Dumbbell, CheckCircle2, Lock, PlayCircle } from 'lucide-react';

const modulesMeta = [
  { key: 'examples', label: 'Examples', icon: BookOpen, description: 'Guided examples to build intuition.' },
  { key: 'explanations', label: 'Explanations', icon: HelpCircle, description: 'Concept breakdowns with key takeaways.' },
  { key: 'drills', label: 'Practice Drills', icon: Dumbbell, description: 'Timed micro-drills for speed and accuracy.' },
];

function ContentBlock({ title, children }) {
  return (
    <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="text-sm text-zinc-300">{children}</div>
    </div>
  );
}

export default function ChapterFlow({ chapter, state, onModuleUpdate, onStartTest }) {
  const [activeTab, setActiveTab] = useState(modulesMeta[0].key);

  const allCompleted = useMemo(() => modulesMeta.every(m => state?.modules?.[m.key]), [state]);

  const renderTab = (key) => {
    if (key === 'examples') {
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <ContentBlock title="Number patterns">
            Identify parity, multiples, and factor pairs quickly. Practice noting last digit behavior and divisibility heuristics (2, 3, 5, 9, 11). Work through 5–10 curated examples.
          </ContentBlock>
          <ContentBlock title="Prime factorization">
            Decompose integers into primes using trial division up to sqrt(n). Observe exponent patterns for LCM/HCf.
          </ContentBlock>
        </div>
      );
    }
    if (key === 'explanations') {
      return (
        <div className="space-y-3">
          <ContentBlock title="Core concepts">
            • Divisibility and remainders (mod arithmetic basics)
            • Place value and last digit cycles
            • LCM/HCF via exponents
          </ContentBlock>
          <ContentBlock title="Speed tips">
            Cache small prime lists, use digit sum for multiples of 3/9, exploit symmetry to avoid redundant work.
          </ContentBlock>
        </div>
      );
    }
    if (key === 'drills') {
      return (
        <div className="space-y-3">
          <ContentBlock title="Micro-Drill 1 (2 min)">
            10 rapid-fire checks: Is n divisible by k? Target 90%+ accuracy.
          </ContentBlock>
          <ContentBlock title="Micro-Drill 2 (3 min)">
            6 mini LCM/HCF computations using small primes.
          </ContentBlock>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{chapter.title}</h3>
          <p className="text-sm text-zinc-400">Complete all modules to unlock the adaptive test.</p>
        </div>
        <div className="flex items-center gap-2">
          {allCompleted ? (
            <span className="inline-flex items-center gap-1 text-green-400 text-sm"><CheckCircle2 size={16}/> Ready for test</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-zinc-400 text-sm"><Lock size={16}/> Test locked</span>
          )}
          <button
            disabled={!allCompleted}
            onClick={onStartTest}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${allCompleted? 'border-orange-500 text-white hover:bg-orange-500/10' : 'border-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            <PlayCircle size={16}/> Start Test
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {modulesMeta.map(m => {
          const Icon = m.icon;
          const done = state?.modules?.[m.key];
          return (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`px-3 py-2 rounded-md border text-sm inline-flex items-center gap-2 ${activeTab===m.key?'border-orange-500 text-white':'border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}
            >
              <Icon size={16} /> {m.label}
              {done && <CheckCircle2 size={16} className="text-green-400"/>}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-zinc-800 p-4 bg-black/40">
        <p className="text-sm text-zinc-400 mb-3">{modulesMeta.find(m => m.key===activeTab)?.description}</p>
        {renderTab(activeTab)}
        <div className="mt-4">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={!!state?.modules?.[activeTab]}
              onChange={e => onModuleUpdate(activeTab, e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900"
            />
            Mark "{modulesMeta.find(m => m.key===activeTab)?.label}" as completed
          </label>
        </div>
      </div>
    </div>
  );
}
