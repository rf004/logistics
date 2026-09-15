import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Play, RefreshCw, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import healthService from '../../services/healthService';
import { useToast } from '../../context/ToastContext';
import processEngineService from '../../services/processEngineService';

export function Topbar({ onOpenMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isHealthOnline, setIsHealthOnline] = useState(true);
  const [latency, setLatency] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Periodic health check
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const res = await healthService.checkHealth();
      if (isMounted) {
        setIsHealthOnline(res.online);
        setLatency(res.latencyMs);
      }
    };
    check();
    const interval = setInterval(check, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRunPipeline = async () => {
    try {
      setIsProcessing(true);
      const res = await processEngineService.processFarms();
      success(
        `Processed ${res.data?.processedFarms || 0} farms and generated ${res.data?.createdTransportPlans?.length || 0} transport plans!`,
        'Logistics Engine Finished'
      );
      // If we are not on dashboard or transport-plans, navigate to routes or transport-plans
      if (location.pathname === '/routes' || location.pathname === '/transport-plans') {
        window.location.reload();
      }
    } catch (err) {
      error(err.message || 'Failed to execute processing pipeline', 'Execution Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert pathname to readable breadcrumb
  const pageTitle = location.pathname.substring(1).replace(/-/g, ' ').replace(/\//g, ' > ') || 'Dashboard';

  return (
    <header className="h-16 border-b border-zinc-900 bg-black/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-widest">Platform</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 capitalize font-medium">{pageTitle}</span>
        </div>
      </div>

      {/* Right: Health Status & Engine Trigger */}
      <div className="flex items-center gap-3">
        {/* API Health indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-900 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthOnline ? 'bg-emerald-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'
            }`}
          />
          <span className="text-zinc-400">
            {isHealthOnline ? 'API Connected' : 'API Offline'}
          </span>
          {latency !== null && isHealthOnline && (
            <span className="text-zinc-600">({latency}ms)</span>
          )}
        </div>

        {/* Global Process Engine CTA */}
        <Button
          variant="brand"
          size="sm"
          onClick={handleRunPipeline}
          isLoading={isProcessing}
          icon={Play}
        >
          <span className="hidden sm:inline">Run Engine Pipeline</span>
          <span className="sm:hidden">Run</span>
        </Button>
      </div>
    </header>
  );
}

export default Topbar;
