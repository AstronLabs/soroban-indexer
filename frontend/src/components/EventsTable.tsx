"use client";

import { useState } from "react";
import { Event } from "@/lib/api";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EventsTableProps {
  events: Event[];
  isLoading: boolean;
}

export default function EventsTable({ events, isLoading }: EventsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
        <p className="text-gray-400">No events found.</p>
      </div>
    );
  }

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Event ID</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Contract ID</th>
              <th className="px-6 py-4 font-medium">Ledger</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {events.map((event) => (
              <React.Fragment key={event.id}>
                <tr 
                  className={`hover:bg-gray-800/50 transition-colors cursor-pointer ${expandedRow === event.id ? 'bg-gray-800/30' : ''}`}
                  onClick={() => toggleRow(event.id)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-300">{event.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      event.type === 'system' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-400 truncate max-w-[120px] inline-block" title={event.contractId}>
                      {event.contractId.substring(0, 10)}...{event.contractId.substring(event.contractId.length - 4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{event.ledger.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(event.ledgerClosedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {expandedRow === event.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                </tr>
                
                {expandedRow === event.id && (
                  <tr className="bg-gray-950 border-b border-gray-800">
                    <td colSpan={6} className="px-6 py-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.topic.map((t, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs font-mono text-gray-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Value (JSON)</h4>
                          <pre className="bg-gray-900 border border-gray-700 rounded-md p-4 overflow-x-auto text-xs font-mono text-emerald-400">
                            {JSON.stringify(event.value, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";
