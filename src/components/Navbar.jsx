import React from 'react';
import { Building2, PlusCircle, LayoutList, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">ECOBUILD</h1>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Hyperlocal C&D Waste</span>
          </div>
        </div>

        {/* Navigation Actions & Account Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feed'
                ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutList className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black shadow-2xs transition-all ${
              activeTab === 'post'
                ? 'bg-amber-600 text-white shadow-amber-600/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Post Waste</span>
          </button>

          {/* User Account / Logout Badge */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl ml-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-mono font-bold text-slate-700 hidden md:inline">
              {user?.phone ? `+91 ${user.phone.slice(-4)}` : 'Account'}
            </span>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-600 ml-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}