import React, { useState } from "react";
import "./OrderPage.css";

const FLAVORS = ["起士", "奧利奧", "黑糖"];
const TYPES = ["原味", "特價綜合", "內餡"];

export default function OrderPage() {
  const [itemType, setItemType] = useState("原味");
  const [plainCount, setPlainCount] = useState(1);
  const [comboCounts, setComboCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [fillingCounts, setFillingCounts] = useState({ 起士: 0, 奧利奧: 0, 黑糖: 0 });
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);

  const comboTotal = Object.values(comboCounts).reduce((a, b) => a + b, 0);
  const fillingTotal = Object.values(fillingCounts).reduce((a, b) => a + b, 0);

  /* --- handlers --- */
  const changePlain = d => setPlainCount(p => Math.max(1, p + d));
  const changeCombo = (fl, d) => setComboCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));
  const changeFill  = (fl, d) => setFillingCounts(p => ({ ...p, [fl]: Math.max(0, p[fl] + d) }));

  const resetCounts = () => {
    if (itemType==='原味') setPlainCount(1);
    if (itemType==='特價綜合') setComboCounts({ 起士:0, 奧利奧:0, 黑糖:0 });
    if (itemType==='內餡')   setFillingCounts({ 起士:0, 奧利奧:0, 黑糖:0 });
    setNote("");
  };

  const addToCart = () => {
    let itm={ type:itemType, note };
    if (itemType==='原味') itm.count = plainCount;
    if (itemType==='特價綜合') { if (comboTotal!==3) return alert('請選滿3顆'); itm.flavors={...comboCounts}; }
    if (itemType==='內餡') { if (fillingTotal!==3) return alert('請選滿3顆'); itm.flavors={...fillingCounts}; }
    setCart(c=>[...c,itm]); resetCounts();
  };

  const directSend = () => { alert('已直接送出'); resetCounts(); };

  const toggle = idx => setSelected(s=>s.includes(idx)?s.filter(i=>i!==idx):[...s,idx]);

  const sendCart = () => { if(!cart.length) return alert('購物車空'); alert('已送出'); setCart([]); setSelected([]); };
  const deleteOrClear = () => { setCart(c=>selected.length?c.filter((_,i)=>!selected.includes(i)):[]); setSelected([]); };

  /* --- render helpers --- */
  const renderNumberRow = (label, value, minusDisabled, plusDisabled, onMinus, onPlus)=> (
    <div className="number-row" key={label}>
      <span className="flavor-label">{label}</span>
      <button className="num-btn" onClick={onMinus} disabled={minusDisabled}>-</button>
      <span className="num-display">{value}</span>
      <button className="num-btn" onClick={onPlus} disabled={plusDisabled}>+</button>
    </div>
  );

  return (
    <div className="order-container">
      {/* Tabs */}
      <div className="tabs">
        {TYPES.map(t=> (
          <button key={t} className={`tab-btn ${itemType===t?'active':''}`} onClick={()=>setItemType(t)}>
            {t}{t!=='原味' && `（共${t==='特價綜合'?comboTotal:fillingTotal}/3）`}
          </button>
        ))}
      </div>

      {/* Selector */}
      <div className="selector">
        {itemType==='原味' && renderNumberRow('份數', plainCount, false, false, ()=>changePlain(-1), ()=>changePlain(1))}
        {itemType==='特價綜合' && FLAVORS.map(fl=>renderNumberRow(fl, comboCounts[fl], comboCounts[fl]===0, comboTotal>=3, ()=>changeCombo(fl,-1), ()=>changeCombo(fl,1)))}
        {itemType==='內餡' && FLAVORS.map(fl=>renderNumberRow(fl, fillingCounts[fl], fillingCounts[fl]===0, fillingTotal>=3, ()=>changeFill(fl,-1), ()=>changeFill(fl,1)))}
      </div>

      {/* Note */}
      <input className="note-input" value={note} placeholder="備註…" onChange={e=>setNote(e.target.value)}/>

      {/* First action row */}
      <div className="actions-row">
        <button className="action-btn" onClick={directSend}>🚀 直接送出</button>
        <button className="action-btn" onClick={addToCart}>🛒 加入購物車</button>
      </div>

      {/* Cart list (between two button groups) */}
      {cart.length>0 && (
        <div className="cart-list">
          {cart.map((it,i)=>(
            <label key={i} className="cart-item">
              <input type="checkbox" checked={selected.includes(i)} onChange={()=>toggle(i)}/>
              <span>
                {it.type==='原味'?`原味：${it.count}份`:
                  Object.entries(it.flavors).filter(([,v])=>v>0).map(([k,v])=>`${k}×${v}`).join('、')}
                {it.note?`（${it.note}）`:''}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Second action row (delete left, send right) */}
      {cart.length>0 && (
        <div className="cart-actions">
          <button className="action-btn" onClick={deleteOrClear}>🗑️ {selected.length?"刪除選取":"清空購物車"}</button>
          <button className="action-btn" onClick={sendCart}>🚀 送出購物車訂單</button>
        </div>
      )}
    </div>
  );
}
