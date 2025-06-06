// src/pages/CookingPage.jsx
import React, { useState, useEffect } from "react";
import "./CookingPage.css";
import { listenPendingOrders } from "../firebase";

export default function CookingPage() {
  // (1) 用來存放 Firestore 撈回來、status==="pending" 的訂單清單
  const [pendingList, setPendingList] = useState([]);

  // (2) on mount 時，開始監聽 Firestore 的訂單
  useEffect(() => {
    // listenPendingOrders 會回傳 unsubscribe function
    const unsubscribe = listenPendingOrders((orders) => {
      setPendingList(orders);
    });
    return () => {
      unsubscribe();
    };
  }, []);

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
                {/* 你可以加入一個「將 status 改為 inProgress / done」的按鈕 */}
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
                    {Object.entries(item.comboCounts).map(([fl, cnt]) =>
                      cnt > 0 ? (
                        <li key={fl}>
                          {fl} × {cnt}
                        </li>
                      ) : null
                    )}
                  </ul>
                  {item.note && <p className="pending-note">備註：{item.note}</p>}
                </div>
              )}
              {item.type === "內餡" && (
                <div>
                  <p>內餡雞蛋糕：</p>
                  <ul className="sub-list">
                    {Object.entries(item.fillingCounts).map(([fl, cnt]) =>
                      cnt > 0 ? (
                        <li key={fl}>
                          {fl} × {cnt}
                        </li>
                      ) : null
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
