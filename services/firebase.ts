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

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    const loadLocal = () => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        const local = saved ? JSON.parse(saved) : [];
        return [...local, ...MOCK_PRODUCTS].sort((a: Product, b: Product) => b.createdAt - a.createdAt);
    };
    
    callback(loadLocal());

    const q = query(productsRef, orderByChild('createdAt'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const firebaseProducts = Object.values(data) as Product[];
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const local = saved ? JSON.parse(saved) : [];
            const allProducts = [...firebaseProducts, ...local, ...MOCK_PRODUCTS]
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
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            let products = saved ? JSON.parse(saved) : [];
            products = products.filter((p: Product) => p.id !== productId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
            window.dispatchEvent(new Event('product-local-update'));
        } else {
            await remove(ref(db, `products/${productId}`));
        }
    } catch (e) {
        console.error("Delete failed", e);
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

export const createOrGetChat = async (user: User, product: Product): Promise<string> => {
    // Unique ID for a chat: productID + buyerID + sellerID (sorted to avoid duplicates if needed, but here structure is strict)
    // Structure: user_chats / {userId} / {chatId}
    // We will generate a Chat ID based on product and buyer to ensure one chat per product per buyer.
    
    const chatId = `${product.id}_${user.uid}`;
    const sellerId = product.sellerId;
    const buyerId = user.uid;

    if (sellerId === buyerId) return ""; // Cannot chat with self

    const chatData: ChatRoom = {
        id: chatId,
        productId: product.id,
        productTitle: product.title,
        productImage: product.imageUrl,
        participants: [buyerId, sellerId],
        participantNames: {
            [buyerId]: user.displayName || "구매자",
            [sellerId]: product.sellerName || "판매자"
        },
        lastMessage: "대화가 시작되었습니다.",
        lastMessageTime: Date.now(),
        updatedAt: Date.now()
    };

    // Update for Buyer
    await update(ref(db, `user_chats/${buyerId}/${chatId}`), chatData);
    
    // Update for Seller
    await update(ref(db, `user_chats/${sellerId}/${chatId}`), chatData);

    return chatId;
};

export const sendMessage = async (chatId: string, text: string, sender: User, receiverId: string) => {
    const messageRef = push(ref(db, `messages/${chatId}`));
    const timestamp = Date.now();
    
    const message: ChatMessage = {
        id: messageRef.key!,
        senderId: sender.uid,
        text,
        timestamp
    };

    await set(messageRef, message);

    // Update Metadata for both users
    const updates: any = {};
    updates[`user_chats/${sender.uid}/${chatId}/lastMessage`] = text;
    updates[`user_chats/${sender.uid}/${chatId}/lastMessageTime`] = timestamp;
    updates[`user_chats/${receiverId}/${chatId}/lastMessage`] = text;
    updates[`user_chats/${receiverId}/${chatId}/lastMessageTime`] = timestamp;

    await update(ref(db), updates);
};

export const subscribeToMyChats = (userId: string, callback: (chats: ChatRoom[]) => void) => {
    const q = query(ref(db, `user_chats/${userId}`), orderByChild('lastMessageTime'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const chats = Object.values(data) as ChatRoom[];
            callback(chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
        } else {
            callback([]);
        }
    });
};

export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
    const q = query(ref(db, `messages/${chatId}`), orderByChild('timestamp'));
    return onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const msgs = Object.values(data) as ChatMessage[];
            callback(msgs);
        } else {
            callback([]);
        }
    });
};

export { db, auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };