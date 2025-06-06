// src/pages/CookingPage.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';

const FLAVORS = ["起士", "奧利奧", "黑糖"];

export default function CookingPage() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState({});           // { [orderId]: [flavor1, flavor2, …] }
  const [editingOrder, setEditingOrder] = useState(null); // 目前正在編輯的訂單物件
  const [editFlavors, setEditFlavors] = useState([]);     // 編輯視窗的口味暫存

  // 監聽 Firebase /orders/pending
  useEffect(() => {
    const ordersRef = ref(db, 'orders/pending');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, order]) => ({ id, ...order }));
        setOrders(list);
      } else {
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 切換選取：針對某筆訂單的某個口味加/移除
  const toggleSelect = (orderId, flavor) => {
    setSelected(prev => {
      const current = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: current.includes(flavor)
          ? current.filter(f => f !== flavor)
          : [...current, flavor]
      };
    });
  };

  // 完成按鈕：分「整筆」與「部分」
  const handleComplete = async (order) => {
    const pick = selected[order.id] || [];
    const allFlavors = order.flavors || [];

    // 如果未勾選或全部都勾，則視為整筆完成
    if (pick.length === 0 || pick.length === allFlavors.length) {
      // 移到 /orders/completed
      await push(ref(db, 'orders/completed'), {
        ...order,
        completed_at: new Date().toISOString(),
      });
      // 刪除 /orders/pending/{id}
      await remove(ref(db, `orders/pending/${order.id}`));
    } else {
      // 部分完成：把選中的那幾顆塞到 completed，剩下的更新回 pending
      const remaining = allFlavors.filter(f => !pick.includes(f));
      const donePart = {
        type: order.type,
        flavors: pick,
        price: order.price,
        timestamp: order.timestamp,
        completed_at: new Date().toISOString(),
      };
      await push(ref(db, 'orders/completed'), donePart);
      await update(ref(db, `orders/pending/${order.id}`), { flavors: remaining });
    }

    setSelected(prev => ({ ...prev, [order.id]: [] }));
  };

  // 刪除按鈕：分「整筆」與「部分」
  const handleDelete = async (order) => {
    const pick = selected[order.id] || [];
    const allFlavors = order.flavors || [];

    if (pick.length === 0 || pick.length === allFlavors.length) {
      // 整筆刪除
      await remove(ref(db, `orders/pending/${order.id}`));
    } else {
      // 部分刪除：剩下的更新回 pending
      const remaining = allFlavors.filter(f => !pick.includes(f));
      await update(ref(db, `orders/pending/${order.id}`), { flavors: remaining });
    }

    setSelected(prev => ({ ...prev, [order.id]: [] }));
  };

  // 打開編輯視窗
  const openEdit = (order) => {
    setEditingOrder(order);
    setEditFlavors(order.flavors ? [...order.flavors] : []);
  };

  // 編輯視窗內切換口味
  const toggleEditFlavor = (flavor) => {
    if (editFlavors.includes(flavor)) {
      setEditFlavors(editFlavors.filter(f => f !== flavor));
    } else {
      // 特價或內餡最多三顆 ／ 原味任意（其實原味無法在這編輯）
      if (editFlavors.length < 3) {
        setEditFlavors([...editFlavors, flavor]);
      }
    }
  };

  // 儲存編輯後內容
  const saveEdit = async () => {
    if (!editingOrder) return;
    // 更新 Firebase pending
    await update(ref(db, `orders/pending/${editingOrder.id}`), {
      flavors: editFlavors
    });
    setEditingOrder(null);
    setEditFlavors([]);
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingOrder(null);
    setEditFlavors([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🍳 製作頁</h2>

      {orders.length === 0 ? (
        <p>目前沒有待製作的訂單</p>
      ) : (
        orders.map((order, idx) => (
          <div
            key={order.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              backgroundColor: '#fff8dc'
            }}
          >
            <p>🆔 訂單編號：{idx + 1}</p>
            <p>📦 類型：{order.type}</p>
            <p>⏰ 下單時間：{new Date(order.timestamp).toLocaleString()}</p>

            {order.flavors && order.flavors.length > 0 && (
              <div>
                <p>🍥 餐點內容：</p>
                {order.flavors.map((flavor, i) => {
                  // 如果是特價綜合且口味是「原味」，則不顯示
                  if (order.type === "特價綜合雞蛋糕" && flavor === "原味") {
                    return null;
                  }
                  return (
                    <label
                      key={i}
                      style={{ display: 'block', marginLeft: 8, marginBottom: 4 }}
                    >
                      <input
                        type="checkbox"
                        checked={selected[order.id]?.includes(flavor) || false}
                        onChange={() => toggleSelect(order.id, flavor)}
                      />
                      {flavor}
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleComplete(order)}
                style={{
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px'
                }}
              >
                ✅ 完成
              </button>
              <button
                onClick={() => handleDelete(order)}
                style={{
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px'
                }}
              >
                🗑️ 刪除
              </button>
              <button
                onClick={() => openEdit(order)}
                style={{
                  backgroundColor: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px'
                }}
              >
                ✏️ 修改
              </button>
            </div>
          </div>
        ))
      )}

      {/* 編輯彈窗 */}
      {editingOrder && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '2px solid #ccc',
            padding: 20,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <h4>✏️ 編輯訂單 - {editingOrder.type}</h4>

          {(editingOrder.type === "特價綜合雞蛋糕" ||
            editingOrder.type === "內餡雞蛋糕") ? (
            <>
              <p>🍥 選擇口味（最多 3 種）：</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {FLAVORS.map(flavor => (
                  <button
                    key={flavor}
                    onClick={() => toggleEditFlavor(flavor)}
                    style={{
                      backgroundColor: editFlavors.includes(flavor) ? '#4caf50' : '#ddd',
                      color: '#000',
                      borderRadius: 6,
                      padding: '6px 12px'
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: 8 }}>
                已選：{editFlavors.join('、')}
              </p>
            </>
          ) : (
            <p>原味雞蛋糕無可編輯內容。</p>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button
              onClick={saveEdit}
              style={{
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px'
              }}
            >
              ✅ 儲存
            </button>
            <button
              onClick={cancelEdit}
              style={{
                backgroundColor: '#9e9e9e',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px'
              }}
            >
              ❌ 取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
