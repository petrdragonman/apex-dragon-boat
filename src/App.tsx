import { useState, useRef } from 'react';
import { Users, FileDown, Activity, Eye, EyeOff, Save, Trash2, GitBranch, FileCode, FileUp, RotateCcw } from 'lucide-react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useBoatStore } from './store/useBoatStore';
import type { Paddler, SeatPosition } from './types';
import { jsPDF } from 'jspdf';
import autoTable, { type RowInput } from 'jspdf-autotable';

import { PoolArea } from './components/PoolArea';
import { BoatLayout } from './components/BoatLayout';
import { BalanceMeter } from './components/BalanceMeter';
import { PaddlerDraggable } from './components/PaddlerDraggable';

function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePaddler, setActivePaddler] = useState<Paddler | null>(null);
  const [newVersionName, setNewVersionName] = useState('');
  const [activeVersionId, setActiveVersionId] = useState<string>('');
  
  const exportRef = useRef<HTMLDivElement>(null);

  const assignSeat = useBoatStore((state) => state.assignSeat);
  const unassignSeat = useBoatStore((state) => state.unassignSeat);
  const clearBoat = useBoatStore((state) => state.clearBoat);
  const seating = useBoatStore((state) => state.seating);
  const unassignedPaddlers = useBoatStore((state) => state.unassignedPaddlers);
  
  const showWeight = useBoatStore((state) => state.showWeight);
  const toggleShowWeight = useBoatStore((state) => state.toggleShowWeight);
  
  const versions = useBoatStore((state) => state.versions);
  const saveVersion = useBoatStore((state) => state.saveVersion);
  const loadVersion = useBoatStore((state) => state.loadVersion);
  const deleteVersion = useBoatStore((state) => state.deleteVersion);
  const importPaddlers = useBoatStore((state) => state.importPaddlers);
  const importState = useBoatStore((state) => state.importState);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleExportState = () => {
    // We get the raw state object (ignoring functions)
    const rawState = useBoatStore.getState();
    const statePayload = {
      seating: rawState.seating,
      unassignedPaddlers: rawState.unassignedPaddlers,
      showWeight: rawState.showWeight,
      versions: rawState.versions
    };
    
    const blob = new Blob([JSON.stringify(statePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dragon-boat-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const payload = JSON.parse(text);
        
        if (payload && (payload.seating || payload.unassignedPaddlers)) {
          importState(payload);
          alert("App state loaded successfully!");
        } else {
           throw new Error("Invalid payload");
        }
      } catch (err) {
        console.error("Invalid state file", err);
        alert("Failed to read boat data file. It may be corrupted or invalid.");
      }
    };
    reader.readAsText(file);
    if (stateInputRef.current) stateInputRef.current.value = '';
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const activeVersionName = activeVersionId ? versions[activeVersionId]?.name : '';
      const pdfTitle = activeVersionName ? activeVersionName : 'Apex Dragon Boat Seating Plan';
      const filename = activeVersionName ? `${activeVersionName}.pdf` : 'Dragon-Boat-Seating-Plan.pdf';

      // Title
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(pdfTitle, 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

      // Build data rows mapping directly to the boat structure
      const getLabel = (paddler?: Paddler) => paddler ? paddler.name : '';
      
      const rows: RowInput[] = [];
      
      // Drummer Row
      rows.push([{ 
        content: getLabel(seating['drummer']), 
        colSpan: 3, 
        styles: { halign: 'center' as const, fontStyle: 'bold' as const, fillColor: [241, 245, 249] } 
      }]);

      // Left vs Right 10 Rows
      for (let i = 1; i <= 10; i++) {
        const leftId = `${i}L` as SeatPosition;
        const rightId = `${i}R` as SeatPosition;
        
        rows.push([
          getLabel(seating[leftId]),
          { content: `${i}`, styles: { fontStyle: 'bold' as const, textColor: [100, 116, 139] } },
          getLabel(seating[rightId])
        ]);
      }

      // Sweep Row
      rows.push([{ 
        content: getLabel(seating['sweep']), 
        colSpan: 3, 
        styles: { halign: 'center' as const, fontStyle: 'bold' as const, fillColor: [241, 245, 249] } 
      }]);

      autoTable(doc, {
        startY: 40,
        head: [['Left Side', '#', 'Right Side']],
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [13, 148, 136], // brand-600
          textColor: 255,
          halign: 'center',
          fontSize: 14,
        },
        bodyStyles: {
          halign: 'center',
          fontSize: 12,
          cellPadding: 6,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        styles: {
          lineColor: [203, 213, 225], // slate-300
          lineWidth: 0.5,
        }
      });

      // @ts-ignore - jspdf-autotable adds lastAutoTable property to doc
      const finalY = doc.lastAutoTable?.finalY || 150;
      
      if (unassignedPaddlers.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text('Reserves:', 14, finalY + 15);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // slate-500
        const reserveNames = unassignedPaddlers.map(p => p.name).join(', ');
        const splitText = doc.splitTextToSize(reserveNames, 182); // 210mm width - 28mm margins
        doc.text(splitText, 14, finalY + 22);
      }

      doc.save(filename);
    } catch (error) {
      console.error('Failed to export PDF Table:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const paddlers: Paddler[] = [];
      
      lines.forEach((line, index) => {
        const cols = line.split(',');
        if (cols.length >= 2) {
          const name = cols[0].trim();
          const weight = parseFloat(cols[1].trim());
          
          let gender: 'male' | 'female' | undefined = undefined;
          if (cols.length >= 3) {
            const g = cols[2].trim().toLowerCase();
            if (g === 'male' || g === 'm') gender = 'male';
            else if (g === 'female' || g === 'f') gender = 'female';
          }
          
          if (name && !isNaN(weight)) {
            // skip header
            if (index === 0 && name.toLowerCase() === 'name') return;
            paddlers.push({ id: `imported-${Date.now()}-${index}`, name, weight, gender });
          }
        }
      });

      if (paddlers.length > 0) {
        importPaddlers(paddlers);
      } else {
        alert("No valid paddlers found in CSV. Expected format: Name,Weight,Gender");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActivePaddler(event.active.data.current?.paddler as Paddler);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActivePaddler(null);

    if (!over) return;
    
    // If droppable is a pool area (return to unassigned)
    if (over.data.current?.isPool) {
      let currentSeat: SeatPosition | null = null;
      for (const [seatPos, p] of Object.entries(seating)) {
        if (p?.id === active.id) {
          currentSeat = seatPos as SeatPosition;
          break;
        }
      }
      
      if (currentSeat) {
        unassignSeat(currentSeat);
      }
      return;
    }

    const newSeat = over.id as SeatPosition;
    if (newSeat) {
       assignSeat(active.id as string, newSeat);
    }
  };
  
  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;
    const newId = saveVersion(newVersionName.trim());
    setActiveVersionId(newId);
    setNewVersionName('');
  };

  const handleLoadVersion = (id: string) => {
    setActiveVersionId(id);
    if (id) {
      loadVersion(id);
    }
  };

  const handleDeleteVersion = () => {
    if (activeVersionId) {
      deleteVersion(activeVersionId);
      setActiveVersionId('');
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col pt-6 text-slate-100 font-sans antialiased selection:bg-brand-500/30 overflow-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.15),rgba(2,6,23,1))]"></div>
        
        {/* Header */}
        <header className="px-8 py-4 mb-4 flex-shrink-0 z-10 relative">
          <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent flex items-center gap-3">
                  <Activity className="text-brand-400" size={32} />
                  Apex Dragon Boat
                </h1>
                <p className="text-slate-400 mt-1">Advanced Crew selection & boat balancing</p>
              </div>

              <div className="h-10 w-px bg-slate-800 hidden xl:block"></div>

              {/* Version Controls */}
              <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                <form onSubmit={handleSaveVersion} className="flex items-center">
                  <input 
                    type="text" 
                    placeholder="e.g. Heat 1" 
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-sm rounded-l-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 w-32"
                  />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-brand-400 px-3 py-1.5 border border-l-0 border-slate-700 rounded-r-lg transition-colors flex items-center gap-2">
                    <Save size={16} /> Save
                  </button>
                </form>

                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-slate-500" />
                  <select 
                    value={activeVersionId}
                    onChange={(e) => handleLoadVersion(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 w-40 text-slate-300 appearance-none"
                  >
                    <option value="">Load Version...</option>
                    {Object.values(versions).map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  
                  {activeVersionId && (
                    <button onClick={handleDeleteVersion} className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors" title="Delete loaded version">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleShowWeight}
                className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800/80 transition-all active:scale-95 duration-200"
              >
                {showWeight ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-brand-400" />}
                <span className={showWeight ? 'text-slate-400' : 'text-slate-200'}>
                  {showWeight ? 'Hide Weight' : 'Show Weight'}
                </span>
              </button>
              
              <div className="h-6 w-px bg-slate-800 hidden xl:block"></div>

              <div className="flex gap-1.5 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                <button 
                  onClick={handleExportState}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-brand-500/20 text-brand-400 transition-all active:scale-95 duration-200"
                  title="Export Data File"
                >
                  <FileCode size={16} />
                  <span className="text-sm font-medium">Export</span>
                </button>
                <div className="w-px bg-slate-800 my-1"></div>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={stateInputRef} 
                  onChange={handleImportState}
                  className="hidden" 
                />
                <button 
                  onClick={() => stateInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-slate-800 text-slate-300 transition-all active:scale-95 duration-200"
                  title="Import Data File"
                >
                  <FileUp size={16} />
                  <span className="text-sm font-medium">Import</span>
                </button>
              </div>

              <div className="h-6 w-px bg-slate-800 hidden xl:block"></div>

              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                className="hidden" 
              />
              <button 
                onClick={clearBoat}
                className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all active:scale-95 duration-200"
                title="Return all paddlers to the pool"
              >
                <RotateCcw size={18} />
                Clear Boat
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-800/80 transition-all active:scale-95 duration-200"
              >
                <Users size={18} className="text-brand-400" />
                Import CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(13,148,136,0.5)] transition-all active:scale-95 duration-200"
              >
                <FileDown size={18} />
                Export PDF
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 px-8 pb-12 overflow-hidden flex flex-col relative z-10">
          <div className="max-w-[1600px] w-full h-[calc(100vh-140px)] mx-auto flex gap-8">
            <PoolArea />

            {/* Center Boat Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden" ref={exportRef}>
              <BalanceMeter />
              <BoatLayout />
            </div>
          </div>
        </main>
      </div>

      <DragOverlay dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
        {activeId && activePaddler ? (
          <div className="opacity-90 scale-105 shadow-[0_0_30px_rgba(45,212,191,0.3)] rotate-2 z-[1000] min-w-40 w-full pointer-events-none">
            <PaddlerDraggable paddler={activePaddler} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
