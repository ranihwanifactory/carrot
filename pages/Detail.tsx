import React from 'react';
import { ArrowLeft, Share2, Heart, MoreVertical, ShieldCheck, User } from 'lucide-react';
import { Product } from '../types';
import { toggleLike } from '../services/firebase';

interface DetailProps {
  product: Product;
  onBack: () => void;
}

const Detail: React.FC<DetailProps> = ({ product, onBack }) => {
  
  const handleLike = () => {
    toggleLike(product.id, product.likes);
  };

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700">
            <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3">
            <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700">
                <Share2 size={20} />
            </button>
            <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700">
                <MoreVertical size={20} />
            </button>
        </div>
      </div>

      {/* Image */}
      <div className="w-full h-96 bg-gray-100 relative">
        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-3xl"></div>
      </div>

      <div className="px-5">
        {/* User Info */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary">
                    <User size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{product.sellerName || "당근이웃"}</h3>
                    <p className="text-xs text-gray-500">{product.location}</p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                 <div className="flex items-center gap-1 text-primary bg-orange-50 px-2 py-1 rounded-md">
                    <span className="text-xs font-bold">37.5°C</span>
                    <ShieldCheck size={12} />
                 </div>
                 <span className="text-[10px] text-gray-400 mt-1">매너온도</span>
            </div>
        </div>

        {/* Product Content */}
        <div className="py-6 space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-xs text-gray-400">{product.category} • {new Date(product.createdAt).toLocaleDateString()}</p>
            </div>
            
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {product.description}
            </p>
            
            <div className="flex gap-2 text-xs text-gray-400 pt-4">
                <span>채팅 0</span>
                <span>•</span>
                <span>관심 {product.likes}</span>
                <span>•</span>
                <span>조회 102</span>
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <button onClick={handleLike} className="flex flex-col items-center gap-1 text-gray-500 min-w-[50px] transition-colors active:scale-95">
                <Heart size={24} className={product.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                <span className={`text-xs ${product.likes > 0 ? "text-red-500" : ""}`}>{product.likes}</span>
            </button>
            <div className="h-10 w-[1px] bg-gray-200"></div>
            <div className="flex-1">
                <span className="block text-lg font-bold text-gray-900">{product.price.toLocaleString()}원</span>
                <span className="text-xs text-primary font-medium">가격 제안 불가</span>
            </div>
            <button className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-orange-200 active:scale-95">
                채팅하기
            </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;