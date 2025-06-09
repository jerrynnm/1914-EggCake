// src/pages/CompletedPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";

export default function CompletedPage() {
  const [orders, setOrders] = useState([]);

  /* ① Firestore 監聽 */
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "done"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, snap => {
      setOrders(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ② 轉成顯示字串 */
  const getItemLabel = (items) =>
    items.map(it => `${it.name}×${it.qty}`).join("、");

  /* ③ JSX */
  return (
    <div style={{ padding: 20 }}>
      <h2>🎉 已完成訂單</h2>

      {orders.length === 0 ? (
        <p>目前還沒有完成的訂單</p>
      ) : (
        orders.map(o => (
          <div
            key={o.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              backgroundColor: "#e0f7fa"
            }}
          >
            <p>🆔 訂單 ID：{o.id}</p>
            <p>📦 類型：{o.type}</p>
            <p>🍥 餐點：{getItemLabel(o.items)}</p>
            {o.note && <p>📝 備註：{o.note}</p>}
            <p>⏰ 下單：{o.createdAt?.toDate?.().toLocaleString()}</p>
            <p>✅ 完成：{o.updatedAt?.toDate?.().toLocaleString() || "-"}</p>
          </div>
        ))
      )}
    </div>
  );
}

