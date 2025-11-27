import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { subscribeToMyChats } from '../services/firebase';
import { ChatRoom } from '../types';
import { User } from 'firebase/auth';

interface ChatProps {
    user: User;
    onBack: () => void;
    onChatClick: (chatId: string) => void;
}

const Chat: React.FC<ChatProps> = ({ user, onBack, onChatClick }) => {
    const [chats, setChats] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToMyChats(user.uid, (data) => {
            setChats(data);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const formatTime = (timestamp: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    };

    const getOtherUserName = (chat: ChatRoom) => {
        if (!chat.participants) return "알 수 없음";
        const otherId = chat.participants.find(id => id !== user.uid);
        return otherId && chat.participantNames ? (chat.participantNames[otherId] || "알 수 없음") : "알 수 없음";
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <header className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">채팅</h1>
            </header>
            
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-gray-300" />
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {chats.length > 0 ? chats.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => onChatClick(chat.id)}
                            className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors"
                        >
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <img 
                                    src={chat.productImage || 'https://via.placeholder.com/100?text=No+Image'} 
                                    className="w-full h-full rounded-xl object-cover border border-gray-100 bg-gray-50" 
                                    alt="product" 
                                />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <div className="flex items-center gap-1 overflow-hidden">
                                        <h3 className="font-bold text-gray-900 truncate text-[15px]">{getOtherUserName(chat)}</h3>
                                        <span className="text-xs text-gray-400 truncate hidden sm:inline">• {chat.productTitle}</span>
                                    </div>
                                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">{formatTime(chat.lastMessageTime)}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate max-w-[90%]">{chat.lastMessage}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <MessageCircle size={48} className="text-gray-200 mb-4" strokeWidth={1.5} />
                            <p className="text-gray-900 font-medium mb-1">채팅 내역이 없어요.</p>
                            <p className="text-gray-500 text-sm mb-6">동네 이웃들과 따뜻한 거래를 시작해보세요.</p>
                            <button 
                                onClick={onBack} 
                                className="bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-sm"
                            >
                                이웃 만나러 가기
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;