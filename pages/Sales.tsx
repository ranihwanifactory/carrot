import React, { useEffect, useState } from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { subscribeToProducts, updateProduct } from '../services/firebase';
import { Product } from '../types';
import { User } from 'firebase/auth';
import ProductCard from '../components/ProductCard';

interface SalesProps {
    user: User;
    onBack: () => void;
    onProductClick: (p: Product) => void;
}

const Sales: React.FC<SalesProps> = ({ user, onBack, onProductClick }) => {
    const [activeTab, setActiveTab] = useState<'selling' | 'sold'>('selling');
    const [products, setProducts] = useState<Product[]>([]);
    
    useEffect(() => {
        const unsubscribe = subscribeToProducts((all) => {
            // Filter my products
            const myProducts = all.filter(p => p.sellerId === user.uid);
            setProducts(myProducts);
        });
        return unsubscribe;
    }, [user.uid]);

    const displayProducts = products.filter(p => activeTab === 'selling' ? !p.isSold : p.isSold);

    const handleMarkAsSold = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        if (window.confirm("판매완료 처리하시겠습니까?")) {
            await updateProduct({ ...product, isSold: true });
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <header className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 sticky top-0">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">판매내역</h1>
            </header>
            
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('selling')}
                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${activeTab === 'selling' ? 'border-primary text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                    판매중
                </button>
                <button 
                    onClick={() => setActiveTab('sold')}
                    className={`flex-1 py-3 text-sm font-bold text-center border-b-2 ${activeTab === 'sold' ? 'border-primary text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                    거래완료
                </button>
            </div>

            <div className="divide-y divide-gray-100">
                {displayProducts.length > 0 ? displayProducts.map(p => (
                    <div key={p.id} className="relative">
                        <ProductCard product={p} onClick={onProductClick} />
                        {!p.isSold && (
                            <div className="absolute bottom-4 right-4">
                                <button 
                                    onClick={(e) => handleMarkAsSold(e, p)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    거래완료로 변경
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-400">
                        <p>{activeTab === 'selling' ? '판매중인 게시글이 없어요.' : '거래완료된 게시글이 없어요.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sales;