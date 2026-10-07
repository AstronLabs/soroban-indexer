import { Activity, Layers, FileCode, Server } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: "events" | "contracts" | "ledgers" | "status";
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  const IconMap = {
    events: Activity,
    contracts: FileCode,
    ledgers: Layers,
    status: Server
  };
  
  const Icon = IconMap[icon];
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
            {trend}
          </span>
          <span className="ml-2 text-gray-500">vs last week</span>
        </div>
      )}
    </div>
  );
}
