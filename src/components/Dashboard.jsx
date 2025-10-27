import { Award, Target, LockOpen, BarChart2 } from 'lucide-react';

function avgAccuracy(scores){
  if (!scores?.length) return 0;
  return Math.round(scores.reduce((s, r) => s + r.accuracy, 0) / scores.length);
}

export default function Dashboard({ chapters, progress, strengthsWeaknesses, onStartChapter, onRetrySkipped }) {
  const best = strengthsWeaknesses.sorted[0]?.[0];
  const worst = strengthsWeaknesses.sorted[strengthsWeaknesses.sorted.length-1]?.[0];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><Award size={16}/> Strength</div>
          <div className="mt-2 text-lg font-semibold">{chapters.find(c=>c.id===best)?.title || '—'}</div>
          <div className="text-sm text-zinc-400">Highest avg accuracy</div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><Target size={16}/> Weakness</div>
          <div className="mt-2 text-lg font-semibold">{chapters.find(c=>c.id===worst)?.title || '—'}</div>
          <div className="text-sm text-zinc-400">Needs more reps</div>
        </div>
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><LockOpen size={16}/> Unlocked Chapters</div>
          <div className="mt-2 text-2xl font-semibold">{chapters.filter(c=>c.unlocked).length} / {chapters.length}</div>
          <div className="text-sm text-zinc-400">Progressive unlocking</div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400"><BarChart2 size={16}/> Chapter Performance</div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {chapters.map(ch => {
            const st = progress[ch.id];
            const avg = avgAccuracy(st?.scores);
            const last = st?.scores?.[st.scores.length-1];
            return (
              <div key={ch.id} className="border border-zinc-800 rounded-lg p-4 bg-black/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{ch.title}</div>
                    <div className="text-xs text-zinc-400">Avg accuracy: {avg}% • Attempts: {st?.scores?.length || 0}</div>
                  </div>
                  <button
                    disabled={!ch.unlocked}
                    onClick={() => onStartChapter(ch.id)}
                    className={`px-3 py-1.5 rounded-md text-sm border ${ch.unlocked? 'border-orange-500 text-white hover:bg-orange-500/10':'border-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >Open</button>
                </div>
                <div className="mt-3 h-2 bg-zinc-900 rounded">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded" style={{ width: `${avg}%` }} />
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  {last ? (
                    <span>Last: {last.correct}/{last.total} correct • Skipped: {last.skipped} • Retries: {last.retries}</span>
                  ) : (
                    <span>No attempts yet.</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onRetrySkipped(ch.id)}
                    disabled={!(st?.scores?.length)}
                    className={`px-3 py-1.5 rounded-md text-sm border ${st?.scores?.length? 'border-zinc-700 text-zinc-200 hover:border-zinc-600':'border-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >Retry Skipped/Incorrect</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
