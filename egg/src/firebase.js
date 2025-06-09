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

// 1️⃣ 把 config 先存常量，再初始化
const firebaseConfig = {
  apiKey:             process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:         process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:        process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:          process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.REACT_APP_FIREBASE_APP_ID,
};

// 2️⃣ 强化日志，确认每个字段都已经被注入
console.log("🔥 Firebase config:", firebaseConfig);

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("✅ Firebase initialized OK");
} catch (e) {
  console.error("❌ Firebase initialization failed:", e);
}

const ordersCol = db ? collection(db, "orders") : null;

/**
 * 新增一筆訂單到 Firestore
 */
export async function addOrder(orderData) {
  if (!ordersCol) {
    const msg = "`ordersCol` is not initialized";
    console.error(msg);
    throw new Error(msg);
  }
  const payload = {
    ...orderData,
    status:    "pending",
    createdAt: serverTimestamp(),
  };
  try {
    console.log("✉️  Sending order to Firestore:", payload);
    const docRef = await addDoc(ordersCol, payload);
    console.log("✔️  Order written with ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ addOrder failed:", e.code, e.message);
    throw e;
  }
}

/**
 * 監聽 status === "pending" 的訂單
 */
export function listenPendingOrders(callback) {
  if (!ordersCol) {
    console.error("`ordersCol` is not initialized, cannot listen");
    return () => {};
  }
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log("🔔 pendingList updated:", list);
    callback(list);
  }, (err) => {
    console.error("❌ listenPendingOrders error:", err);
  });
}

/**
 * 更新訂單的狀態
 */
export async function updateOrderStatus(orderId, status) {
  if (!db) {
    console.error("`db` is not initialized");
    return;
  }
  const ref = doc(db, "orders", orderId);
  try {
    await updateDoc(ref, { status });
    console.log(`🔄 Order ${orderId} status -> ${status}`);
  } catch (e) {
    console.error("❌ updateOrderStatus failed:", e);
  }
}

