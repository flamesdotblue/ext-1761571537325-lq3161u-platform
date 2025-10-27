import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Flag, ChevronRight, Lightbulb, RotateCcw } from 'lucide-react';

const difficulties = [
  { name: 'Rookie', timePerQuestionSec: 120 },
  { name: 'Based', timePerQuestionSec: 60 },
  { name: 'Cracker', timePerQuestionSec: 30 },
];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function gcd(a,b){ while(b){ const t=b; b=a%b; a=t; } return Math.abs(a); }
function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }

function generateQuestion(chapterId, difficultyName) {
  const d = difficultyName;
  // Vary ranges by difficulty
  const ranges = {
    Rookie: { a:[2,50], b:[2,50] },
    Based: { a:[10,200], b:[10,200] },
    Cracker: { a:[100,999], b:[10,999] },
  }[d];
  const a = randInt(...ranges.a);
  const b = randInt(...ranges.b);
  const types = ['div', 'mod', 'lcm', 'hcf', 'lastdigit'];
  const type = types[randInt(0, types.length-1)];
  let stem = '', answer = 0, steps = [];
  if (type==='div') {
    stem = `Is ${a*b} divisible by ${a}?`;
    answer = 'Yes';
    steps = [
      `Compute product ${a}×${b} = ${a*b}.`,
      `Any number multiplied by ${a} is divisible by ${a}.`,
      'Therefore, answer is Yes.'
    ];
  } else if (type==='mod') {
    const n = a*b + randInt(0, a-1);
    stem = `What is ${n} mod ${a}?`;
    answer = String(n % a);
    steps = [
      `n = ${n}, divisor = ${a}.`,
      `Remainder r = n - a×floor(n/a) = ${n % a}.`,
    ];
  } else if (type==='lcm') {
    stem = `Find LCM(${a}, ${b}).`;
    answer = String(lcm(a,b));
    steps = [
      `Prime factors or via gcd: lcm(a,b) = |ab|/gcd(a,b).`,
      `gcd(${a},${b}) = ${gcd(a,b)} ⇒ lcm = ${Math.abs(a*b)}/${gcd(a,b)} = ${lcm(a,b)}.`
    ];
  } else if (type==='hcf') {
    stem = `Find HCF(${a}, ${b}).`;
    answer = String(gcd(a,b));
    steps = [
      `Use Euclid's algorithm for gcd.`,
      `gcd(${a},${b}) = ${gcd(a,b)}.`
    ];
  } else if (type==='lastdigit') {
    const base = randInt(2,9);
    const pow = randInt(2,10);
    const value = BigInt(base) ** BigInt(pow);
    const last = Number(String(value).slice(-1));
    stem = `What is the last digit of ${base}^${pow}?`;
    answer = String(last);
    steps = [
      `Observe last digit cycles for ${base}.`,
      'Compute or recall cycle length and index to get the last digit.',
      `For small exponents, direct compute ⇒ ${base}^${pow} ends with ${last}.`
    ];
  }
  const options = new Set();
  options.add(answer);
  while(options.size < 4){ options.add(String(randInt(0, 9 + (a%10)))); }
  const shuffled = Array.from(options).sort(() => Math.random()-0.5);
  return { chapterId, difficulty: d, stem, options: shuffled, answer, steps };
}

