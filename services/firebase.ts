import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, update, query, orderByChild, remove, get } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { Product, ChatRoom, ChatMessage, Notification } from "../types";

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
const LOCAL_PRODUCTS_KEY = 'carrot_local_products'; // For new products OR edits
const LOCAL_CHATS_KEY = 'carrot_local_chats';
const LOCAL_MESSAGES_KEY = 'carrot_local_messages';
const LOCAL_HIDDEN_IDS_KEY = 'carrot_hidden_ids'; // For deleted products (both mock and real)
const LOCAL_NOTIFICATIONS_KEY = 'carrot_notifications';

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

// Mock Notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'noti-1',
        type: 'ACTIVITY',
        text: '당근러님이 "아이패드 에어" 게시글을 관심목록에 추가했어요.',
        timestamp: Date.now() - 3600000,
        isRead: false,
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 'noti-2',
        type: 'ACTIVITY',
        text: '따뜻한 거래 되셨나요? 거래 후기를 남겨주세요.',
        subText: '이사가서 의자 무료나눔해요',
        timestamp: Date.now() - 86400000,
        isRead: true,
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-2321114453ad?auto=format&fit=crop&q=80&w=100'
    },
    {
        id: 'noti-3',
        type: 'KEYWORD',
        text: '"맥북" 키워드 알림',
        subText: '새로운 상품이 등록되었습니다: 맥북 프로 14인치 팝니다.',
        timestamp: Date.now() - 172800000,
        isRead: true
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

const getLocalProducts = (): Product[] => {
    return JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || '[]');
};

const getHiddenIds = (): string[] => {
    return JSON.parse(localStorage.getItem(LOCAL_HIDDEN_IDS_KEY) || '[]');
};

const saveLocalProduct = (product: Product) => {
    const products = getLocalProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
        products[index] = product;
    } else {
        products.push(product);
    }
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

const hideProductLocally = (productId: string) => {
    const hidden = getHiddenIds();
    if (!hidden.includes(productId)) {
        hidden.push(productId);
        localStorage.setItem(LOCAL_HIDDEN_IDS_KEY, JSON.stringify(hidden));
    }
    // Also remove from local products if it exists there
    const products = getLocalProducts().filter(p => p.id !== productId);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const mergeData = (firebaseData: Product[]) => {
        const localProducts = getLocalProducts();
        const hiddenIds = getHiddenIds();
        
        // 1. Start with Firebase Data
        let merged = [...firebaseData];

        // 2. Add Mock Data (if not in firebase)
        // Check if mock data is already in firebase (to avoid dupes if we ever synced them)
        MOCK_PRODUCTS.forEach(mock => {
             if (!merged.find(p => p.id === mock.id)) {
                 merged.push(mock);
             }
        });

        // 3. Apply Local Overrides (Edits) & Add New Local Products
        localProducts.forEach(local => {
            const index = merged.findIndex(p => p.id === local.id);
            if (index >= 0) {
                // Override existing (Firebase or Mock)
                merged[index] = local;
            } else {
                // Add new local
                merged.push(local);
            }
        });

        // 4. Filter Hidden
        const final = merged.filter(p => !hiddenIds.includes(p.id));
        
        // 5. Sort
        final.sort((a, b) => b.createdAt - a.createdAt);
        
        callback(final);
    };

    // Initial Load (Local Only)
    mergeData([]);

    const q = query(productsRef, orderByChild('createdAt'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        const firebaseProducts = data ? Object.values(data).map(sanitizeProduct) : [];
        mergeData(firebaseProducts);
    }, (error) => {
        console.warn("Firebase read failed, using local only", error);
        mergeData([]); // Keep using local/mock data
    });
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
    // Optimistic: Create Local ID
    const newId = `local-${Date.now()}`;
    const newProduct = { ...product, id: newId };

    try {
        // Try Firebase
        const fbRef = push(productsRef);
        const fbId = fbRef.key;
        if (fbId) {
             const finalProduct = { ...product, id: fbId };
             await set(fbRef, finalProduct);
             return fbId;
        }
    } catch (e) {
        console.warn("Create failed, falling back to local", e);
    }
    
    // Fallback or if using local ID logic
    saveLocalProduct(newProduct);
    window.dispatchEvent(new Event('product-local-update'));
    return newId;
};

export const updateProduct = async (product: Product) => {
    // 1. Save Local Override Immediately (Optimistic UI)
    saveLocalProduct(product);
    window.dispatchEvent(new Event('product-local-update'));

    // 2. Try Firebase Update
    if (!product.id.startsWith('local-') && !product.id.startsWith('mock-')) {
        try {
            await update(ref(db, `products/${product.id}`), product);
        } catch (e) {
            console.warn("Firebase update failed (permission?), kept local override.", e);
        }
    }
};

