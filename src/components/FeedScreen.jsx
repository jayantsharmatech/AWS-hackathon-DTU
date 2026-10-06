import React, { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import { Filter, MapPin } from 'lucide-react';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function FeedScreen({ listings = [], onBookTruck, onDeleteListing }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceType, setSelectedPriceType] = useState('All');
  const [maxDistance, setMaxDistance] = useState(25); 
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });

  const categories = ['All', 'Red Brick', 'Concrete Rubble', 'Tiles & Ceramic', 'Steel Rebar'];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.warn("Location error for filtering:", err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const filteredListings = listings.filter((item) => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchPrice =
      selectedPriceType === 'All' ||
      (selectedPriceType === 'Free' && item.priceType === 'Free') ||
      (selectedPriceType === 'Paid' && item.priceType === 'Paid');

    let itemDistance = 0;
    if (userCoords.lat && userCoords.lon && item.lat && item.lon) {
      itemDistance = calculateDistance(userCoords.lat, userCoords.lon, Number(item.lat), Number(item.lon));
    }
    const matchDistance = itemDistance <= maxDistance;

    return matchCategory && matchPrice && matchDistance;
  });

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          <span className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> FILTER MARKETPLACE
          </span>
          <span className="text-emerald-400 font-mono">{filteredListings.length} FOUND</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 px-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all touch-target shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 px-1">
          {['All', 'Free', 'Paid'].map((priceType) => (
            <button
              key={priceType}
              onClick={() => setSelectedPriceType(priceType)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase border transition-colors ${
                selectedPriceType === priceType
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {priceType === 'All' ? 'ALL PRICES' : priceType}
            </button>
          ))}
        </div>

        <div className="space-y-1 pt-1 px-1">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-red-400" /> Max Distance Radius
            </span>
            <span className="text-amber-400 font-mono">{maxDistance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full accent-amber-500 bg-slate-950 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => {
            const distKm = userCoords.lat && listing.lat 
              ? calculateDistance(userCoords.lat, userCoords.lon, Number(listing.lat), Number(listing.lon)).toFixed(1) + ' km'
              : 'Live GPS';

            return (
              <ListingCard 
                key={listing.id || listing.PK} 
                listing={{ ...listing, distance: distKm }} 
                onBookTruck={onBookTruck}
                onDeleteListing={onDeleteListing} 
              />
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm font-bold">No waste listings found in this filter/radius.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceType('All');
                setMaxDistance(50);
              }}
              className="text-amber-400 text-xs font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}