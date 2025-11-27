import React, { useState } from 'react';
import { ArrowLeft, BellRing, Tag } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsProps {
    onBack: () => void;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'ACTIVITY',
        text: '당근러님이 "아이패드 에어" 게시글을 관심목록에 추가했어요.',
        timestamp: Date.now() - 3600000,
        isRead: false,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: '2',
        type: 'ACTIVITY',
        text: '따뜻한 거래 되셨나요? 거래 후기를 남겨주세요.',
        subText: '이사가서 의자 무료나눔해요',
        timestamp: Date.now() - 86400000,
        isRead: true,
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-2321114453ad?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: '3',
        type: 'KEYWORD',
        text: '"맥북" 키워드 알림',
        subText: '새로운 상품이 등록되었습니다: 맥북 프로 14인치 팝니다.',
        timestamp: Date.now() - 172800000,
        isRead: true
    }
];

const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'KEYWORD'>('ACTIVITY');
    
    const displayNotis = MOCK_NOTIFICATIONS.filter(n => n.type === activeTab);

    const timeAgo = (date: number) => {
        const seconds = Math.floor((new Date().getTime() - date) / 1000);
        if (seconds < 3600) return Math.floor(seconds / 60) + "분 전";
        if (seconds < 86400) return Math.floor(seconds / 3600) + "시간 전";
        return Math.floor(seconds / 86400) + "일 전";
    };

    return (
        <div className="bg-white min-h-screen">
            <header className="sticky top-0 bg-white p-4 flex items-center gap-3 border-b border-gray-100 z-10">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">알림</h1>
            </header>

            {/* Tabs */}
            <div className="flex px-4 pt-2 pb-0 border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('ACTIVITY')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ACTIVITY' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                    활동 알림
                </button>
                <button 
                    onClick={() => setActiveTab('KEYWORD')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'KEYWORD' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                    키워드 알림
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {displayNotis.length > 0 ? displayNotis.map(noti => (
                    <div key={noti.id} className={`p-4 flex gap-4 ${noti.isRead ? 'bg-white' : 'bg-orange-50/30'}`}>
                        {noti.type === 'KEYWORD' ? (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <Tag size={20} />
                            </div>
                        ) : (
                            <div className="relative w-10 h-10 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary">
                                    <BellRing size={20} />
                                </div>
                                {noti.imageUrl && (
                                     <img src={noti.imageUrl} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md border-2 border-white object-cover shadow-sm" alt="ref" />
                                )}
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-gray-900 text-[15px] leading-snug mb-1">{noti.text}</p>
                            {noti.subText && <p className="text-gray-500 text-xs mb-1">{noti.subText}</p>}
                            <span className="text-gray-400 text-xs">{timeAgo(noti.timestamp)}</span>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-400">
                         <p>{activeTab === 'ACTIVITY' ? '새로운 알림이 없어요.' : '설정된 키워드 알림이 없어요.'}</p>
                    </div>
                )}
            </div>
            
            {activeTab === 'KEYWORD' && displayNotis.length === 0 && (
                 <div className="text-center pb-8">
                     <button className="text-primary text-sm font-bold bg-orange-50 px-4 py-2 rounded-full">
                         + 키워드 알림 설정하기
                     </button>
                 </div>
            )}
        </div>
    );
};

export default Notifications;