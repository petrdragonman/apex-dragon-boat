import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BoatState, Paddler, SeatPosition } from '../types';

interface BoatStore extends BoatState {
  setPaddlers: (paddlers: Paddler[]) => void;
  assignSeat: (paddlerId: string, seat: SeatPosition) => void;
  unassignSeat: (seat: SeatPosition) => void;
  removePaddler: (paddlerId: string) => void;
  clearBoat: () => void;
  toggleShowWeight: () => void;
  saveVersion: (name: string) => void;
  loadVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  importPaddlers: (paddlers: Paddler[]) => void;
  addPaddler: (paddler: Paddler) => void;
  importState: (newState: Partial<BoatState>) => void;
}

const mockPaddlers: Paddler[] = [
  { id: '1', name: 'Alice C', weight: 65, gender: 'female' },
  { id: '2', name: 'Andrew B', weight: 82, gender: 'male' },
  { id: '3', name: 'Michael H', weight: 90, gender: 'male' },
  { id: '4', name: 'Helen F', weight: 60, gender: 'female' },
  { id: '5', name: 'Diego E', weight: 75, gender: 'male' },
  { id: '6', name: 'Lianna C', weight: 62, gender: 'female' },
  { id: '7', name: 'Deb H', weight: 68, gender: 'female' },
  { id: '8', name: 'Amanda D', weight: 70, gender: 'female' },
  { id: '9', name: 'Andrea M', weight: 64, gender: 'female' },
  { id: '10', name: 'Victoria H', weight: 66, gender: 'female' },
  { id: '11', name: 'Paul J', weight: 85, gender: 'male' },
  { id: '12', name: 'Alison M', weight: 63, gender: 'female' },
  { id: '13', name: 'Rohini', weight: 58, gender: 'female' },
  { id: '14', name: 'Andrew H', weight: 88, gender: 'male' },
  { id: '15', name: 'Kiran R', weight: 72, gender: 'male' },
  { id: '16', name: 'Miu', weight: 55, gender: 'female' },
  { id: '17', name: 'Jocelyn K', weight: 61, gender: 'female' },
  { id: '18', name: 'Jaid', weight: 79, gender: 'female' },
  { id: '19', name: 'Richard V', weight: 95, gender: 'male' },
  { id: '20', name: 'Janet A', weight: 67, gender: 'female' },
  { id: '21', name: 'Marc', weight: 84, gender: 'male' },
  { id: '22', name: 'Detlef H', weight: 86, gender: 'male' },
  { id: '23', name: 'Simon F', weight: 81, gender: 'male' },
  { id: '24', name: 'Divina', weight: 59, gender: 'female' },
  { id: '25', name: 'S-J', weight: 74, gender: 'female' },
];

export const useBoatStore = create<BoatStore>()(
  persist(
    (set) => ({
      seating: {},
      unassignedPaddlers: mockPaddlers,
      showWeight: true,
      versions: {},

      setPaddlers: (paddlers) => set({ unassignedPaddlers: paddlers }),

      importPaddlers: (paddlers) => set({
        seating: {},
        unassignedPaddlers: paddlers
      }),

      addPaddler: (paddler) => set((state) => ({
        unassignedPaddlers: [...state.unassignedPaddlers, paddler]
      })),

      importState: (newState) => set((state) => ({
        ...state,
        seating: newState.seating || {},
        unassignedPaddlers: newState.unassignedPaddlers || [],
        versions: newState.versions || {},
        showWeight: newState.showWeight ?? true,
      })),

      assignSeat: (paddlerId, seat) => set((state) => {
        let paddler = state.unassignedPaddlers.find(p => p.id === paddlerId);
        let originalSeat: SeatPosition | null = null;
        
        if (!paddler) {
          for (const [s, p] of Object.entries(state.seating)) {
            if (p?.id === paddlerId) {
              paddler = p;
              originalSeat = s as SeatPosition;
              break;
            }
          }
        }

        if (!paddler) return state;

        const occupant = state.seating[seat];
        const newSeating = { ...state.seating };
        let newUnassigned = [...state.unassignedPaddlers];

        newSeating[seat] = paddler;

        if (originalSeat) {
          if (occupant) {
            newSeating[originalSeat] = occupant;
          } else {
            delete newSeating[originalSeat];
          }
        } else {
          newUnassigned = newUnassigned.filter(p => p.id !== paddlerId);
          if (occupant) {
            newUnassigned.push(occupant);
          }
        }

        return {
          seating: newSeating,
          unassignedPaddlers: newUnassigned
        };
      }),

      unassignSeat: (seat) => set((state) => {
        const occupant = state.seating[seat];
        if (!occupant) return state;

        const newSeating = { ...state.seating };
        delete newSeating[seat];

        return {
          seating: newSeating,
          unassignedPaddlers: [...state.unassignedPaddlers, occupant],
        };
      }),

      removePaddler: (paddlerId) => set((state) => {
        const newUnassigned = state.unassignedPaddlers.filter(p => p.id !== paddlerId);
        const newSeating = { ...state.seating };
        for (const [s, p] of Object.entries(newSeating)) {
          if (p?.id === paddlerId) {
            delete newSeating[s as SeatPosition];
            break;
          }
        }

        return {
          unassignedPaddlers: newUnassigned,
          seating: newSeating,
        };
      }),

      clearBoat: () => set((state) => {
        const allOccupants = Object.values(state.seating).filter((p): p is Paddler => p !== undefined);
        return {
          seating: {},
          unassignedPaddlers: [...state.unassignedPaddlers, ...allOccupants],
        };
      }),

      toggleShowWeight: () => set((state) => ({ showWeight: !state.showWeight })),

      saveVersion: (name) => set((state) => {
        const id = Date.now().toString();
        const newVersion = {
          id,
          name,
          seating: { ...state.seating },
          unassignedPaddlers: [...state.unassignedPaddlers],
          timestamp: Date.now(),
        };
        return {
          versions: {
            ...state.versions,
            [id]: newVersion,
          }
        };
      }),

      loadVersion: (id) => set((state) => {
        const version = state.versions[id];
        if (!version) return state;
        return {
          seating: { ...version.seating },
          unassignedPaddlers: [...version.unassignedPaddlers],
        };
      }),

      deleteVersion: (id) => set((state) => {
        const newVersions = { ...state.versions };
        delete newVersions[id];
        return { versions: newVersions };
      })
    }),
    {
      name: 'boat-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        let state = { ...persistedState };

        if (version === 0) {
          // Inject gender into cached paddlers from mockPaddlers
          const injectGender = (p: any) => {
            if (!p) return p;
            const mock = mockPaddlers.find(m => m.id === p.id);
            if (mock && !p.gender) {
               p.gender = mock.gender;
            }
            return p;
          };

          if (state.unassignedPaddlers) {
             state.unassignedPaddlers = state.unassignedPaddlers.map(injectGender);
          }
          
          if (state.seating) {
             for (const key in state.seating) {
                if (state.seating[key]) {
                   state.seating[key] = injectGender(state.seating[key]);
                }
             }
          }
        }

        if (version < 2) {
          if (state.showWeight === undefined) {
             state.showWeight = true;
          }
          if (state.versions === undefined) {
             state.versions = {};
          }
        }
        
        return state;
      }
    }
  )
);
