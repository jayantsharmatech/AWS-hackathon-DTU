import React from 'react';
import { HardHat, LogOut, PlusCircle, ShoppingBag, WifiOff } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, isOnline }) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b-2 border-amber-500 shadow-xl">
      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-xs font-black py-1 px-3 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>OFFLINE MODE - POSTS WILL SYNC WHEN ONLINE</span>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-amber-500 p-2 rounded-xl text-slate-950 font-black shadow-lg flex items-center justify-center">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-xl tracking-wider text-white flex items-center gap-1">
              ECO<span className="text-emerald-400">BUILD</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-bold uppercase tracking-widest">
              C&D Waste Market
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 font-mono font-bold">
              +91 {user.phone.slice(-4)}
            </span>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors touch-target"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      {user && (
        <div className="grid grid-cols-2 bg-slate-950 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3.5 text-center font-bold text-sm tracking-wide flex items-center justify-center gap-2 border-b-2 touch-target ${
              activeTab === 'feed'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            BUY WASTE
          </button>

          <button
            onClick={() => setActiveTab('post')}
            className={`py-3.5 text-center font-bold text-sm tracking-wide flex items-center justify-center gap-2 border-b-2 touch-target ${
              activeTab === 'post'
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            SELL / POST
          </button>
        </div>
      )}
    </header>
  );
}
