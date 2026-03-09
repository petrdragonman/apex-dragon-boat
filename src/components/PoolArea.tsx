import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBoatStore } from '../store/useBoatStore';
import { PaddlerDraggable } from './PaddlerDraggable';
import { Info, Plus } from 'lucide-react';
import clsx from 'clsx';
import { AddAthleteModal } from './AddAthleteModal';

export function PoolArea() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: 'pool',
    data: { isPool: true }
  });

  const unassignedPaddlers = useBoatStore((state) => state.unassignedPaddlers);

  return (
    <>
      <aside className="w-[340px] glass-panel rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
          <h2 className="font-semibold text-lg drop-shadow-sm flex items-center gap-2">
            Available Paddlers
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-brand-500/20 text-brand-400 hover:bg-brand-500/40 rounded-lg transition-colors"
              title="Add single athlete"
            >
              <Plus size={16} />
            </button>
            <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full font-bold">
              {unassignedPaddlers.length}
            </span>
          </div>
        </div>
      
      <div 
        ref={setNodeRef}
        className={clsx(
          "p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar transition-colors",
          isOver && "bg-slate-800/30 inset-shadow-sm"
        )}
      >
        {unassignedPaddlers.map((paddler) => (
          <PaddlerDraggable key={paddler.id} paddler={paddler} />
        ))}
        {unassignedPaddlers.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 pb-10">
            <Info size={32} className="opacity-50" />
            <p className="text-sm text-center">All paddlers seated<br/>or no paddlers imported.</p>
          </div>
        )}
      </div>
    </aside>
      <AddAthleteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
