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
import { createOrder } from "../services/orderService"; // 路徑依實際調整

// …中略

const sendCart = async () => {
  try {
    // 1. 把你畫面上的資料整理成 items 陣列
    //    例如 cart = [{name:"原味雞蛋糕", qty:1}]
    const items = cart.map(c => ({ name: c.name, qty: c.qty }));

    // 2. 其他想帶的欄位（備註、類型…）
    const extra = {
      note: noteText,  // 來自 textarea
      type: itemType   // 原味 / 特價綜合 / 內餡
    };

    // 3. 呼叫 service
    await createOrder(items, extra);

    // 4. 清空畫面
    setCart([]);
    setNoteText("");
    alert("已送單！");
  } catch (err) {
    console.error(err);
    alert("送單失敗，請稍後再試");
  }
};
