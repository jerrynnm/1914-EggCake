// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "…",
  appId: "…",
};

// 初始化 App
const app = initializeApp(firebaseConfig);
// 初始化 Firestore
export const db = getFirestore(app);

// 導出 collection 參考，給外面呼叫
export const ordersCol = collection(db, "orders");

/**
 * 新增一筆訂單到 Firestore
 * @param {object} orderData 
 *    {
 *      type: "原味"｜"特價綜合"｜"內餡",
 *      plainCount,      // 僅當 type==="原味" 才有
 *      comboCounts,     // 僅當 type==="特價綜合" 才有: { 起士:1, 奧利奧:2, 黑糖:0 }
 *      fillingCounts,   // 僅當 type==="內餡" 才有
 *      note,            // 備註 (空字串也可以)
 *      createdAt: Timestamp
 *      status: "pending"｜"inProgress"｜"done"
 *    }
 */
export async function addOrder(orderData) {
  // auto-created createdAt and status
  const payload = {
    ...orderData,
    createdAt: serverTimestamp(),
    status: "pending", // 一律先放 pending，代表「廚房尚未接單」
  };
  const docRef = await addDoc(ordersCol, payload);
  return docRef.id;
}

/**
 * 監聽所有 status === "pending" 的訂單 (製作中)
 * callback(items: Array)：
 *   items = [
 *     { id: "...", type: "...", plainCount: 2, note: "...", createdAt: Timestamp, status: "pending" },
 *     ...
 *   ]
 */
export function listenPendingOrders(callback) {
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  // onSnapshot 會在有變化時，回呼 callback
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(list);
  });
}
