import { useEffect, useState } from "react";
import "./CookingPage.css";
import { db } from "../firebase";
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore";

/* 把任何格式文件 ➜ [{name,qty}] */
const toList = (d) => {
  if (Array.isArray(d.items) && d.items.length) return d.items;
  if (d.plainCount) return [{ name: "原味雞蛋糕", qty: d.plainCount }];
  const list = [];
  ["comboCounts", "fillingCounts"].forEach(k => {
    if (d[k]) Object.entries(d[k]).forEach(([fl, c]) => {
      if (c > 0) list.push({ name: `${fl}雞蛋糕`, qty: c });
    });
  });
  return list.length ? list : [{ name: "未知餐點", qty: 1 }];
};

export default function CookingPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSel]  = useState({});

  /* 監聽待製作 */
  useEffect(() => {
    console.log("🍳 New CookingPage loaded");   // 看得到這行就表示跑到新版
    const q = query(
      collection(db, "orders"),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc")              // 需複合索引
    );
    const unsub = onSnapshot(q, snap => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, list: toList(d.data()) }))
      );
    });
    return () => unsub();
  }, []);

  /* 勾選 */
  const toggle = (oid, idx) =>
    setSel(p => {
      const s = new Set(p[oid] || []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...p, [oid]: s };
    });

  /* 完成 */
  const finish = async (o) => {
    const chk = [...(selected[o.id] || [])];
    if (!chk.length) {
      await updateDoc(doc(db, "orders", o.id), {
        status: "done",
        updatedAt: serverTimestamp()
      });
    } else {
      const left = o.list.filter((_, i) => !chk.includes(i));
      left.length
        ? await updateDoc(doc(db, "orders", o.id), { items: left })
        : await updateDoc(doc(db, "orders", o.id), {
            status: "done",
            updatedAt: serverTimestamp()
          });
    }
    setSel(p => ({ ...p, [o.id]: new Set() }));
  };

  /* 刪除 */
  const remove = async (o) => {
    const chk = [...(selected[o.id] || [])];
    if (!chk.length) {
      await deleteDoc(doc(db, "orders", o.id));
    } else {
      const left = o.list.filter((_, i) => !chk.includes(i));
      left.length
        ? await updateDoc(doc(db, "orders", o.id), { items: left })
        : await deleteDoc(doc(db, "orders", o.id));
    }
    setSel(p => ({ ...p, [o.id]: new Set() }));
  };

  /* ---------- UI ---------- */
  return (
    <div className="cook-wrap">
      {orders.map(o => (
        <div key={o.id} className="card">
          <ul>
            {o.list.map((it, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected[o.id]?.has(i) || false}
                    onChange={() => toggle(o.id, i)}
                  />{" "}
                  {it.name} × {it.qty}
                </label>
              </li>
            ))}
          </ul>
          <div className="btn-row">
            <button className="done" onClick={() => finish(o)}>✅ 完成</button>
            <button className="del"  onClick={() => remove(o)}>🗑️ 刪除</button>
          </div>
        </div>
      ))}
      {orders.length === 0 && <p className="empty">（目前沒有訂單）</p>}
    </div>
  );
}
