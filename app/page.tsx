"use client";

import { useState, useCallback } from "react";
import {
  Room,
  initializeRooms,
  findOptimalRooms,
  randomizeBookings,
  calculateTravelTime,
} from "./lib/booking";

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(initializeRooms);
  const [roomCount, setRoomCount] = useState<string>("");
  const [lastBookedRooms, setLastBookedRooms] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [travelTime, setTravelTime] = useState<number | null>(null);

  const handleBook = useCallback(() => {
    const count = parseInt(roomCount, 10);
    if (isNaN(count) || count < 1) {
      setMessage("Please enter a valid number of rooms (1-5).");
      return;
    }

    const result = findOptimalRooms(rooms, count);

    if (result.success) {
      const updatedRooms = rooms.map((room) =>
        result.rooms.includes(room.number)
          ? { ...room, isBooked: true }
          : room
      );
      setRooms(updatedRooms);
      setLastBookedRooms(result.rooms);
      setTravelTime(result.travelTime);
      setMessage(
        `Booked rooms: ${result.rooms.join(", ")}. Travel time: ${result.travelTime} minutes.`
      );
    } else {
      setMessage(result.message);
      setLastBookedRooms([]);
      setTravelTime(null);
    }
  }, [rooms, roomCount]);

  const handleReset = useCallback(() => {
    setRooms(initializeRooms());
    setLastBookedRooms([]);
    setMessage("All rooms have been reset.");
    setTravelTime(null);
    setRoomCount("");
  }, []);

  const handleRandom = useCallback(() => {
    const randomized = randomizeBookings(initializeRooms(), 30);
    setRooms(randomized);
    setLastBookedRooms([]);
    setMessage("Random bookings applied (30% of rooms).");
    setTravelTime(null);
  }, []);

  const getFloorRooms = (floor: number) => {
    return rooms.filter((r) => r.floor === floor).sort((a, b) => a.position - b.position);
  };

  const availableCount = rooms.filter((r) => !r.isBooked).length;
  const bookedCount = rooms.filter((r) => r.isBooked).length;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-6">
          Hotel Room Reservation System
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <input
            type="number"
            min="1"
            max="5"
            placeholder="No of Rooms"
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
            className="w-40 px-4 py-2 border-2 border-slate-300 rounded-lg text-slate-800 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleBook}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRandom}
            className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Random
          </button>
        </div>

        {message && (
          <div
            className={`text-center mb-4 p-3 rounded-lg ${
              message.includes("Successfully") || message.includes("Booked")
                ? "bg-green-100 text-green-800"
                : message.includes("reset") || message.includes("Random")
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-400 bg-white rounded"></div>
            <span className="text-slate-600">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-400 rounded"></div>
            <span className="text-slate-600">Booked ({bookedCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            <span className="text-slate-600">Just Booked ({lastBookedRooms.length})</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex">
            <div className="flex flex-col justify-center mr-4">
              <div className="w-12 h-full border-2 border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                <div className="transform -rotate-90 whitespace-nowrap text-xs text-slate-500 font-medium">
                  LIFT / STAIRS
                </div>
              </div>
            </div>

            <div className="flex-1">
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((floor) => (
                <div key={floor} className="flex items-center mb-2 last:mb-0">
                  <div className="w-8 text-xs text-slate-500 font-medium mr-2">
                    F{floor}
                  </div>
                  <div className="flex gap-1">
                    {getFloorRooms(floor).map((room) => {
                      const isJustBooked = lastBookedRooms.includes(room.number);
                      const isBooked = room.isBooked;

                      return (
                        <div
                          key={room.number}
                          className={`w-9 h-9 flex items-center justify-center text-xs font-medium rounded border-2 transition-all cursor-default ${
                            isJustBooked
                              ? "bg-green-500 border-green-600 text-white"
                              : isBooked
                              ? "bg-slate-400 border-slate-500 text-white"
                              : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"
                          }`}
                          title={`Room ${room.number}`}
                        >
                          {room.number >= 1000
                            ? room.number - 1000
                            : room.number % 100}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {travelTime !== null && lastBookedRooms.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <span className="text-green-800 font-medium">
                Total Travel Time: {travelTime} minutes
              </span>
              <span className="text-green-600 text-sm ml-2">
                (between rooms {lastBookedRooms.sort((a, b) => a - b).join(" → ")})
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-slate-500 text-center space-y-1">
          <p>Horizontal travel: 1 minute per room | Vertical travel: 2 minutes per floor</p>
          <p>Maximum 5 rooms per booking | Priority: Same floor first, then minimize travel time</p>
        </div>
      </div>
    </main>
  );
}
