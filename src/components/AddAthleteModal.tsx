import { useState } from 'react';
import { useBoatStore } from '../store/useBoatStore';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAthleteModal({ isOpen, onClose }: Props) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  const addPaddler = useBoatStore((state) => state.addPaddler);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !weight) return;

    addPaddler({
      id: `manual-${Date.now()}`,
      name: name.trim(),
      weight: parseFloat(weight),
      gender
    });

    setName('');
    setWeight('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Add Athlete</h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Weight (kg)</label>
            <input 
              type="number" 
              required
              min="30"
              max="200"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="e.g. 75.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-brand-500 transition-colors appearance-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:shadow-[0_0_20px_rgba(13,148,136,0.5)] active:scale-95"
            >
              Add to Pool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
