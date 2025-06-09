// src/pages/OrderPage.jsx
import React, { useState } from "react";
import "./OrderPage.css";

import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

const TYPES   = ["原味", "特價綜合", "內餡"];
const FLAVORS = ["起士", "奧利奧", "黑糖"];

export default function OrderPage() {
  /* ------------ State ------------ */
  const [itemType, setItemType]   = useState("原味");
  const [plainCount, setPlainCount]       = useState(1);
  const [comboCounts, setComboCounts]     = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote]           = useState("");
  const [cart, setCart]           = useState([]);      // [{ items, extra }]
  const [selected, setSelected]   = useState([]);

  /* ------------ Derived ------------ */
  const comboTotal   = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  /* ------------ Helpers ------------ */
  const changePlain = d => setPlainCount(p => Math.max(1, p + d));
  const changeCombo = (fl, d) => setComboCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));
  const changeFill  = (fl, d) => setFillingCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));

  const resetCounts = () => {
    setPlainCount(1);
    setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  /* ❶ 將畫面選擇整理為 { items, extra } 結構 */
  const buildOrder = () => {
    const items = [];

    if (itemType === "原味") {
      if (plainCount <= 0) return alert("份數必須 ≥1");
      items.push({ name: "原味", qty: plainCount });
    }

    if (itemType === "特價綜合") {
      if (comboTotal !== 3) return alert("特價綜合必須選滿 3 顆");
      Object.entries(comboCounts).forEach(([fl, cnt]) => {
        if (cnt > 0) items.push({ name: `${fl}`, qty: cnt });
      });
    }

    if (itemType === "內餡") {
      if (fillingTotal !== 3) return alert("內餡雞蛋糕必須選滿 3 顆");
      Object.entries(fillingCounts).forEach(([fl, cnt]) => {
        if (cnt > 0) items.push({ name: `${fl}`, qty: cnt });
      });
    }

    return {
      items,
      extra: { type: itemType, note }
    };
  };

  /* ❷ 寫入 Firestore（單筆） */
  const pushOrder = async ({ items, extra }) => {
    try {
      await addDoc(collection(db, "orders"), {
        items,
        status: "pending",
        createdAt: serverTimestamp(),
        ...extra
      });
    } catch (err) {
      console.error(err);
      alert("寫入 Firestore 失敗");
    }
  };

  /* 直接送出 */
  const directSend = async () => {
    const order = buildOrder();
    if (!order) return;
    await pushOrder(order);
    resetCounts();
    alert("已直接送出");
  };

  /* 加入購物車 */
  const addToCart = () => {
    const order = buildOrder();
    if (!order) return;
    setCart(c => [...c, order]);
    resetCounts();
  };

  /* 勾選 */
  const toggleSelect = i =>
    setSelected(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]));

  /* 送出購物車 */
  const sendCart = async () => {
    if (!cart.length) return alert("購物車空");
    for (const order of cart) await pushOrder(order);
    setCart([]);
    setSelected([]);
    alert("已送出購物車訂單");
  };

  /* 刪除選取 / 清空 */
  const deleteOrClear = () => {
    setCart(c =>
      selected.length ? c.filter((_, i) => !selected.includes(i)) : []
    );
    setSelected([]);
  };

  /* 顯示用文字 */
  const getItemLabel = order => {
    const { items, extra } = order;
    const str = items.map(it => `${it.name}×${it.qty}`).join("、");
    return (extra.type === "原味" ? "原味：" : extra.type === "特價綜合" ? "特綜：" : "內餡：") + str;
  };

  /* 數字調整元件 */
  const renderNumberRow = (label, val, minusDis, plusDis, onMinus, onPlus) => (
    <div className="number-row" key={label}>
      <span className="flavor-label">{label}</span>
      <button className="num-btn" onClick={onMinus} disabled={minusDis}>-</button>
      <span className="num-display">{val}</span>
      <button className="num-btn" onClick={onPlus} disabled={plusDis}>+</button>
    </div>
  );

  /* ------------ JSX ------------ */
  return (
    <div className="order-container">
      {/* Tabs */}
      <div className="tabs">
        {TYPES.map(t => (
          <button
            key={t}
            className={`tab-btn ${itemType === t ? "active" : ""}`}
            onClick={() => setItemType(t)}
          >
            {t}
            {t !== "原味" && `（共${t === "特價綜合" ? comboTotal : fillingTotal}/3）`}
          </button>
        ))}
      </div>

      {/* Selector */}
      <div className="selector">
        {itemType === "原味" &&
          renderNumberRow(
            "份數", plainCount, false, false,
            () => changePlain(-1), () => changePlain(1)
          )}
        {itemType === "特價綜合" &&
          FLAVORS.map(fl =>
            renderNumberRow(
              fl, comboCounts[fl],
              comboCounts[fl] === 0,
              comboTotal >= 3,
              () => changeCombo(fl, -1),
              () => changeCombo(fl, 1)
            )
          )}
        {itemType === "內餡" &&
          FLAVORS.map(fl =>
            renderNumberRow(
              fl, fillingCounts[fl],
              fillingCounts[fl] === 0,
              fillingTotal >= 3,
              () => changeFill(fl, -1),
              () => changeFill(fl, 1)
            )
          )}
      </div>

      {/* Note */}
      <input
        className="note-input"
        value={note}
        placeholder="備註…"
        onChange={e => setNote(e.target.value)}
      />

      {/* Top buttons */}
      <div className="actions-row actions-row--top">
        <button className="action-btn direct" onClick={directSend}>
          🚀 直接送出
        </button>
        <button className="action-btn cart" onClick={addToCart}>
          🛒 加入購物車
        </button>
      </div>

      {/* Cart list */}
      {cart.length > 0 && (
        <div className="cart-list">
          {cart.map((order, i) => (
            <label key={i} className="cart-item">
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={() => toggleSelect(i)}
              />
              <span>
                {getItemLabel(order)}
                {order.extra.note ? `（${order.extra.note}）` : ""}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Bottom buttons */}
      {cart.length > 0 && (
        <div className="actions-row actions-row--bottom">
          <button className="action-btn clear" onClick={deleteOrClear}>
            🗑️ {selected.length ? "刪除選取" : "清空購物車"}
          </button>
          <button className="action-btn send" onClick={sendCart}>
            🚀 送出購物車訂單
          </button>
        </div>
      )}
    </div>
  );
}

