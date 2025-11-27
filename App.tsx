import React, { useState, useEffect } from 'react';
import Feed from './pages/Feed';
import Post from './pages/Post';
import Detail from './pages/Detail';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import { Product, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>(ViewState.FEED);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Render content based on state
  const renderContent = () => {
    switch (currentView) {
      case ViewState.FEED:
        return <Feed onProductClick={handleProductClick} />;
      case ViewState.POST:
        return <Post onBack={() => setView(ViewState.FEED)} onPostComplete={handlePostComplete} />;
      case ViewState.DETAIL:
        if (selectedProduct) return <Detail product={selectedProduct} onBack={handleBackToFeed} />;
        return <Feed onProductClick={handleProductClick} />;
      case ViewState.PROFILE:
        return <Profile />;
      default:
        return <Feed onProductClick={handleProductClick} />;
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