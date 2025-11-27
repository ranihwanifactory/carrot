import React, { useState } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Product } from '../types';

interface ChatProps {
    onBack: () => void;
}

// Mock Chat Data since we don't have real backend for chats in this iteration
const MOCK_CHATS = [
    {
        id: '1',
        name: '당근이웃',
        message: '안녕하세요! 아직 판매중인가요?',
        time: '방금 전',
        unread: 1,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: '2',
        name: '쿨거래요정',
        message: '네고 가능한가요? 바로 갈게요.',
        time: '1시간 전',
        unread: 0,
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-2321114453ad?auto=format&fit=crop&q=80&w=100'
    }
];

const Chat: React.FC<ChatProps> = ({ onBack }) => {
    return (
        <div className="bg-white min-h-screen">
            <header className="bg-white p-4 flex items-center gap-3 border-b border-gray-100 sticky top-0">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">채팅</h1>
            </header>
            
            <div>
                {MOCK_CHATS.map(chat => (
                    <div key={chat.id} className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                        <div className="relative">
                            <img src={chat.imageUrl} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                            {chat.unread > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border border-white"></span>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-gray-900">{chat.name}</h3>
                                <span className="text-xs text-gray-400">{chat.time}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{chat.message}</p>
                        </div>
                    </div>
                ))}
                
                <div className="p-8 text-center text-gray-400 text-sm">
                    <p>최근 대화 목록입니다.</p>
                </div>
            </div>
        </div>
    );
};

export default Chat;