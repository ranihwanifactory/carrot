import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { subscribeToProducts, getMyLikedProductIds } from '../services/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface WatchlistProps {
    onBack: () => void;
    onProductClick: (p: Product) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ onBack, onProductClick }) => {
    const [products, setProducts] = useState<Product[]>([]);
    
    useEffect(() => {
        const likedIds = getMyLikedProductIds();
        const unsubscribe = subscribeToProducts((all) => {
            const liked = all.filter(p => likedIds.includes(p.id));
            setProducts(liked);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <header className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 sticky top-0">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">관심목록</h1>
            </header>

            <div className="divide-y divide-gray-100">
                {products.length > 0 ? products.map(p => (
                    <ProductCard key={p.id} product={p} onClick={onProductClick} />
                )) : (
                    <div className="py-20 text-center text-gray-400">
                        <p>관심 표시한 게시글이 없어요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;