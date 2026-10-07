"use client";

import { useEffect, useState } from "react";
import { fetchLedgers, Ledger } from "@/lib/api";
import { Layers, Clock } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default function LedgersPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    const loadLedgers = async () => {
      try {
        const res = await fetchLedgers({ limit: 20 });
        setLedgers(res);
        setLastRefresh(new Date());
      } catch (error) {
        console.error("Failed to load ledgers", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLedgers();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadLedgers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Network Ledgers</h1>
          <p className="text-gray-400">Recent ledgers processed by the indexer.</p>
        </div>
        <div className="flex items-center text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
          <Clock className="w-4 h-4 mr-2 text-emerald-500" />
          Auto-updating • Last: {lastRefresh ? lastRefresh.toLocaleTimeString() : "--"}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Sequence</th>
                <th className="px-6 py-4 font-medium">Hash</th>
                <th className="px-6 py-4 font-medium text-right">Events Count</th>
                <th className="px-6 py-4 font-medium text-right">Closed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading && ledgers.length === 0 ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-8 ml-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-32 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                ledgers.map((ledger, idx) => (
                  <tr key={ledger.sequence} className={`hover:bg-gray-800/50 transition-colors ${idx === 0 ? 'bg-blue-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Layers className={`w-4 h-4 mr-2 ${idx === 0 ? 'text-blue-400' : 'text-gray-500'}`} />
                        <span className={`font-mono font-medium ${idx === 0 ? 'text-blue-400' : 'text-gray-200'}`}>
                          {ledger.sequence.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
  <div className="flex items-center gap-1">
    <span className="font-mono text-xs text-gray-400 truncate w-[200px] sm:w-xs md:w-md">
      {ledger.hash}
    </span>

    <CopyButton value={ledger.hash} />
  </div>
</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        ledger.eventsCount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-500'
                      }`}>
                        {ledger.eventsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 text-right">
                      {new Date(ledger.closedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {!isLoading && ledgers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No ledgers indexed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
