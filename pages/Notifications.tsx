import React, { useState, useEffect } from 'react';
import { ArrowLeft, BellRing, Tag, CheckCheck } from 'lucide-react';
import { Notification } from '../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/firebase';
import { User } from 'firebase/auth';

interface NotificationsProps {
    user?: User;
    onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ user, onBack }) => {
    const [activeTab, setActiveTab] = useState<'ACTIVITY' | 'KEYWORD'>('ACTIVITY');
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user) return;
        const load = () => {
            setNotifications(getNotifications(user.uid));
        };
        load();
        window.addEventListener('notifications-update', load);
        return () => window.removeEventListener('notifications-update', load);
    }, [user]);

    const displayNotis = notifications.filter(n => n.type === activeTab);

    const timeAgo = (date: number) => {
        const seconds = Math.floor((new Date().getTime() - date) / 1000);
        if (seconds < 60) return "방금 전";
        if (seconds < 3600) return Math.floor(seconds / 60) + "분 전";
        if (seconds < 86400) return Math.floor(seconds / 3600) + "시간 전";
        return Math.floor(seconds / 86400) + "일 전";
    };

    const handleRead = (id: string) => {
        if (!user) return;
        markNotificationAsRead(user.uid, id);
    };

    const handleMarkAllRead = () => {
        if (!user) return;
        markAllNotificationsAsRead(user.uid);
    }

    if (!user) return null;

    return (
        <div className="bg-white min-h-screen">
            <header className="sticky top-0 bg-white p-4 flex items-center justify-between border-b border-gray-100 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">알림</h1>
                </div>
                <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-900"
                >
                    <CheckCheck size={14} />
                    모두 읽음
                </button>
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
                    <div 
                        key={noti.id} 
                        onClick={() => handleRead(noti.id)}
                        className={`p-4 flex gap-4 cursor-pointer transition-colors ${noti.isRead ? 'bg-white' : 'bg-orange-50/40 hover:bg-orange-50/60'}`}
                    >
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
                            <p className={`text-gray-900 text-[15px] leading-snug mb-1 ${!noti.isRead && 'font-medium'}`}>{noti.text}</p>
                            {noti.subText && <p className="text-gray-500 text-xs mb-1 line-clamp-1">{noti.subText}</p>}
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
                     <p className="text-xs text-gray-400 mb-2">원하는 키워드를 등록해보세요</p>
                 </div>
            )}
        </div>
    );
};

export default Notifications;