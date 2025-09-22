"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Bond Memory — Teach → Intro → Play (pure memory + stacked formula)
 * -------------------------------------------------------------------------
 * • Years shown as solid integers.
 * • Example never suggests which wand to pick.
 * • PLAY shows a big fraction-style formula (stacked numerator/denominator). Drag numbers into slots.
 * • ALL matched pairs (right or wrong) get added to the collection.
 * • Memory logic: first card stays up until the second is clicked; on mismatch, both flip back after a short delay.
 * • Wands labeled: Wand A (Zero‑coupon), Wand B (Coupon). No cursor tricks.
 * • Teaching includes a numeric timeline (CPN=11, m=2, years=2) marking each payment and the FV at maturity.
 */

type Scene = "TEACH" | "INTRO" | "PLAY";

type Question = {
  face: number;      // FV
  couponRate: number;// annual coupon rate
  ytm: number;       // annual YTM
  years: number;     // integer years to maturity
  m: number;         // payments per year (1,2,4,12)
};

type Card = { id: string; value: number; faceUp: boolean; matched: boolean };

type ChipKey = "CPN" | "FV" | "N" | "y";
// NUMBER-ONLY chips so the memory game stays independent
type Chip = { value: number };

function randFrom<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function fmtMoney(x: number) { return `$${x.toFixed(2)}`; }
function roundN(x: number) { 
  // For very small numbers, keep more precision but round long decimals
  if (Math.abs(x) > 100) return x.toFixed(0);
  if (Math.abs(x) > 10) return x.toFixed(2);
  if (Math.abs(x) > 1) return x.toFixed(3);
  // For small decimals like 0.025, keep as is, but round very long decimals
  return x.toFixed(4);
}

function makeQuestion(): Question {
  const faces = [100, 500, 1000];
  const face = randFrom(faces);
  const hasCoupon = Math.random() < 0.667; // 2/3 coupon, 1/3 zero-coupon
  const couponRate = hasCoupon ? randFrom([0.0125, 0.0175, 0.02, 0.03, 0.04]) : 0;
  const ytm = randFrom([0.03, 0.04, 0.05, 0.06, 0.08]);
  const years = randFrom([2, 3]); // keep small for easy mental picture
  const m = randFrom([1, 2, 4, 12]);
  return { face, couponRate, ytm, years, m };
}

function deriveParams(q: Question) {
  const N = q.m * q.years;                   // total periods
  const y = q.ytm / q.m;                     // per‑period rate
  const CPN = (q.couponRate * q.face) / q.m; // per‑period coupon payment
  const annuity = y > 0 ? (1 / y) * (1 - 1 / Math.pow(1 + y, N)) : N;
  const P_coupon = CPN * annuity + q.face / Math.pow(1 + y, N);
  const P_zero = q.face / Math.pow(1 + y, N);
  return { N, y, CPN, P_coupon, P_zero };
}

export default function BondMemoryPage() {
  const [scene, setScene] = useState<Scene>("TEACH");
  const [q, setQ] = useState<Question>(() => makeQuestion());
  const params = useMemo(() => deriveParams(q), [q]);

  // Wand A = ZERO, Wand B = COUPON (just switches formula; no judgement)
  const [wand, setWand] = useState<null | "A" | "B">(null);
  const [wandWarning, setWandWarning] = useState<string>("");

  const boardRef = useRef<HT6MLDivElement>(null);

  // Required keys depend on wand
  const requiredKeys = useMemo(() => (wand === "B" ? (['CPN','FV','N','y'] as const) : (['FV','N','y'] as const)), [wand]);
  const requiredMap = useMemo(() => ({ CPN: params.CPN, FV: q.face, N: q.m * q.years, y: params.y }), [params, q]);

  // PLAY state
  const [cards, setCards] = useState<Card[]>([]);
  const [openId, setOpenId] = useState<string | null>(null); // single open card (unmatched)
  const [lockBoard, setLockBoard] = useState(false);         // block clicks during flip-back delay
  const [collected, setCollected] = useState<Chip[]>([]);    // all matched numbers
  const [slotValues, setSlotValues] = useState<Partial<Record<ChipKey, number>>>({});
  const [message, setMessage] = useState<string>("");

  // Check if device supports cursor (not touch devices)
  const supportsCursor = typeof window !== 'undefined' && !('ontouchstart' in window);

  // Simple confetti
  function burstConfetti(n = 18) {
    const host = boardRef.current || document.body; const rect = host.getBoundingClientRect();
    const x = rect.left + rect.width/2; const y = rect.top + 120;
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div'); const size = 6 + Math.random() * 6;
      d.style.position = 'fixed'; d.style.left = `${x + (Math.random()*60 - 30)}px`; d.style.top = `${y + (Math.random()*20 - 10)}px`;
      d.style.width = `${size}px`; d.style.height = `${size}px`; d.style.borderRadius = Math.random() < 0.3 ? '50%' : '4px';
      d.style.background = ['#fde68a','#bbf7d0','#bfdbfe','#fbcfe8'][Math.floor(Math.random()*4)]; d.style.pointerEvents = 'none'; d.style.opacity = '0.95';
      const xVel = (Math.random() - 0.5) * 2.2; const yVel0 = - (Math.random() * 2 + 3);
      let xPos = 0, yPos = 0; let yVel = yVel0, life = 0; const gravity = 0.07;
      host.appendChild(d);
      const tick = () => { life += 1; xPos += xVel; yVel += gravity; yPos += yVel; d.style.transform = `translate(${xPos}px, ${yPos}px) rotate(${life*7}deg)`; d.style.opacity = String(Math.max(0, 1 - life/70)); if (life < 70) requestAnimationFrame(tick); else d.remove(); };
      requestAnimationFrame(tick);
    }
  }

  // Example (no wand suggestion)
  const exampleText = (
    <>
      Face value <b>{fmtMoney(q.face)}</b>. Matures in <b>{q.years}</b> years. Market YTM <b>{(q.ytm * 100).toFixed(1)}%</b> per year.
      Payments per year <b>m = {q.m}</b> ({q.m===1?'annual':q.m===2?'semiannual':q.m===4?'quarterly':'monthly'}).
      {q.couponRate > 0 && <> Coupon rate <b>{(q.couponRate*100).toFixed(1)}%</b>.</>}
    </>
  );

  // Build pairs (ALL exact pairs; include required + distractor pairs → 8 pairs total)
  useEffect(() => {
    if (scene !== 'PLAY' || !wand) return;
    const reqVals: number[] = (requiredKeys as readonly ChipKey[]).map(k => requiredMap[k]);
    
    
    // Create distractors with better precision for small values
    const distractorSeeds: number[] = []; 
    const near = (v: number) => { 
      const mag = Math.abs(v) > 100 ? 1 : Math.abs(v) > 10 ? 0.5 : Math.abs(v) > 1 ? 0.1 : 0.005; 
      return [v+mag, v-mag]; 
    };
    reqVals.forEach(v => distractorSeeds.push(...near(v)));
    
    // Ensure ALL required values are included as exact pairs
    const pairs: number[] = []; 
    reqVals.forEach(v => pairs.push(v, v)); // Each required value appears exactly twice
    
    // Fill remaining slots with distractors
    let i = 0; 
    while(pairs.length < 16) { 
      const val = distractorSeeds[i % distractorSeeds.length]; 
      pairs.push(val, val); 
      i++; 
    }
    
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((v,i)=>({ id:`c${i}-${Math.random().toString(36).slice(2,6)}`, value:v, faceUp:false, matched:false })));
    setOpenId(null); setLockBoard(false); setCollected([]); setSlotValues({});
    setMessage("Flip two cards. If they match, they stay. Drag collected numbers into the formula.");
  }, [scene, wand, q, requiredKeys, requiredMap]);

  function resetAll(){ setQ(makeQuestion()); setWand(null); setWandWarning(""); setScene('TEACH'); }

  // Validate wand choice against bond type
  function validateWandChoice(selectedWand: "A" | "B") {
    const isCouponBond = q.couponRate > 0;
    const isCorrectChoice = (selectedWand === "A" && !isCouponBond) || (selectedWand === "B" && isCouponBond);
    
    if (!isCorrectChoice) {
      const bondType = isCouponBond ? "coupon" : "zero-coupon";
      const correctWand = isCouponBond ? "Wand B (Coupon)" : "Wand A (Zero-coupon)";
      setWandWarning(`⚠️ Wrong wand! This is a ${bondType} bond. You should use ${correctWand}.`);
      return false;
    } else {
      setWandWarning("");
      return true;
    }
  }

  // PURE memory logic with single open card & board lock during flip-back
  function onFlip(cardId: string){
    if (lockBoard) return; // prevent mid-delay clicks
    const idx = cards.findIndex(c=>c.id===cardId); if (idx<0) return;
    const card = cards[idx]; if (card.matched || card.faceUp) return;

    // flip up instantly
    setCards(prev => prev.map((c,i)=> i===idx ? { ...c, faceUp:true } : c));

    if (openId === null){ setOpenId(cardId); return; }

    // second of a pair
    const other = cards.find(c=>c.id===openId);
    if (!other) { setOpenId(null); return; }

    if (other.value === card.value){
      // match: keep both, collect a chip
      setCards(prev => prev.map(c => (c.id===openId || c.id===cardId) ? { ...c, matched:true, faceUp:true } : c));
      setCollected(prev => prev.some(ch => Math.abs(ch.value - card.value) < 1e-9) ? prev : [...prev, { value: card.value }]);
      burstConfetti(14);
      setOpenId(null);
    } else {
      // mismatch: slight delay then flip both back
      setLockBoard(true);
      setTimeout(() => {
        setCards(prev => prev.map(c => (c.id===openId || c.id===cardId) && !c.matched ? { ...c, faceUp:false } : c));
        setLockBoard(false);
      }, 420);
      setOpenId(null);
    }
  }

  // Drag & Drop chips → slots (no correctness hint on drop; validate on Finish)
  function onDragStartChip(e: React.DragEvent<HTMLDivElement>, chip: Chip) { 
    e.dataTransfer.setData('application/x-bond-chip', JSON.stringify(chip)); 
  }
  function onDropSlot(e: React.DragEvent<HTMLDivElement>, key: ChipKey) {
    const raw = e.dataTransfer.getData('application/x-bond-chip'); 
    if (!raw) return; 
    const chip: Chip = JSON.parse(raw);
    setSlotValues(prev => ({ ...prev, [key]: chip.value })); 
    setCollected(prev => prev.filter(c => Math.abs(c.value - chip.value) > 1e-9));
  }
  function onDragOverSlot(e: React.DragEvent<HTMLDivElement>) { 
    e.preventDefault(); 
  }
  
  // Function to return chip to collected area when removed from slot
  function returnChipToCollected(value: number) {
    setCollected(prev => [...prev, { value }]);
  }

  // Finish check only
  const allPlaced = requiredKeys.every(k => slotValues[k as keyof typeof slotValues] !== undefined);
  function onDone(){
    // Check if wrong wand was used
    if (wand && !validateWandChoice(wand)) {
      setMessage('You chose the wrong formula for this bond type. Please go back and select the correct wand.');
      return;
    }
    
    if (!allPlaced) { setMessage('Place all required numbers into the formula first.'); return; }
    
    // Check each slot individually and provide specific feedback
    const errors: string[] = [];
    const correctValues: string[] = [];
    
    (requiredKeys as readonly ChipKey[]).forEach(k => {
      const userValue = slotValues[k as keyof typeof slotValues] as number;
      const correctValue = requiredMap[k];
      const isCorrect = Math.abs(userValue - correctValue) < 1e-9;
      
      if (!isCorrect) {
        const keyName = k === 'CPN' ? 'Coupon Payment (CPN)' : 
                       k === 'FV' ? 'Face Value (FV)' : 
                       k === 'N' ? 'Number of Periods (N)' : 
                       k === 'y' ? 'Per-period Yield to Maturity (y)' : k;
        errors.push(`${keyName}: You have ${roundN(userValue)}, but it should be ${roundN(correctValue)}`);
      } else {
        const keyName = k === 'CPN' ? 'Coupon Payment (CPN)' : 
                       k === 'FV' ? 'Face Value (FV)' : 
                       k === 'N' ? 'Number of Periods (N)' : 
                       k === 'y' ? 'Per-period Yield to Maturity (y)' : k;
        correctValues.push(keyName);
      }
    });
    
    if (errors.length === 0) {
      const price = wand === 'B' ? params.P_coupon : params.P_zero;
      setMessage(`Correct! Bond price = ${fmtMoney(price)}`);
      burstConfetti(28);
    } else {
      const errorText = errors.join('; ');
      setMessage(`Not quite right. Check these values: ${errorText}. Try again!`);
    }
  }

  // ---------- UI helpers ----------
  const SlotBox: React.FC<{ k: ChipKey; value?: number }> = ({ k, value }) => (
    <div 
      onDrop={(e)=>onDropSlot(e,k)} 
      onDragOver={onDragOverSlot} 
      className="inline-flex min-w-[64px] justify-center items-center px-2 py-1 rounded-lg border bg-white/80 relative"
      style={{ 
        cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "default") : "default"
      }}
    >
      {value !== undefined ? (
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">{k==='y'? (value as number).toFixed(4) : k==='CPN'? (value as number).toFixed(2) : String(value)}</span>
          <button 
            onClick={() => {
              const currentValue = slotValues[k as keyof typeof slotValues];
              if (currentValue !== undefined) {
                returnChipToCollected(currentValue as number);
              }
              setSlotValues(prev => ({ ...prev, [k]: undefined }));
            }}
            className="text-red-500 hover:text-red-700 text-xs font-bold ml-1"
            title="Remove this value"
            style={{ 
              cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "pointer") : "pointer"
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <span className="text-stone-400 text-xs">drop</span>
      )}
    </div>
  );

  const Frac: React.FC<{ top: React.ReactNode; bot: React.ReactNode }> = ({ top, bot }) => (
    <div className="inline-flex flex-col items-stretch align-middle mx-1">
      <div className="px-1 pb-1 flex items-center justify-center">{top}</div>
      <div className="border-t border-stone-400"></div>
      <div className="px-1 pt-1 flex items-center justify-center">{bot}</div>
    </div>
  );

  // Scenes
  function Teach(){
    // Short, concrete timeline demo: CPN=11, m=2, years=2 → 4 coupons; FV shown at end
    const demo = { CPN: 11, m: 2, years: 2, FV: 100 };
    const ticks = demo.m * demo.years; // 4
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Bond Pricing — Quick Guide</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-indigo-200 bg-white/70 p-4 shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">Wand A — Zero‑Coupon <img src="/images/wand1.png" alt="Wand A" className="w-5 h-5" /></h3>
            <ul className="text-sm text-stone-800 list-disc pl-5 space-y-1">
              <li>No coupons. One payment at maturity (FV).</li>
              <li>Discount that payment back to today.</li>
            </ul>
            <div className="mt-2 text-sm"><code>P = FV / (1 + y)^N</code></div>
            <div className="text-xs text-stone-600 mt-1">y = YTM/m; N = m × years.</div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white/70 p-4 shadow-sm">
            <h3 className="font-medium mb-2 flex items-center gap-2">Wand B — Coupon <img src="/images/wand2.png" alt="Wand B" className="w-5 h-5" /></h3>
            <ul className="text-sm text-stone-800 list-disc pl-5 space-y-1">
              <li>m payments per year (1, 2, 4, or 12).</li>
              <li>Per‑period coupon CPN = coupon rate × FV / m.</li>
              <li>Price = value of coupon stream + value of FV.</li>
            </ul>
            <div className="mt-2 text-sm"><code>P = CPN × ((1 − 1/(1+y)^N)/y) + FV/(1+y)^N</code></div>
            <div className="text-xs text-stone-600 mt-1">y = YTM/m; N = m × years.</div>
          </div>
        </div>

        {/* Numeric timeline demo (short horizon) */}
        <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
          <div className="font-medium mb-2 text-stone-800">Timeline demo (semiannual, {demo.years} years): CPN = {demo.CPN}, FV = {demo.FV}</div>
          
          {/* Horizontal timeline with connecting line */}
          <div className="relative">
            {/* Horizontal line representing time */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-stone-400"></div>
            
            <div className="flex justify-between items-center relative">
              {[...Array(ticks)].map((_,i)=> (
                <div key={i} className="flex flex-col items-center relative">
                  {/* Vertical line from timeline */}
                  <div className="h-8 w-0.5 bg-stone-300 mb-2"/>
                  <div className="text-xs font-medium">{demo.CPN}</div>
                  <div className="text-[10px] text-stone-500">t{i+1}</div>
                </div>
              ))}
              <div className="flex flex-col items-center relative">
                {/* Vertical line from timeline */}
                <div className="h-10 w-0.5 bg-stone-400 mb-2"/>
                <div className="text-xs font-semibold">{demo.CPN} + FV</div>
                <div className="text-[10px] text-stone-500">maturity</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-stone-600">Each tick is one period. Here m=2 (semiannual), so N = m×years = {ticks} periods.</div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border bg-emerald-200 hover:bg-emerald-300" onClick={() => setScene('INTRO')}>Begin →</button>
        </div>
      </div>
    );
  }

  function Intro(){
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">This Round's Example</h2>
        <div className="p-4 rounded-2xl border bg-white/70 shadow-sm">
          <p className="text-sm text-stone-800">{exampleText}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-stone-700">Pick formula mode:</span>
          <button className={`px-3 py-2 rounded-xl border text-sm transition flex items-center gap-2 ${wand === 'A' ? 'bg-indigo-200 border-indigo-400' : 'bg-white/90 border-stone-300 hover:bg-indigo-50'}`} onClick={() => { setWand('A'); validateWandChoice('A'); }} title="Zero-coupon">
            <img src="/images/wand1.png" alt="Wand A" className="w-5 h-5" />
            Wand A (Zero‑coupon)
          </button>
          <button className={`px-3 py-2 rounded-xl border text-sm transition flex items-center gap-2 ${wand === 'B' ? 'bg-amber-200 border-amber-400' : 'bg-white/90 border-stone-300 hover:bg-amber-50'}`} onClick={() => { setWand('B'); validateWandChoice('B'); }} title="Coupon bond">
            <img src="/images/wand2.png" alt="Wand B" className="w-5 h-5" />
            Wand B (Coupon)
          </button>
          <button className="px-4 py-2 rounded-xl border bg-emerald-200 hover:bg-emerald-300 disabled:opacity-50" disabled={!wand} onClick={() => setScene('PLAY')}>Start Game →</button>
          <button className="px-4 py-2 rounded-xl border" onClick={() => { setQ(makeQuestion()); setWand(null); setWandWarning(""); }}>New Example</button>
        </div>
        {wandWarning && (
          <div className="mt-2 p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">
            {wandWarning}
          </div>
        )}
      </div>
    );
  }

  function Play(){
    const slots = (wand==='B'? ['CPN','FV','N','y'] : ['FV','N','y']) as ChipKey[];

    return (
      <div className="space-y-4">
        {/* Example panel pinned on PLAY */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="text-sm text-stone-800">
            <div className="font-medium mb-1">Formula (drag into slots):</div>
            {/* Big stacked formula */}
            {wand === 'B' ? (
              <div className="text-base">
                <span>P = </span>
                <span className="inline-flex items-center gap-2">
                  <SlotBox k='CPN' value={slotValues['CPN']} />
                  <span>×</span>
                  <Frac
                    top={<span className="inline-flex items-center gap-1">(1 − <Frac top={<span>1</span>} bot={<span>(1 + <SlotBox k='y' value={slotValues['y']} />)<sup><SlotBox k='N' value={slotValues['N']} /></sup></span>} />)</span>}
                    bot={<SlotBox k='y' value={slotValues['y']} />}
                  />
                  <span> + </span>
                  <Frac
                    top={<SlotBox k='FV' value={slotValues['FV']} />}
                    bot={<span>(1 + <SlotBox k='y' value={slotValues['y']} />)<sup><SlotBox k='N' value={slotValues['N']} /></sup></span>}
                  />
                </span>
              </div>
            ) : (
              <div className="text-base">
                <span>P = </span>
                <Frac
                  top={<SlotBox k='FV' value={slotValues['FV']} />}
                  bot={<span>(1 + <SlotBox k='y' value={slotValues['y']} />)<sup><SlotBox k='N' value={slotValues['N']} /></sup></span>}
                />
              </div>
            )}
            <div className="mt-2 text-xs text-stone-600">Slots needed: {slots.map(k => <span key={k} className="inline-block mx-1 px-2 py-0.5 rounded-full border bg-white/80">{k}</span>)}</div>
          </div>

          <div className="min-w-[260px] max-w-[360px] text-xs bg-white/70 border rounded-2xl p-3 shadow-sm">
            <div className="font-semibold mb-1">Round Example</div>
            <div>FV = <b>{fmtMoney(q.face)}</b></div>
            <div>Years = <b>{q.years}</b></div>
            <div>Yield to Maturity (annual) = <b>{(q.ytm*100).toFixed(1)}%</b></div>
            <div>m = <b>{q.m}</b> ({q.m===1?'annual':q.m===2?'semiannual':q.m===4?'quarterly':'monthly'})</div>
            {q.couponRate > 0 && <div>Coupon rate = <b>{(q.couponRate*100).toFixed(1)}%</b> → per‑period CPN = {(params.CPN).toFixed(2)}</div>}
            <div className="mt-1 text-stone-600">Per‑period: y = {(params.y).toFixed(4)}, N = {params.N}</div>
          </div>
        </div>

        {/* Collected numbers */}
        <div>
          <div className="text-xs text-stone-600 mb-1">Numbers you've collected (drag to slots):</div>
          <div className="flex gap-2 flex-wrap">
            {collected.length === 0 && <div className="text-xs text-stone-500">(none yet)</div>}
            {collected.map((ch, i) => (
              <div 
                key={i} 
                draggable 
                onDragStart={(e) => onDragStartChip(e, ch)} 
                className="inline-flex items-center gap-2 px-2 py-1 rounded-xl border bg-amber-100 border-amber-300 shadow-sm"
                style={{ 
                  cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "grab") : "grab"
                }}
              >
                <span className="text-sm">{roundN(ch.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4×4 grid of EXACT PAIRS */}
        <div className="grid grid-cols-4 gap-3 mt-2">
          {cards.map((card) => (
            <button 
              key={card.id} 
              onClick={() => onFlip(card.id)} 
              className={`relative h-24 rounded-2xl border transition shadow-sm ${card.matched ? 'bg-emerald-50 border-emerald-300' : card.faceUp ? 'bg-amber-50 border-amber-300' : 'bg-white/60 hover:bg-white/80 border-stone-300'}`}
              style={{ 
                cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "pointer") : "pointer"
              }}
            >
              {card.faceUp || card.matched ? (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-stone-800">{roundN(card.value)}</div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-400">◆</div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-stone-700 min-h-[22px]">{message}</div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 rounded-xl border" 
              onClick={() => setScene('INTRO')}
              style={{ 
                cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "pointer") : "pointer"
              }}
            >Back</button>
            <button 
              className="px-3 py-2 rounded-xl border bg-emerald-200 hover:bg-emerald-300" 
              onClick={onDone} 
              disabled={!wand}
              style={{ 
                cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "pointer") : "pointer"
              }}
            >Finish</button>
            <button 
              className="px-3 py-2 rounded-xl border" 
              onClick={() => { setQ(makeQuestion()); setWand(null); setScene('INTRO'); }}
              style={{ 
                cursor: supportsCursor ? (wand === "A" ? "url('/images/wand1.png'), auto" : wand === "B" ? "url('/images/wand2.png'), auto" : "pointer") : "pointer"
              }}
            >New Round</button>
          </div>
        </div>
      </div>
    );
  }

  const scopeClass = "wand-scope";
  const wandClass = wand === "A" ? "wand-a" : wand === "B" ? "wand-b" : "";
  const wandCursor = supportsCursor && wand ? (wand === "A" ? "url('/images/wand1.png'), auto" : "url('/images/wand2.png'), auto") : "default";

  return (
    <main 
      ref={boardRef} 
      className={`min-h-[100vh] w-full flex items-center justify-center p-6 ${scopeClass} ${wandClass}`}
      style={{ 
        backgroundImage: 'url(/images/forest.png)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        cursor: wandCursor
      }}
    >
      <div className="w-[1120px] max-w-full rounded-3xl shadow-2xl border border-white/60 bg-white/75 backdrop-blur p-6">
        {scene === 'TEACH' && <Teach />}
        {scene === 'INTRO' && <Intro />}
        {scene === 'PLAY' && <Play />}
      </div>
    </main>
  );
}