export default function AptitudeTest({ chapter, chapterState, onFinish, config }) {
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [timeLeft, setTimeLeft] = useState(difficulty.timePerQuestionSec);
  const [correctCount, setCorrectCount] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [retries, setRetries] = useState(0);
  const timerRef = useRef(null);

  const questionTarget = useMemo(() => {
    // between 20 and 40
    return 20 + Math.floor(Math.random()*21);
  }, [chapter?.id]);

  useEffect(() => {
    // Initialize questions
    if (config?.mode === 'retrySkipped' && chapterState?.scores?.length) {
      // Flatten last session's incorrect questions stem to regenerate similar ones
      const last = chapterState.scores[chapterState.scores.length-1];
      const n = Math.max(10, Math.min(30, last.skipped + (last.total - last.correct)));
      const qs = Array.from({ length: n }, () => generateQuestion(chapter.id, difficulties[0].name));
      setQuestions(qs);
    } else {
      const qs = Array.from({ length: questionTarget }, () => {
        const pick = difficulties[Math.floor(Math.random()*difficulties.length)];
        return generateQuestion(chapter.id, pick.name);
      });
      setQuestions(qs);
    }
    setIndex(0);
    setSelected(null);
    setShowWalkthrough(false);
  }, [chapter?.id, config]);

  useEffect(() => {
    // Reset timer per question
    clearInterval(timerRef.current);
    const t = questions[index]?.difficulty || difficulty.name;
    const tcfg = difficulties.find(d => d.name === t) || difficulty;
    setTimeLeft(tcfg.timePerQuestionSec);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [index, questions]);

  const current = questions[index];

  const handleAnswer = (opt) => {
    if (!current) return;
    setSelected(opt);
    if (opt === current.answer) {
      setCorrectCount(c => c + 1);
      setShowWalkthrough(false);
      setTimeout(() => nextQuestion(), 300);
    } else {
      setShowWalkthrough(true);
    }
  };

  const handleRetry = () => {
    setRetries(r => r + 1);
    setSelected(null);
    setShowWalkthrough(false);
  };

  const handleSkip = () => {
    setSkipped(s => s + 1);
    nextQuestion();
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowWalkthrough(false);
    if (index + 1 < questions.length) {
      setIndex(i => i + 1);
    } else {
      const total = questions.length;
      const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
      onFinish({ total, correct: correctCount, accuracy, skipped, retries, endedAt: Date.now(), difficultyMix: true });
    }
  };

  const aiHint = useMemo(() => {
    if (!current) return '';
    if (current.stem.includes('LCM')) return 'Hint: Use lcm(a,b) = |ab|/gcd(a,b). Factor small numbers quickly by checking primes up to sqrt(n).';
    if (current.stem.includes('HCF')) return 'Hint: Apply Euclid’s algorithm: gcd(a,b) = gcd(b, a mod b) iteratively.';
    if (current.stem.includes('mod')) return 'Hint: Remainder is periodic: n mod a equals the remainder after subtracting multiples of a.';
    if (current.stem.includes('last digit')) return 'Hint: Last digits repeat in cycles. Find cycle length for the base and index by exponent.';
    return 'Think about properties of factors and multiples to simplify mentally.';
  }, [current]);

  if (!current) {
    return (
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-950 text-center">Loading questions…</div>
    );
  }

  const tcfg = difficulties.find(d => d.name === current.difficulty) || difficulty;

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="text-sm text-zinc-300">Chapter: <span className="text-white font-medium">{chapter.title}</span></div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-zinc-300">Mode: <span className="text-white font-medium">{config?.mode==='retrySkipped'?'Retry Skipped':'Adaptive'}</span></div>
          <div className="text-sm text-zinc-300">Difficulty: <span className="text-white font-medium">{tcfg.name}</span></div>
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-orange-400">
            <Clock size={16}/> <span className="tabular-nums">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="text-lg">{index+1}. {current.stem}</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {current.options.map((opt, i) => {
              const isCorrect = selected && opt === current.answer;
              const isWrong = selected && opt === selected && opt !== current.answer;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className={`text-left px-4 py-3 rounded-lg border transition ${isCorrect? 'border-green-500 bg-green-500/10': isWrong? 'border-red-500 bg-red-500/10': 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleSkip} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-800 hover:border-zinc-700">
              <Flag size={16}/> Skip
            </button>
            {showWalkthrough && (
              <button onClick={handleRetry} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-800 hover:border-zinc-700">
                <RotateCcw size={16}/> Retry
              </button>
            )}
            {!showWalkthrough && selected===current.answer && (
              <button onClick={nextQuestion} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-orange-600 hover:bg-orange-500 text-white">
                Next <ChevronRight size={16}/>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="text-sm text-zinc-400">Progress</div>
            <div className="mt-2 text-2xl font-semibold">{index+1} / {questions.length}</div>
            <div className="mt-1 text-sm text-zinc-400">Correct: {correctCount} • Skipped: {skipped}</div>
          </div>

          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2"><Lightbulb size={16}/> AI Hint</div>
            <div className="text-sm text-zinc-200">{aiHint}</div>
          </div>

          {showWalkthrough && (
            <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="text-sm text-zinc-400 mb-2">Interactive Walkthrough</div>
              <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-200">
                {current.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
