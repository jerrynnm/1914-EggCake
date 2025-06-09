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

// 一定要先把 config 赋给一个常量！
const firebaseConfig = {
  apiKey:             process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:         process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.REACT_APP_FIREBASE_APP_ID,
};

// 打印出来确认都不是 undefined
console.log("🔥 Firebase config:", firebaseConfig);

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Firestore 上的 orders 集合引用
const ordersCol = collection(db, "orders");

/** 新增訂單 */
export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status:    "pending",
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(ordersCol, payload);
  return docRef.id;
}

/** 監聽製作中訂單 */
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

/** 更新訂單狀態 */
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status });
}


