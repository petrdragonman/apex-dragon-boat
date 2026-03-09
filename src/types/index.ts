export interface Paddler {
  id: string;
  name: string;
  weight: number;
  gender?: 'male' | 'female';
}

export type SeatPosition = 
  | 'drummer'
  | 'sweep'
  | '1L' | '1R'
  | '2L' | '2R'
  | '3L' | '3R'
  | '4L' | '4R'
  | '5L' | '5R'
  | '6L' | '6R'
  | '7L' | '7R'
  | '8L' | '8R'
  | '9L' | '9R'
  | '10L' | '10R';

export type BoatSeating = Partial<Record<SeatPosition, Paddler>>;

export interface BoatVersion {
  id: string;
  name: string;
  seating: BoatSeating;
  unassignedPaddlers: Paddler[];
  timestamp: number;
}

export interface BoatState {
  seating: BoatSeating;
  unassignedPaddlers: Paddler[];
  showWeight: boolean;
  versions: Record<string, BoatVersion>;
}
