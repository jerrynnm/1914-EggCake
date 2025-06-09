import { useEffect, useState } from "react";
import "./CookingPage.css";
import { db } from "../firebase";
import {
  collection, onSnapshot,
  doc, updateDoc, deleteDoc, serverTimestamp,
  // 若要用 where("status","==","pending") 就另外 import
} from "firebase/firestore";

/** 把「不確定格式」的文件轉成 [{name,qty}] 陣列 */
const fallbackParser = (docData) => {
  // 1. 新版 items
  if (Array.isArray(docData.items) && docData.items.length) return docData.items;

  // 2. 舊版 plainCount
  if (docData.plainCount)
    return [{ name: "原味雞蛋糕", qty: docData.plainCount }];

  // 3. 舊版特價綜合 / 內餡
  const list = [];
  const buckets = ["comboCounts", "fillingCounts"];
  buckets.forEach((b) => {
    if (docData[b]) {
      Object.entries(docData[b]).forEach(([fl, cnt]) => {
        if (cnt > 0) list.push({ name: `${fl}雞蛋糕`, qty: cnt });
      });
    }
  });
  if (list.length) return list;

  // 4. 萬不得已回傳占位
  return [{ name: "未知餐點", qty: 1 }];
};

export default function CookingPage() {
  const [orders, setOrders] = useState([]);         // [{id, data, list}]
  const [selected, setSelected] = useState({});     // {orderId:Set(idx)}

  /* 📡 監聽全部訂單（你想過濾就把 where 打開） */
  useEffect(() => {
    const q = collection(db, "orders");
    const unsub = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          data,
          list: fallbackParser(data)   // 轉成 [{name,qty}]
        };
      });
      setOrders(arr);
    });
    return () => unsub();
  }, []);

  /* ✔ 勾 / 取消勾 */
  const toggle = (oid, idx) =>
    setSelected(p => {
      const s = new Set(p[oid] || []);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return { ...p, [oid]: s };
    });

  /* ✅ 完成 */
  const finish = async (ord) => {
    const checked = [...(selected[ord.id] || [])];
    if (!checked.length) {
      await updateDoc(doc(db, "orders", ord.id), {
        status: "done",
        updatedAt: serverTimestamp()
      });
    } else {
      const remain = ord.list.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", ord.id), { items: remain })
        : await updateDoc(doc(db, "orders", ord.id), {
            status: "done",
            updatedAt: serverTimestamp()
          });
    }
    setSelected(p => ({ ...p, [ord.id]: new Set() }));
  };

  /* 🗑️ 刪除 */
  const remove = async (ord) => {
    const checked = [...(selected[ord.id] || [])];
    if (!checked.length) {
      await deleteDoc(doc(db, "orders", ord.id));
    } else {
      const remain = ord.list.filter((_, i) => !checked.includes(i));
      remain.length
        ? await updateDoc(doc(db, "orders", ord.id), { items: remain })
        : await deleteDoc(doc(db, "orders", ord.id));
    }
    setSelected(p => ({ ...p, [ord.id]: new Set() }));
  };

  /* ✏️ 修正數量（修改第一個選中）*/
  const revise = async (ord) => {
    const checked = [...(selected[ord.id] || [])];
    if (!checked.length) return alert("請先勾選要修改的品項");
    const idx = checked[0];
    const current = ord.list[idx];
    const str = prompt(`「${current.name}」目前 ${current.qty} 份，輸入新數量：`, current.qty);
    if (str === null) return;
    const n = parseInt(str, 10);
    if (isNaN(n) || n <= 0) return alert("數量需為正整數");

    const newList = ord.list.map((it, i) =>
      i === idx ? { ...it, qty: n } : it
    );
    await updateDoc(doc(db, "orders", ord.id), { items: newList });
    setSelected(p => ({ ...p, [ord.id]: new Set() })); // 清勾選
  };

  /* ------------------- UI ------------------- */
  return (
    <div className="cook-wrap">
      {orders.map(ord => (
        <div key={ord.id} className="card">
          <ul>
            {ord.list.map((it, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected[ord.id]?.has(i) || false}
                    onChange={() => toggle(ord.id, i)}
                  />
                  {it.name} × {it.qty}
                </label>
              </li>
            ))}
          </ul>

          <div className="btn-row">
            <button className="done" onClick={() => finish(ord)}>✅ 完成</button>
            <button className="edit" onClick={() => revise(ord)}>✏️ 修正</button>
            <button className="del"  onClick={() => remove(ord)}>🗑️ 刪除</button>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <p className="empty">（目前沒有訂單）</p>
      )}
    </div>
  );
}

