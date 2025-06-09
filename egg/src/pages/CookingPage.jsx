import React, { useEffect, useState } from "react";
import "./CookingPage.css";
import { db } from "../firebase";
import {
  collection, query, where, orderBy,
  onSnapshot, doc, updateDoc, deleteDoc
} from "firebase/firestore";

export default function CookingPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState({});   // { orderId: Set<idx> }

  /* ① 監聽待製作訂單 */
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("status", "==", "pending"),   // 只抓待製作
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ② 勾 / 取消勾 */
  const toggle = (oid, idx) => {
    setSelected(prev => {
      const s = new Set(prev[oid] || []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...prev, [oid]: s };
    });
  };

  /* ③ 完成 */
  const complete = async (o) => {
    const checked = [...(selected[o.id] || [])];
    if (!checked.length) {
      await updateDoc(doc(db, "orders", o.id), { status: "done" });
    } else {
      const remain = o.items.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", o.id), { items: remain })
        : await updateDoc(doc(db, "orders", o.id), { status: "done" });
    }
    setSelected(prev => ({ ...prev, [o.id]: new Set() }));
  };

  /* ④ 刪除 */
  const remove = async (o) => {
    const checked = [...(selected[o.id] || [])];
    if (!checked.length) {
      await deleteDoc(doc(db, "orders", o.id));
    } else {
      const remain = o.items.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", o.id), { items: remain })
        : await deleteDoc(doc(db, "orders", o.id));
    }
    setSelected(prev => ({ ...prev, [o.id]: new Set() }));
  };

  return (
    <div className="cook-wrap">
      {orders.map(o => (
        <div key={o.id} className="card">
          <ul>
            {o.items.map((it, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected[o.id]?.has(i) || false}
                    onChange={() => toggle(o.id, i)}
                  />
                  {it.name} × {it.qty}
                </label>
              </li>
            ))}
          </ul>

          <div className="btn-row">
            <button className="done" onClick={() => complete(o)}>✅ 完成</button>
            <button className="del"  onClick={() => remove(o)}>🗑️ 刪除</button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <p className="empty">（目前沒有待製作的餐點）</p>
      )}
    </div>
  );
}

