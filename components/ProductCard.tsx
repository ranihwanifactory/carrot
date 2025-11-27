import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const timeAgo = (date: number) => {
    const seconds = Math.floor((new Date().getTime() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return "방금 전";
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex gap-4 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm uppercase tracking-wide">판매완료</span>
            </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 justify-between py-1">
        <div>
          <h3 className="text-gray-900 font-medium text-base line-clamp-2 leading-tight mb-1">
            {product.title}
          </h3>
          <div className="flex items-center text-gray-400 text-xs mb-1">
             <MapPin size={12} className="mr-1" />
             <span>{product.location}</span>
             <span className="mx-1">•</span>
             <span>{timeAgo(product.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
            <span className="text-gray-900 font-bold text-lg">
                {product.price.toLocaleString()}원
            </span>
            <div className="flex items-center text-gray-400 space-x-1">
                <Heart size={16} className={product.likes > 0 ? "fill-gray-400" : ""} />
                <span className="text-sm">{product.likes}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;