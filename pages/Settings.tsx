import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Loader2 } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { updateUserProfile } from '../services/firebase';

interface SettingsProps {
    user: FirebaseUser;
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onBack }) => {
    const [nickname, setNickname] = useState(user.displayName || '');
    const [loading, setLoading] = useState(false);
    
    // In a real app, we'd handle file upload to Storage. 
    // Here we'll just allow nickname editing for simplicity, 
    // as image upload requires Storage bucket config often.
    
    const handleSave = async () => {
        if (!nickname.trim()) return alert("닉네임을 입력해주세요.");
        setLoading(true);
        try {
            await updateUserProfile(user, nickname);
            alert("프로필이 수정되었습니다.");
            onBack();
        } catch (e) {
            alert("수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
             <header className="sticky top-0 bg-white p-4 flex items-center justify-between border-b border-gray-100 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">프로필 수정</h1>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="text-base font-bold text-gray-900 disabled:opacity-50"
                >
                    {loading ? "저장 중" : "완료"}
                </button>
            </header>

            <div className="p-6 flex flex-col items-center">
                 <div className="relative mb-8">
                     <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-gray-400" />
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-2 shadow-sm text-gray-600">
                        <Camera size={16} />
                    </button>
                 </div>

                 <div className="w-full space-y-4">
                     <div>
                         <label className="block text-sm font-bold text-gray-900 mb-1">닉네임</label>
                         <input 
                            type="text" 
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력해주세요"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-primary"
                         />
                         <p className="text-xs text-gray-500 mt-1">
                             이웃들에게 보여질 닉네임입니다.
                         </p>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default Settings;