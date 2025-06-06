// src/pages/OrderPage.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';

const FLAVORS = ["起士", "奧利奧", "黑糖"];

export default function OrderPage() {
  const [type, setType] = useState("原味雞蛋糕");
  const [flavors, setFlavors] = useState([]);
  const [message, setMessage] = useState("");

  const maxSelection = (type === "特價綜合雞蛋糕" || type === "內餡雞蛋糕") ? 3 : 0;

  const handleFlavorToggle = (flavor) => {
    if (flavors.includes(flavor)) {
      setFlavors(flavors.filter(f => f !== flavor));
    } else {
      if (flavors.length < maxSelection) {
        setFlavors([...flavors, flavor]);
      }
    }
  };

  const handleSubmit = async () => {
    const price = type === "原味雞蛋糕" ? 60 : type === "特價綜合雞蛋糕" ? 70 : 65;

    // 檢查口味限制
    if (maxSelection > 0 && flavors.length !== 3) {
      setMessage("請選擇三種口味");
      return;
    }

    const newOrder = {
      type,
      flavors: maxSelection > 0 ? flavors : [],
      price,
      timestamp: new Date().toISOString()
    };

    try {
      await push(ref(db, 'orders/pending'), newOrder);
      setMessage("✅ 訂單已送出！");
      setFlavors([]);
      setType("原味雞蛋糕");
    } catch (e) {
      setMessage("❌ 發生錯誤，請稍後再試");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🍳 點餐頁</h2>

      <label>選擇品項：</label>
      <select value={type} onChange={e => { setType(e.target.value); setFlavors([]); }}>
        <option>原味雞蛋糕</option>
        <option>特價綜合雞蛋糕</option>
        <option>內餡雞蛋糕</option>
      </select>

      {(type === "特價綜合雞蛋糕" || type === "內餡雞蛋糕") && (
        <>
          <p>請選擇三種口味：</p>
          <div style={{ display: "flex", gap: 10 }}>
            {FLAVORS.map(flavor => (
              <button
                key={flavor}
                onClick={() => handleFlavorToggle(flavor)}
                style={{
                  padding: "8px 12px",
                  background: flavors.includes(flavor) ? "#4caf50" : "#ddd",
                  borderRadius: 6
                }}
              >
                {flavor}
              </button>
            ))}
          </div>
          <p>已選：{flavors.join("、")}（{flavors.length}/3）</p>
        </>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: 6
        }}
      >
        🚀 送出訂單
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
