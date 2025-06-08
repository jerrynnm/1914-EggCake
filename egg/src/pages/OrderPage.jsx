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

  const changePlain = delta => setPlainCount(prev => Math.max(1, prev + delta));
  const changeCombo = (flavor, delta) => setComboCounts(prev => {
    const total = comboTotal + delta;
    if (total < 0 || total > 3) return prev;
    const cnt = prev[flavor] + delta; if (cnt < 0) return prev;
    return { ...prev, [flavor]: cnt };
  });
  const changeFilling = (flavor, delta) => setFillingCounts(prev => {
    const total = fillingTotal + delta;
    if (total < 0 || total > 3) return prev;
    const cnt = prev[flavor] + delta; if (cnt < 0) return prev;
    return { ...prev, [flavor]: cnt };
  });

  // 只重置當前品項的數量與備註，保留 itemType
  const resetForm = () => {
    if (itemType === "原味") setPlainCount(1);
    else if (itemType === "特價綜合") setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    else setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  const handleAddToCart = () => {
    let newItem;
    if (itemType === "原味") newItem = { type: itemType, plainCount, note };
    else if (itemType === "特價綜合" && comboTotal === 3) newItem = { type: itemType, comboCounts: { ...comboCounts }, note };
    else if (itemType === "內餡" && fillingTotal === 3) newItem = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    else { alert("請完成選擇後再加入"); return; }
    setCart(prev => [...prev, newItem]);
    resetForm();
  };

  const handleDirectSend = () => {
    // 同 handleAddToCart 但送出即清空
    // ...類似邏輯
  };

  const toggleSelect = idx => setSelectedIndices(prev =>
    prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
  );

  const handleSubmitCart = () => {
    if (!cart.length) { alert("購物車為空"); return; }
    console.log("送出購物車：", cart);
    alert("訂單已送出！");
    setCart([]); setSelectedIndices([]);
  };

  const handleClearOrDelete = () => {
    if (selectedIndices.length) {
      // 刪除勾選
      setCart(prev => prev.filter((_, i) => !selectedIndices.includes(i)));
    } else {
      // 清空全部
      setCart([]);
    }
    setSelectedIndices([]);
  };

  return (
    <div className="order-page-container">
      {/* 品項切換 */}
      <div className="item-selector">
        {ITEM_TYPES.map(item => (
          <button
            key={item.key}
            className="selector-btn full-width-large"
            onClick={() => setItemType(item.key)}
          >{item.label}</button>
        ))}
      </div>

      {/* 數量控制與備註 */}
      {itemType === "原味" && (
        <div className="form-group">
          <p>原味份數：</p>
          <button className="btn-number large" onClick={() => changePlain(-1)}>-</button>
          <span className="count-display large">{plainCount}</span>
          <button className="btn-number large" onClick={() => changePlain(1)}>+</button>
        </div>
      )}
      {/* 其他類似省略... */}

      <div className="action-buttons">
        <button onClick={handleAddToCart} className="btn-confirm-add full-width-large">🛒 加入購物車</button>
        <button onClick={handleDirectSend} className="btn-direct-send full-width-large">🚀 直接送出</button>
      </div>

      {/* 購物車區塊 */}
      {cart.length > 0 && (
        <div className="cart-section">
          <h2>購物車：</h2>
          <div className="cart-items">
            {cart.map((item, idx) => (
              <label key={idx} className="cart-item-card">
                <input
                  type="checkbox"
                  checked={selectedIndices.includes(idx)}
                  onChange={() => toggleSelect(idx)}
                  className="cart-checkbox"
                />
                <span>{/* 顯示 item 內容 */}</span>
              </label>
            ))}
          </div>
          <div className="cart-actions">
            <button onClick={handleClearOrDelete} className="btn-clear-cart full-width-large">🗑️ {selectedIndices.length ? '刪除選取' : '清空購物車'}</button>
            <button onClick={handleSubmitCart} className="btn-submit-cart full-width-large">🚀 送出購物車訂單</button>
          </div>
        </div>
      )}
    </div>
  );
}
