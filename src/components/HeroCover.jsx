import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <section className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/cEecEwR6Ehj4iT8T/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Competitive Aptitude Assessment Simulator</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">Master quantitative aptitude with structured chapters, adaptive drills, and timer-based tests. Unlock, practice, and conquer.</p>
      </div>
    </section>
  );
}
