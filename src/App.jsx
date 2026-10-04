import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import FeedScreen from './components/FeedScreen';
import PostListingScreen from './components/PostListingScreen';
import { Truck, CheckCircle2, X } from 'lucide-react';

// Mock Initial Feed Data for C&D Waste Market
const MOCK_INITIAL_LISTINGS = [
  {
    id: 1,
    category: 'Red Brick',
    priceType: 'Free',
    price: '0',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    location: 'Connaught Place, Site 4',
    distance: '0.8 km',
    description: 'Clean red brick bat debris, ~2 brass quantity. Free to haul away immediately.',
    hasVoiceNote: true,
    phone: '9811223344',
    sellerName: 'Sharma Contractors',
    timeAgo: '10 mins ago'
  },
  {
    id: 2,
    category: 'Concrete Rubble',
    priceType: 'Paid',
    price: '800',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80',
    location: 'Sector 62, Metro Pillar 12',
    distance: '2.4 km',
    description: 'Crushed concrete slab rubble ideal for road filling & foundations. Total 1 Dumper load.',
    hasVoiceNote: false,
    phone: '9876543210',
    sellerName: 'Verma Masons',
    timeAgo: '1 hour ago'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'post'
  const [listings, setListings] = useState(MOCK_INITIAL_LISTINGS);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedTruckModal, setSelectedTruckModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Check login session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('ecobuild_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ecobuild_user');
    setUser(null);
  };

  const handlePostCreated = (newListing) => {
    setListings([newListing, ...listings]);
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      <main className="max-w-md mx-auto">
        {!user ? (
          <LoginScreen onLoginSuccess={setUser} />
        ) : activeTab === 'feed' ? (
          <FeedScreen listings={listings} onBookTruck={(item) => setSelectedTruckModal(item)} />
        ) : (
          <PostListingScreen onPostCreated={handlePostCreated} />
        )}
      </main>

      {/* Dumper Pickup Truck Booking Modal */}
      {selectedTruckModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedTruckModal(null);
                setBookingSuccess(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {!bookingSuccess ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">BOOK DUMPER TRUCK</h3>
                    <p className="text-xs text-slate-400">Direct logistics dispatch to site</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="text-amber-400 font-bold uppercase">{selectedTruckModal.category}</div>
                  <div className="text-slate-300">{selectedTruckModal.location}</div>
                  <div className="text-slate-500">Estimated Transport Cost: ₹1,200 / trip</div>
                </div>

                <button
                  onClick={() => setBookingSuccess(true)}
                  className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-2xl text-lg shadow-lg touch-target"
                >
                  CONFIRM TRUCK DISPATCH
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-white">TRUCK BOOKED!</h3>
                <p className="text-xs text-slate-400">
                  Driver assigned. You will receive a call shortly to confirm site access.
                </p>
                <button
                  onClick={() => {
                    setSelectedTruckModal(null);
                    setBookingSuccess(false);
                  }}
                  className="bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl border border-slate-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
