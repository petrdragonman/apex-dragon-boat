import { useDroppable } from '@dnd-kit/core';
import type { SeatPosition } from '../types';
import { useBoatStore } from '../store/useBoatStore';
import { PaddlerDraggable } from './PaddlerDraggable';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface Props {
  id: SeatPosition;
  label?: string;
}

export function SeatDroppable({ id, label }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { isSeat: true }
  });

  const participant = useBoatStore((state) => state.seating[id]);
  const removePaddler = useBoatStore((state) => state.unassignSeat);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "relative w-full h-[60px] rounded-xl border flex items-center justify-center transition-all",
        isOver && !participant && "border-brand-400 bg-brand-500/20 shadow-[0_0_15px_rgba(45,212,191,0.2)]",
        isOver && participant && "border-rose-400 bg-rose-500/20", // Indicates swap
        !isOver && !participant && "border-slate-700/50 bg-slate-900/40 border-dashed",
        !isOver && participant && "border-brand-500/20 bg-slate-900/80"
      )}
    >
      {/* Label for empty seat */}
      {!participant && (
        <span className="text-slate-500 text-sm font-medium tracking-wider">
          {label || id}
        </span>
      )}

      {/* Render participant if exists */}
      {participant && (
        <div className="absolute inset-0 p-1 flex">
          <PaddlerDraggable paddler={participant} isSeated={true} />
          
          {/* Quick remove button */}
          <button 
            onClick={() => removePaddler(id)}
            className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
