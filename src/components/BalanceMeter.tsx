import { useBoatStore } from '../store/useBoatStore';
import { calculateBalance } from '../utils/balancing';
import clsx from 'clsx';
import { Scale } from 'lucide-react';

export function BalanceMeter() {
  const seating = useBoatStore((state) => state.seating);
  const balance = calculateBalance(seating);

  const diff = balance.leftRightDiff; // Positive = Right heavier, Negative = Left heavier
  const absDiff = Math.abs(diff);
  const diffIsGood = absDiff <= 5;

  // Front / Back target is between -15 and -25
  const fm = balance.frontBackMoment;
  const fmIsGood = fm >= -25 && fm <= -15;

  return (
    <div className="glass-panel rounded-2xl p-5 grid grid-cols-2 gap-8 divide-x divide-slate-800/50 shadow-xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

      {/* LEFT / RIGHT BALANCE */}
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-end">
          <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <Scale size={16} /> Left / Right Balance
          </h3>
          <div className="text-right">
            <span className={clsx("text-2xl font-mono font-bold tracking-tight", diffIsGood ? "text-brand-400" : "text-rose-400")}>
              {absDiff.toFixed(0)}<span className="text-sm"> kg</span>
            </span>
            <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
              {diff > 0 ? "Right Side is Heavier" : diff < 0 ? "Left Side is Heavier" : "Perfectly Balanced"}
            </div>
          </div>
        </div>
        <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/50 shadow-inner">
          {/* Target Zone indicator (-5 to +5). Assuming total visual range is -25 to +25 */}
          <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-brand-500/20 z-0 border-x border-brand-500/30"></div>

          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-400 z-10 shadow-sm shadow-black"></div>

          {/* Progress fill */}
          <div
            className={clsx("absolute top-0 bottom-0 transition-all duration-300 ease-out z-20", diff > 0 ? "bg-gradient-to-r from-brand-500 to-emerald-400 right-1/2" : "bg-gradient-to-l from-brand-500 to-emerald-400 left-1/2")}
            style={{ width: `${Math.min(Math.abs(diff) / 25 * 50, 50)}%` }} // Visual max scale = 25kg diff
          ></div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
          <span>Total L: {balance.totalLeft.toFixed(1)}kg</span>
          <span className={clsx(diffIsGood ? "text-brand-400" : "text-rose-400")}>Target: &lt; 5kg Diff</span>
          <span>Total R: {balance.totalRight.toFixed(1)}kg</span>
        </div>
      </div>

      {/* FRONT / BACK MOMENT */}
      <div className="flex flex-col gap-3 pl-8 relative z-10">
        <div className="flex justify-between items-end">
          <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            Front / Back Moment
          </h3>
          <div className="text-right">
            <span className={clsx("text-2xl font-mono font-bold tracking-tight", fmIsGood ? "text-emerald-400" : "text-amber-400")}>
              {fm.toFixed(0)}<span className="text-sm"> kg</span>
            </span>
            <div className="text-xs text-slate-400 uppercase font-semibold mt-1">
              Moment Force
            </div>
          </div>
        </div>
        <div className="h-3 bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/50 shadow-inner">
          {/* Target Zone indicator (-25 to -15). Assuming visual range is -50 to +50 */}
          {/* Range mapping: 0% is -50, 100% is +50.  Target -25 is 25%. Target -15 is 35%. */}
          <div className="absolute left-[25%] -mr-[10%] w-[10%] top-0 bottom-0 bg-emerald-500/30 z-0 border-x border-emerald-500/50 block"></div>

          {/* Center line (0 moment) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-400 z-10 shadow-sm shadow-black"></div>

          {/* Marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20 rounded-full transition-all duration-300 ease-out"
            style={{ left: `calc(${Math.max(0, Math.min(100, (fm + 50)))}% - 2px)` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-1">
          <span>&lt; Back Heaviness</span>
          <span className={clsx(fmIsGood ? "text-emerald-400" : "text-amber-400")}>Target Range: -15 to -25</span>
          <span>Front Heaviness &gt;</span>
        </div>
      </div>
    </div>
  );
}
