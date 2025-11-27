import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
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
      className="bg-white py-4 border-b border-gray-100 flex gap-4 active:bg-gray-50 transition-colors cursor-pointer last:border-0"
    >
      <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm">판매완료</span>
            </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 justify-between py-0.5">
        <div>
          <h3 className="text-gray-900 font-normal text-[15px] line-clamp-2 leading-tight mb-1">
            {product.title}
          </h3>
          <div className="flex items-center text-gray-400 text-[13px] gap-1">
             <span>{product.location}</span>
             <span>•</span>
             <span>{timeAgo(product.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
            <span className="text-gray-900 font-bold text-[16px]">
                {product.price === 0 ? "나눔🧡" : `${product.price.toLocaleString()}원`}
            </span>
            <div className="flex items-center text-gray-400 space-x-2 text-sm justify-end">
                {product.likes > 0 && (
                    <div className="flex items-center gap-0.5">
                        <Heart size={14} className="" />
                        <span>{product.likes}</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;