import type { SeatPosition } from '../types';
import { SeatDroppable } from './SeatDroppable';

const ROW_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function BoatLayout() {
  return (
    <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col items-center justify-start relative overflow-y-auto overflow-x-hidden bg-slate-950/20 custom-scrollbar">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Visual background shape for the boat (Scaled down) */}
      <div className="absolute top-0 bottom-8 w-[400px] border-4 border-slate-700/30 rounded-[200px] pointer-events-none bg-slate-900/30 backdrop-blur-sm z-0"></div>
      
      {/* Scale the entire boat content down to ~25% using Tailwind */}
      <div className="relative w-full max-w-[360px] h-full flex flex-col z-10 pt-4 pb-12 gap-2 mt-4 items-center transform scale-75 xl:scale-100 origin-top">
        
        {/* DRUMMER */}
        <div className="w-full flex justify-center mb-1">
          <div className="w-[180px]">
             {/* Scale down seats by wrapping with a transform or passing a smaller size prop, 
                 we will handle sizes in SeatDroppable directly, but for now we reduce wrapper width */}
            <SeatDroppable id="drummer" label="DRUMMER" />
          </div>
        </div>

        {/* ROWS */}
        <div className="w-full flex flex-col gap-1.5">
          {ROW_NUMBERS.map((rowNum) => (
            <div key={rowNum} className="flex items-center w-full justify-between gap-2">
              {/* Left Seat */}
              <div className="flex-1 relative">
                <SeatDroppable id={`${rowNum}L` as SeatPosition} label={`${rowNum} L`} />
              </div>
              
              {/* Row Divider / Info */}
              <div className="w-6 flex flex-col items-center justify-center pointer-events-none opacity-50">
                <span className="text-[10px] font-bold text-slate-500 mb-0.5">{rowNum}</span>
                <div className="w-px h-6 bg-slate-600"></div>
              </div>

              {/* Right Seat */}
              <div className="flex-1 relative">
                <SeatDroppable id={`${rowNum}R` as SeatPosition} label={`${rowNum} R`} />
              </div>
            </div>
          ))}
        </div>

        {/* SWEEP */}
        <div className="w-full flex justify-center mt-1">
          <div className="w-[180px]">
            <SeatDroppable id="sweep" label="SWEEP" />
          </div>
        </div>
        
      </div>
    </div>
  );
}
