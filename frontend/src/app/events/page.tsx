"use client";

import { useEffect, useState } from "react";
import EventsTable from "@/components/EventsTable";
import Pagination from "@/components/Pagination";
import { fetchEvents, Event } from "@/lib/api";
import { Search, Filter } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contractId, setContractId] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);

  const loadEvents = async (searchCursor?: string, searchContract?: string) => {
    setIsLoading(true);
    try {
      const res = await fetchEvents({ 
        limit: 15, 
        cursor: searchCursor,
        contractId: searchContract || undefined
      });
      setEvents(res.data);
      setNextCursor(res.nextCursor);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHistory([]);
    setCursor(undefined);
    loadEvents(undefined, contractId);
  };

  const handleNext = () => {
    if (nextCursor) {
      setHistory([...history, cursor || ""]);
      setCursor(nextCursor);
      loadEvents(nextCursor, contractId);
    }
  };

  const handlePrev = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevCursor = newHistory.pop();
      setHistory(newHistory);
      setCursor(prevCursor || undefined);
      loadEvents(prevCursor || undefined, contractId);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Events Explorer</h1>
        <p className="text-gray-400">Search and filter smart contract events on Soroban.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by Contract ID..." 
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button 
            type="button"
            className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <div className="flex-1">
        <EventsTable events={events} isLoading={isLoading} />
      </div>

      <Pagination 
        onNext={handleNext} 
        onPrev={handlePrev} 
        hasNext={!!nextCursor} 
        hasPrev={history.length > 0} 
        currentPage={history.length + 1}
      />
    </div>
  );
}
