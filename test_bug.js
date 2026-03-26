const state = {
  seating: {
    '1L': { id: '1', name: 'Alice', weight: 65, gender: 'female' },
    '1R': { id: '2', name: 'Bob', weight: 80, gender: 'male' }
  },
  unassignedPaddlers: [
    { id: '3', name: 'Charlie', weight: 70, gender: 'male' }
  ]
};

function assignSeat(paddlerId, seat, currentState) {
  let state = JSON.parse(JSON.stringify(currentState));
  let paddler = state.unassignedPaddlers.find(p => p.id === paddlerId);
  let originalSeat = null;

  if (!paddler) {
    for (const [s, p] of Object.entries(state.seating)) {
      if (p?.id === paddlerId) {
        paddler = p;
        originalSeat = s;
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
    if (occupant && !newUnassigned.some(p => p.id === occupant.id)) {
      newUnassigned.push(occupant);
    }
  }

  return { seating: newSeating, unassignedPaddlers: newUnassigned };
}

console.log("State before:");
console.log(state.seating);

console.log("Move Alice (1) from 1L to 2L:");
const nextState = assignSeat('1', '2L', state);
console.log(nextState.seating);

console.log("Then move Alice (1) from 2L to 3L:");
const nextState2 = assignSeat('1', '3L', nextState);
console.log(nextState2.seating);
