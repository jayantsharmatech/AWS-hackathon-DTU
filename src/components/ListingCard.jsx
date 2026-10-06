import React, { useState, useRef } from 'react';
import { MapPin, Phone, MessageSquare, Truck, ShieldCheck, Trash2, Volume2, Play, Pause } from 'lucide-react';

export default function ListingCard({ listing, onBookTruck, onDeleteListing }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const contactPhone = listing.phone && listing.phone.trim() !== '' ? listing.phone : '9876543210';
  const displayPrice = listing.price && listing.price !== 'undefined' && listing.price !== 'null' ? listing.price : '500';
  const displayLocation = listing.location && listing.location.trim() !== '' ? listing.location : 'Connaught Place, Site 4';
  const displayImage = listing.imageUrl && listing.imageUrl.trim() !== '' ? listing.imageUrl : 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80';

  const googleMapsUrl = listing.lat && listing.lat !== 'None' 
    ? `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`;

  const toggleAudioPlay = () => {
    if (!audioRef.current && listing.audioUrl) {
      audioRef.current = new Audio(listing.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all max-w-md mx-auto my-3 relative">
      
      {/* DELETE BUTTON */}
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to delete this listing?")) {
            const uniqueId = listing.id || listing.PK?.replace('LISTING#', '');
            onDeleteListing(uniqueId);
          }
        }}
        className="absolute top-3 right-3 z-20 bg-slate-950/85 hover:bg-red-600 text-slate-300 hover:text-white p-2.5 rounded-full backdrop-blur-md transition-colors border border-slate-700 shadow-lg"
        title="Delete listing"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="relative h-56 bg-slate-950 overflow-hidden">
        <img
          src={displayImage}
          alt={listing.category || 'C&D Waste'}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-3 left-3 right-16 flex items-center gap-2 pointer-events-none">
          <span className="bg-slate-950/90 backdrop-blur-md text-amber-400 text-xs font-black px-3 py-1.5 rounded-full border border-amber-500/40 uppercase tracking-wider shadow-md pointer-events-auto truncate">
            {listing.category || 'Mixed Aggregate'}
          </span>

          <span
            className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto shrink-0 ${
              listing.priceType === 'Free'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {listing.priceType === 'Free' ? 'FREE' : `₹${displayPrice}`}
          </span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 right-3 bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center justify-between font-bold border border-slate-700 transition-colors shadow-lg group"
        >
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate">{displayLocation}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono uppercase shrink-0 underline ml-2">Precise Map ↗</span>
        </a>
      </div>

      <div className="p-4 space-y-4">
        {/* VOICE NOTE AUDIO PLAYER WIDGET */}
        {(listing.hasVoiceNote || listing.audioUrl) && (
          <div 
            onClick={toggleAudioPlay}
            className="bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-md">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </div>
              <div>
                <span className="text-xs font-black text-amber-400 tracking-wider block">LOCAL VOICE NOTE</span>
                <span className="text-[11px] text-slate-400">Tap to {isPlaying ? 'pause' : 'listen'} seller's audio</span>
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
        )}

        <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 overflow-hidden">
          <p className="text-slate-200 text-sm md:text-base font-medium leading-relaxed break-words">
            "{listing.description || 'Verified construction waste ready for site clearance.'}"
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <span className="font-bold text-slate-300 flex items-center gap-1 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{listing.sellerName || 'Site Contractor'} ({contactPhone})</span>
          </span>
          <span className="font-mono shrink-0 ml-2">{listing.timeAgo || 'Just now'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${contactPhone}`}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Phone className="w-5 h-5 text-emerald-400" />
            <span>CALL</span>
          </a>

          <a
            href={`https://wa.me/91${contactPhone}?text=Hi,%20I%20am%20interested%20in%20your%20EcoBuild%20listing:%20${encodeURIComponent(listing.category || 'Waste')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-emerald-600/20"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WHATSAPP</span>
          </a>
        </div>

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