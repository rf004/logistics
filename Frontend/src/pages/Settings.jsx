import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cpu,
  Database,
  Globe,
  Sliders,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

import healthService from '../services/healthService';
import { API_BASE_URL } from '../services/api';
import { useToast } from '../context/ToastContext';

export function Settings() {
  const { success, error } = useToast();
  const [healthInfo, setHealthInfo] = useState({ online: false, latencyMs: null, data: null });
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const res = await healthService.checkHealth();
    setHealthInfo(res);
    setChecking(false);
    if (res.online) {
      success(`Backend API is active with ${res.latencyMs}ms response latency.`);
    } else {
      error(`Backend is unreachable at ${API_BASE_URL}`);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        title="System Settings & Diagnostics"
        subtitle="Inspect backend API connectivity, optimization algorithm parameters, and runtime environment."
      />

      {/* API Connectivity Diagnostic Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Server className="w-4 h-4 text-emerald-400" />
              API Server Diagnostics
            </CardTitle>
            <CardDescription>Live health probe to the Express.js backend.</CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={checkConnection}
            isLoading={checking}
          >
            Ping Server
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
              <span className="text-zinc-500 uppercase text-[10px]">Connection Status</span>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthInfo.online ? 'bg-emerald-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm font-bold text-white">
                  {healthInfo.online ? 'ONLINE' : 'UNREACHABLE'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
              <span className="text-zinc-500 uppercase text-[10px]">Response Latency</span>
              <div className="text-sm font-bold text-emerald-400 pt-1">
                {healthInfo.latencyMs !== null ? `${healthInfo.latencyMs} ms` : 'N/A'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
              <span className="text-zinc-500 uppercase text-[10px]">Configured API Base URL</span>
              <div className="text-xs font-mono text-zinc-300 pt-1 truncate">{API_BASE_URL}</div>
            </div>
          </div>

          {healthInfo.data && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 font-mono text-xs">
              <span className="text-zinc-500 block mb-1 uppercase text-[10px]">Raw Server Response</span>
              <pre className="text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(healthInfo.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backend Engine Optimization Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Sliders className="w-4 h-4 text-blue-400" />
            Algorithm Parameters & Consts
          </CardTitle>
          <CardDescription>
            Constants configured in the backend optimization engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">URGENCY_TIE_THRESHOLD</span>
                <Badge variant="info">5.0 points</Badge>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                When two candidate farms have urgency scores within 5 points, Dijkstra road distance is used as the decisive tie-breaker.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">PATHFINDING_ALGORITHM</span>
                <Badge variant="success">DIJKSTRA</Badge>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Shortest path calculated using a min-heap priority queue over truck-specific filtered graph networks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Runtime Platform Information */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-zinc-400" /> Platform Architecture
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-zinc-400">
          <div>
            <span className="text-zinc-600 block text-[10px]">FRONTEND</span>
            <span className="text-zinc-200">React + Vite</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px]">BACKEND</span>
            <span className="text-zinc-200">Node.js + Express</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px]">DATABASE</span>
            <span className="text-zinc-200">MongoDB / Mongoose</span>
          </div>
          <div>
            <span className="text-zinc-600 block text-[10px]">MAPPING</span>
            <span className="text-zinc-200">Leaflet + Dark Matter</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
