import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, update, query, orderByChild, remove, get } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Product, ChatRoom, ChatMessage } from "../types";

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
const LOCAL_CHATS_KEY = 'carrot_local_chats';
const LOCAL_MESSAGES_KEY = 'carrot_local_messages';
const LOCAL_DELETED_MOCKS_KEY = 'carrot_deleted_mocks';

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
        sellerId: 'mock-user-1',
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
        sellerId: 'mock-user-2',
        isSold: true
    }
];

// Helper to sanitize product data
const sanitizeProduct = (p: any): Product => ({
    ...p,
    sellerId: p.sellerId || 'unknown-seller',
    sellerName: p.sellerName || '알 수 없음',
    likes: p.likes || 0,
    isSold: !!p.isSold
});

const getDeletedMockIds = (): string[] => {
    return JSON.parse(localStorage.getItem(LOCAL_DELETED_MOCKS_KEY) || '[]');
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const loadLocal = () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const local = saved ? JSON.parse(saved) : [];
        const migratedLocal = local.map(sanitizeProduct);
        
        const deletedMocks = getDeletedMockIds();
        const activeMocks = MOCK_PRODUCTS.filter(p => !deletedMocks.includes(p.id));

        return [...migratedLocal, ...activeMocks].sort((a: Product, b: Product) => b.createdAt - a.createdAt);
    };
    
    callback(loadLocal());

    const q = query(productsRef, orderByChild('createdAt'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const firebaseProducts = Object.values(data).map(sanitizeProduct);
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const local = saved ? JSON.parse(saved) : [];
            const migratedLocal = local.map(sanitizeProduct);
            
            const deletedMocks = getDeletedMockIds();
            const activeMocks = MOCK_PRODUCTS.filter(p => !deletedMocks.includes(p.id));
            
            const allProducts = [...firebaseProducts, ...migratedLocal, ...activeMocks]
                .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                .sort((a, b) => b.createdAt - a.createdAt);
            callback(allProducts);
        }
    }, (error) => {
        callback(loadLocal());
    });
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
    const newId = push(productsRef).key || `local-${Date.now()}`;
    const newProduct = { ...product, id: newId };

    try {
        await set(ref(db, `products/${newId}`), newProduct);
    } catch (e) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const products = saved ? JSON.parse(saved) : [];
        products.push(newProduct);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        window.dispatchEvent(new Event('product-local-update'));
    }
    return newId;
};

export const updateProduct = async (product: Product) => {
    try {
        if (product.id.startsWith('local-')) {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            let products = saved ? JSON.parse(saved) : [];
            products = products.map((p: Product) => p.id === product.id ? product : p);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
            window.dispatchEvent(new Event('product-local-update'));
        } else {
            await update(ref(db, `products/${product.id}`), product);
        }
    } catch (e) {
        console.error("Update failed", e);
    }
};

