import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Server,
  HardDrive,
  UserCheck,
  Clock,
  Activity,
  Layers,
  Info,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { FirebaseConnectionDiagnostic } from '../../lib/firebase';

interface DiagnosticCardProps {
  compact?: boolean;
}

export const FirebaseConnectionDiagnosticCard: React.FC<DiagnosticCardProps> = ({ compact = false }) => {
  const { firebaseStatus, refreshFirebaseConnection, language } = useShop();
  const [testing, setTesting] = useState(false);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await refreshFirebaseConnection();
      setLastTestedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } finally {
      setTesting(false);
    }
  };

  const formatTimestamp = (isoStr?: string) => {
    if (!isoStr || isoStr.startsWith('N/A')) return 'N/A (অপেক্ষমাণ)';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ', ' + d.toLocaleDateString();
    } catch {
      return isoStr;
    }
  };

  const diag = firebaseStatus;
  const isConnected = Boolean(diag?.connected);
  const isAppInit = Boolean(diag?.appInitialized ?? true);
  const authStatus = diag?.authStatus || 'Authenticated (Staff/Admin)';
  const firestoreStatus = diag?.firestoreStatus || (isConnected ? 'Connected' : 'Connecting...');
  const storageStatus = diag?.storageStatus || 'Cloudflare R2 (jotpotshop)';
  const lastRead = formatTimestamp(diag?.lastReadTime);
  const lastWrite = formatTimestamp(diag?.lastWriteTime);
  const lastError = diag?.lastErrorMessage || diag?.error;

  return (
    <div className="bg-white rounded-2xl border border-[#e6e3dd] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e3dd]">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
            isConnected ? 'bg-[#15803d]' : 'bg-[#881337]'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
                Firebase ক্লাউড সংযোগ ডায়াগনস্টিক
              </h3>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isConnected ? 'text-[#15803d]' : 'text-[#b91c1c]'
              }`}>
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>অনলাইন ও কার্যকর</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>পুনঃসংযোগ পরীক্ষা প্রয়োজন</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5 tabular-nums">
              Project: <span className="font-mono font-semibold text-[#374151]">{diag?.projectId || 'jotpotshop'}</span>
              <span className="mx-1.5">·</span>
              Database ID: <span className="font-mono font-semibold text-[#374151]">{diag?.databaseId || 'default'}</span>
            </p>
          </div>
        </div>

        {/* Live Test Action Button */}
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="min-h-[38px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#111827] hover:bg-black text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
          <span>{testing ? 'কানেকশন টেস্ট হচ্ছে...' : 'Test Firebase Connection'}</span>
        </button>
      </div>

      {/* Grid of Diagnostic Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
        {/* 1. App Init */}
        <div className="bg-[#faf9f7] rounded-xl p-4 border border-[#e6e3dd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6b7280] text-xs mb-1">
            <span className="font-semibold">Firebase App Initialized</span>
            <Server className="w-4 h-4 text-[#374151]" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
            <span className="font-bold text-sm text-[#111827]">
              {isAppInit ? 'Yes (সফলভাবে ইনিশিয়ালাইজড)' : 'No (ব্যর্থ)'}
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280] mt-1">ক্লাইন্ট ও সার্ভার এসডিকে রেডি</p>
        </div>

        {/* 2. Auth Status */}
        <div className="bg-[#faf9f7] rounded-xl p-4 border border-[#e6e3dd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6b7280] text-xs mb-1">
            <span className="font-semibold">Firebase Auth Status</span>
            <UserCheck className="w-4 h-4 text-[#374151]" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-[#111827] shrink-0" />
            <span className="font-bold text-sm text-[#111827] truncate" title={authStatus}>
              {authStatus.includes('Authenticated') ? 'Authenticated' : 'Guest / Anonymous'}
            </span>
          </div>
          <p className="text-[11px] text-[#374151] font-mono truncate mt-1" title={diag?.authEmail || 'RBAC Staff Session'}>
            {diag?.authEmail || 'Admin/Staff Session Active'}
          </p>
        </div>

        {/* 3. Firestore Status */}
        <div className="bg-[#faf9f7] rounded-xl p-4 border border-[#e6e3dd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6b7280] text-xs mb-1">
            <span className="font-semibold">Firestore Connection</span>
            <Activity className={`w-4 h-4 ${isConnected ? 'text-[#15803d]' : 'text-[#b91c1c]'}`} />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {isConnected ? (
              <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#b91c1c] shrink-0" />
            )}
            <span className="font-bold text-sm text-[#111827] truncate">
              {firestoreStatus}
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280] mt-1">
            {diag?.latencyMs ? `রেসপন্স লেটেন্সি: ${diag.latencyMs}ms` : 'রিয়েল-টাইম ক্লাউড সিঙ্ক'}
          </p>
        </div>

        {/* 4. Cloudflare R2 Storage Status */}
        <div className="bg-[#faf9f7] rounded-xl p-4 border border-[#e6e3dd] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6b7280] text-xs mb-1">
            <span className="font-semibold">Cloudflare R2 Storage</span>
            <HardDrive className="w-4 h-4 text-[#374151]" />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
            <span className="font-bold text-xs text-[#111827] truncate" title={storageStatus}>
              {storageStatus}
            </span>
          </div>
          <p className="text-[11px] text-[#6b7280] mt-1">
            অটো WebP অপ্টিমাইজেশন · R2 এজ ক্যাশিং
          </p>
        </div>
      </div>

      {/* Reads, Writes & Audit Log Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 tabular-nums">
        <div className="p-3.5 rounded-xl bg-[#faf9f7] border border-[#e6e3dd] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-[#e6e3dd] text-[#111827]">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#6b7280]">Last Successful Firestore Read</div>
            <div className="text-xs font-bold text-[#111827] truncate mt-0.5">{lastRead}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#faf9f7] border border-[#e6e3dd] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-[#e6e3dd] text-[#15803d]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#6b7280]">Last Successful Firestore Write</div>
            <div className="text-xs font-bold text-[#111827] truncate mt-0.5">{lastWrite}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#faf9f7] border border-[#e6e3dd] flex items-center gap-3 md:col-span-2 lg:col-span-1">
          <div className={`p-2 rounded-lg bg-white border border-[#e6e3dd] ${lastError ? 'text-[#b91c1c]' : 'text-[#6b7280]'}`}>
            <Info className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#6b7280]">Last Error Message</div>
            <div className={`text-xs font-semibold truncate mt-0.5 ${lastError ? 'text-[#b91c1c] font-mono' : 'text-[#15803d]'}`}>
              {lastError ? String(lastError) : 'কোনো সক্রিয় ত্রুটি নেই'}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Cloudflare Guarantee Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6b7280] pt-2 border-t border-[#e6e3dd] tabular-nums">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15803d]" />
          <span>নিরাপত্তা নীতি: সংবেদনশীল API প্রাইভেট কি ও পাসওয়ার্ড কখনো স্ক্রিনে প্রদর্শিত হয় না।</span>
        </span>
        {lastTestedAt && (
          <span className="text-[#6b7280] font-mono text-[11px]">
            সর্বশেষ টেস্ট: {lastTestedAt}
          </span>
        )}
      </div>
    </div>
  );
};
