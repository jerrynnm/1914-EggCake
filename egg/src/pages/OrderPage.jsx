import React, { useState } from "react";
import "./OrderPage.css";

const FLAVORS = ["起士", "奧利奧", "黑糖"];
const TYPES   = ["原味", "特價綜合", "內餡"];

export default function OrderPage() {
  /* -------------------- state -------------------- */
  const [itemType, setItemType] = useState("原味");
  const [plainCount, setPlainCount] = useState(1);
  const [comboCounts, setComboCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);

  const comboTotal   = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  /* -------------------- helpers -------------------- */
  const changePlain = d => setPlainCount(p => Math.max(1, p + d));
  const changeCombo = (fl, d) => setComboCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));
  const changeFill  = (fl, d) => setFillingCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));

  const resetCounts = () => {
    if (itemType === "原味") setPlainCount(1);
    if (itemType === "特價綜合") setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    if (itemType === "內餡")   setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  const addToCart = () => {
    const itm = { type: itemType, note };
    if (itemType === "原味") itm.count = plainCount;
    if (itemType === "特價綜合") {
      if (comboTotal !== 3) return alert("請選滿 3 顆");
      itm.flavors = { ...comboCounts };
    }
    if (itemType === "內餡") {
      if (fillingTotal !== 3) return alert("請選滿 3 顆");
      itm.flavors = { ...fillingCounts };
    }
    setCart(c => [...c, itm]);
    resetCounts();
  };

  const directSend   = () => { alert("已直接送出"); resetCounts(); };
  const toggleSelect = i => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
  const sendCart     = () => { if (!cart.length) return alert("購物車空"); alert("已送出"); setCart([]); setSelected([]); };
  const deleteOrClear= () => { setCart(c => selected.length ? c.filter((_, i) => !selected.includes(i)) : []); setSelected([]); };

  /* 產生顯示字串 */
  const getItemLabel = it => {
    if (it.type === "原味") return `原味：${it.count}份`;
    const flavorStr = Object.entries(it.flavors)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}×${v}`)
      .join("、");
    return (it.type === "特價綜合" ? "特綜：" : "內餡：") + flavorStr;
  };

  /* 渲染每一行數量控制 */
  const renderNumberRow = (label, val, minusD, plusD, onMinus, onPlus) => (
    <div className="number-row" key={label}>
      <span className="flavor-label">{label}</span>
      <button className="num-btn" onClick={onMinus} disabled={minusD}>-</button>
      <span className="num-display">{val}</span>
      <button className="num-btn" onClick={onPlus}  disabled={plusD}>+</button>
    </div>
  );

  /* -------------------- render -------------------- */
  return (
    <div className="order-container">
      {/* 頂端功能鍵可放在 .top-nav 容器，視需求插入 */}

      {/* Tabs */}
      <div className="tabs">
        {TYPES.map(t => (
          <button
            key={t}
            className={`tab-btn ${itemType === t ? "active" : ""}`}
            onClick={() => setItemType(t)}
          >
            {t}{t !== "原味" && `（共${t === "特價綜合" ? comboTotal : fillingTotal}/3）`}
          </button>
        ))}
      </div>

      {/* Selector */}
      <div className="selector">
        {itemType === "原味" && renderNumberRow("份數", plainCount, false, false, () => changePlain(-1), () => changePlain(1))}
        {itemType === "特價綜合" && FLAVORS.map(fl =>
          renderNumberRow(fl, comboCounts[fl], comboCounts[fl] === 0, comboTotal >= 3, () => changeCombo(fl, -1), () => changeCombo(fl, 1))
        )}
        {itemType === "內餡" && FLAVORS.map(fl =>
          renderNumberRow(fl, fillingCounts[fl], fillingCounts[fl] === 0, fillingTotal >= 3, () => changeFill(fl, -1), () => changeFill(fl, 1))
        )}
      </div>

      {/* 備註 */}
      <input className="note-input" value={note} placeholder="備註…" onChange={e => setNote(e.target.value)} />

            {/* 第一列按鈕 */}
      <div className="actions-row">
        <button className="action-btn direct" onClick={directSend}>🚀 直接送出</button>
        <button className="action-btn cart"   onClick={addToCart}>🛒 加入購物車</button>
      </div>

      {/* 購物車清單 */}
      {cart.length > 0 && (
        <div className="cart-list">
          {cart.map((it, i) => (
            <label key={i} className="cart-item">
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={() => toggleSelect(i)}
              />
              <span>{getItemLabel(it)}{it.note ? `（${it.note}）` : ""}</span>
            </label>
          ))}
        </div>
      )}

      {/* 第二列按鈕 */}
      {cart.length > 0 && (
-       <div className="cart-actions">
+       <div className="actions-row">
          <button className="action-btn clear" onClick={deleteOrClear}>
            🗑️ {selected.length ? "刪除選取" : "清空購物車"}
          </button>
          <button className="action-btn send" onClick={sendCart}>
            🚀 送出購物車訂單
          </button>
        </div>
      )}

}