export const deleteProduct = async (productId: string) => {
    try {
        if (productId.startsWith('local-')) {
            // Case 1: Created locally offline
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            let products = saved ? JSON.parse(saved) : [];
            products = products.filter((p: Product) => p.id !== productId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
            window.dispatchEvent(new Event('product-local-update'));
        } else if (productId.startsWith('mock-')) {
            // Case 2: Mock product - add to exclusion list
            const deletedMocks = getDeletedMockIds();
            if (!deletedMocks.includes(productId)) {
                deletedMocks.push(productId);
                localStorage.setItem(LOCAL_DELETED_MOCKS_KEY, JSON.stringify(deletedMocks));
                window.dispatchEvent(new Event('product-local-update'));
            }
        } else {
            // Case 3: Real Firebase product
            await remove(ref(db, `products/${productId}`));
        }
    } catch (e) {
        console.error("Delete failed", e);
        alert("삭제에 실패했습니다. 권한을 확인해주세요.");
    }
};

export const toggleLike = (productId: string, currentLikes: number) => {
    const likesKey = 'my_likes';
    const myLikes = JSON.parse(localStorage.getItem(likesKey) || '[]');
    
    if (myLikes.includes(productId)) {
        const newLikes = myLikes.filter((id: string) => id !== productId);
        localStorage.setItem(likesKey, JSON.stringify(newLikes));
    } else {
        myLikes.push(productId);
        localStorage.setItem(likesKey, JSON.stringify(myLikes));
    }

    try {
        if (!productId.startsWith('local-') && !productId.startsWith('mock-')) {
            const productRef = ref(db, `products/${productId}`);
            update(productRef, { likes: currentLikes + 1 });
        }
    } catch (e) {
        console.log("Offline like toggle");
    }
    window.dispatchEvent(new Event('product-local-update'));
};

export const getMyLikedProductIds = (): string[] => {
    return JSON.parse(localStorage.getItem('my_likes') || '[]');
};

// --- CHAT SERVICES ---

// Sanitize string for Firebase keys (no '.', '#', '$', '[', ']')
const sanitizeKey = (key: string) => key.replace(/[.#$\[\]]/g, '_');

export const createOrGetChat = async (user: User, product: Product): Promise<string> => {
    let sellerId = product.sellerId;
    const buyerId = user.uid;

    // Handle unknown seller case by assigning a bot placeholder so chat can still open
    if (!sellerId || sellerId === 'unknown-seller') {
        sellerId = 'bot-seller';
    }

    if (sellerId === buyerId) return ""; 

    const chatId = sanitizeKey(`${product.id}_${buyerId}`);

    const chatData: ChatRoom = {
        id: chatId,
        productId: product.id,
        productTitle: product.title,
        productImage: product.imageUrl || '',
        participants: [buyerId, sellerId],
        participantNames: {
            [buyerId]: user.displayName || "구매자",
            [sellerId]: product.sellerName || "판매자"
        },
        lastMessage: "대화가 시작되었습니다.",
        lastMessageTime: Date.now(),
        updatedAt: Date.now()
    };

    // Try Hybrid Approach: Shared Collection -> User Collection -> Local Storage
    try {
        // Attempt 1: Shared 'chats' collection
        await set(ref(db, `chats/${chatId}`), chatData);
    } catch (error: any) {
        console.warn("Shared chat creation failed, trying user-private path...", error);
        
        try {
            // Attempt 2: Write to my own user_chats node (I can always write to my own node)
            await update(ref(db, `user_chats/${buyerId}/${chatId}`), chatData);
        } catch (innerError) {
             console.warn("User-private chat creation failed, falling back to local storage.", innerError);
             
             // Attempt 3: Local Storage
             const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '{}');
             localChats[chatId] = chatData;
             localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(localChats));
             window.dispatchEvent(new Event('chat-local-update'));
        }
    }

    return chatId;
};

export const sendMessage = async (chatId: string, text: string, sender: User, receiverId: string) => {
    const timestamp = Date.now();
    const messageId = `msg-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
    
    const message: ChatMessage = {
        id: messageId,
        senderId: sender.uid,
        text,
        timestamp
    };

    // Hybrid Send
    try {
        // Try standard path
        const messageRef = ref(db, `messages/${chatId}/${messageId}`);
        await set(messageRef, message);
        
        // Try update metadata
        try {
            await update(ref(db, `chats/${chatId}`), {
                lastMessage: text,
                lastMessageTime: timestamp,
                updatedAt: timestamp
            });
        } catch (e) {
            // If shared chat update fails, try updating my own record
             await update(ref(db, `user_chats/${sender.uid}/${chatId}`), {
                lastMessage: text,
                lastMessageTime: timestamp,
                updatedAt: timestamp
            });
        }
    } catch (e) {
        console.warn("Firebase send failed, using local storage");
        
        // Save Message Locally
        const allMessages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
        if (!allMessages[chatId]) allMessages[chatId] = [];
        allMessages[chatId].push(message);
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(allMessages));
        
        // Update Chat Metadata Locally
        const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '{}');
        if (localChats[chatId]) {
            localChats[chatId].lastMessage = text;
            localChats[chatId].lastMessageTime = timestamp;
            localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(localChats));
        }
        
        window.dispatchEvent(new Event(`chat-messages-update-${chatId}`));
        window.dispatchEvent(new Event('chat-local-update'));
    }
};

export const subscribeToMyChats = (userId: string, callback: (chats: ChatRoom[]) => void) => {
    let sharedUnsub: (() => void) | undefined;
    let privateUnsub: (() => void) | undefined;
    
    // 1. Helper to read local
    const localChats = () => {
        try {
            const saved = localStorage.getItem(LOCAL_CHATS_KEY);
            return saved ? Object.values(JSON.parse(saved)) : [];
        } catch(e) { return []; }
    };

    // State containers
    let sharedChats: ChatRoom[] = [];
    let privateChats: ChatRoom[] = [];

    // Combiner function
    const updateCombined = () => {
        const local = localChats();
        const map = new Map<string, ChatRoom>();
        
        // Priority: Shared > Private > Local
        local.forEach((c: any) => map.set(c.id, c));
        privateChats.forEach(c => map.set(c.id, c));
        sharedChats.forEach(c => map.set(c.id, c));

        const merged = Array.from(map.values()).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        callback(merged);
    };

    // 2. Subscribe Shared
    const sharedQ = query(ref(db, `chats`), orderByChild('updatedAt'));
    sharedUnsub = onValue(sharedQ, (snapshot) => {
        const val = snapshot.val();
        if (val) {
            const all = Object.values(val) as ChatRoom[];
            // Filter client-side
            sharedChats = all.filter(c => c.participants && Array.isArray(c.participants) && c.participants.includes(userId));
        } else {
            sharedChats = [];
        }
        updateCombined();
    }, (error) => {
        console.warn("Shared chats read failed", error);
    });

    // 3. Subscribe Private
    const privateQ = query(ref(db, `user_chats/${userId}`), orderByChild('lastMessageTime'));
    privateUnsub = onValue(privateQ, (snapshot) => {
        const val = snapshot.val();
        if (val) {
            privateChats = Object.values(val) as ChatRoom[];
        } else {
            privateChats = [];
        }
        updateCombined();
    }, (error) => {
         console.warn("Private chats read failed", error);
    });

    // 4. Local Event Listener
    const handleLocal = () => updateCombined();
    window.addEventListener('chat-local-update', handleLocal);

    // Initial Trigger
    updateCombined();

    return () => {
        if (sharedUnsub) sharedUnsub();
        if (privateUnsub) privateUnsub();
        window.removeEventListener('chat-local-update', handleLocal);
    };
};

export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
    const loadLocal = () => {
        const allMessages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
        return (allMessages[chatId] || []) as ChatMessage[];
    };

    const q = query(ref(db, `messages/${chatId}`), orderByChild('timestamp'));
    const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val();
        let fbMessages: ChatMessage[] = [];
        if (data) {
            fbMessages = Object.values(data) as ChatMessage[];
        }
        const local = loadLocal();
        // Simple merge by ID or timestamp
        const merged = [...fbMessages, ...local].sort((a, b) => a.timestamp - b.timestamp);
        // Dedupe by ID
        const unique = Array.from(new Map(merged.map(m => [m.id, m])).values());
        callback(unique);
    }, () => {
        callback(loadLocal());
    });

    const handleLocalUpdate = () => {
         const local = loadLocal();
         callback(local);
    };
    window.addEventListener(`chat-messages-update-${chatId}`, handleLocalUpdate);

    return () => {
        unsubscribe();
        window.removeEventListener(`chat-messages-update-${chatId}`, handleLocalUpdate);
    };
};

export const getChatInfo = async (chatId: string): Promise<ChatRoom | null> => {
     try {
         const snap = await get(ref(db, `chats/${chatId}`));
         if (snap.exists()) return snap.val();
         
         // Fallback to user_chats
         const user = auth.currentUser;
         if (user) {
             const userSnap = await get(ref(db, `user_chats/${user.uid}/${chatId}`));
             if (userSnap.exists()) return userSnap.val();
         }
     } catch (e) {}

     // Fallback to local
     const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '{}');
     return localChats[chatId] || null;
};

export { db, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };