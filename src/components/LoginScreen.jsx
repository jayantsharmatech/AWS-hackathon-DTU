import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Strip out non-numeric characters immediately as user types
    const numericVal = val.replace(/\D/g, '');
    setPhone(numericVal);
    if (errorMsg) setErrorMsg('');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    
    // Strict validation: Must be exactly 10 digits and contain NO characters/symbols
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg('Enter proper phone number');
      return;
    }

    setErrorMsg('');
    setStep('otp');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpRegex = /^\d{4}$/;
    if (!otpRegex.test(otp)) {
      setErrorMsg('Enter proper 4-digit OTP');
      return;
    }
    onLoginSuccess(phone);
  };

  return (
    <div className="bg-white w-full max-w-md rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 my-auto">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Building2 className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Welcome to EcoBuild</h2>
        <p className="text-xs text-slate-500">Secure neighborhood C&D waste & debris exchange</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5">
              Mobile Number
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 transition-colors">
              <span className="px-3 text-xs font-bold text-slate-500 border-r border-slate-200 bg-slate-100 py-3">+91</span>
              <input
                type="text"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit mobile"
                className="w-full bg-transparent px-3 py-3 text-sm font-bold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Get Verification OTP</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 font-medium text-center">
            OTP sent via SMS to <strong className="font-bold">+91 {phone}</strong>. (Use any 4 digits for demo).
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Enter 4-Digit OTP
            </label>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="1 2 3 4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Verify & Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setErrorMsg('');
            }}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 pt-2"
          >
            ← Change Mobile Number
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Encrypted & Secure Authentication
      </div>

    </div>
  );
}