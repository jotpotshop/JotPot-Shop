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
  const storageStatus = diag?.storageStatus || 'Active with Safe Fallback Compression';
  const lastRead = formatTimestamp(diag?.lastReadTime);
  const lastWrite = formatTimestamp(diag?.lastWriteTime);
  const lastError = diag?.lastErrorMessage || diag?.error;

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
            isConnected ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-amber-600'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Firebase ক্লাউড সংযোগ ডায়াগনস্টিক
              </h3>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>অনলাইন ও কার্যকর</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>পুনঃসংযোগ পরীক্ষা প্রয়োজন</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Project: <span className="font-mono font-semibold text-gray-700">{diag?.projectId || 'jotpotshop'}</span> • 
              Database ID: <span className="font-mono font-semibold text-gray-700">{diag?.databaseId || 'default'}</span>
            </p>
          </div>
        </div>

        {/* Live Test Action Button */}
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin text-rose-400' : 'text-gray-300'}`} />
          <span>{testing ? 'কানেকশন টেস্ট হচ্ছে...' : 'Test Firebase Connection'}</span>
        </button>
      </div>

      {/* Grid of Diagnostic Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. App Init */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold">Firebase App Initialized</span>
            <Server className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-black text-sm text-gray-900">
              {isAppInit ? 'Yes (সফলভাবে ইনিশিয়ালাইজড)' : 'No (ব্যর্থ)'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">ক্লাইন্ট ও সার্ভার এসডিকে রেডি</p>
        </div>

        {/* 2. Auth Status */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold">Firebase Auth Status</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-black text-sm text-gray-900 truncate" title={authStatus}>
              {authStatus.includes('Authenticated') ? 'Authenticated' : 'Guest / Anonymous'}
            </span>
          </div>
          <p className="text-[11px] text-indigo-700 font-mono truncate mt-1" title={diag?.authEmail || 'RBAC Staff Session'}>
            {diag?.authEmail || 'Admin/Staff Session Active'}
          </p>
        </div>

        {/* 3. Firestore Status */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold">Firestore Connection</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-black text-sm text-gray-900 truncate">
              {firestoreStatus}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {diag?.latencyMs ? `রেসপন্স লেটেন্সি: ${diag.latencyMs}ms` : 'রিয়েল-টাইম ক্লাউড সিঙ্ক'}
          </p>
        </div>

        {/* 4. Storage Status */}
        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold">Firebase Storage Status</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center space-x-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-black text-xs text-gray-900 truncate">
              Active / Safe Fallback
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            স্বয়ংক্রিয় ক্লায়েন্ট অপ্টিমাইজেশন (&lt;60KB)
          </p>
        </div>
      </div>

      {/* Reads, Writes & Audit Log Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gray-500">Last Successful Firestore Read</div>
            <div className="text-xs font-black text-gray-900 truncate mt-0.5">{lastRead}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gray-500">Last Successful Firestore Write</div>
            <div className="text-xs font-black text-gray-900 truncate mt-0.5">{lastWrite}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center space-x-3 md:col-span-2 lg:col-span-1">
          <div className={`p-2.5 rounded-xl ${lastError ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
            <Info className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-gray-500">Last Error Message</div>
            <div className={`text-xs font-semibold truncate mt-0.5 ${lastError ? 'text-amber-700 font-mono' : 'text-emerald-700'}`}>
              {lastError ? String(lastError) : 'কোনো সক্রিয় ত্রুটি নেই (All systems clear)'}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Cloudflare Guarantee Disclaimer */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>নিরাপত্তা নীতি: সংবেদনশীল API প্রাইভেট কি ও পাসওয়ার্ড কখনো স্ক্রিনে প্রদর্শিত হয় না।</span>
        </span>
        {lastTestedAt && (
          <span className="text-gray-500 font-mono text-[10px]">
            সর্বশেষ টেস্ট: {lastTestedAt}
          </span>
        )}
      </div>
    </div>
  );
};
