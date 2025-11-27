import React, { useState, useEffect } from 'react';
import Feed from './pages/Feed';
import Post from './pages/Post';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import { Product, ViewState } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getCurrentLocation, getAddressName } from './services/locationService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setView] = useState<ViewState>(ViewState.FEED);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [locationName, setLocationName] = useState<string>("위치 찾는 중...");

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Location Fetcher
  useEffect(() => {
    if (user) {
      const fetchLocation = async () => {
        try {
          const { lat, lng } = await getCurrentLocation();
          const address = await getAddressName(lat, lng);
          setLocationName(address);
        } catch (error) {
          console.error("Location error:", error);
          setLocationName("알 수 없는 지역");
        }
      };
      fetchLocation();
    }
  }, [user]);

  // Simple Router Logic
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView(ViewState.DETAIL);
  };

  const handleBackToFeed = () => {
    setSelectedProduct(null);
    setView(ViewState.FEED);
  };

  const handlePostComplete = () => {
    setView(ViewState.FEED);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-bounce">
             <span className="text-3xl">🥕</span>
          </div>
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Render content based on state
  const renderContent = () => {
    switch (currentView) {
      case ViewState.FEED:
        return <Feed onProductClick={handleProductClick} locationName={locationName} />;
      case ViewState.POST:
        return <Post onBack={() => setView(ViewState.FEED)} onPostComplete={handlePostComplete} locationName={locationName} user={user} />;
      case ViewState.DETAIL:
        if (selectedProduct) return <Detail product={selectedProduct} onBack={handleBackToFeed} />;
        return <Feed onProductClick={handleProductClick} locationName={locationName} />;
      case ViewState.PROFILE:
        return <Profile user={user} locationName={locationName} />;
      default:
        return <Feed onProductClick={handleProductClick} locationName={locationName} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans mx-auto max-w-md shadow-2xl overflow-hidden relative">
      <div className="bg-white min-h-screen h-full relative">
        {renderContent()}
      </div>
      
      {/* Show Bottom Nav unless in Detail or Post view to maximize screen space */}
      {currentView !== ViewState.DETAIL && currentView !== ViewState.POST && (
        <NavBar currentView={currentView} setView={setView} />
      )}
    </div>
  );
};

export default App;