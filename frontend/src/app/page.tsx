"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import EventsTable from "@/components/EventsTable";
import { fetchStats, fetchEvents, Stats, Event } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          fetchStats(),
          fetchEvents({ limit: 10 })
        ]);
        setStats(statsData);
        setRecentEvents(eventsData.data);
      } catch (error) {
        console.error("Failed to load overview data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Monitoring Soroban network indexing status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          title="Total Events" 
          value={isLoading ? "..." : stats?.totalEvents.toLocaleString() || "0"} 
          icon="events" 
          trend="+12%" 
          trendUp={true} 
        />
        <StatsCard 
          title="Contracts Indexed" 
          value={isLoading ? "..." : stats?.contractsIndexed.toLocaleString() || "0"} 
          icon="contracts" 
        />
        <StatsCard 
          title="Latest Ledger" 
          value={isLoading ? "..." : stats?.latestLedger.toLocaleString() || "0"} 
          icon="ledgers" 
        />
        <StatsCard 
          title="Ingester Status" 
          value={isLoading ? "..." : (stats?.ingesterStatus === 'online' ? 'Online' : 'Offline')} 
          icon="status" 
        />
      </div>

      {/* Recent Events Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Events</h2>
        <Link href="/events" className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300">
          View all events <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>
      
      <EventsTable events={recentEvents} isLoading={isLoading} />
    </div>
  );
}
