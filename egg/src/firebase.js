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

// TODO: 用你的實際 config 值替換下面各欄位
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// 初始化 App
const app = initializeApp(firebaseConfig);
// 初始化 Firestore
const db = getFirestore(app);

// orders collection 參考
const ordersCol = collection(db, "orders");

/**
 * 新增一筆訂單到 Firestore
 * @param {object} orderData
 *   {
 *     type: "原味"｜"特價綜合"｜"內餡",
 *     plainCount?,    // 僅當 type==="原味" 有
 *     comboCounts?,   // 僅當 type==="特價綜合" 有
 *     fillingCounts?, // 僅當 type==="內餡" 有
 *     note,           // 備註
 *   }
 * @returns {Promise<string>} 新增文檔的 id
 */
export async function addOrder(orderData) {
  const payload = {
    ...orderData,
    status: "pending",          // 一律先標為 pending
    createdAt: serverTimestamp(), // 自動加上 timestamp
  };
  const docRef = await addDoc(ordersCol, payload);
  return docRef.id;
}

/**
 * 監聽 status === "pending" 的訂單 (製作中)
 * @param {function(Array<object>)} callback
 *   callback 會收到一個陣列，每項結構為 { id, type, plainCount?, comboCounts?, fillingCounts?, note, status, createdAt }
 * @returns {function()} unsubscribe function
 */
export function listenPendingOrders(callback) {
  const q = query(
    ordersCol,
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(list);
  });
}

/**
 * 更新訂單的狀態欄位
 * @param {string} orderId
 * @param {"pending"|"inProgress"|"done"} status
 * @returns {Promise<void>}
 */
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status });
}

