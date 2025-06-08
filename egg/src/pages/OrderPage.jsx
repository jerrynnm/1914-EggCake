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

  const changePlain = (delta) =>
    setPlainCount((prev) => Math.max(1, prev + delta));
  const changeCombo = (flavor, delta) =>
    setComboCounts((prev) => {
      const total = comboTotal + delta;
      if (total < 0 || total > 3) return prev;
      const cnt = prev[flavor] + delta;
      if (cnt < 0) return prev;
      return { ...prev, [flavor]: cnt };
    });
  const changeFilling = (flavor, delta) =>
    setFillingCounts((prev) => {
      const total = fillingTotal + delta;
      if (total < 0 || total > 3) return prev;
      const cnt = prev[flavor] + delta;
      if (cnt < 0) return prev;
      return { ...prev, [flavor]: cnt };
    });

  // 只重置當前品項的數量與備註，保留 itemType
  const resetForm = () => {
    if (itemType === "原味") setPlainCount(1);
    else if (itemType === "特價綜合")
      setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    else setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote("");
  };

  const handleAddToCart = () => {
    let newItem;
    if (itemType === "原味") newItem = { type: itemType, plainCount, note };
    else if (itemType === "特價綜合" && comboTotal === 3)
      newItem = { type: itemType, comboCounts: { ...comboCounts }, note };
    else if (itemType === "內餡" && fillingTotal === 3)
      newItem = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    else {
      alert("請完成選擇後再加入");
      return;
    }
    setCart((prev) => [...prev, newItem]);
    resetForm();
  };

  const handleDirectSend = () => {
    // 建立即下單並清空表單
    let order;
    if (itemType === "原味") order = { type: itemType, plainCount, note };
    else if (itemType === "特價綜合" && comboTotal === 3)
      order = { type: itemType, comboCounts: { ...comboCounts }, note };
    else if (itemType === "內餡" && fillingTotal === 3)
      order = { type: itemType, fillingCounts: { ...fillingCounts }, note };
    else {
      alert("請完成選擇後再送出");
      return;
    }
    console.log("直接送出：", order);
    alert("訂單已直接送出！");
    resetForm();
  };

  const toggleSelect = (idx) =>
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  const handleSubmitCart = () => {
    if (!cart.length) {
      alert("購物車為空");
      return;
    }
    console.log("送出購物車：", cart);
    alert("購物車訂單已送出！");
    setCart([]);
    setSelectedIndices([]);
  };

  const handleClearOrDelete = () => {
    if (selectedIndices.length) {
      // 刪除勾選
      setCart((prev) =>
        prev.filter((_, i) => !selectedIndices.includes(i))
      );
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
        {ITEM_TYPES.map((item) => (
          <button
            key={item.key}
            className={`selector-btn full-width-large ${
              itemType === item.key ? "active" : ""
            }`}
            onClick={() => setItemType(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 數量控制與備註 */}
      <div className="form-group">
        {itemType === "原味" && (
          <>
            <p>原味份數：</p>
            <button
              className="btn-number large"
              onClick={() => changePlain(-1)}
            >
              −
            </button>
            <span className="count-display large">{plainCount}</span>
            <button
              className="btn-number large"
              onClick={() => changePlain(1)}
            >
              ＋
            </button>
          </>
        )}
        {itemType === "特價綜合" && (
          <>
            <p>特價綜合 ({comboTotal}/3)：</p>
            {FLAVORS.map((fl) => (
              <React.Fragment key={fl}>
                <span>{fl}</span>
                <button
                  className="btn-number large"
                  disabled={comboCounts[fl] === 0}
                  onClick={() => changeCombo(fl, -1)}
                >
                  −
                </button>
                <span className="count-display large">
                  {comboCounts[fl]}
                </span>
                <button
                  className="btn-number large"
                  disabled={comboTotal >= 3}
                  onClick={() => changeCombo(fl, 1)}
                >
                  ＋
                </button>
              </React.Fragment>
            ))}
          </>
        )}
        {itemType === "內餡" && (
          <>
            <p>內餡 ({fillingTotal}/3)：</p>
            {FLAVORS.map((fl) => (
              <React.Fragment key={fl}>
                <span>{fl}</span>
                <button
                  className="btn-number large"
                  disabled={fillingCounts[fl] === 0}
                  onClick={() => changeFilling(fl, -1)}
                >
                  −
                </button>
                <span className="count-display large">
                  {fillingCounts[fl]}
                </span>
                <button
                  className="btn-number large"
                  disabled={fillingTotal >= 3}
                  onClick={() => changeFilling(fl, 1)}
                >
                  ＋
                </button>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      <div className="form-group">
        <input
          type="text"
          placeholder="備註（例如：不要加蔥...）"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="note-input"
        />
      </div>

      {/* 動作按鈕 */}
      <div className="action-buttons">
        <button
          onClick={handleAddToCart}
          className="btn-confirm-add full-width-large"
        >
          🛒 加入購物車
        </button>
        <button
          onClick={handleDirectSend}
          className="btn-direct-send full-width-large"
        >
          🚀 直接送出
        </button>
      </div>

      {/* 購物車列表 */}
      {cart.length > 0 && (
        <div className="cart-section">
          <h2>購物車：</h2>
          <div className="cart-items">
            {cart.map((item, idx) => {
              let desc;
              if (item.type === "原味") desc = `原味：${item.plainCount}份`;
              else if (item.type === "特價綜合")
                desc = FLAVORS.filter((f) => item.comboCounts[f] > 0)
                  .map((f) => `${f}×${item.comboCounts[f]}`)
                  .join("、");
              else
                desc = FLAVORS.filter((f) => item.fillingCounts[f] > 0)
                  .map((f) => `${f}×${item.fillingCounts[f]}`)
                  .join("、");

              return (
                <label key={idx} className="cart-item-card">
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(idx)}
                    onChange={() => toggleSelect(idx)}
                    className="cart-checkbox"
                  />
                  <span>{`${item.type}：${desc}`}</span>
                </label>
              );
            })}
          </div>
          <div className="cart-actions">
            <button
              onClick={handleClearOrDelete}
              className="btn-clear-cart full-width-large"
            >
              🗑️ {selectedIndices.length ? "刪除選取" : "清空購物車"}
            </button>
            <button
              onClick={handleSubmitCart}
              className="btn-submit-cart full-width-large"
            >
              🚀 送出購物車訂單
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
