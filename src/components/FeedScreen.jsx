import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Layers, MapPin, Phone, MessageSquare, Truck, X, CheckCircle2, Navigation, Volume2 } from 'lucide-react';
import ListingCard from './ListingCard';

const API_BASE_URL = 'https://6jzwkohkx5.execute-api.ap-south-1.amazonaws.com';

// Haversine formula to calculate distance in kilometers between two GPS coordinates
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export default function FeedScreen() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState('All'); // Radius filter state
  const [selectedListing, setSelectedListing] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null });
  const [speakingId, setSpeakingId] = useState(null);

  // Text-to-Speech function for accessibility & regional users
  const handleSpeak = (item, e) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const itemId = item.PK || item.id;
    if (speakingId === itemId) {
      setSpeakingId(null);
      return;
    }

    const priceText = (item.priceType === 'Free' || item.price === '0') ? 'Free pickup' : `Price: ${item.price} rupees`;
    const textToSpeak = `Listing category: ${item.category}. ${priceText}. Description: ${item.description || item.title}. Located at: ${item.location}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-IN'; // Indian English context
    utterance.rate = 0.9; // Slightly slower for clarity

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(itemId);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch listings & user GPS position on mount
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/listings`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListings(data);
      } else if (data.body) {
        setListings(JSON.parse(data.body));
      }
    } catch (err) {
      console.error('Failed to fetch listings from AWS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('GPS location access denied or unavailable:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      await fetch(`${API_BASE_URL}/listings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setListings((prev) => prev.filter((item) => (item.PK || item.id) !== id));
      setSelectedListing(null);
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const categories = ['All', 'Red Brick', 'Concrete Rubble', 'Tiles & Ceramic', 'Mixed Aggregate', 'Steel Rebar'];
  const radiusOptions = ['All', '5 km', '10 km', '25 km', '50 km'];

  // Filter listings by category, search query, and hyperlocal radius
  const filteredListings = listings.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());

    // Radius distance filtering logic
    let matchesRadius = true;
    if (selectedRadius !== 'All' && userLocation.lat && userLocation.lon && item.lat && item.lon) {
      const maxKm = parseInt(selectedRadius);
      const distance = calculateDistanceKm(
        userLocation.lat,
        userLocation.lon,
        parseFloat(item.lat),
        parseFloat(item.lon)
      );
      matchesRadius = distance <= maxKm;
    }

    return matchesCategory && matchesSearch && matchesRadius;
  });

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5 pb-24">
      
      {/* Clean Search, Category & Radius Filter Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local waste materials, location..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium pl-10 pr-4 py-2.5 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-slate-400 transition-colors"
            />
          </div>
          <button
            onClick={fetchListings}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Radius Distance Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 shrink-0">
            <Navigation className="w-3.5 h-3.5 text-amber-600" /> Radius:
          </div>
          {radiusOptions.map((rad) => (
            <button
              key={rad}
              onClick={() => setSelectedRadius(rad)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedRadius === rad
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {rad}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing <strong className="text-slate-900">{filteredListings.length}</strong> hyperlocal listings</span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">Live GPS Active</span>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl h-80 animate-pulse p-4 space-y-4">
              <div className="bg-slate-100 h-44 rounded-xl" />
              <div className="bg-slate-100 h-4 rounded w-3/4" />
              <div className="bg-slate-100 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No listings found in this radius</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Try expanding your distance radius or search query to find nearby C&D waste.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredListings.map((listing) => {
            const currentId = listing.PK || listing.id;
            const isSpeaking = speakingId === currentId;
            return (
              <div key={currentId} className="relative group">
                <ListingCard 
                  listing={listing} 
                  onDelete={handleDelete} 
                  onSelect={setSelectedListing} 
                />
                {/* Floating Audio Read Aloud Button */}
                <button
                  onClick={(e) => handleSpeak(listing, e)}
                  title="Listen to details"
                  className={`absolute top-3 right-3 z-10 p-2 rounded-xl border shadow-sm transition-all flex items-center justify-center ${
                    isSpeaking 
                      ? 'bg-amber-500 border-amber-600 text-white animate-pulse' 
                      : 'bg-white/90 backdrop-blur-xs border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* DETAILED AMAZON-STYLE LISTING MODAL VIEW   */}
      {/* ========================================== */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase">
                  {selectedListing.category}
                </span>
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase ${
                  (selectedListing.priceType === 'Free' || selectedListing.price === '0') ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                  {(selectedListing.priceType === 'Free' || selectedListing.price === '0') ? 'Free Pickup' : `₹ ${selectedListing.price}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleSpeak(selectedListing, e)}
                  title="Listen to details"
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                    speakingId === (selectedListing.PK || selectedListing.id)
                      ? 'bg-amber-500 border-amber-600 text-white animate-pulse'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedListing(null)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* High-Res Image */}
              <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={selectedListing.imageUrl} 
                  alt={selectedListing.category} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg font-bold">
                  Posted {selectedListing.timeAgo || 'Recently'}
                </div>
              </div>

              {/* Seller Verification Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedListing.sellerName || 'Verified Contributor'}</h4>
                    <p className="text-xs text-slate-500">Verified Neighborhood User</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  ID: {(selectedListing.PK || selectedListing.id)?.slice(-6)}
                </span>
              </div>

              {/* Description Section */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Listing Details & Description</h5>
                <p className="text-sm font-medium text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                  "{selectedListing.description}"
                </p>
              </div>

              {/* Exact Location & GPS */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider">Pickup Location & Coordinates</h5>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedListing.location}</p>
                    <p className="text-[11px] font-mono text-slate-500">
                      Lat: {selectedListing.lat || '28.6139'}, Lon: {selectedListing.lon || '77.2090'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-3">
              <a
                href={`tel:${selectedListing.phone}`}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-200 shadow-2xs transition-colors"
              >
                <Phone className="w-4 h-4 text-slate-700" />
                <span>Call Seller</span>
              </a>

              <a
                href={`https://wa.me/91${selectedListing.phone}?text=Hi,%20I%20am%20interested%20in%20your%20C%26D%20waste%20listing%20(${selectedListing.category})%20on%20EcoBuild.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => alert('Logistics partner assigned! A pickup dumper has been notified for your location.')}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Book Dumper</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}