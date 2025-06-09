// CookingPage.jsx
import React, { useEffect, useState } from "react";
import "./CookingPage.css";
import { db } from "../firebase";   // ← 你的 Firebase 初始化
import {
  collection, query, where, orderBy,
  onSnapshot, doc, updateDoc, deleteDoc
} from "firebase/firestore";

export default function CookingPage() {
  // Firestore 抓回的訂單
  const [orders, setOrders] = useState([]);
  // { orderId: Set<itemIndex> } —— 被勾選的餐點
  const [selected, setSelected] = useState({});

  /* ──────────────────────────────
     1️⃣  監聽「製作中(pending)」訂單
     ────────────────────────────── */
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "pending"),      // ← 依需求更換
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });
    return () => unsub();
  }, []);

  /* ──────────────────────────────
     2️⃣  互動：勾 / 取消勾
     ────────────────────────────── */
  const toggleCheck = (oid, idx) => {
    setSelected(prev => {
      const set = new Set(prev[oid] || []);
      set.has(idx) ? set.delete(idx) : set.add(idx);
      return { ...prev, [oid]: set };
    });
  };

  /* ──────────────────────────────
     3️⃣  完成：整筆 or 部分
     ────────────────────────────── */
  const handleComplete = async order => {
    const checked = [...(selected[order.id] || [])];
    // 沒勾＝整筆完成
    if (!checked.length) {
      await updateDoc(doc(db, "orders", order.id), { status: "done" });
    } else {
      const remain = order.items.filter((_, i) => !checked.includes(i));
      // 部分完成 → 移除已完成項；全勾完就直接整筆 done
      if (remain.length === 0) {
        await updateDoc(doc(db, "orders", order.id), { status: "done" });
      } else {
        await updateDoc(doc(db, "orders", order.id), { items: remain });
      }
    }
    // 清勾選
    setSelected(prev => ({ ...prev, [order.id]: new Set() }));
  };

  /* ──────────────────────────────
     4️⃣  刪除：整筆 or 部分
     ────────────────────────────── */
  const handleDelete = async order => {
    const checked = [...(selected[order.id] || [])];
    if (!checked.length) {
      // 沒勾＝整筆刪除
      await deleteDoc(doc(db, "orders", order.id));
    } else {
      const remain = order.items.filter((_, i) => !checked.includes(i));
      if (remain.length === 0) {
        // 全勾 → 直接刪 doc
        await deleteDoc(doc(db, "orders", order.id));
      } else {
        await updateDoc(doc(db, "orders", order.id), { items: remain });
      }
    }
    setSelected(prev => ({ ...prev, [order.id]: new Set() }));
  };

  return (
    <div className="cooking-wrapper">
      <h2>🍳 製作中訂單</h2>

      {orders.map((o, idx) => (
        <div key={o.id} className="order-card">
          {/* 🔢 每日遞增訂單號碼（已寫入 orderNo） */}
          <h3>訂單 #{o.orderNo}</h3>

          <ul>
            {o.items.map((it, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected[o.id]?.has(i) || false}
                    onChange={() => toggleCheck(o.id, i)}
                  />
                  {it.name} × {it.qty}
                </label>
              </li>
            ))}
          </ul>

          <div className="btn-row">
            <button
              className="done-btn"
              onClick={() => handleComplete(o)}
            >
              ✅ 完成
            </button>
            <button
              className="del-btn"
              onClick={() => handleDelete(o)}
            >
              🗑️ 刪除
            </button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 32 }}>（目前沒有等待中的訂單）</p>
      )}
    </div>
  );
}

