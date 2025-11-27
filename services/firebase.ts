import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, onValue, update, DatabaseReference } from "firebase/database";
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

export const productsRef = ref(db, 'products');

export const createProduct = async (product: Omit<Product, 'id'>) => {
  const newProductRef = push(productsRef);
  await set(newProductRef, { ...product, id: newProductRef.key });
  return newProductRef.key;
};

export const toggleLike = (productId: string, currentLikes: number) => {
  const productRef = ref(db, `products/${productId}`);
  update(productRef, { likes: currentLikes + 1 });
};

export const markAsSold = (productId: string) => {
  const productRef = ref(db, `products/${productId}`);
  update(productRef, { isSold: true });
};

export { db };
