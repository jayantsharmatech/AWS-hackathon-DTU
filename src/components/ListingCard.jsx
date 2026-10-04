import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Volume2, Truck, ShieldCheck } from 'lucide-react';

export default function ListingCard({ listing, onBookTruck }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoiceNote = () => {
    if (listing.audioUrl) {
      const audio = new Audio(listing.audioUrl);
      setIsPlayingAudio(true);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    } else {
      // Fallback browser speech synthesizer for demo voice simulation
      const textToSpeak = listing.transcript || listing.description;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'hi-IN';
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all">
      {/* Image Container with Badges */}
      <div className="relative h-52 bg-slate-950 overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.category}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-slate-950/90 backdrop-blur-md text-amber-400 text-xs font-black px-3 py-1.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
            {listing.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
              listing.priceType === 'Free'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'bg-amber-500 text-slate-950 shadow-lg'
            }`}
          >
            {listing.priceType === 'Free' ? 'FREE PICKUP' : `₹${listing.price}`}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>{listing.location} ({listing.distance || '1.2 km'})</span>
        </div>
      </div>

      {/* Listing Content */}
      <div className="p-4 space-y-4">
        {/* Audio Note Button (if available) */}
        {(listing.audioUrl || listing.hasVoiceNote) && (
          <button
            onClick={handlePlayVoiceNote}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between border font-bold text-sm transition-all ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-750'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <span>{isPlayingAudio ? 'PLAYING VOICE NOTE...' : 'LISTEN SELLER VOICE NOTE'}</span>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-950/40 px-2 py-0.5 rounded">
              0:12
            </span>
          </button>
        )}

        {/* Text Description */}
        <p className="text-slate-200 text-base font-medium leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          "{listing.description || listing.transcript}"
        </p>

        {/* Contractor Info Tag */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {listing.sellerName || 'Site Contractor'}
          </span>
          <span className="font-mono">{listing.timeAgo || 'Just now'}</span>
        </div>

        {/* Action Buttons Stack */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${listing.phone || '9876543210'}`}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 touch-target active:scale-95 transition-transform"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            <span>CALL</span>
          </a>

          <a
            href={`https://wa.me/91${listing.phone || '9876543210'}?text=Hi,%20I%20am%20interested%20in%20your%20EcoBuild%20listing:%20${encodeURIComponent(listing.category)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 touch-target active:scale-95 transition-transform shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WHATSAPP</span>
          </a>
        </div>

        {/* Book Pickup Truck Call To Action */}
        <button
          onClick={() => onBookTruck(listing)}
          className="w-full bg-slate-950 hover:bg-slate-800 border-2 border-amber-500/50 text-amber-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs tracking-wider uppercase transition-colors"
        >
          <Truck className="w-4 h-4 text-amber-500" />
          <span>BOOK DUMPER / PICKUP TRUCK</span>
        </button>
      </div>
    </div>
  );
}
