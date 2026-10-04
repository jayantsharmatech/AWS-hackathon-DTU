import React, { useState } from 'react';
import ListingCard from './ListingCard';
import { Filter, Truck, X, PhoneCall } from 'lucide-react';

export default function FeedScreen({ listings, onBookTruck }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceType, setSelectedPriceType] = useState('All');

  const categories = ['All', 'Red Brick', 'Concrete Rubble', 'Tiles & Ceramic', 'Steel Rebar'];

  const filteredListings = listings.filter((item) => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchPrice =
      selectedPriceType === 'All' ||
      (selectedPriceType === 'Free' && item.priceType === 'Free') ||
      (selectedPriceType === 'Paid' && item.priceType === 'Paid');
    return matchCategory && matchPrice;
  });

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-24">
      {/* Category Horizontal Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> FILTER BY MATERIAL
          </span>
          <span>{filteredListings.length} LISTINGS</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all touch-target ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Price Type Filters */}
        <div className="flex gap-2">
          {['All', 'Free', 'Paid'].map((priceType) => (
            <button
              key={priceType}
              onClick={() => setSelectedPriceType(priceType)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase border transition-colors ${
                selectedPriceType === priceType
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {priceType === 'All' ? 'ALL PRICES' : priceType}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Listings Stack */}
      <div className="space-y-4 pt-2">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onBookTruck={onBookTruck} />
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm font-bold">No waste listings found in this filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceType('All');
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
