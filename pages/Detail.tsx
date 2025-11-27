import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, MoreVertical, ShieldCheck, User as UserIcon, Edit, Trash, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { toggleLike, deleteProduct, getMyLikedProductIds } from '../services/firebase';
import { User } from 'firebase/auth';

interface DetailProps {
  product: Product;
  currentUser: User;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onChat: (product: Product) => void;
}

const Detail: React.FC<DetailProps> = ({ product, currentUser, onBack, onEdit, onChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = currentUser.uid === product.sellerId;
  const isLiked = getMyLikedProductIds().includes(product.id);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(product.likes);

  const handleLike = () => {
    toggleLike(product.id, product.likes);
    setLocalLiked(!localLiked);
    setLocalLikeCount(prev => localLiked ? prev - 1 : prev + 1);
  };

  const handleDelete = async () => {
      if(window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
          await deleteProduct(product.id);
          onBack();
      }
  }

  return (
    <div className="bg-white min-h-screen pb-24 relative">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center p-4">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700">
            <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3 relative">
            <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700">
                <Share2 size={20} />
            </button>
            {isOwner && (
                <>
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-700"
                >
                    <MoreVertical size={20} />
                </button>
                {showMenu && (
                    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-32 z-50">
                        <button 
                            onClick={() => onEdit(product)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                            <Edit size={14} /> 수정
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-500 flex items-center gap-2"
                        >
                            <Trash size={14} /> 삭제
                        </button>
                    </div>
                )}
                </>
            )}
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
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                    <UserIcon size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{product.sellerName}</h3>
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
                <span>채팅 2</span>
                <span>•</span>
                <span>관심 {localLikeCount}</span>
                <span>•</span>
                <span>조회 102</span>
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <button onClick={handleLike} className="flex flex-col items-center gap-1 text-gray-500 min-w-[50px] transition-colors active:scale-95">
                <Heart size={24} className={localLiked ? "fill-red-500 text-red-500" : ""} />
                <span className={`text-xs ${localLiked ? "text-red-500" : ""}`}>{localLikeCount}</span>
            </button>
            <div className="h-10 w-[1px] bg-gray-200"></div>
            <div className="flex-1">
                <span className="block text-lg font-bold text-gray-900">{product.price.toLocaleString()}원</span>
                {!isOwner && <span className="text-xs text-primary font-medium">가격 제안 불가</span>}
            </div>
            
            {isOwner ? (
                <button 
                    onClick={() => onChat(product)}
                    className="bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-xl transition-colors"
                >
                    대화 중인 채팅방
                </button>
            ) : (
                <button 
                    onClick={() => onChat(product)}
                    className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-orange-200 active:scale-95 flex items-center gap-2"
                >
                    <MessageCircle size={18} />
                    채팅하기
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Detail;