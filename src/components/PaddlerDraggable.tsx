import { useDraggable } from '@dnd-kit/core';
import type { Paddler } from '../types';
import { GripVertical, X } from 'lucide-react';
import clsx from 'clsx';
import { useBoatStore } from '../store/useBoatStore';

interface Props {
  paddler: Paddler;
  isSeated?: boolean;
}

export function PaddlerDraggable({ paddler, isSeated = false }: Props) {
  const showWeight = useBoatStore((state) => state.showWeight);
  const removePaddler = useBoatStore((state) => state.removePaddler);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paddler.id,
    data: { paddler },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        "rounded-xl flex justify-between items-center cursor-grab active:cursor-grabbing transition-all group z-50",
        isDragging && "opacity-80 scale-105 shadow-2xl rotate-2 ring-2 ring-brand-400 z-[100]",
        isSeated 
          ? [
              "p-2 shadow-lg backdrop-blur-md w-full font-medium text-slate-100",
              paddler.gender === 'female' ? "bg-fuchsia-600 border border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.3)]" : 
              paddler.gender === 'male' ? "bg-blue-600 border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : 
              "bg-brand-900 border border-brand-500"
            ]
          : [
              "p-3 font-medium text-slate-100 hover:scale-[1.02]",
              paddler.gender === 'female' ? "bg-fuchsia-900/80 hover:bg-fuchsia-800 border-2 border-fuchsia-500/50 hover:border-fuchsia-400" : 
              paddler.gender === 'male' ? "bg-blue-900/80 hover:bg-blue-800 border-2 border-blue-500/50 hover:border-blue-400" :
              "bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-brand-500"
            ]
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <GripVertical size={14} className="text-white/50 group-hover:text-white" />
        <span className="truncate text-sm">
          {paddler.name}
        </span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 pl-2">
        {showWeight && (
          <span className={clsx(
            "font-mono rounded-md",
            isSeated ? "text-xs text-brand-300 bg-brand-950/50 px-1.5 py-0.5" : "text-sm text-slate-400 bg-slate-900/50 px-2 py-0.5"
          )}>
            {paddler.weight}kg
          </span>
        )}
        {!isSeated && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removePaddler(paddler.id);
            }}
            className="p-1 -mr-1 rounded-md text-slate-300/50 hover:text-rose-400 hover:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all"
            title="Remove Athlete"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
