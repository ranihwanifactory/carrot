import React, { useEffect, useState } from 'react';
import { Home, PlusCircle, User, MessageCircle, LayoutGrid } from 'lucide-react';
import { ViewState } from '../types';
import { subscribeToMyChats, auth } from '../services/firebase';

interface NavBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // Simple notification simulation
    const user = auth.currentUser;
    if (user) {
        const unsubscribe = subscribeToMyChats(user.uid, (chats) => {
             setHasUnread(chats.length > 0); 
        });
        return unsubscribe;
    }
  }, []);

  const navItemClass = (view: ViewState) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === view ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="max-w-md mx-auto h-16 flex justify-between items-center px-6">
        <button onClick={() => setView(ViewState.FEED)} className={navItemClass(ViewState.FEED)}>
          <Home size={24} strokeWidth={currentView === ViewState.FEED ? 2.5 : 2} />
          <span className="text-[10px] font-medium">홈</span>
        </button>
        
        <button onClick={() => setView(ViewState.CATEGORY)} className={navItemClass(ViewState.CATEGORY)}> 
          <LayoutGrid size={24} strokeWidth={currentView === ViewState.CATEGORY ? 2.5 : 2} />
           <span className="text-[10px] font-medium">카테고리</span>
        </button>
        
        <button onClick={() => setView(ViewState.POST)} className="flex flex-col items-center justify-center -mt-8">
            <div className="bg-primary text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                <PlusCircle size={28} />
            </div>
        </button>

        <button onClick={() => setView(ViewState.CHAT)} className={`${navItemClass(ViewState.CHAT)} relative`}>
           <MessageCircle size={24} strokeWidth={currentView === ViewState.CHAT ? 2.5 : 2} />
           <span className="text-[10px] font-medium">채팅</span>
           {hasUnread && (
               <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
           )}
        </button>

        <button onClick={() => setView(ViewState.PROFILE)} className={navItemClass(ViewState.PROFILE)}>
          <User size={24} strokeWidth={currentView === ViewState.PROFILE ? 2.5 : 2} />
          <span className="text-[10px] font-medium">나의 당근</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;