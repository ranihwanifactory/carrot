import React from 'react';
import { 
    Smartphone, Armchair, Baby, Plug, Shirt, 
    Bike, Gamepad2, Book, Sparkles, Dog, 
    MoreHorizontal, Utensils
} from 'lucide-react';

interface CategoryPageProps {
    onSelect: (category: string) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ onSelect }) => {
    const categories = [
        { name: "디지털기기", icon: <Smartphone size={28} className="text-gray-700" /> },
        { name: "생활/가전", icon: <Plug size={28} className="text-gray-700" /> },
        { name: "가구/인테리어", icon: <Armchair size={28} className="text-gray-700" /> },
        { name: "유아동", icon: <Baby size={28} className="text-gray-700" /> },
        { name: "여성의류", icon: <Shirt size={28} className="text-gray-700" /> },
        { name: "남성의류", icon: <Shirt size={28} className="text-gray-700" /> },
        { name: "스포츠/레저", icon: <Bike size={28} className="text-gray-700" /> },
        { name: "취미/게임/음반", icon: <Gamepad2 size={28} className="text-gray-700" /> },
        { name: "뷰티/미용", icon: <Sparkles size={28} className="text-gray-700" /> },
        { name: "반려동물용품", icon: <Dog size={28} className="text-gray-700" /> },
        { name: "도서", icon: <Book size={28} className="text-gray-700" /> },
        { name: "기타 중고물품", icon: <MoreHorizontal size={28} className="text-gray-700" /> },
    ];

    return (
        <div className="bg-white min-h-screen pb-20">
            <header className="sticky top-0 bg-white p-4 flex items-center border-b border-gray-100 z-10">
                <h1 className="text-lg font-bold">카테고리</h1>
            </header>

            <div className="p-4 grid grid-cols-3 gap-y-8 gap-x-4">
                {categories.map((cat) => (
                    <button 
                        key={cat.name} 
                        onClick={() => onSelect(cat.name)}
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                            {cat.icon}
                        </div>
                        <span className="text-xs text-gray-700 font-medium text-center break-keep w-full">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;