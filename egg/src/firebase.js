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

/* ❶ 直接把 Firebase Console → 專案設定 裡的 SDK Config 貼進來 */
const firebaseConfig = {
  apiKey: "AIzaSyBZiaj4pHHhJy_j9Mu5TlH7CEIwTZ143JyQ",
  authDomain: "egg-waffle-ordering.firebaseapp.com",
  databaseURL: "https://egg-waffle-ordering-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "egg-waffle-ordering",
  storageBucket: "egg-waffle-ordering.appspot.com",
  messagingSenderId: "439794130729",
  appId: "1:439794130729:web:f4e6b38c85c6d48051a138",
};

console.log("🔥 目前使用的 Firebase Config：", firebaseConfig); // 確認不會是 undefined

/* ❷ 初始化 */
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const ordersCol = collection(db, "orders");

/* ❸ 新增訂單 */
export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(ordersCol, payload);
  console.log("✔️ 已寫入 Firestore，文件 ID =", ref.id);
  return ref.id;
}

/* ❹ 監聽 pending 訂單 */
export function listenPendingOrders(cb) {
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(list);
  });
}

/* ❺ 更新訂單狀態 */
export async function updateOrderStatus(id, status) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, { status });
}

