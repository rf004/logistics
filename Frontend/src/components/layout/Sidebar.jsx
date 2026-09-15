import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Package,
  Warehouse,
  Truck,
  Route,
  GitFork,
  ClipboardList,
  BarChart3,
  Settings,
  Sparkles,
  Activity,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farms', label: 'Farms', icon: Sprout },
  { path: '/shipments', label: 'Produce Queue', icon: Package },
  { path: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { path: '/trucks', label: 'Fleet Management', icon: Truck },
  { path: '/roads', label: 'Road Network', icon: GitFork },
  { path: '/routes', label: 'Route Optimizer', icon: Route, highlight: true },
  { path: '/transport-plans', label: 'Transport Plans', icon: ClipboardList },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onCloseMobile }) {
  return (
    <aside className="w-64 h-full bg-black border-r border-zinc-900 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group" onClick={onCloseMobile}>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/50 transition-colors shadow-sm">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-white flex items-center gap-1.5">
                AGROLOGIX
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 rounded border border-emerald-500/30 font-mono font-normal">
                  PRO
                </span>
              </span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                Logistics OS
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-600 font-semibold">
            Platform Navigation
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-zinc-900 text-white border border-zinc-800 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-emerald-400'
                              : 'text-zinc-500 group-hover:text-zinc-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.highlight && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}

                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Optimization Engine
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">v1.0</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            Dijkstra + Priority Urgency pipeline active on port 5000.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
