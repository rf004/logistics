import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Route,
  Zap,
  ShieldCheck,
  Truck,
  Warehouse,
  Sprout,
  Activity,
  Layers,
  ChevronRight,
  TrendingDown,
  Clock,
} from 'lucide-react';
import Button from '../components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/20 selection:text-emerald-400 overflow-hidden font-sans">
      {/* Background Subtle Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-sm">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-widest text-white">AGROLOGIX</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/routes">
            <Button variant="ghost" size="sm">
              Route Optimizer
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300 mb-8 backdrop-blur-md shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Production Logistics Optimization OS
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          Smarter Agriculture <br />
          <span className="bg-gradient-to-r from-emerald-400 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Logistics & Transport.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Optimize farm-to-warehouse transportation with perishable shelf-life prioritization, Dijkstra shortest-path routing, capacity-aware fleet allocation, and multi-farm pickup sequences.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Launch Command Center
            </Button>
          </Link>
          <Link to="/routes">
            <Button variant="secondary" size="lg" icon={Route}>
              Test Route Optimizer
            </Button>
          </Link>
        </div>
      </section>

      {/* Interactive Platform Feature Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/80 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:border-emerald-500/50 transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shelf Life Urgency Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates real-time perishability scores (0-100) based on harvest timestamps. Prioritizes critical produce batches before spoilage occurs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/80 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:border-emerald-500/50 transition-colors">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dijkstra Multi-Farm Routing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Constructs truck-specific graph networks adhering to bridge height, width, and gross vehicle weight restrictions to calculate optimal multi-stop paths.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/80 backdrop-blur-md hover:border-zinc-800 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 mb-6 group-hover:border-emerald-500/50 transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Best-Fit Fleet Allocation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Matches warehouse storage feasibility and fleet payload capacity using heuristics to minimize empty backhauls and excess fuel expenditure.
            </p>
          </div>
        </div>
      </section>

      {/* Algorithmic Pipeline Diagram */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="p-8 rounded-2xl border border-zinc-850 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
                Architecture Workflow
              </span>
              <h3 className="text-xl font-bold text-white mt-1">End-to-End Optimization Pipeline</h3>
            </div>
            <Link to="/dashboard">
              <span className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono">
                View Live Pipeline <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-500 block mb-1">01. INTAKE</span>
              <span className="text-sm font-bold text-zinc-200">Farms & Urgency</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-500 block mb-1">02. FEASIBILITY</span>
              <span className="text-sm font-bold text-zinc-200">Storage & Trucks</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-500 block mb-1">03. PATHFINDING</span>
              <span className="text-sm font-bold text-zinc-200">Dijkstra Graph</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-500 block mb-1">04. DISPATCH</span>
              <span className="text-sm font-bold text-emerald-400">Transport Plan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <div>AgroLogix &copy; {new Date().getFullYear()} — Production Logistics Optimization</div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:text-zinc-300">Dashboard</Link>
          <Link to="/routes" className="hover:text-zinc-300">Route Planner</Link>
          <Link to="/transport-plans" className="hover:text-zinc-300">Transport Plans</Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
