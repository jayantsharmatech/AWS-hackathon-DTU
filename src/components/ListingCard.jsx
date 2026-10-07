import React from 'react';
import { MapPin, Phone, Truck, Trash2, CheckCircle2 } from 'lucide-react';

export default function ListingCard({ listing, onDelete, onSelect }) {
  const isFree = listing.priceType === 'Free' || listing.price === '0';

  return (
    <div 
      onClick={() => onSelect && onSelect(listing)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
    >
      
      {/* Image Preview & Badges Header */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={listing.imageUrl || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600'}
          alt={listing.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top Header Row (Badges on Left, Delete on Right with proper spacing to prevent overlap) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          
          {/* Left Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            <span className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs">
              {listing.category}
            </span>
            <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-xs ${
              isFree ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950 font-black'
            }`}>
              {isFree ? 'Free' : `₹ ${listing.price}`}
            </span>
          </div>

          {/* Delete button (Right) */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(listing.PK || listing.id);
              }}
              className="bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 p-2 rounded-lg transition-colors shadow-xs border border-slate-200 pointer-events-auto shrink-0"
              title="Delete Listing"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Time Ago Tag */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
          {listing.timeAgo || 'Just now'}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          
          {/* Seller Info */}
          <div className="flex items-start justify-between gap-2 text-xs border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{listing.sellerName || 'Verified Contributor'}</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
              ID: {(listing.PK || listing.id)?.slice(-4)}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs font-medium text-slate-900 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{listing.description}"
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{listing.location || 'Location verified'}</span>
          </div>
        </div>

        {/* Action Buttons (Call, WhatsApp, Dumper) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
          <a
            href={`tel:${listing.phone}`}
            title="Call Seller"
            className="col-span-1 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors border border-slate-200 shadow-xs"
          >
            <Phone className="w-4 h-4 text-slate-700" />
          </a>

          <a
            href={`https://wa.me/91${listing.phone}?text=Hi,%20I%20am%20interested%20in%20your%20C%26D%20waste%20listing%20(${listing.category})%20on%20EcoBuild.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>

          <button
            onClick={() => alert('Logistics partner assigned! A pickup dumper has been notified for your location.')}
            title="Book Pickup Dumper"
            className="col-span-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2.5 rounded-xl flex items-center justify-center transition-colors shadow-xs"
          >
            <Truck className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>
    </div>
  );
}