import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Wand2, Loader2, DollarSign } from 'lucide-react';
import { createProduct, updateProduct } from '../services/firebase';
import { enhanceDescription, suggestPrice } from '../services/geminiService';
import { User } from 'firebase/auth';
import { Product } from '../types';

interface PostProps {
  onBack: () => void;
  onPostComplete: () => void;
  locationName: string;
  user: User;
  initialData?: Product; // If provided, we are in edit mode
}

const categories = ["디지털기기", "가구/인테리어", "유아동", "생활/가전", "여성의류", "남성의류", "스포츠/레저", "취미/게임/음반", "뷰티/미용", "반려동물용품", "도서", "기타 중고물품"];

const Post: React.FC<PostProps> = ({ onBack, onPostComplete, locationName, user, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState<string | null>(initialData?.imageUrl || null);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!initialData;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIEnhance = async () => {
    if (!title) return alert("제목을 먼저 입력해주세요.");
    setIsEnhancing(true);
    const enhanced = await enhanceDescription(title, description, category);
    setDescription(enhanced);
    setIsEnhancing(false);
  };

  const handlePriceSuggest = async () => {
    if (!title) return alert("제목을 먼저 입력해주세요.");
    setIsSuggestingPrice(true);
    const suggestion = await suggestPrice(title, category);
    setPriceSuggestion(suggestion);
    setIsSuggestingPrice(false);
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || !image) {
      alert("모든 항목을 입력하고 사진을 추가해주세요.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && initialData) {
         await updateProduct({
             ...initialData,
             title,
             price: parseInt(price.replace(/,/g, '')),
             description,
             category,
             imageUrl: image,
         });
      } else {
         await createProduct({
            title,
            price: parseInt(price.replace(/,/g, '')),
            description,
            category,
            imageUrl: image,
            location: locationName, 
            createdAt: Date.now(),
            likes: 0,
            sellerName: user.displayName || user.email?.split('@')[0] || "당근이웃",
            sellerId: user.uid,
            isSold: false
         });
      }
      onPostComplete();
    } catch (error) {
      console.error(error);
      alert("실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-900 flex items-center gap-1 font-medium">
            <ArrowLeft size={20} />
            <span>닫기</span>
        </button>
        <h2 className="font-bold text-lg">{isEditMode ? "게시글 수정" : "내 물건 팔기"}</h2>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="text-primary font-bold disabled:opacity-50"
        >
          {loading ? '저장 중...' : '완료'}
        </button>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Image Picker */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer shrink-0"
            >
                <Camera size={24} />
                <span className="text-xs mt-1">사진 추가</span>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />
            {image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => setImage(null)}
                        className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>

        {/* Title */}
        <div className="border-b border-gray-100 py-2">
            <input 
                type="text" 
                placeholder="글 제목" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-medium outline-none placeholder:text-gray-300"
            />
        </div>

        {/* Category */}
        <div className="border-b border-gray-100 py-2">
            <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full outline-none bg-white text-gray-900"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>

        {/* Price */}
        <div className="border-b border-gray-100 py-2 space-y-2">
            <div className="flex items-center">
                <span className="text-gray-400 mr-2">₩</span>
                <input 
                    type="number" 
                    placeholder="가격 (원)" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full outline-none placeholder:text-gray-300"
                />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="offer" className="accent-primary w-4 h-4" />
                    <label htmlFor="offer" className="text-sm text-gray-500">가격 제안 받기</label>
                </div>
                 <button 
                    onClick={handlePriceSuggest}
                    disabled={isSuggestingPrice || !title}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                >
                    {isSuggestingPrice ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                    시세 조회
                </button>
            </div>
            {priceSuggestion && (
                 <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded animate-fade-in">
                    예상 중고 시세: <strong>{priceSuggestion}</strong>
                 </div>
            )}
        </div>

        {/* Description */}
        <div className="relative">
            <textarea 
                placeholder="게시글 내용을 작성해주세요. (가품 및 판매금지품목은 게시가 제한될 수 있어요.)" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-40 resize-none outline-none placeholder:text-gray-300 text-base leading-relaxed"
            />
            
            {/* AI Floating Button */}
            <button 
                onClick={handleAIEnhance}
                disabled={isEnhancing}
                className="absolute bottom-2 right-0 flex items-center gap-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
            >
                {isEnhancing ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Wand2 size={16} />
                )}
                <span>AI 작성 도우미</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Post;