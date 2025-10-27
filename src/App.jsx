import { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import ChapterFlow from './components/ChapterFlow';
import AptitudeTest from './components/AptitudeTest';
import Dashboard from './components/Dashboard';
import { User, LogOut, Rocket, PlayCircle, Gauge } from 'lucide-react';

const initialChapters = [
  { id: 'ch1', title: 'Numbers & Divisibility', unlocked: true },
  { id: 'ch2', title: 'Percentages & Profit/Loss', unlocked: false },
  { id: 'ch3', title: 'Time, Speed & Distance', unlocked: false },
  { id: 'ch4', title: 'Ratio & Proportion', unlocked: false },
];

function loadState() {
  try {
    const json = localStorage.getItem('caas_state_v1');
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem('caas_state_v1', JSON.stringify(state));
}

export default function App() {
  const persisted = loadState();
  const [user, setUser] = useState(persisted?.user || null);
  const [view, setView] = useState(persisted?.view || (persisted?.user ? 'dashboard' : 'login'));
  const [chapters, setChapters] = useState(persisted?.chapters || initialChapters);
  const [progress, setProgress] = useState(
    persisted?.progress || {
      ch1: { modules: { examples: false, explanations: false, drills: false }, testUnlocked: false, scores: [], skipped: 0, retries: 0 },
      ch2: { modules: { examples: false, explanations: false, drills: false }, testUnlocked: false, scores: [], skipped: 0, retries: 0 },
      ch3: { modules: { examples: false, explanations: false, drills: false }, testUnlocked: false, scores: [], skipped: 0, retries: 0 },
      ch4: { modules: { examples: false, explanations: false, drills: false }, testUnlocked: false, scores: [], skipped: 0, retries: 0 },
    }
  );
  const [activeChapterId, setActiveChapterId] = useState(persisted?.activeChapterId || 'ch1');
  const [pendingTestConfig, setPendingTestConfig] = useState(null);

  useEffect(() => {
    saveState({ user, view, chapters, progress, activeChapterId });
  }, [user, view, chapters, progress, activeChapterId]);

  const activeChapter = useMemo(() => chapters.find(c => c.id === activeChapterId), [chapters, activeChapterId]);

  const handleLogin = (email) => {
    setUser({ email, name: email.split('@')[0] });
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  const updateModuleProgress = (chapterId, moduleKey, value) => {
    setProgress(prev => {
      const next = { ...prev };
      next[chapterId] = next[chapterId] || { modules: {}, testUnlocked: false, scores: [], skipped: 0, retries: 0 };
      next[chapterId].modules = { ...next[chapterId].modules, [moduleKey]: value };
      const allDone = ['examples', 'explanations', 'drills'].every(k => next[chapterId].modules[k]);
      next[chapterId].testUnlocked = allDone;
      if (allDone) {
        // Unlock next chapter
        const idx = chapters.findIndex(c => c.id === chapterId);
        if (idx > -1 && idx + 1 < chapters.length) {
          setChapters(chs => chs.map((c, i) => (i === idx + 1 ? { ...c, unlocked: true } : c)));
        }
      }
      return next;
    });
  };

  const recordTestResult = (chapterId, result) => {
    setProgress(prev => {
      const next = { ...prev };
      next[chapterId] = next[chapterId] || { modules: {}, testUnlocked: false, scores: [], skipped: 0, retries: 0 };
      next[chapterId].scores = [...(next[chapterId].scores || []), result];
      next[chapterId].skipped = (next[chapterId].skipped || 0) + (result.skipped || 0);
      next[chapterId].retries = (next[chapterId].retries || 0) + (result.retries || 0);
      return next;
    });
  };

  const strengthsWeaknesses = useMemo(() => {
    const data = chapters.reduce((acc, c) => {
      const sc = progress[c.id]?.scores || [];
      const avg = sc.length ? Math.round(sc.reduce((s, r) => s + r.accuracy, 0) / sc.length) : 0;
      acc[c.id] = { avg, attempts: sc.length };
      return acc;
    }, {});
    const sorted = Object.entries(data).sort((a, b) => b[1].avg - a[1].avg);
    return { data, sorted };
  }, [chapters, progress]);

  const LoginView = () => {
    const [email, setEmail] = useState('');
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <HeroCover />
        <div className="mx-auto w-full max-w-md -mt-20 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} />
            <h2 className="text-xl font-semibold">Login to continue</h2>
          </div>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => email && handleLogin(email)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 transition text-white"
          >
            <Rocket size={18} /> Enter Simulator
          </button>
          <p className="text-xs text-zinc-400 mt-3">Your progress is saved locally in your browser.</p>
        </div>
      </div>
    );
  };

  const NavBar = () => (
    <div className="w-full sticky top-0 z-20 bg-black/70 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="font-semibold text-white">Competitive Aptitude Assessment Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm ${view==='dashboard'?'bg-zinc-800 text-white':'text-zinc-300 hover:bg-zinc-800'}`}>Dashboard</button>
          <button onClick={() => setView('chapters')} className={`px-3 py-1.5 rounded-md text-sm ${view==='chapters'?'bg-zinc-800 text-white':'text-zinc-300 hover:bg-zinc-800'}`}>Chapters</button>
          <button onClick={() => setView('test')} className={`px-3 py-1.5 rounded-md text-sm ${view==='test'?'bg-zinc-800 text-white':'text-zinc-300 hover:bg-zinc-800'}`}>
            <Gauge size={16} className="inline-block mr-1"/> Test</button>
          <div className="w-px h-6 bg-zinc-800 mx-2"/>
          <div className="hidden sm:flex items-center gap-2 text-zinc-300">
            <User size={18} />
            <span className="text-sm">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="ml-2 p-2 rounded-md hover:bg-zinc-800 text-zinc-300" aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) return <LoginView />;

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroCover />
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <Dashboard
            chapters={chapters}
            progress={progress}
            strengthsWeaknesses={strengthsWeaknesses}
            onStartChapter={(id) => { setActiveChapterId(id); setView('chapters'); }}
            onRetrySkipped={(id) => { setActiveChapterId(id); setView('test'); setPendingTestConfig({ mode: 'retrySkipped' }); }}
          />
        )}
        {view === 'chapters' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {chapters.map(c => (
                <button
                  key={c.id}
                  disabled={!c.unlocked}
                  onClick={() => setActiveChapterId(c.id)}
                  className={`px-3 py-1.5 rounded-md text-sm border ${activeChapterId===c.id?'border-orange-500 text-white':'border-zinc-800 text-zinc-300 hover:border-zinc-700'} ${!c.unlocked?'opacity-50 cursor-not-allowed':''}`}
                >
                  {c.title}
                </button>
              ))}
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl">
              <ChapterFlow
                chapter={activeChapter}
                state={progress[activeChapterId]}
                onModuleUpdate={(mod, v) => updateModuleProgress(activeChapterId, mod, v)}
                onStartTest={() => { setView('test'); setPendingTestConfig({ mode: 'normal' }); }}
              />
            </div>
          </div>
        )}
        {view === 'test' && (
          <AptitudeTest
            chapter={activeChapter}
            chapterState={progress[activeChapterId]}
            onFinish={(result) => { recordTestResult(activeChapterId, result); setView('dashboard'); setPendingTestConfig(null); }}
            config={pendingTestConfig}
          />
        )}
      </div>
      <footer className="py-8 text-center text-zinc-500 text-sm">Built for deep mastery. Practice ethically. Sources: Personal notes and generated exercises.</footer>
    </div>
  );
}
