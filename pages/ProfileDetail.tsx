import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { subscribeToProducts } from '../services/firebase';
import ProductCard from '../components/ProductCard';

interface ProfileDetailProps {
    user: FirebaseUser;
    onBack: () => void;
    onProductClick: (p: Product) => void;
    locationName: string;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ user, onBack, onProductClick, locationName }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToProducts((all) => {
            const myProducts = all.filter(p => p.sellerId === user.uid && !p.isSold);
            setProducts(myProducts);
        });
        return unsubscribe;
    }, [user.uid]);

    return (
        <div className="bg-white min-h-screen">
            <header className="sticky top-0 bg-white p-4 flex items-center border-b border-gray-100 z-10">
                <button onClick={onBack} className="mr-3">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">프로필</h1>
            </header>

            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-xl">{user.displayName || "당근이웃"}</h2>
                        <p className="text-sm text-gray-500">#{user.uid.slice(0, 6)}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-bold text-gray-700">매너온도</span>
                         <div className="flex items-center gap-1 text-primary">
                            <span className="font-bold text-base">36.5°C</span>
                            <ShieldCheck size={16} />
                         </div>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[36.5%]"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">첫 온도 36.5°C</p>
                </div>
            </div>

            <div className="p-4 pb-2">
                <h3 className="font-bold text-base">판매 상품 <span className="text-primary">{products.length}</span></h3>
            </div>
            
            <div className="divide-y divide-gray-100 min-h-[300px]">
                {products.length > 0 ? products.map(p => (
                    <ProductCard key={p.id} product={p} onClick={onProductClick} />
                )) : (
                    <div className="py-20 text-center text-gray-400 text-sm">
                        판매중인 상품이 없어요.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileDetail;