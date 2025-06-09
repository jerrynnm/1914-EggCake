// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// 1) Gather your env vars into a config object
const firebaseConfig = {
  apiKey:             process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:         process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.REACT_APP_FIREBASE_APP_ID,
};

// 2) Quick debug: ensure none are undefined
console.log("🔥 Firebase config:", firebaseConfig);

// 3) Initialize App and Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);          // ← Export this so other modules can import { db }
const ordersCol = collection(db, "orders");

/**
 * 新增一筆訂單到 Firestore
 */
export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status:    "pending",
    createdAt: serverTimestamp(),
  };
  return await addDoc(ordersCol, payload);
}

/**
 * 監聽 status === "pending" 的訂單
 */
export function listenPendingOrders(callback) {
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

/**
 * 更新訂單的狀態
 */
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status });
}

