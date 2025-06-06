// src/pages/CompletedPage.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function CompletedPage() {
  const [combinedOrders, setCombinedOrders] = useState([]);

  useEffect(() => {
    const completedRef = ref(db, 'orders/completed');
    const unsubscribe = onValue(completedRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCombinedOrders([]);
        return;
      }

      // 1. 將 raw 資料轉成陣列
      const rawList = Object.entries(data).map(([firebaseKey, entry]) => ({
        firebaseKey,
        parentId: entry.parentId,        // 原始訂單 ID
        type: entry.type,
        flavors: entry.flavors || [],
        price: entry.price,
        timestamp: entry.timestamp,
        completed_at: entry.completed_at,
      }));

      // 2. 依 parentId 分組
      const grouped = {};
      rawList.forEach(item => {
        const pid = item.parentId;
        if (!grouped[pid]) {
          grouped[pid] = {
            parentId: pid,
            type: item.type,
            timestamp: item.timestamp,
            allFlavors: [],           // 合併後的口味
            lastCompletedAt: "",      // 最後完成時間
          };
        }
        // 收集所有口味
        grouped[pid].allFlavors.push(...item.flavors);

        // 更新最後完成時間為最大的 completed_at
        if (
          !grouped[pid].lastCompletedAt ||
          new Date(item.completed_at) > new Date(grouped[pid].lastCompletedAt)
        ) {
          grouped[pid].lastCompletedAt = item.completed_at;
        }
      });

      // 3. 移除重複口味
      Object.values(grouped).forEach(group => {
        group.allFlavors = Array.from(new Set(group.allFlavors));
      });

      // 4. 轉陣列並依 lastCompletedAt 排序（最新完成排前面）
      const combinedArray = Object.values(grouped).sort(
        (a, b) => new Date(b.lastCompletedAt) - new Date(a.lastCompletedAt)
      );

      setCombinedOrders(combinedArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎉 已完成訂單（合併顯示）</h2>

      {combinedOrders.length === 0 ? (
        <p>目前還沒有完成的訂單</p>
      ) : (
        combinedOrders.map((order, idx) => (
          <div
            key={order.parentId}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              backgroundColor: '#e0f7fa'
            }}
          >
            <p>🆔 原始訂單編號：{order.parentId}</p>
            <p>📦 類型：{order.type}</p>
            {order.allFlavors.length > 0 && (
              <p>
                🍥 合併口味：
                {order.allFlavors
                  .filter(f => !(order.type === "特價綜合雞蛋糕" && f === "原味"))
                  .join('、')}
              </p>
            )}
            <p>⏰ 下單時間：{new Date(order.timestamp).toLocaleString()}</p>
            <p>✅ 完成時間：{new Date(order.lastCompletedAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
