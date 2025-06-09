import {
  doc,
  runTransaction,
  serverTimestamp,
  addDoc,
  collection
} from "firebase/firestore";
import { db } from "../firebase";  // ← 路徑依你的專案層級調整

/**
 * 建立新訂單（帶每日遞增 orderNo）
 * @param {Array} items  送出的餐點，例如 [{ name:"原味", qty:1 }]
 * @param {Object} extra 其他欄位：note / type…
 */
export async function createOrder(items, extra = {}) {
  const today      = new Date();
  const yyyymmdd   = today.toISOString().slice(0, 10).replace(/-/g, "");
  const counterRef = doc(db, "counters", yyyymmdd);

  // ① 取得當日遞增號碼
  const orderNo = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const last = snap.exists() ? snap.data().last || 0 : 0;
    const next = last + 1;
    tx.set(counterRef, { last: next }, { merge: true });
    return next;
  });

  // ② 寫入訂單
  await addDoc(collection(db, "orders"), {
    orderNo,               // 訂單 #1, 2, 3…
    items,
    status: "pending",     // 初始狀態
    createdAt: serverTimestamp(),
    ...extra
  });
}
