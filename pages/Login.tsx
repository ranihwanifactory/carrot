import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';
import { Mail, Smartphone } from 'lucide-react';

const Login: React.FC = () => {
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError("구글 로그인 실패: " + err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEmailMode) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <button onClick={() => setIsEmailMode(false)} className="self-start text-gray-900 mb-8 text-lg font-medium">
          ← 뒤로
        </button>
        
        <h1 className="text-2xl font-bold mb-2">{isSignUp ? "이메일로 가입하기" : "이메일로 로그인"}</h1>
        <p className="text-gray-500 mb-8">이메일과 비밀번호를 입력해주세요.</p>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="이메일" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-primary"
            required
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-primary"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-lg disabled:opacity-50 mt-4"
          >
            {loading ? "처리중..." : (isSignUp ? "가입하기" : "로그인")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-gray-500 text-sm underline">
            {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-orange-100 rotate-3">
            <span className="text-4xl">🥕</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">당신 근처의 당근마켓</h1>
        <p className="text-gray-500 mb-12 leading-relaxed">
          중고 거래부터 동네 정보까지,<br/>
          지금 내 동네를 선택하고 시작해보세요!
        </p>

        <div className="w-full space-y-3 max-w-sm">
          <button 
            onClick={() => setIsEmailMode(true)}
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            시작하기
          </button>
          
          <div className="relative py-3">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
             <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">또는</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-200 text-gray-800 font-medium py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 relative"
          >
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5 absolute left-4" />
             <span>Google로 계속하기</span>
          </button>
          
          <button className="w-full bg-gray-100 text-gray-600 font-medium py-3.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 relative">
             <Smartphone size={20} className="absolute left-4" />
             <span>휴대폰 번호로 시작하기</span>
          </button>
           <button 
            onClick={() => setIsEmailMode(true)}
            className="w-full bg-white border border-gray-200 text-gray-600 font-medium py-3.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 relative"
          >
             <Mail size={20} className="absolute left-4" />
             <span>이메일로 시작하기</span>
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-8 mb-4">
        도움이 필요하신가요? <span className="underline">이메일 문의하기</span>
      </p>
    </div>
  );
};

export default Login;
