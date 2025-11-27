import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, Clock } from 'lucide-react';
import { Product } from '../types';
import { subscribeToProducts } from '../services/firebase';
import ProductCard from '../components/ProductCard';

interface SearchPageProps {
    onBack: () => void;
    onProductClick: (product: Product) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onBack, onProductClick }) => {
    const [query, setQuery] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const LOCAL_RECENT_KEY = 'carrot_recent_searches';

    useEffect(() => {
        // Load Data
        const unsubscribe = subscribeToProducts((data) => {
            setAllProducts(data);
        });
        
        // Load Recent Searches
        const saved = localStorage.getItem(LOCAL_RECENT_KEY);
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }

        // Auto focus
        setTimeout(() => inputRef.current?.focus(), 100);

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setFilteredProducts([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = allProducts.filter(p => 
            p.title.toLowerCase().includes(lowerQuery) || 
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.location.toLowerCase().includes(lowerQuery)
        );
        setFilteredProducts(results);
    }, [query, allProducts]);

    const saveRecentSearch = (text: string) => {
        if (!text.trim()) return;
        const newSet = new Set([text, ...recentSearches]);
        const newArr = Array.from(newSet).slice(0, 10); // Keep max 10
        setRecentSearches(newArr);
        localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(newArr));
    };

    const handleProductClick = (product: Product) => {
        saveRecentSearch(query);
        onProductClick(product);
    };

    const handleRecentClick = (text: string) => {
        setQuery(text);
    };

    const removeRecent = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        const newArr = recentSearches.filter(s => s !== text);
        setRecentSearches(newArr);
        localStorage.setItem(LOCAL_RECENT_KEY, JSON.stringify(newArr));
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem(LOCAL_RECENT_KEY);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="sticky top-0 bg-white p-3 flex items-center gap-2 border-b border-gray-100 z-10">
                <button onClick={onBack} className="p-1">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 bg-gray-100 rounded-lg flex items-center px-3 py-2">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveRecentSearch(query)}
                        placeholder="이웃과 직거래할 물품을 검색해보세요."
                        className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-gray-400"
                    />
                    {query && (
                        <button onClick={() => setQuery('')}>
                            <X size={16} className="text-gray-400 bg-gray-200 rounded-full p-0.5" />
                        </button>
                    )}
                </div>
            </header>

            <div className="min-h-[calc(100vh-60px)]">
                {!query ? (
                    // Recent Searches View
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm text-gray-900">최근 검색어</h3>
                            {recentSearches.length > 0 && (
                                <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-gray-600">
                                    지우기
                                </button>
                            )}
                        </div>
                        {recentSearches.length > 0 ? (
                             <div className="flex flex-wrap gap-2">
                                {recentSearches.map(text => (
                                    <div 
                                        key={text} 
                                        onClick={() => handleRecentClick(text)}
                                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-700 cursor-pointer active:bg-gray-50"
                                    >
                                        <span>{text}</span>
                                        <button onClick={(e) => removeRecent(e, text)} className="text-gray-400">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="py-10 text-center text-gray-400 text-sm">
                                최근 검색한 내역이 없습니다.
                            </div>
                        )}
                        
                        {/* Popular Keywords Mock */}
                        <div className="mt-8">
                             <h3 className="font-bold text-sm text-gray-900 mb-4">이웃들이 많이 찾고 있어요</h3>
                             <div className="space-y-4">
                                 {['자전거', '아이폰', '냉장고', '의자', '노트북'].map((kw, i) => (
                                     <div key={kw} onClick={() => setQuery(kw)} className="flex items-center justify-between cursor-pointer">
                                         <div className="flex items-center gap-3">
                                             <span className="font-bold text-gray-500 w-4">{i + 1}</span>
                                             <span className="text-gray-800">{kw}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                ) : (
                    // Search Results View
                    <div>
                         {filteredProducts.length > 0 ? (
                             filteredProducts.map(p => (
                                 <ProductCard key={p.id} product={p} onClick={handleProductClick} />
                             ))
                         ) : (
                             <div className="flex flex-col items-center justify-center py-20 text-center">
                                 <p className="text-gray-900 font-medium mb-1">검색 결과가 없어요.</p>
                                 <p className="text-gray-500 text-sm">오타가 있는지 확인해보세요.</p>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;