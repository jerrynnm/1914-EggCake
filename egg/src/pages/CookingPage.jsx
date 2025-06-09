// CookingPage.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";          // ← 你的 Firebase 初始化
import {
  collection, query, where,
  orderBy, onSnapshot, doc, updateDoc, deleteDoc
} from "firebase/firestore";

export default function CookingPage() {
  // 料理中訂單
  const [orders, setOrders] = useState([]);
  // 每筆訂單被勾選的 item 索引
  const [selected, setSelected] = useState({}); // { orderId: Set([idx, ...]) }

  // ① 即時監聽
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "cooking"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 勾 / 取消勾
  const toggleCheck = (oid, idx) => {
    setSelected(prev => {
      const newSet = new Set(prev[oid] || []);
      newSet.has(idx) ? newSet.delete(idx) : newSet.add(idx);
      return { ...prev, [oid]: newSet };
    });
  };

  // 完成
  const handleComplete = async (order) => {
    const checked = [...(selected[order.id] || [])];
    // 2-1 完成整筆
    if (!checked.length) {
      await updateDoc(doc(db, "orders", order.id), { status: "done" });
    }
    // 2-2 完成部分
    else {
      const remain = order.items.filter((_, i) => !checked.includes(i));
      if (remain.length === 0) {
        // 全部勾光 → 直接整筆完成
        await updateDoc(doc(db, "orders", order.id), { status: "done" });
      } else {
        await updateDoc(doc(db, "orders", order.id), { items: remain });
      }
    }
    // 清掉勾選
    setSelected(prev => ({ ...prev, [order.id]: new Set() }));
  };

  // 刪除
  const handleDelete = async (order) => {
    const checked = [...(selected[order.id] || [])];
    // 3-1 刪整筆
    if (!checked.length) {
      await deleteDoc(doc(db, "orders", order.id));
    }
    // 3-2 刪部分
    else {
      const remain = order.items.filter((_, i) => !checked.includes(i));
      if (remain.length === 0) {
        // 全部勾光 → 直接刪掉整筆
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

      {orders.map((o, ordIdx) => (
        <div key={o.id} className="order-card">
          {/* 🔢 顯示順序編號（ordIdx 由 0 開始） */}
          <h3>訂單 #{ordIdx + 1}</h3>

          <ul>
            {o.items.map((item, idx) => (
              <li key={idx}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected[o.id]?.has(idx) || false}
                    onChange={() => toggleCheck(o.id, idx)}
                  />
                  {item.name} × {item.qty}
                </label>
              </li>
            ))}
          </ul>

          <div className="btn-row">
            <button className="done-btn"  onClick={() => handleComplete(o)}>
              ✅ 完成
            </button>
            <button className="del-btn"   onClick={() => handleDelete(o)}>
              🗑️ 刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

