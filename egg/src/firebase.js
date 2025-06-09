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

// 1. 把 process.env.REACT_APP_FIREBASE_… 读到的值先存在 firebaseConfig
const firebaseConfig = {
  apiKey:             process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:         process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.REACT_APP_FIREBASE_APP_ID,
};

// 2. 打印一次，确保它们都不是 undefined
console.log("🔥 Firebase config:", firebaseConfig);

// 3. 用它来初始化 SDK
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// 4. 拿到 orders collection 的引用
const ordersCol = collection(db, "orders");

/** 新增一笔订单 */
export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status:    "pending",
    createdAt: serverTimestamp(),
  };
  console.log("✉️  addOrder payload:", payload);
  const ref = await addDoc(ordersCol, payload);
  console.log("✔️  addOrder done, id=", ref.id);
  return ref.id;
}

/** 监听所有 pending 的订单 */
export function listenPendingOrders(callback) {
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("🔔 pending orders:", list);
    callback(list);
  }, err => {
    console.error("❌ listenPendingOrders error:", err);
  });
}

/** 更新订单状态 */
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status });
  console.log(`🔄 Order ${orderId} -> ${status}`);
}
