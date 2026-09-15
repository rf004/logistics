import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react';
import Button from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 mb-6 shadow-2xl">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white mb-2">
        404
      </h1>
      <h2 className="text-lg font-semibold text-zinc-200 mb-2">Page Not Found</h2>
      <p className="text-xs text-zinc-400 max-w-sm mb-8 leading-relaxed">
        The requested routing node or URL path does not exist in the logistics system.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" size="sm" icon={Home}>
            Home
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={LayoutDashboard}>
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
