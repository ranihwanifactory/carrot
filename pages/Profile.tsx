import React from 'react';
import { User, Settings, Heart, ShoppingBag, CreditCard, LogOut } from 'lucide-react';
import { signOut, auth } from '../services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileProps {
    user: FirebaseUser;
    locationName: string;
}

const Profile: React.FC<ProfileProps> = ({ user, locationName }) => {
  const menuItems = [
    { icon: <Heart size={20} />, label: '관심목록' },
    { icon: <ShoppingBag size={20} />, label: '판매내역' },
    { icon: <CreditCard size={20} />, label: '당근페이' },
    { icon: <Settings size={20} />, label: '계정 설정' },
  ];

  const handleLogout = () => {
      signOut(auth);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <header className="bg-white p-4 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-lg font-bold">나의 당근</h1>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={20} />
        </button>
      </header>

      <div className="p-4 bg-white mb-2">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User size={32} className="text-gray-400" />
                )}
            </div>
            <div>
                <h2 className="font-bold text-lg">{user.displayName || user.email?.split('@')[0] || "당근이웃"}</h2>
                <p className="text-sm text-gray-500">{locationName} • #{user.uid.slice(0,6)}</p>
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
         
         <div className="p-4">
             <button onClick={handleLogout} className="text-sm text-gray-400 underline">로그아웃</button>
         </div>
      </div>
    </div>
  );
};

export default Profile;