export const deleteProduct = async (productId: string) => {
    // 1. Hide Locally Immediately (Optimistic UI)
    hideProductLocally(productId);
    window.dispatchEvent(new Event('product-local-update'));

    // 2. Try Firebase Delete
    if (!productId.startsWith('local-') && !productId.startsWith('mock-')) {
        try {
            await remove(ref(db, `products/${productId}`));
        } catch (e) {
             console.warn("Firebase delete failed (permission?), kept local hide.", e);
        }
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

    // Attempt Firebase update but don't worry if it fails
    if (!productId.startsWith('local-') && !productId.startsWith('mock-')) {
        update(ref(db, `products/${productId}`), { likes: currentLikes + 1 }).catch(() => {});
    }
    window.dispatchEvent(new Event('product-local-update'));
};

export const getMyLikedProductIds = (): string[] => {
    return JSON.parse(localStorage.getItem('my_likes') || '[]');
};

// --- NOTIFICATION SERVICES ---

export const getNotifications = (): Notification[] => {
    const local = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY) || '[]');
    // Merge with mock notifications that aren't in local (by ID)
    const merged = [...local];
    MOCK_NOTIFICATIONS.forEach(mock => {
        if (!merged.find(n => n.id === mock.id)) {
            merged.push(mock);
        }
    });
    return merged.sort((a: Notification, b: Notification) => b.timestamp - a.timestamp);
};

export const markNotificationAsRead = (notiId: string) => {
    const notis = getNotifications();
    const updated = notis.map(n => n.id === notiId ? { ...n, isRead: true } : n);
    // Filter out mocks from saving full list? Better to just save state of mocks.
    // For simplicity, we just dump the whole merged state to local storage.
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications-update'));
};

export const markAllNotificationsAsRead = () => {
    const notis = getNotifications();
    const updated = notis.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('notifications-update'));
}

// --- CHAT SERVICES ---

// Sanitize string for Firebase keys (no '.', '#', '$', '[', ']')
const sanitizeKey = (key: string) => key.replace(/[.#$\[\]]/g, '_');

export const createOrGetChat = async (user: User, product: Product): Promise<string> => {
    let sellerId = product.sellerId;
    const buyerId = user.uid;

    if (!sellerId || sellerId === 'unknown-seller') sellerId = 'bot-seller';
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

    try {
        await set(ref(db, `chats/${chatId}`), chatData);
    } catch (error: any) {
        try {
            await update(ref(db, `user_chats/${buyerId}/${chatId}`), chatData);
        } catch (innerError) {
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

    try {
        const messageRef = ref(db, `messages/${chatId}/${messageId}`);
        await set(messageRef, message);
        
        try {
            await update(ref(db, `chats/${chatId}`), {
                lastMessage: text,
                lastMessageTime: timestamp,
                updatedAt: timestamp
            });
        } catch (e) {
             await update(ref(db, `user_chats/${sender.uid}/${chatId}`), {
                lastMessage: text,
                lastMessageTime: timestamp,
                updatedAt: timestamp
            });
        }
    } catch (e) {
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
    
    const localChats = () => {
        try {
            const saved = localStorage.getItem(LOCAL_CHATS_KEY);
            return saved ? Object.values(JSON.parse(saved)) : [];
        } catch(e) { return []; }
    };

    let sharedChats: ChatRoom[] = [];
    let privateChats: ChatRoom[] = [];

    const updateCombined = () => {
        const local = localChats();
        const map = new Map<string, ChatRoom>();
        
        local.forEach((c: any) => map.set(c.id, c));
        privateChats.forEach(c => map.set(c.id, c));
        sharedChats.forEach(c => map.set(c.id, c));

        const merged = Array.from(map.values()).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        callback(merged);
    };

    const sharedQ = query(ref(db, `chats`), orderByChild('updatedAt'));
    sharedUnsub = onValue(sharedQ, (snapshot) => {
        const val = snapshot.val();
        if (val) {
            const all = Object.values(val) as ChatRoom[];
            sharedChats = all.filter(c => c.participants && Array.isArray(c.participants) && c.participants.includes(userId));
        } else {
            sharedChats = [];
        }
        updateCombined();
    }, (error) => {});

    const privateQ = query(ref(db, `user_chats/${userId}`), orderByChild('lastMessageTime'));
    privateUnsub = onValue(privateQ, (snapshot) => {
        const val = snapshot.val();
        if (val) {
            privateChats = Object.values(val) as ChatRoom[];
        } else {
            privateChats = [];
        }
        updateCombined();
    }, (error) => {});

    const handleLocal = () => updateCombined();
    window.addEventListener('chat-local-update', handleLocal);

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
        const merged = [...fbMessages, ...local].sort((a, b) => a.timestamp - b.timestamp);
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
         const user = auth.currentUser;
         if (user) {
             const userSnap = await get(ref(db, `user_chats/${user.uid}/${chatId}`));
             if (userSnap.exists()) return userSnap.val();
         }
     } catch (e) {}
     const localChats = JSON.parse(localStorage.getItem(LOCAL_CHATS_KEY) || '{}');
     return localChats[chatId] || null;
};

export { db, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };