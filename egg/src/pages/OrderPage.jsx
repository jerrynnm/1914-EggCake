import React, { useState } from "react";
import "./OrderPage.css";

const FLAVORS = ["起士", "奧利奧", "黑糖"];
const TYPES = ["原味", "特價綜合", "內餡"];

export default function OrderPage() {
  const [itemType, setItemType] = useState("原味");
  const [plainCount, setPlainCount] = useState(1);
  const [comboCounts, setComboCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);

  const comboTotal = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  const changePlain = delta => setPlainCount(p => Math.max(1, p + delta));
  const changeCombo = (fl, d) => setComboCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));
  const changeFilling = (fl, d) => setFillingCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));

  const resetCounts = () => {
    if (itemType === "原味") setPlainCount(1);
    if (itemType === "特價綜合") setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    if (itemType === "內餡") setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  const addToCart = () => {
    let item = { type: itemType, note };
    if (itemType === "原味") item.count = plainCount;
    if (itemType === "特價綜合") {
      if (comboTotal !== 3) return alert("請選滿3顆");
      item.flavors = { ...comboCounts };
    }
    if (itemType === "內餡") {
      if (fillingTotal !== 3) return alert("請選滿3顆");
      item.flavors = { ...fillingCounts };
    }
    setCart(c => [...c, item]);
    resetCounts();
  };

  const toggleSelect = i => {
    setSelected(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]));
  };

  const submitCart = () => {
    if (cart.length === 0) return alert("購物車為空");
    console.log("送出", cart);
    alert("訂單送出");
    setCart([]);
    setSelected([]);
  };

  const clearOrDelete = () => {
    if (selected.length) setCart(c => c.filter((_, i) => !selected.includes(i)));
    else setCart([]);
    setSelected([]);
  };

  return (
    <div className="order-container">
      <div className="tabs">
        {TYPES.map(type => (
          <button
            key={type}
            className={`tab-btn ${itemType === type ? 'active' : ''}`}
            onClick={() => setItemType(type)}
          >
            {type}
            {type !== '原味' && (
              <span className="badge">
                {`(${type === '特價綜合' ? comboTotal : fillingTotal}/3)`}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="selector">
        {itemType === '原味' ? (
          <div className="number-row">
            <button className="num-btn" onClick={() => changePlain(-1)}>-</button>
            <span className="num-display">{plainCount}</span>
            <button className="num-btn" onClick={() => changePlain(1)}>+</button>
          </div>
        ) : (
          FLAVORS.map(flavor => (
            <div className="number-row" key={flavor}>
              <button
                className="num-btn"
                onClick={() =>
                  itemType === '特價綜合'
                    ? changeCombo(flavor, -1)
                    : changeFilling(flavor, -1)
                }
                disabled={
                  (itemType === '特價綜合' && comboCounts[flavor] === 0) ||
                  (itemType === '內餡' && fillingCounts[flavor] === 0)
                }
              >
                -
              </button>
              <span className="num-display">
                {itemType === '特價綜合' ? comboCounts[flavor] : fillingCounts[flavor]}
              </span>
              <button
                className="num-btn"
                onClick={() =>
                  itemType === '特價綜合'
                    ? changeCombo(flavor, 1)
                    : changeFilling(flavor, 1)
                }
                disabled={
                  (itemType === '特價綜合' && comboTotal >= 3) ||
                  (itemType === '內餡' && fillingTotal >= 3)
                }
              >
                +
              </button>
            </div>
          ))
        )}
      </div>

      <input
        type="text"
        className="note-input"
        placeholder="備註..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <div className="actions-row">
        <button className="action-btn cart" onClick={addToCart}>
          🛒 加入
        </button>
        <button className="action-btn send" onClick={submitCart}>
          🚀 送出
        </button>
        <button className="action-btn clear" onClick={clearOrDelete}>
          🗑️ {selected.length ? '刪除' : '清空'}
        </button>
      </div>

      <div className="cart-list">
        {cart.map((it, idx) => (
          <label key={idx} className="cart-item">
            <input
              type="checkbox"
              checked={selected.includes(idx)}
              onChange={() => toggleSelect(idx)}
            />
            <span>
              {it.type === '原味'
                ? `原味：${it.count}份`
                : Object.entries(it.flavors)
                    .filter(([, v]) => v > 0)
                    .map(([k, v]) => `${k}×${v}`)
                    .join('、')}
              {it.note ? `（${it.note}）` : ''}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
