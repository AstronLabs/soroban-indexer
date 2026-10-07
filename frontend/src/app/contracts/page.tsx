"use client";

import { useEffect, useState } from "react";
import { fetchContracts, Contract } from "@/lib/api";
import { FileCode, Activity } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const res = await fetchContracts({ limit: 20 });
        setContracts(res.data);
      } catch (error) {
        console.error("Failed to load contracts", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContracts();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Indexed Contracts</h1>
        <p className="text-gray-400">Smart contracts that have emitted events on the network.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <div key={contract.id}  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-colors cursor-pointer shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FileCode className="h-5 w-5" />
                </div>
                <div className="flex items-center text-xs font-medium bg-gray-950 px-2 py-1 rounded-md text-gray-400 border border-gray-800">
                  <Activity className="h-3 w-3 mr-1 text-emerald-500" />
                  {contract.totalEvents.toLocaleString()} Events
                </div>
              </div>
              
              <div className="mb-4">
  <h3 className="text-gray-400 text-xs font-medium mb-1">Contract ID</h3>

  <div className="flex items-center gap-2">
    <p className="font-mono text-gray-200 text-sm break-all flex-1">
      {contract.id.substring(0, 12)}...
      {contract.id.substring(contract.id.length - 8)}
    </p>

    <CopyButton value={contract.id} />
  </div>
</div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 border-t border-gray-800 pt-4">
                <div>
                  <span className="block text-gray-500 mb-1">First Seen</span>
                  L {contract.firstSeenLedger.toLocaleString()}
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Last Activity</span>
                  L {contract.lastActivityLedger.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {contracts.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
          <FileCode className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Contracts Found</h3>
          <p className="text-gray-400">There are no indexed contracts in the database.</p>
        </div>
      )}
    </div>
  );
}
