import React, { useState } from "react";
import "./OrderPage.css";

/**
 * 假設有三種口味：
 *   - 起士
 *   - 奧利奧
 *   - 黑糖
 */
const FLAVORS = ["起士", "奧利奧", "黑糖"];

export default function OrderPage() {
  // ──────────────────────────────────────────
  // 一、主要 State
  // ──────────────────────────────────────────
  // 1. 當前表單：選擇「餐點種類」（原味 / 特價綜合 / 內餡）
  const [itemType, setItemType] = useState("原味");

  // 2. 原味雞蛋糕｜份數（最少 1，無特殊上限，可自行調整）
  const [plainCount, setPlainCount] = useState(1);

  // 3. 特價綜合雞蛋糕｜口味組合（最多 3 顆，可重複同一口味）
  const [comboCounts, setComboCounts] = useState({
    起士: 0,
    奧利奧: 0,
    黑糖: 0,
  });

  // 4. 內餡雞蛋糕｜口味組合（最多 3 顆，可重複同一口味）
  const [fillingCounts, setFillingCounts] = useState({
    起士: 0,
    奧利奧: 0,
    黑糖: 0,
  });

  // 5. 備註（文字輸入框），每次加入購物車時歸零
  const [note, setNote] = useState("");

  // 6. 購物車（陣列）：每個元素都是一次「Add to Cart」時的紀錄
  //    會把 type、plainCount/comboCounts/fillingCounts，以及 note 一併放進去
  const [cart, setCart] = useState([]);

  // ──────────────────────────────────────────
  // 二、輔助函式
  // ──────────────────────────────────────────

  // 取得「特價綜合」已選總顆數
  const comboTotal = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  // 取得「內餡」已選總顆數
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  // 處理「點擊某口味」時：只要未超過 3 顆，就可以再加一顆
  const handleClickComboFlavor = (flavor) => {
    if (comboTotal >= 3) return; // 已達上限
    setComboCounts((prev) => ({
      ...prev,
      [flavor]: prev[flavor] + 1,
    }));
  };
  const handleClickFillingFlavor = (flavor) => {
    if (fillingTotal >= 3) return; // 已達上限
    setFillingCounts((prev) => ({
      ...prev,
      [flavor]: prev[flavor] + 1,
    }));
  };

  // 如果想提供「減少某口味」功能，可以再寫一個類似的
  const handleRemoveComboFlavor = (flavor) => {
    if (comboCounts[flavor] <= 0) return;
    setComboCounts((prev) => ({
      ...prev,
      [flavor]: prev[flavor] - 1,
    }));
  };
  const handleRemoveFillingFlavor = (flavor) => {
    if (fillingCounts[flavor] <= 0) return;
    setFillingCounts((prev) => ({
      ...prev,
      [flavor]: prev[flavor] - 1,
    }));
  };

  // 按下「加入購物車」時，先把目前選項＋備註存到 cart，然後重置對應欄位
  const handleAddToCart = () => {
    let newItem = null;

    if (itemType === "原味") {
      // 原味至少要 1 份
      if (plainCount < 1) {
        alert("請輸入至少 1 份原味雞蛋糕");
        return;
      }
      newItem = {
        type: "原味",
        plainCount,
        note: note.trim(), // 把備註也放進來
      };
    } else if (itemType === "特價綜合") {
      if (comboTotal !== 3) {
        alert("特價綜合雞蛋糕請選擇剛好 3 顆口味");
        return;
      }
      newItem = {
        type: "特價綜合",
        comboCounts: { ...comboCounts },
        note: note.trim(),
      };
    } else if (itemType === "內餡") {
      if (fillingTotal !== 3) {
        alert("內餡雞蛋糕請選擇剛好 3 顆口味");
        return;
      }
      newItem = {
        type: "內餡",
        fillingCounts: { ...fillingCounts },
        note: note.trim(),
      };
    }

    // 將 newItem 加入購物車
    setCart((prev) => [...prev, newItem]);

    // 加入後重置各個欄位：恢復到初始狀態
    setItemType("原味");
    setPlainCount(1);
    setComboCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setFillingCounts({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
    setNote(""); // 清空備註
  };

  // 刪除購物車內某一筆
  const handleRemoveCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // 按下「送出訂單」時，將整個購物車送到後端（或 Firebase），送完再清空
  const handleSubmitCart = async () => {
    if (cart.length === 0) {
      alert("購物車是空的，請先加入一筆訂單");
      return;
    }

    try {
      // --- 以下只是示意，請自行改成你的 Firebase / 後端寫法 ---
      console.log("要送出的購物車內容：", cart);
      // 例如：
      // const ordersRef = ref(database, "orders");
      // await push(ordersRef, { items: cart, createdAt: Date.now() });

      alert("訂單已送出，感謝訂購！");
      setCart([]); // 清空購物車
    } catch (err) {
      console.error(err);
      alert("送出訂單失敗，請重試");
    }
  };

  // ──────────────────────────────────────────
  // 三、畫面 JSX
  // ──────────────────────────────────────────
  return (
    <div className="order-page-container">
      {/* ── (1) 標題區 ──────────────────────────────────── */}
      <h1 className="page-title">🍳 點餐頁面</h1>

      {/* ── (2) 選擇餐點種類 ──────────────────────────────── */}
      <div className="form-group">
        <label style={{ fontSize: 14, fontWeight: 500 }}>
          選擇品項：
          <select
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="select-item-type"
          >
            <option value="原味">原味雞蛋糕</option>
            <option value="特價綜合">特價綜合雞蛋糕</option>
            <option value="內餡">內餡雞蛋糕</option>
          </select>
        </label>
      </div>

      {/* ── (3) 原味雞蛋糕：輸入「份數」 ─────────────────── */}
      {itemType === "原味" && (
        <div className="form-group">
          <label style={{ fontSize: 14, fontWeight: 500 }}>
            原味份數：
            <input
              type="number"
              min="1"
              value={plainCount}
              onChange={(e) =>
                setPlainCount(Math.max(parseInt(e.target.value) || 1, 1))
              }
              className="input-number"
            />
            <span style={{ marginLeft: 8, fontSize: 12 }}>(至少 1 份)</span>
          </label>
        </div>
      )}

      {/* ── (4) 特價綜合雞蛋糕：選擇口味（可重複，總共 3 顆） ──────── */}
      {itemType === "特價綜合" && (
        <div className="form-group">
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            請選擇三種口味（可重複，同口味最多 3 顆）：
          </p>
          <div className="flavor-buttons-container">
            {FLAVORS.map((flavor) => (
              <button
                key={flavor}
                type="button"
                className={`flavor-btn ${
                  comboCounts[flavor] > 0 ? "flavor-selected" : ""
                }`}
                onClick={() => handleClickComboFlavor(flavor)}
              >
                {flavor}
                {comboCounts[flavor] > 0 && (
                  <span className="flavor-count">
                    ×{comboCounts[flavor]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, marginTop: 4 }}>已選： ({comboTotal}/3)</p>
          {/* 想要提供「減少口味」的話，可以用 handleRemoveComboFlavor */}
        </div>
      )}

      {/* ── (5) 內餡雞蛋糕：選擇口味（可重複，總共 3 顆） ───────── */}
      {itemType === "內餡" && (
        <div className="form-group">
          <p style={{ fontSize: 14, fontWeight: 500 }}>
            請選擇三種口味（可重複，同口味最多 3 顆）：
          </p>
          <div className="flavor-buttons-container">
            {FLAVORS.map((flavor) => (
              <button
                key={flavor}
                type="button"
                className={`flavor-btn ${
                  fillingCounts[flavor] > 0 ? "flavor-selected" : ""
                }`}
                onClick={() => handleClickFillingFlavor(flavor)}
              >
                {flavor}
                {fillingCounts[flavor] > 0 && (
                  <span className="flavor-count">
                    ×{fillingCounts[flavor]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, marginTop: 4 }}>已選： ({fillingTotal}/3)</p>
        </div>
      )}

      {/* ── (6) 備註輸入欄 ─────────────────────────────────────── */}
      <div className="form-group">
        <label style={{ fontSize: 14, fontWeight: 500 }}>
          備註（可不填）：
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：不要加蔥、要熱的..."
            className="input-textarea"
          />
        </label>
      </div>

      {/* ── (7) 加入購物車 + 送出訂單 按鈕 ─────────────────────── */}
      <div className="order-action-buttons">
        <button
          type="button"
          className="btn-add-to-cart"
          onClick={handleAddToCart}
        >
          🛒 加入購物車
        </button>
        <button
          type="button"
          className="btn-submit-cart"
          onClick={handleSubmitCart}
        >
          🚀 送出訂單
        </button>
      </div>

      {/* ── (8) 購物車清單顯示 ───────────────────────────────────── */}
      {cart.length > 0 && (
        <div className="cart-container">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            購物車：
          </h2>
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item-card">
              {/* 如果是「原味」 */}
              {item.type === "原味" && (
                <>
                  <p style={{ margin: 0 }}>
                    【原味雞蛋糕】 × {item.plainCount} 份
                  </p>
                  {item.note && (
                    <p className="cart-note">備註：{item.note}</p>
                  )}
                </>
              )}

              {/* 如果是「特價綜合」 */}
              {item.type === "特價綜合" && (
                <div>
                  <p style={{ margin: 0 }}>【特價綜合雞蛋糕】</p>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {FLAVORS.map((fl) => {
                      const cnt = item.comboCounts[fl];
                      return cnt > 0 ? (
                        <li key={fl} style={{ fontSize: 13 }}>
                          {fl} × {cnt}
                        </li>
                      ) : null;
                    })}
                  </ul>
                  {item.note && (
                    <p className="cart-note">備註：{item.note}</p>
                  )}
                </div>
              )}

              {/* 如果是「內餡」 */}
              {item.type === "內餡" && (
                <div>
                  <p style={{ margin: 0 }}>【內餡雞蛋糕】</p>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    {FLAVORS.map((fl) => {
                      const cnt = item.fillingCounts[fl];
                      return cnt > 0 ? (
                        <li key={fl} style={{ fontSize: 13 }}>
                          {fl} × {cnt}
                        </li>
                      ) : null;
                    })}
                  </ul>
                  {item.note && (
                    <p className="cart-note">備註：{item.note}</p>
                  )}
                </div>
              )}

              <button
                className="btn-remove-cart-item"
                onClick={() => handleRemoveCartItem(idx)}
              >
                ❌ 刪除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
