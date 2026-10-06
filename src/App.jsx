import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import FeedScreen from './components/FeedScreen';
import PostListingScreen from './components/PostListingScreen';
import { Truck, CheckCircle2, X } from 'lucide-react';

// Deployed AWS API Gateway Endpoint URL
const API_BASE_URL = 'https://6jzwkohkx5.execute-api.ap-south-1.amazonaws.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'post'
  const [listings, setListings] = useState([]); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedTruckModal, setSelectedTruckModal] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);

  // Check login session & fetch live listings from AWS backend on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ecobuild_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch live listings from API Gateway GET /listings
    fetch(`${API_BASE_URL}/listings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data);
        }
        setIsLoadingBackend(false);
      })
      .catch((err) => {
        console.error('Failed to fetch live AWS listings:', err);
        setIsLoadingBackend(false);
      });

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

  // Properly await AWS POST sync and use backend response item before updating feed state
  const handlePostCreated = async (newListing) => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing),
      });
      
      const data = await response.json();
      
      if (response.ok && data.listing) {
        // Use the exact item returned from AWS (ensures PK and all fields match backend)
        setListings((prevListings) => [data.listing, ...prevListings]);
      } else {
        setListings((prevListings) => [newListing, ...prevListings]);
      }
    } catch (err) {
      console.error('Failed to sync new listing with AWS backend:', err);
      setListings((prevListings) => [newListing, ...prevListings]);
    } finally {
      setActiveTab('feed');
    }
  };

  // ENHANCED DELETE HANDLER: Optimistically update UI and call AWS DELETE
  const handleDeleteListing = async (listingIdentifier) => {
    setListings(listings.filter((item) => {
      const itemId = String(item.id || '');
      const itemPK = String(item.PK || '').replace('LISTING#', '');
      const target = String(listingIdentifier);
      return itemId !== target && itemPK !== target;
    }));

    try {
      await fetch(`${API_BASE_URL}/listings?id=${listingIdentifier}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete listing from backend:', err);
    }
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
          isLoadingBackend ? (
            <div className="text-center py-20 text-slate-400 text-sm animate-pulse">
              Syncing live AWS database...
            </div>
          ) : (
            <FeedScreen 
              listings={listings} 
              onBookTruck={(item) => setSelectedTruckModal(item)} 
              onDeleteListing={handleDeleteListing}
            />
          )
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