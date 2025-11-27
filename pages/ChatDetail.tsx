import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { subscribeToMessages, sendMessage, getChatInfo } from '../services/firebase';
import { ChatRoom, ChatMessage } from '../types';
import { User } from 'firebase/auth';

interface ChatDetailProps {
    user: User;
    chatId: string;
    onBack: () => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ user, chatId, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInfo, setChatInfo] = useState<ChatRoom | null>(null);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Chat Info
    useEffect(() => {
        const fetchChatInfo = async () => {
            const info = await getChatInfo(chatId);
            if (info) {
                setChatInfo(info);
            }
        };
        fetchChatInfo();
    }, [chatId]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages(chatId, (msgs) => {
            setMessages(msgs);
            // Scroll to bottom on new message
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
        return unsubscribe;
    }, [chatId]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !chatInfo) return;

        // If bot-seller (unknown), we still allow sending but it won't go anywhere useful
        const otherUserId = chatInfo.participants.find(uid => uid !== user.uid) || 'bot-seller';

        const text = inputText;
        setInputText(''); // Optimistic clear
        
        await sendMessage(chatId, text, user, otherUserId);
    };

    const getOtherUserName = () => {
        if (!chatInfo) return "채팅";
        const otherId = chatInfo.participants.find(id => id !== user.uid);
        return otherId ? (chatInfo.participantNames[otherId] || "상대방") : "상대방";
    };

    if (!chatInfo) return (
        <div className="bg-white min-h-screen flex items-center justify-center">
             <div className="text-gray-400">채팅방 정보를 불러오는 중...</div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white p-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold text-gray-900">{getOtherUserName()}</h1>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="bg-gray-100 px-1 rounded text-[10px] text-gray-600">37.5°C</span>
                    </div>
                </div>
            </header>

            {/* Product Summary Snippet */}
            <div className="bg-white p-3 border-b border-gray-100 flex gap-3 items-center">
                <img src={chatInfo.productImage} className="w-10 h-10 rounded-md object-cover bg-gray-100" alt="item" />
                <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{chatInfo.productTitle}</div>
                    <div className="text-sm font-bold text-gray-900">거래중</div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-20">
                 <div className="text-center text-xs text-gray-400 py-4">
                    거래 매너를 지켜주세요.<br/>
                    비매너 사용자에게는 경고가 주어질 수 있습니다.
                 </div>

                 {messages.map((msg) => {
                     const isMe = msg.senderId === user.uid;
                     return (
                         <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                 isMe 
                                 ? 'bg-primary text-white rounded-tr-none' 
                                 : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                             }`}>
                                 {msg.text}
                             </div>
                             <span className="text-[10px] text-gray-400 self-end mx-1 mb-1">
                                {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}
                             </span>
                         </div>
                     );
                 })}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="bg-white p-3 border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto pb-safe">
                <div className="flex gap-2 items-center bg-gray-100 px-4 py-2 rounded-full">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메세지 보내기"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim()}
                        className={`transition-colors ${inputText.trim() ? 'text-primary' : 'text-gray-300'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatDetail;