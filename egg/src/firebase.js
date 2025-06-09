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

// ① 先把从 .env 或 Vercel 注入的变量存到一个常量里
const firebaseConfig = {
  apiKey:             process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:         process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.REACT_APP_FIREBASE_APP_ID,
};

// ② 打印一次，确认都不是 undefined
console.log("🔥 Firebase config:", firebaseConfig);

// ③ 再用它去初始化
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ④ 拿到 orders collection 引用
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
  const ref = await addDoc(ordersCol, payload);
  return ref.id;
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
