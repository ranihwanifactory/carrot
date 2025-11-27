import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, update, query, orderByChild } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Product } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCljhEUeggqRKk18EeQPsE_EsDOqfmWdOw",
  authDomain: "carrot-912ce.firebaseapp.com",
  databaseURL: "https://carrot-912ce-default-rtdb.firebaseio.com",
  projectId: "carrot-912ce",
  storageBucket: "carrot-912ce.firebasestorage.app",
  messagingSenderId: "610768721946",
  appId: "1:610768721946:web:379eed5965cd2abad3d9a3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const productsRef = ref(db, 'products');
const LOCAL_STORAGE_KEY = 'carrot_local_products';

// Mock data for initial populated feel
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'mock-1',
        title: '아이패드 에어 5세대 스페이스그레이',
        price: 750000,
        description: '배터리 효율 95%입니다. 기스 하나도 없고 풀박스입니다! 쿨거래 하시면 네고 조금 해드릴게요 😊',
        category: '디지털기기',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
        location: '역삼1동',
        createdAt: Date.now() - 3600000 * 2, // 2 hours ago
        likes: 12,
        sellerName: '당근러',
        isSold: false
    },
    {
        id: 'mock-2',
        title: '이사가서 의자 무료나눔해요',
        price: 0,
        description: '튼튼한 원목 의자입니다. 직접 가져가실 분만 채팅 주세요!',
        category: '가구/인테리어',
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-2321114453ad?auto=format&fit=crop&q=80&w=800',
        location: '역삼1동',
        createdAt: Date.now() - 3600000 * 24, // 1 day ago
        likes: 8,
        sellerName: '미니멀리스트',
        isSold: true
    }
];

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    // 1. Load Local + Mock Data First
    const loadLocal = () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const local = saved ? JSON.parse(saved) : [];
        return [...local, ...MOCK_PRODUCTS].sort((a: Product, b: Product) => b.createdAt - a.createdAt);
    };
    
    // Initial callback with local data
    callback(loadLocal());

    // 2. Try Firebase Subscription
    const q = query(productsRef, orderByChild('createdAt'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const firebaseProducts = Object.values(data) as Product[];
            // Merge with local data (simple concat)
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const local = saved ? JSON.parse(saved) : [];
            // Combine and sort
            const allProducts = [...firebaseProducts, ...local, ...MOCK_PRODUCTS]
                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Uniqueness check by ID
                .sort((a, b) => b.createdAt - a.createdAt);
                
            callback(allProducts);
        }
    }, (error) => {
        console.warn("Firebase permission denied or error. Running in offline/demo mode.", error);
        // Fallback is already handled by initial load
        callback(loadLocal());
    });
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
    const newId = push(productsRef).key || `local-${Date.now()}`;
    const newProduct = { ...product, id: newId };

    try {
        await set(ref(db, `products/${newId}`), newProduct);
    } catch (e) {
        console.warn("Firebase write failed (Permission Denied). Saving locally.", e);
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const products = saved ? JSON.parse(saved) : [];
        products.push(newProduct);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        window.dispatchEvent(new Event('product-local-update'));
    }
    return newId;
};

export const toggleLike = (productId: string, currentLikes: number) => {
    try {
        const productRef = ref(db, `products/${productId}`);
        update(productRef, { likes: currentLikes + 1 });
    } catch (e) {
        console.log("Offline like toggle");
    }
};

export { db, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
