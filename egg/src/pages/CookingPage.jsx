// src/pages/CookingPage.jsx
import React, { useState, useEffect } from "react";
import "./CookingPage.css";
import { listenPendingOrders, updateOrderStatus } from "../firebase";

export default function CookingPage() {
  // (1) 存放 Firestore 撈回來、status==="pending" 的訂單清單
  const [pendingList, setPendingList] = useState([]);

  // (2) on mount 時，開始監聽 Firestore 的訂單
  useEffect(() => {
    const unsubscribe = listenPendingOrders((orders) => {
      setPendingList(orders);
    });
    return unsubscribe;
  }, []);

  // 處理狀態更新
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      // 成功後 Firestore listener 會自動更新列表
    } catch (err) {
      console.error("Update status failed:", err);
      alert("更新訂單狀態失敗");
    }
  };

  return (
    <div className="cooking-page-container">
      <h1 className="page-title">🍳 製作中訂單</h1>

      {pendingList.length === 0 ? (
        <p className="empty-note">目前沒有製作中訂單。</p>
      ) : (
        <ul className="pending-list">
          {pendingList.map((item) => (
            <li key={item.id} className="pending-card">
              <div className="pending-header">
                <span className="pending-id">訂單 ID：{item.id}</span>
                <div className="status-buttons">
                  <button
                    className="action-btn cart"
                    onClick={() => handleStatusChange(item.id, "inProgress")}
                  >
                    開始製作
                  </button>
                  <button
                    className="action-btn send"
                    onClick={() => handleStatusChange(item.id, "done")}
                  >
                    標記完成
                  </button>
                </div>
              </div>

              {item.type === "原味" && (
                <p>
                  原味雞蛋糕 × {item.plainCount} 份
                  {item.note && <span className="pending-note">，備註：{item.note}</span>}
                </p>
              )}

              {item.type === "特價綜合" && (
                <div>
                  <p>特價綜合雞蛋糕：</p>
                  <ul className="sub-list">
                    {Object.entries(item.comboCounts).map(
                      ([fl, cnt]) =>
                        cnt > 0 && (
                          <li key={fl}>
                            {fl} × {cnt}
                          </li>
                        )
                    )}
                  </ul>
                  {item.note && <p className="pending-note">備註：{item.note}</p>}
                </div>
              )}

              {item.type === "內餡" && (
                <div>
                  <p>內餡雞蛋糕：</p>
                  <ul className="sub-list">
                    {Object.entries(item.fillingCounts).map(
                      ([fl, cnt]) =>
                        cnt > 0 && (
                          <li key={fl}>
                            {fl} × {cnt}
                          </li>
                        )
                    )}
                  </ul>
                  {item.note && <p className="pending-note">備註：{item.note}</p>}
                </div>
              )}

              <p className="small-text">
                下單時間：{item.createdAt?.toDate().toLocaleString() || "--"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
