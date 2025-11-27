import React, { useEffect, useState } from 'react';
import { subscribeToProducts } from '../services/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, MapPin, Bell, ChevronDown } from 'lucide-react';

interface FeedProps {
  onProductClick: (product: Product) => void;
  locationName: string;
}

const Feed: React.FC<FeedProps> = ({ onProductClick, locationName }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
      const unsubscribe = subscribeToProducts((data) => {
          setProducts(data);
          setLoading(false);
      });
      return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchProducts();
    
    const handleLocalUpdate = () => {
        unsubscribe();
        fetchProducts();
    };
    
    window.addEventListener('product-local-update', handleLocalUpdate);

    return () => {
        unsubscribe();
        window.removeEventListener('product-local-update', handleLocalUpdate);
    };
  }, []);

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
            <h1 className="text-lg font-bold text-gray-900">{locationName}</h1>
            <ChevronDown size={18} className="text-gray-900" />
        </div>
        <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <Search size={24} />
            </button>
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors relative">
                <Bell size={24} />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
        </div>
      </header>

      {/* Categories / Filter Scroll */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {['전체', '디지털기기', '가구/인테리어', '유아동', '여성의류', '스포츠/레저', '취미/게임', '도서'].map((cat, idx) => (
              <button key={cat} className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors border ${idx === 0 ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600'}`}>
                  {cat}
              </button>
          ))}
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4 mt-1">
        {loading ? (
           <div className="space-y-4 pt-4">
              {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl animate-pulse">
                      <div className="w-28 h-28 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1 py-2 space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-5 bg-gray-200 rounded w-1/3 mt-auto"></div>
                      </div>
                  </div>
              ))}
           </div>
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} onClick={onProductClick} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium text-lg">등록된 매물이 없어요</h3>
            <p className="text-gray-500 text-sm mt-1">첫 번째 매물을 등록해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;