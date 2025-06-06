// src/App.jsx
import React, { useState } from 'react';
import OrderPage from './pages/OrderPage';
import CookingPage from './pages/CookingPage';
import CompletedPage from './pages/CompletedPage';

export default function App() {
  const [tab, setTab] = useState('order'); // 預設顯示點餐頁

  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, padding: 20, backgroundColor: '#f5f5f5' }}>
        <button onClick={() => setTab('order')}>🛒 點餐</button>
        <button onClick={() => setTab('cooking')}>🍳 製作</button>
        <button onClick={() => setTab('completed')}>✅ 完成</button>
      </nav>

      <div>
        {tab === 'order' && <OrderPage />}
        {tab === 'cooking' && <CookingPage />}
        {tab === 'completed' && <CompletedPage />}
      </div>
    </div>
  );
} // ✅ 這行補回來！
