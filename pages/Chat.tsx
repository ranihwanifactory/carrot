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
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    };

    const getOtherUserName = (chat: ChatRoom) => {
        const otherId = chat.participants.find(id => id !== user.uid);
        return otherId ? (chat.participantNames[otherId] || "알 수 없음") : "알 수 없음";
    };

    return (
        <div className="bg-white min-h-screen">
            <header className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 sticky top-0">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">채팅</h1>
            </header>
            
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-gray-300" />
                </div>
            ) : (
                <div>
                    {chats.length > 0 ? chats.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => onChatClick(chat.id)}
                            className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <img src={chat.productImage} className="w-full h-full rounded-full object-cover bg-gray-100 border border-gray-100" alt="product" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1 overflow-hidden">
                                        <h3 className="font-bold text-gray-900 truncate">{getOtherUserName(chat)}</h3>
                                        <span className="text-xs text-gray-400 truncate">• {chat.productTitle}</span>
                                    </div>
                                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{formatTime(chat.lastMessageTime)}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
                            <MessageCircle size={48} className="text-gray-200 mb-4" strokeWidth={1.5} />
                            <p>대화방이 없어요.</p>
                            <p className="mt-1">동네 이웃과 따뜻한 거래를 시작해보세요!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;