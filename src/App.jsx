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
    try {
      const storedUser = localStorage.getItem('ecobuild_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to read user session:', e);
    }

    // Fetch live listings from API Gateway GET /listings
    fetch(`${API_BASE_URL}/listings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data);
        } else if (data && data.body) {
          try {
            setListings(JSON.parse(data.body));
          } catch (err) {
            setListings([]);
          }
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

  const handlePostCreated = async (newListing) => {
    try {
      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing),
      });
      
      const data = await response.json();
      
      if (response.ok && data && data.listing) {
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

  const handleDeleteListing = async (listingIdentifier) => {
    setListings(listings.filter((item) => {
      const itemId = String(item.id || '');
      const itemPK = String(item.PK || '').replace('LISTING#', '');
      const target = String(listingIdentifier);
      return itemId !== target && itemPK !== target;
    }));

    try {
      await fetch(`${API_BASE_URL}/listings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: listingIdentifier }),
      });
    } catch (err) {
      console.error('Failed to delete listing from backend:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      <div className="flex-1 flex flex-col w-full">
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
            <LoginScreen onLoginSuccess={setUser} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col w-full">
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
              isOnline={isOnline}
            />

            <main className="max-w-3xl mx-auto py-4 flex-1 w-full px-4">
              {activeTab === 'feed' ? (
                isLoadingBackend ? (
                  <div className="text-center py-20 text-slate-400 text-xs font-bold animate-pulse">
                    Syncing live AWS cloud database...
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
          </div>
        )}
      </div>

      {/* Global Copyright Footer */}
      <footer className="py-5 text-center text-xs text-slate-400 font-medium border-t border-slate-200 bg-white w-full">
        © {new Date().getFullYear()} EcoBuild Marketplace. Developed by <strong className="text-slate-700">Kernel_Devs</strong>. All rights reserved.
      </footer>

      {/* Dumper Pickup Truck Booking Modal */}
      {selectedTruckModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedTruckModal(null);
                setBookingSuccess(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!bookingSuccess ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 text-amber-400 rounded-2xl font-black shadow-sm">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Book Dumper Truck</h3>
                    <p className="text-xs text-slate-500">Direct logistics dispatch to site</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="text-amber-600 font-bold uppercase">{selectedTruckModal.category}</div>
                  <div className="text-slate-800 font-medium">{selectedTruckModal.location}</div>
                  <div className="text-slate-400 font-mono text-[11px]">Estimated Transport Cost: ₹1,200 / trip</div>
                </div>

                <button
                  onClick={() => setBookingSuccess(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-sm shadow-md transition-all active:scale-95"
                >
                  Confirm Truck Dispatch
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Truck Booked Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Driver assigned. You will receive a verification call shortly to confirm site access.
                </p>
                <button
                  onClick={() => {
                    setSelectedTruckModal(null);
                    setBookingSuccess(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold px-6 py-2.5 rounded-xl border border-slate-200 transition-colors"
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