// src/pages/CookingPage.jsx
import React, { useEffect, useState } from "react";
import "./CookingPage.css";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

export default function CookingPage() {
  const [orders, setOrders]   = useState([]);          // Firestore 撈回的訂單
  const [selected, setSelect] = useState({});         // { orderId: Set<index> }

  /* ─────────────── ① 監聽 status=pending ─────────────── */
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ─────────────── ② 勾 / 取消勾 ─────────────── */
  const toggle = (oid, idx) =>
    setSelect(prev => {
      const set = new Set(prev[oid] || []);
      set.has(idx) ? set.delete(idx) : set.add(idx);
      return { ...prev, [oid]: set };
    });

  /* ─────────────── ③ 完成（整筆 or 部分） ─────────────── */
  const complete = async (order, list) => {
    const checked = [...(selected[order.id] || [])];

    if (!checked.length) {
      // 沒勾 → 整筆完成
      await updateDoc(doc(db, "orders", order.id), {
        status: "done",
        updatedAt: serverTimestamp()
      });
    } else {
      // 勾部分 → 移除已完成餐點；全勾完就改 done
      const remain = list.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", order.id), { items: remain })
        : await updateDoc(doc(db, "orders", order.id), {
            status: "done",
            updatedAt: serverTimestamp()
          });
    }
    setSelect(prev => ({ ...prev, [order.id]: new Set() }));
  };

  /* ─────────────── ④ 刪除（整筆 or 部分） ─────────────── */
  const remove = async (order, list) => {
    const checked = [...(selected[order.id] || [])];

    if (!checked.length) {
      // 沒勾 → 整筆刪除
      await deleteDoc(doc(db, "orders", order.id));
    } else {
      // 勾部分 → 只刪選取；全勾完則刪文件
      const remain = list.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", order.id), { items: remain })
        : await deleteDoc(doc(db, "orders", order.id));
    }
    setSelect(prev => ({ ...prev, [order.id]: new Set() }));
  };

  /* ─────────────── ⑤ UI ─────────────── */
  return (
    <div className="cook-wrap">
      {orders.map(order => {
        /* ⭐ 保險：舊文件沒有 items 時，用舊欄位拼成 list */
        const list =
          Array.isArray(order.items) && order.items.length
            ? order.items
            : [{ name: order.type || "未知", qty: order.plainCount || 1 }];

        return (
          <div key={order.id} className="card">
            <ul>
              {list.map((it, i) => (
                <li key={i}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected[order.id]?.has(i) || false}
                      onChange={() => toggle(order.id, i)}
                    />
                    {it.name} × {it.qty}
                  </label>
                </li>
              ))}
            </ul>

            <div className="btn-row">
              <button
                className="done"
                onClick={() => complete(order, list)}
              >
                ✅ 完成
              </button>
              <button
                className="del"
                onClick={() => remove(order, list)}
              >
                🗑️ 刪除
              </button>
            </div>
          </div>
        );
      })}

      {orders.length === 0 && (
        <p className="empty">（目前沒有待製作的餐點）</p>
      )}
    </div>
  );
}
