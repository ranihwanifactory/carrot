import React from 'react';
import { User, Settings, Heart, ShoppingBag, CreditCard } from 'lucide-react';
import { ViewState } from '../types';

const Profile: React.FC = () => {
  const menuItems = [
    { icon: <Heart size={20} />, label: '관심목록' },
    { icon: <ShoppingBag size={20} />, label: '판매내역' },
    { icon: <CreditCard size={20} />, label: '당근페이' },
    { icon: <Settings size={20} />, label: '계정 설정' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-lg font-bold">나의 당근</h1>
        <Settings size={20} className="text-gray-600" />
      </header>

      <div className="p-4 bg-white mb-2">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
            </div>
            <div>
                <h2 className="font-bold text-lg">당근이웃 #1234</h2>
                <p className="text-sm text-gray-500">역삼1동 • #123456</p>
            </div>
        </div>
        <button className="w-full mt-4 border border-gray-300 py-2 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50">
            프로필 보기
        </button>
      </div>

      <div className="space-y-2">
         {/* Pay Banner */}
         <div className="bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-lg">Pay</span>
                <span className="text-gray-500 text-sm">0원</span>
            </div>
            <span className="text-gray-400 text-lg">›</span>
         </div>

         <div className="bg-white">
            {menuItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 border-b border-gray-50 active:bg-gray-50 cursor-pointer">
                    <div className="text-gray-600">{item.icon}</div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Profile;