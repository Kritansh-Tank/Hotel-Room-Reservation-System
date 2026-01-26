export interface Room {
  number: number;
  floor: number;
  position: number;
  isBooked: boolean;
}

export interface BookingResult {
  rooms: number[];
  travelTime: number;
  success: boolean;
  message: string;
}

export function getRoomFloor(roomNumber: number): number {
  if (roomNumber >= 1001) return 10;
  return Math.floor(roomNumber / 100);
}

export function getRoomPosition(roomNumber: number): number {
  if (roomNumber >= 1001) return roomNumber - 1000;
  return roomNumber % 100;
}

export function calculateTravelTime(rooms: number[]): number {
  if (rooms.length <= 1) return 0;

  const sortedRooms = [...rooms].sort((a, b) => a - b);
  let totalTime = 0;

  for (let i = 0; i < sortedRooms.length - 1; i++) {
    const current = sortedRooms[i];
    const next = sortedRooms[i + 1];
    
    const currentFloor = getRoomFloor(current);
    const nextFloor = getRoomFloor(next);
    const currentPos = getRoomPosition(current);
    const nextPos = getRoomPosition(next);

    const verticalTime = Math.abs(nextFloor - currentFloor) * 2;
    const horizontalTime = Math.abs(nextPos - currentPos);

    totalTime += verticalTime + horizontalTime;
  }

  return totalTime;
}

export function initializeRooms(): Room[] {
  const rooms: Room[] = [];
  
  for (let floor = 1; floor <= 9; floor++) {
    for (let pos = 1; pos <= 10; pos++) {
      const roomNumber = floor * 100 + pos;
      rooms.push({
        number: roomNumber,
        floor,
        position: pos,
        isBooked: false,
      });
    }
  }
  
  for (let pos = 1; pos <= 7; pos++) {
    rooms.push({
      number: 1000 + pos,
      floor: 10,
      position: pos,
      isBooked: false,
    });
  }
  
  return rooms;
}

function findBestSameFloorRooms(
  availableRooms: Room[],
  count: number
): number[] | null {
  const roomsByFloor = new Map<number, Room[]>();
  
  for (const room of availableRooms) {
    const floor = room.floor;
    if (!roomsByFloor.has(floor)) {
      roomsByFloor.set(floor, []);
    }
    roomsByFloor.get(floor)!.push(room);
  }

  let bestRooms: number[] | null = null;
  let bestTime = Infinity;

  for (const [, floorRooms] of roomsByFloor) {
    if (floorRooms.length < count) continue;
    
    const sortedRooms = floorRooms.sort((a, b) => a.position - b.position);
    
    for (let i = 0; i <= sortedRooms.length - count; i++) {
      const candidate = sortedRooms.slice(i, i + count).map(r => r.number);
      const time = calculateTravelTime(candidate);
      
      if (time < bestTime) {
        bestTime = time;
        bestRooms = candidate;
      }
    }
  }

  return bestRooms;
}

function findBestCrossFloorRooms(
  availableRooms: Room[],
  count: number
): number[] | null {
  if (availableRooms.length < count) return null;

  const sortedRooms = [...availableRooms].sort((a, b) => {
    if (a.floor !== b.floor) return a.floor - b.floor;
    return a.position - b.position;
  });

  let bestRooms: number[] | null = null;
  let bestTime = Infinity;

  function generateCombinations(
    start: number,
    current: Room[]
  ): void {
    if (current.length === count) {
      const roomNumbers = current.map(r => r.number);
      const time = calculateTravelTime(roomNumbers);
      if (time < bestTime) {
        bestTime = time;
        bestRooms = roomNumbers;
      }
      return;
    }

    for (let i = start; i < sortedRooms.length; i++) {
      current.push(sortedRooms[i]);
      generateCombinations(i + 1, current);
      current.pop();
    }
  }

  if (sortedRooms.length <= 15) {
    generateCombinations(0, []);
  } else {
    const floorGroups = new Map<number, Room[]>();
    for (const room of sortedRooms) {
      if (!floorGroups.has(room.floor)) {
        floorGroups.set(room.floor, []);
      }
      floorGroups.get(room.floor)!.push(room);
    }

    const floors = Array.from(floorGroups.keys()).sort((a, b) => a - b);
    
    for (let i = 0; i < floors.length; i++) {
      for (let j = i; j < floors.length; j++) {
        const roomsInRange: Room[] = [];
        for (let f = floors[i]; f <= floors[j]; f++) {
          if (floorGroups.has(f)) {
            roomsInRange.push(...floorGroups.get(f)!);
          }
        }
        
        if (roomsInRange.length >= count) {
          const sorted = roomsInRange.sort((a, b) => a.position - b.position);
          
          for (let k = 0; k <= sorted.length - count; k++) {
            const candidate = sorted.slice(k, k + count).map(r => r.number);
            const time = calculateTravelTime(candidate);
            if (time < bestTime) {
              bestTime = time;
              bestRooms = candidate;
            }
          }
        }
      }
    }
    
    if (!bestRooms && sortedRooms.length >= count) {
      bestRooms = sortedRooms.slice(0, count).map(r => r.number);
      bestTime = calculateTravelTime(bestRooms);
    }
  }

  return bestRooms;
}

export function findOptimalRooms(
  rooms: Room[],
  count: number
): BookingResult {
  if (count < 1 || count > 5) {
    return {
      rooms: [],
      travelTime: 0,
      success: false,
      message: "You can only book between 1 and 5 rooms at a time.",
    };
  }

  const availableRooms = rooms.filter(r => !r.isBooked);

  if (availableRooms.length < count) {
    return {
      rooms: [],
      travelTime: 0,
      success: false,
      message: `Only ${availableRooms.length} rooms available. Cannot book ${count} rooms.`,
    };
  }

  const sameFloorRooms = findBestSameFloorRooms(availableRooms, count);
  
  if (sameFloorRooms) {
    return {
      rooms: sameFloorRooms,
      travelTime: calculateTravelTime(sameFloorRooms),
      success: true,
      message: `Successfully booked ${count} rooms on the same floor.`,
    };
  }

  const crossFloorRooms = findBestCrossFloorRooms(availableRooms, count);
  
  if (crossFloorRooms) {
    return {
      rooms: crossFloorRooms,
      travelTime: calculateTravelTime(crossFloorRooms),
      success: true,
      message: `Successfully booked ${count} rooms across multiple floors.`,
    };
  }

  return {
    rooms: [],
    travelTime: 0,
    success: false,
    message: "Could not find suitable rooms.",
  };
}

export function randomizeBookings(rooms: Room[], percentage: number = 30): Room[] {
  const newRooms = rooms.map(r => ({ ...r, isBooked: false }));
  const toBook = Math.floor(newRooms.length * (percentage / 100));
  
  const indices = newRooms.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  for (let i = 0; i < toBook; i++) {
    newRooms[indices[i]].isBooked = true;
  }
  
  return newRooms;
}
