import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { getKeywords, addKeyword, removeKeyword } from '../services/firebase';
import { User } from 'firebase/auth';

interface KeywordSettingsProps {
    user?: User;
    onBack: () => void;
}

const KeywordSettings: React.FC<KeywordSettingsProps> = ({ user, onBack }) => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (user) {
            setKeywords(getKeywords(user.uid));
        }
    }, [user]);

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!user) return;
        
        const trimmed = input.trim();
        if (trimmed) {
            if (keywords.length >= 30) {
                alert("키워드는 최대 30개까지 등록 가능합니다.");
                return;
            }
            if (keywords.includes(trimmed)) {
                alert("이미 등록된 키워드입니다.");
                return;
            }
            addKeyword(user.uid, trimmed);
            setKeywords([...keywords, trimmed]);
            setInput('');
        }
    };

    const handleRemove = (kw: string) => {
        if (!user) return;
        removeKeyword(user.uid, kw);
        setKeywords(keywords.filter(k => k !== kw));
    };

    if (!user) return null;

    return (
        <div className="bg-white min-h-screen">
            <header className="sticky top-0 bg-white p-4 flex items-center border-b border-gray-100 z-10">
                <button onClick={onBack} className="mr-3">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">키워드 알림</h1>
            </header>

            <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">
                    관심있는 키워드를 등록하면<br/>
                    새 글이 올라올 때마다 알림을 받을 수 있어요.
                </p>

                <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="키워드를 입력해주세요 (예: 자전거)"
                        className="flex-1 bg-gray-100 rounded-lg px-4 py-3 outline-none text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="bg-primary text-white font-bold px-4 rounded-lg disabled:opacity-50"
                    >
                        등록
                    </button>
                </form>

                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">등록된 키워드 <span className="text-primary">{keywords.length}</span></h3>
                    
                    <div className="flex flex-wrap gap-2">
                        {keywords.length > 0 ? keywords.map(kw => (
                            <div key={kw} className="bg-white border border-gray-200 rounded-full pl-4 pr-2 py-2 flex items-center gap-2 text-sm text-gray-700">
                                <span>{kw}</span>
                                <button onClick={() => handleRemove(kw)} className="text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>
                        )) : (
                            <div className="w-full py-10 text-center text-gray-400 text-sm">
                                등록된 키워드가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeywordSettings;