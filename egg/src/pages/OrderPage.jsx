import React, { useState } from "react";
import "./OrderPage.css";

const FLAVORS = ["起士", "奧利奧", "黑糖"];

export default function OrderPage() {
  const [itemType, setItemType] = useState("原味");
  const [plainCount, setPlainCount] = useState(1);
  const [comboCounts, setComboCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);

  const comboTotal = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  // 增減函式
  const changePlain = (delta) => setPlainCount(prev => Math.max(1, prev + delta));
  const changeCombo = (flavor, delta) => {
    setComboCounts(prev => {
      const newTotal = comboTotal + delta;
      if (newTotal < 0 || newTotal > 3) return prev;
      const newCount = prev[flavor] + delta;
      if (newCount < 0 || newCount > 3) return prev;
      return { ...prev, [flavor]: newCount };
    });
  };
  const changeFilling = (flavor, delta) => {
    setFillingCounts(prev => {
      const newTotal = fillingTotal + delta;
      if (newTotal < 0 || newTotal > 3) return prev;
      const newCount = prev[flavor] + delta;
      if (newCount < 0 || newCount > 3) return prev;
      return { ...prev, [flavor]: newCount };
    });
  };

  const resetForm = () => {
    setItemType("原味");
    setPlainCount(1);
    setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  const handleAddToCart = () => {
    let newItem;
    if (itemType === "原味") {
      newItem = { type: itemType, plainCount, note };
    } else if (itemType === "特價綜合") {
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
    let single;
    if (itemType === "原味") {
      single = { type: itemType, plainCount, note };
    } else if (itemType === "特價綜合" && comboTotal === 3) {
      single = { type: itemType, comboCounts: { ...comboCounts }, note };
    } else if (itemType === "內餡" && fillingTotal === 3) {
      single = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    } else {
      alert("請完成選擇後再送出"); return;
    }
    console.log("直接送出：", single);
    alert("訂單已直接送出！");
    resetForm();
  };

  const handleClearCart = () => setCart([]);

  const handleSubmitCart = () => {
    if (cart.length === 0) { alert("購物車為空"); return; }
    console.log("送出購物車：", cart);
    alert("購物車訂單已送出！");
    setCart([]);
  };

  return (
    <div className="order-page-container">
      <h1 className="page-title">🍳 點餐頁面</h1>
      <div className="form-group">
        <label>選擇品項：
          <select value={itemType} onChange={e => setItemType(e.target.value)}>
            <option value="原味">原味雞蛋糕</option>
            <option value="特價綜合">特價綜合雞蛋糕</option>
            <option value="內餡">內餡雞蛋糕</option>
          </select>
        </label>
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
        <button onClick={handleAddToCart} className="btn-confirm-add">🛒 加入購物車</button>
        <button onClick={handleDirectSend} className="btn-direct-send">🚀 直接送出</button>
        <button onClick={handleClearCart} className="btn-clear-cart">🗑️ 清空購物車</button>
      </div>

      {cart.length > 0 && (
        <div className="temp-orders-section">
          <h2>購物車：</h2>
          {cart.map((item, idx) => (
            <div key={idx} className="temp-order-card">
              <p>{item.type}：
                {item.type === "原味" ? `${item.plainCount}份` :
                 item.type === "特價綜合" ? FLAVORS.map(fl=> item.comboCounts[fl]>0? `${fl}×${item.comboCounts[fl]}`:null).filter(Boolean).join('、') :
                 FLAVORS.map(fl=> item.fillingCounts[fl]>0? `${fl}×${item.fillingCounts[fl]}`:null).filter(Boolean).join('、')}
              </p>
              {item.note && <p>備註：{item.note}</p>}
            </div>
          ))}
          <button onClick={handleSubmitCart} className="btn-submit-temp-all">🚀 送出購物車訂單</button>
        </div>
      )}
    </div>
  );
}

