import React, { useState } from 'react';
import { Phone, ArrowRight, ShieldCheck, HardHat, CheckCircle } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [error, setError] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '1234') {
      setError('Invalid OTP. Use Demo OTP: 1234');
      return;
    }
    const userData = { phone, isLoggedIn: true };
    localStorage.setItem('ecobuild_user', JSON.stringify(userData));
    onLoginSuccess(userData);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-amber-500 text-slate-950 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
            <HardHat className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">ECOBUILD LOGIN</h1>
          <p className="text-slate-400 text-sm font-medium">
            Zero-typing marketplace for Contractors & Masons
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter Mobile Number
              </label>
              <div className="flex items-center bg-slate-950 border-2 border-slate-700 rounded-2xl overflow-hidden focus-within:border-amber-500 transition-colors">
                <span className="px-4 py-4 bg-slate-800 text-slate-300 font-bold border-r border-slate-700 text-lg">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-transparent px-4 py-4 text-xl font-bold text-white focus:outline-none placeholder-slate-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 touch-target"
            >
              <span>SEND OTP</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-center">
              <span className="text-amber-400 text-xs font-bold block">HACKATHON DEMO OTP</span>
              <span className="text-white text-lg font-mono font-bold tracking-widest">1234</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter 4-Digit OTP
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-4 text-center text-3xl font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 touch-target"
            >
              <ShieldCheck className="w-6 h-6" />
              <span>VERIFY & LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-slate-400 text-sm font-bold py-2 text-center underline"
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Verified Construction Portal</span>
        </div>
      </div>
    </div>
  );
}
