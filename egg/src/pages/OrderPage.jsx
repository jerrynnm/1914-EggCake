import React, { useState } from "react";
import "./OrderPage.css";

const FLAVORS = ["起士", "奧利奧", "黑糖"];
const ITEM_TYPES = [
  { key: "原味", label: "原味雞蛋糕" },
  { key: "特價綜合", label: "特價綜合雞蛋糕" },
  { key: "內餡", label: "內餡雞蛋糕" }
];

export default function OrderPage() {
  const [itemType, setItemType] = useState("原味");
  const [plainCount, setPlainCount] = useState(1);
  const [comboCounts, setComboCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  const comboTotal = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  const changePlain = (delta) => setPlainCount(prev => Math.max(1, prev + delta));
  const changeCombo = (flavor, delta) => setComboCounts(prev => {
    const newTotal = comboTotal + delta;
    if (newTotal < 0 || newTotal > 3) return prev;
    const count = prev[flavor] + delta;
    if (count < 0) return prev;
    return { ...prev, [flavor]: count };
  });
  const changeFilling = (flavor, delta) => setFillingCounts(prev => {
    const newTotal = fillingTotal + delta;
    if (newTotal < 0 || newTotal > 3) return prev;
    const count = prev[flavor] + delta;
    if (count < 0) return prev;
    return { ...prev, [flavor]: count };
  });

  // Reset only counts and note, keep current itemType
  const resetForm = () => {
    if (itemType === "原味") {
      setPlainCount(1);
    } else if (itemType === "特價綜合") {
      setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    } else {
      setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    }
    setNote("");
  };

  const handleAddToCart = () => {
    let newItem;
    if (itemType === "原味") newItem = { type: itemType, plainCount, note };
    else if (itemType === "特價綜合") {
      if (comboTotal !== 3) { alert("請選擇正好3顆口味"); return; }
      newItem = { type: itemType, comboCounts: { ...comboCounts }, note };
    } else {
      if (fillingTotal !== 3) { alert("請選擇正好3顆口味"); return; }
      newItem = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    }
    setCart(prev => [...prev, newItem]);
    resetForm();
  };

  const handleDirectSend = () => {
    let order;
    if (itemType === "原味") order = { type: itemType, plainCount, note };
    else if (itemType === "特價綜合" && comboTotal === 3) order = { type: itemType, comboCounts: { ...comboCounts }, note };
    else if (itemType === "內餡" && fillingTotal === 3) order = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    else { alert("請完成選擇後再送出"); return; }
    console.log("直接送出：", order);
    alert("訂單已直接送出！");
    resetForm();
  };

  const handleClearCart = () => {
    setCart([]);
    setSelectedIndices([]);
  };

  const handleSubmitCart = () => {
    if (cart.length === 0) { alert("購物車為空"); return; }
    console.log("送出購物車：", cart);
    alert("購物車訂單已送出！");
    setCart([]);
    setSelectedIndices([]);
  };

  const toggleSelect = (idx) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIndices.length === 0) { alert("請先勾選要刪除的項目"); return; }
    setCart(prev => prev.filter((_, idx) => !selectedIndices.includes(idx)));
    setSelectedIndices([]);
  };

  return (
    <div className="order-page-container">
      <h1 className="page-title">🍳 點餐頁面</h1>

      <div className="item-selector">
        {ITEM_TYPES.map(item => (
          <button
            key={item.key}
            className={`selector-btn ${itemType === item.key ? 'active' : ''}`}
            onClick={() => setItemType(item.key)}
          >{item.label}</button>
        ))}
      </div>

      {itemType === "原味" && (
        <div className="form-group">
          <p>原味份數：</p>
          <button onClick={() => changePlain(-1)}>-</button>
          <span>{plainCount}</span>
          <button onClick={() => changePlain(1)}>+</button>
        </div>
      )}

      {itemType === "特價綜合" && (
        <div className="form-group">
          <p>特價綜合（共{comboTotal}/3）：</p>
          {FLAVORS.map(flavor => (
            <div key={flavor} className="flavor-row">
              <span>{flavor}</span>
              <button onClick={() => changeCombo(flavor, -1)} disabled={comboCounts[flavor]===0}>-</button>
              <span>{comboCounts[flavor]}</span>
              <button onClick={() => changeCombo(flavor, 1)} disabled={comboTotal>=3}>+</button>
            </div>
          ))}
        </div>
      )}

      {itemType === "內餡" && (
        <div className="form-group">
          <p>內餡（共{fillingTotal}/3）：</p>
          {FLAVORS.map(flavor => (
            <div key={flavor} className="flavor-row">
              <span>{flavor}</span>
              <button onClick={() => changeFilling(flavor, -1)} disabled={fillingCounts[flavor]===0}>-</button>
              <span>{fillingCounts[flavor]}</span>
              <button onClick={() => changeFilling(flavor, 1)} disabled={fillingTotal>=3}>+</button>
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label>備註：
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="例如：不要加蔥..." />
        </label>
      </div>

      <div className="action-buttons">
        <button onClick={handleAddToCart} className="btn-confirm-add full-width">🛒 加入購物車</button>
        <button onClick={handleDirectSend} className="btn-direct-send full-width">🚀 直接送出</button>
      </div>

      {cart.length > 0 && (
        <div className="cart-section">
          <h2>購物車：</h2>
          <div className="cart-items">
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item-card">
                <input
                  type="checkbox"
                  checked={selectedIndices.includes(idx)}
                  onChange={() => toggleSelect(idx)}
                />
                <span>
                  {item.type}：
                  {item.type === "原味"
                    ? `${item.plainCount}份`
                    : item.type === "特價綜合"
                    ? FLAVORS.filter(fl => item.comboCounts[fl] > 0)
                        .map(fl => `${fl}×${item.comboCounts[fl]}`)
                        .join('、')
                    : FLAVORS.filter(fl => item.fillingCounts[fl] > 0)
                        .map(fl => `${fl}×${item.fillingCounts[fl]}`)
                        .join('、')
                  }
                </span>
              </div>
            ))}
          </div>
          <div className="cart-actions">
            <button onClick={handleSubmitCart} className="btn-submit-cart full-width">🚀 送出購物車訂單</button>
            <button onClick={handleDeleteSelected} className="btn-delete-selected full-width">❌ 刪除選取</button>
            <button onClick={handleClearCart} className="btn-clear-cart full-width">🗑️ 清空購物車</button>
          </div>
        </div>
      )}
    </div>
  );
}

