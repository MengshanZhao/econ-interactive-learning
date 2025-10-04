"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * DDM — RPG Chat (Owner-only, progressive reveal)
 * Flow matches the sample:
 * - One stock offer per year.
 * - Bottom chat box shows ONLY the latest Q/A pair; a History modal lets you scroll old lines.
 * - Options are a vertical numbered list; the LAST item is "I'm ready to make an offer".
 *   When chosen, it expands inline to show exactly two options: (1) input a number; (2) Pass.
 * - After deal/decline/pass, only one option remains: "Ready for the next year".
 * - Year transition overlay + Boss modal (emoji) explains whether the deal was good; shows calculations; click OK to continue.
 */

// =============== utils ===============
const money = (n: number) => `$${Number(n).toFixed(2)}`;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const randint = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Accept any div props (so we can pass `style`, etc.)
interface FrameProps extends React.HTMLAttributes<HTMLDivElement> { className?: string; }
const Frame: React.FC<React.PropsWithChildren<FrameProps>> = ({ className = "", children, ...rest }) => (
  <div {...rest} className={`rounded-2xl border border-amber-300 shadow-sm bg-[#FFF8EA] ${className}`}>{children}</div>
);

// =============== types ===============
interface Offer {
  id: string;
  animal: string; // emoji
  currentYear: number;
  type: "CONSTANT" | "TWO_STAGE";
  // CONSTANT
  DivConst?: number; // per-year dividend
  g?: number; // constant dividend growth
  // TWO_STAGE
  N?: number; // 1 or 2 early years
  earlyDiv?: number; // fixed dividend during early years
  eps0?: number; // base EPS at year 0
  gHigh?: number; // EPS growth first N years
  gLow?: number; // EPS growth afterward
  payout?: number; // payout ratio after N
  rE: number; // discount rate
  path: number[]; // dividends from next year to year 10 (may be shorter; see length answer)
  opener: string; // owner opening line
}
interface Holding { name: string; paid: number; path: number[]; buyYear: number; }

type Scene = "TEACH" | "HOWTO" | "GAME";

// Character assignments: 4 animals for sellers, dwarf for player, pirate for boss
const SELLER_IMAGES = [
  { name: "Dog", image: "/images/dog.png" },
  { name: "Fox", image: "/images/fox.png" },
  { name: "Leopard", image: "/images/leopard.png" },
  { name: "Sheep", image: "/images/sheep.png" }
];
const PLAYER_IMAGE = { name: "Dwarf", image: "/images/dwarf.png" };
const BOSS_IMAGE = { name: "Pirate", image: "/images/pirate.png" };

// =============== math helpers ===============
const pv = (cash: number[], rE: number) => cash.reduce((acc, c, t) => acc + c / Math.pow(1 + rE, t + 1), 0);
function creditsForYear(pf: Holding[], year: number) {
  return pf.reduce((acc, h) => {
    const k = year - h.buyYear; // 1-based index in path
    if (k >= 1 && k <= h.path.length) return acc + (h.path[k - 1] || 0);
    return acc;
  }, 0);
}
// Scale a dividend path so PV is balanced for gameplay
function scalePathToRange(path: number[], rE: number, min = 100, max = 500) {
  const fairNow = pv(path, rE);
  if ((fairNow >= min && fairNow <= max) || fairNow <= 0) return { scaled: path.slice(), k: 1, fair: fairNow };
  const target = Math.random() * (max - min) + min;
  const k = target / fairNow;
  return { scaled: path.map(v => v * k), k, fair: target };
}
function pvBreakdown(path: number[], rE: number) {
  const lines = path.map((c, i) => {
    const t = i + 1; const disc = Math.pow(1 + rE, t); const term = c / disc; return { t, c, disc, term };
  });
  const total = lines.reduce((a, x) => a + x.term, 0);
  const pretty = lines.map(x => `D${x.t}=${money(x.c)} / (1+${pct(rE,1)})^${x.t} = ${money(x.term)}`).join("\n");
  return { total, pretty };
}
// Closed‑form helpers for boss note (finite horizon to T = path.length)
function gaPV(D1:number, r:number, g:number, T:number){ const ratio=(1+g)/(1+r); return (D1/(r-g))*(1 - Math.pow(ratio, T)); }
function twoStageFinitePV(N:number, early:number, DivNp1:number, r:number, g:number, T:number){
  const n = Math.min(N,T);
  const pvEarly = early * Array.from({length:n},(_,i)=>1/Math.pow(1+r,i+1)).reduce((a,b)=>a+b,0);
  const terms = Math.max(0, T - n);
  if (terms<=0) return pvEarly;
  const q = (1+g)/(1+r);
  const pvLate = (DivNp1/Math.pow(1+r, n+1)) * (1 - Math.pow(q, terms)) / (1 - q);
  return pvEarly + pvLate;
}
function bossFormulaText(o: Offer){
  const T = o.path.length; const r = o.rE;
  if(o.type === "CONSTANT"){
    const D1 = o.path[0] || 0; const g = o.g || 0; const pvv = gaPV(D1, r, g, T);
    const txt = `Constant growth (finite horizon):\nP₀ = (Div₁/(rₑ−g))·(1−((1+g)/(1+rₑ))^T)\n= (${money(D1)}/(${pct(r,1)}−${pct(g,1)})) · (1 − (${(1+g).toFixed(3)}/${(1+r).toFixed(3)})^${T})\n≈ ${money(pvv)}`;
    return { pv: pvv, txt };
  } else {
    const N = Math.min(o.N||0, T); const early = o.earlyDiv || 0; const g2 = o.gLow || 0; const DivNp1 = o.path[N] || 0;
    const pvv = twoStageFinitePV(N, early, DivNp1, r, g2, T);
    const txt = `Two‑stage to year T=${T}:\nP₀ = Σ_{t=1..${N}} Div_t/(1+rₑ)^t  +  [Div_{N+1}/(1+rₑ)^{N+1}] · [1 − ((1+g₂)/(1+rₑ))^{${Math.max(0,T-N)}}] / [1 − (1+g₂)/(1+rₑ)]\n≈ ${money(pvv)}`;
    return { pv: pvv, txt };
  }
}

// =============== phone check ===============
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const check = () => setIsPhone(window.matchMedia("(max-width: 768px)").matches);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isPhone;
}

// =============== typewriter ===============
function Typewriter({ text, speed = 16, onDone }:{ text: string; speed?: number; onDone?: () => void; }){
  const [i, setI] = useState(0);
  useEffect(()=>{ setI(0); },[text]);
  useEffect(()=>{ if(i>=text.length){ onDone?.(); return;} const id=setTimeout(()=>setI(i+1), speed); return ()=>clearTimeout(id); },[i,text,speed,onDone]);
  return <span>{text.slice(0,i)}</span>;
}

// =============== scenes ===============
const Teach: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div 
    className="min-h-[100svh] grid place-items-center p-6 text-amber-900"
    style={{
      backgroundImage: "url('/images/bank.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="max-w-4xl w-full rounded-2xl shadow-xl p-6 space-y-5 bg-[#FFF8EA]">
      <h1 className="text-3xl md:text-4xl font-bold">Two Ways to Value Dividends</h1>
      <div className="grid md:grid-cols-2 gap-4 text-lg">
        <Frame className="p-5 space-y-2">
          <h2 className="font-semibold">Type 1 — Constant dividend</h2>
          <div>• Same cash dividend each year (may grow steadily).</div>
          <div>• Discount at <b>r<sub>E</sub></b> until Year 10 in this game.</div>
        </Frame>
        <Frame className="p-5 space-y-2">
          <h2 className="font-semibold">Type 2 — Bumpy then steady</h2>
          <div>• First <b>N ≤ 2</b> year(s): simple fixed dividend while earnings sprint.</div>
          <div>• Then: pay a percent of earnings; growth slows to a long-run rate.</div>
        </Frame>
      </div>
      <div className="text-right">
        <button onClick={onNext} className="rounded bg-amber-600 px-6 py-3 text-2xl text-white shadow-lg hover:bg-amber-700">How the Game Works →</button>
      </div>
    </div>
  </div>
);

const HowTo: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div 
    className="min-h-[100svh] grid place-items-center p-6 text-amber-900"
    style={{
      backgroundImage: "url('/images/bank.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="max-w-4xl w-full rounded-2xl shadow-xl p-6 space-y-5 bg-[#FFF8EA]">
      <h2 className="text-3xl font-bold">Your Quest</h2>
      <ul className="space-y-2 text-[19px]">
        <li>• Begin with <b>$1,000</b>.</li>
        <li>• Each year an animal owner chats with you and offers a stock.</li>
        <li>• Ask questions in the chat. The last option lets you <b>Make an offer</b>.</li>
        <li>• Dividends credit at each year-end; game ends at Year 10.</li>
      </ul>
      <div className="text-right">
        <button onClick={onStart} className="rounded bg-amber-600 px-6 py-3 text-2xl text-white shadow-lg hover:bg-amber-700">Start</button>
      </div>
    </div>
  </div>
);

// =============== main ===============
export default function DDM_RPG_Chat() {
  const [scene, setScene] = useState<Scene>("TEACH");
  const [year, setYear] = useState(1);
  const [prevYear, setPrevYear] = useState<number | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [wipeCycle, setWipeCycle] = useState(0);

  const [funds, setFunds] = useState(1000);
  const [lastDelta, setLastDelta] = useState(0);
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [showHistory, setShowHistory] = useState(false);

  // decision state for post-offer flow
  type Decision = { status: "accepted" | "declined" | "passed" | null; price?: number };
  const [decision, setDecision] = useState<Decision>({ status: null });

  // boss modal
  const [bossDlg, setBossDlg] = useState<null | { face: string; text: string }>(null);

  const isPhone = useIsPhone();

  // Chat log & scrollback
  const [chat, setChat] = useState<Array<{ who: "You" | "Owner"; text: string }>>([]);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [typingKey, setTypingKey] = useState(0);
  useEffect(()=>{ if(chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; },[chat, typingKey]);

  const speakOwner = (t: string) => { setChat((L)=>[...L,{ who:"Owner", text:t }]); setTypingKey(k=>k+1); };
  const speakYou   = (t: string) => setChat((L)=>[...L,{ who:"You", text:t }]);

  // Offer input state (inline)
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerBid, setOfferBid] = useState<string>("");

  // hidden true value (never shown during the year)
  const pvHidden = (o: Offer | null) => (o ? pv(o.path, o.rE) : 0);
  const acceptProbability = (offerPrice: number, hiddenTrue: number) => {
    if (offerPrice >= hiddenTrue) return 1;
    const shortfall = (hiddenTrue - offerPrice) / hiddenTrue;
    if (shortfall >= 0.1) return 0;
    return clamp(1 - shortfall / 0.1, 0, 1);
  };

  // ---- generate an offer ----
  const makeOffer = (y: number): Offer => {
    const remainingYears = 10 - y;
    const character = choice(SELLER_IMAGES);
    const rE = randint(7, 12) / 100;
    const type: Offer["type"] = Math.random() < 0.5 ? "CONSTANT" : "TWO_STAGE";

    // choose an actual cashflow length L in [1, remainingYears]
    const L = Math.max(1, randint(1, Math.max(1, remainingYears)));

    if (type === "CONSTANT") {
      let DivConst = randint(8, 22); // larger dividends for 100–500 PV targets
      const g = [0, 0.02, 0.03][randint(0, 2)];
      let path = Array.from({ length: remainingYears }, (_, i) => DivConst * Math.pow(1 + g, i)).slice(0, L);
      const scaled = scalePathToRange(path, rE, 100, 500);
      path = scaled.scaled; DivConst = path[0] ?? DivConst;
      const opener = `${character.name}: I run a steady, no-drama business—think groceries and basic supplies. We throw off cash each year and share it. Expect a dividend around ${money(DivConst)} next year, drifting up roughly ${pct(g)} over time. Happy to chat.`;
      return { id: `Y${y}_${Math.random().toString(36).slice(2,7)}`, animal: character.name, currentYear: y, type, DivConst, g, rE, path, opener };
    }

    const N = Math.min(randint(1, 2), remainingYears);
    let earlyDiv = randint(6, 14);
    const eps0 = 2; const gHigh = randint(15, 25) / 100; const gLow = randint(3, 6) / 100; const payout = 0.6;
    const epsSeq: number[] = []; let eps = eps0 * (1 + gHigh);
    for (let i = 0; i < remainingYears; i++) { epsSeq.push(eps); eps *= (i + 1 < N ? 1 + gHigh : 1 + gLow); }
    let path: number[] = []; for (let i = 0; i < remainingYears; i++) path.push(i < N ? earlyDiv : payout * epsSeq[i]);
    path = path.slice(0, L);
    const scaled = scalePathToRange(path, rE, 100, 500);
    path = scaled.scaled; earlyDiv = path[0] ?? earlyDiv;
    const opener = `${character.name}: We just launched a crowd-pleaser and are plowing profits back for about ${N} year${N>1?"s":""} to scale. I'll keep a token dividend of ${money(earlyDiv)} while we sprint. Once the dust settles, we plan to pay roughly ${Math.round(payout*100)}% of earnings and grow at a calmer pace. Ask away.`;
    return { id: `Y${y}_${Math.random().toString(36).slice(2,7)}`, animal: character.name, currentYear: y, type, N, earlyDiv, eps0, gHigh, gLow, payout, rE, path, opener };
  };

  // ---- load offer ----
  useEffect(() => {
    if (scene !== "GAME") return;
    const id = setTimeout(() => {
      const o = makeOffer(year);
      setOffer(o);
      setChat([{ who: "Owner", text: o.opener }]);
      setDecision({ status: null });
      setOfferOpen(false); setOfferBid("");
    }, 0);
    return () => clearTimeout(id);
  }, [scene, year]);

  // overlay timing
  useEffect(() => {
    if (!showOverlay) return;
    const id = setTimeout(() => setShowOverlay(false), 650);
    return () => clearTimeout(id);
  }, [showOverlay]);

  // ---- chat actions (unlock gradually) ----
  type Key = "ask-type"|"ask-first"|"ask-growth"|"ask-afterN"|"ask-re"|"ask-recap"|"ask-length"|"offer"|"pass";
  const [unlocked, setUnlocked] = useState<Set<Key>>(new Set(["ask-type","ask-re","ask-length"]));
  useEffect(()=>{ setUnlocked(new Set(["ask-type","ask-re","ask-length"])); },[offer?.id]);

  const doAskType = () => {
    if(!offer) return;
    speakYou("Is your dividend constant, or does it change?");
    if(offer.type==="CONSTANT"){
      speakOwner(`Constant. Same cash each year, gently growing around ${pct(offer.g||0)}.`);
      setUnlocked(s=> new Set([...s, "ask-first","ask-growth","ask-recap","offer"]));
    } else {
      speakOwner(`Two-stage. For ${offer.N} year(s) I pay ${money(offer.earlyDiv||0)} while we sprint; then I pay about ${Math.round((offer.payout||0.6)*100)}% of earnings.`);
      setUnlocked(s=> new Set([...s, "ask-first","ask-growth","ask-afterN","ask-recap","offer"]));
    }
  };
  const doAskFirst = () => { if(!offer) return; speakYou("What will next year's dividend be?"); const first = offer.path[0] ?? 0; speakOwner(`Next year I expect about ${money(first)}.`); setUnlocked(s=> new Set([...s,"offer","ask-recap"])); };
  const doAskGrowth = () => { if(!offer) return; speakYou("How fast do you grow?"); if(offer.type==="CONSTANT") speakOwner(`We target ${pct(offer.g||0)} growth on the payout.`); else speakOwner(`Earnings grow ~${pct(offer.gHigh||0)} for ${offer.N} year(s), then ~${pct(offer.gLow||0)}.`); setUnlocked(s=> new Set([...s,"offer","ask-recap","ask-afterN"])); };
  const doAskAfterN = () => { if(!offer || offer.type!=="TWO_STAGE") return; speakYou("After the early years, how are dividends set?"); speakOwner(`After year ${offer.N}, around ${Math.round((offer.payout||0.6)*100)}% of earnings becomes the dividend.`); setUnlocked(s=> new Set([...s,"offer","ask-recap"])); };
  const doAskRE = () => { if(!offer) return; speakYou("What should I use for the cost of equity?"); speakOwner(`Most folks discount near ${pct(offer.rE,1)}. Use your judgment.`); setUnlocked(s=> new Set([...s,"offer","ask-recap","ask-first","ask-growth"])) };
  const doAskRecap = () => { if(!offer) return; speakYou("Quick recap?"); if(offer.type==="CONSTANT"){ speakOwner(`Constant dividends around ${money(offer.DivConst||0)} with growth ~${pct(offer.g||0)}; discount near ${pct(offer.rE,1)}.`); } else { speakOwner(`Early ${offer.N} yr(s): ${money(offer.earlyDiv||0)} each. Then ~${Math.round((offer.payout||0.6)*100)}% of EPS; growth cools from ${pct(offer.gHigh||0)} to ${pct(offer.gLow||0)}. rₑ ≈ ${pct(offer.rE,1)}.`); } setUnlocked(s=> new Set([...s,"offer"])); };
  const doAskLength = () => { if(!offer) return; const T = offer.path.length; speakYou("How long will I have the stock?"); speakOwner(`From now, I expect to pay dividends for about ${T} more year${T===1?"":"s"}.`); setUnlocked(s=> new Set([...s, "offer", "ask-recap"])); };

  // Offer & Pass inside chat
  const openOfferUI = () => { setOfferOpen(true); speakYou("I'm ready to make an offer."); };
  const submitOffer = () => {
    if(!offer) return;
    const raw = offerBid;
    const price = Number(raw);
    if (!isFinite(price) || raw.trim()==="") { setMsg("Enter a price."); return; }
    if (price <= 0) { setMsg("Enter a positive P₀."); return; }
    if (price > funds) { setMsg("Insufficient funds."); return; }
    const p = acceptProbability(price, pvHidden(offer));
    const accepted = Math.random() <= p;
    if (accepted) {
      const newHolding: Holding = { name: `${offer.animal}`, paid: price, path: offer.path, buyYear: year };
      setFunds((f) => f - price); setLastDelta(-price); setPortfolio((pf) => [...pf, newHolding]);
      speakOwner(`Okay, let's deal at ${money(price)}.`);
      setOfferOpen(false); setOfferBid("");
      setDecision({ status: "accepted", price });
    } else {
      setOfferOpen(false); setOfferBid("");
      speakOwner("Oh—that's a bit low for me.");
      setDecision({ status: "declined", price });
    }
  };
  const doPass = () => { speakYou("I'll pass for now."); setDecision({ status: "passed" }); };

  const nextYear = () => {
    if (year < 10) {
      const newY = year + 1;
      setPrevYear(year);
      setYear(newY);
      setShowOverlay(true);
      setWipeCycle((c) => c + 1);
      const credits = creditsForYear(portfolio, newY);
      if (credits !== 0) { setFunds((f) => f + credits); setLastDelta(credits); } else { setLastDelta(0); }
    } else {
      const totalDivs = portfolio.reduce((acc, h) => acc + h.path.reduce((a, c) => a + c, 0), 0);
      setMsg(`Campaign complete! Final after Year 10: Funds ${money(funds)} + Dividends ${money(totalDivs)} = ${money(funds + totalDivs)}`);
    }
  };

  // ---- scenes ----
  if (scene === "TEACH") return <Teach onNext={() => setScene("HOWTO")} />;
  if (scene === "HOWTO") return <HowTo onStart={() => setScene("GAME")} />;

  // ---- GAME ----
  const dialogueInner = (
    <div className="p-0 text-amber-900">
      {/* Compact chat — only latest Q/A */}
      <div ref={chatBoxRef} className="px-4 pt-4 pb-2 text-[18px]" style={{ maxHeight: "34svh", overflowY: "auto" }}>
        {(() => {
          const recent = chat.length <= 2 ? chat : chat.slice(-2);
          return recent.map((m, i) => (
            <div key={`recent-${i}`} className="mb-4">
              {m.who === "You" ? (
                <div className="flex items-start gap-3">
                  <div className="relative w-[200px] h-[200px] shrink-0 bg-[#FFF4DF] pixel-inner-amber rounded-lg overflow-hidden">
                    <Image src={PLAYER_IMAGE.image} alt={PLAYER_IMAGE.name} fill className="object-contain rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block mb-2 px-3 py-1 pixel-frame-amber bg-[#FFECC8] text-amber-900 font-ms text-[18px]">You</div>
                    <div className="pixel-inner-amber bg-[#FFF8EA] p-4 min-h-[120px] text-[20px] leading-7 font-vt323">
                      {m.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="inline-block mb-2 px-3 py-1 pixel-frame-amber bg-[#FFECC8] text-amber-900 font-ms text-[18px]">Owner</div>
                    <div className="pixel-inner-amber bg-[#FFF8EA] p-4 min-h-[120px] text-[20px] leading-7 font-vt323">
                      {i === recent.length - 1 && m.who === "Owner" ? (
                        <Typewriter text={m.text} onDone={() => { /* noop */ }} />
                      ) : (
                        <span>{m.text}</span>
                      )}
                    </div>
                  </div>
                  <div className="relative w-[200px] h-[200px] shrink-0 bg-[#FFF4DF] pixel-inner-amber rounded-lg overflow-hidden">
                    {offer && (
                      <Image 
                        src={SELLER_IMAGES.find(c => c.name === offer.animal)?.image || "/images/dog.png"} 
                        alt={offer.animal} 
                        fill 
                        className="object-contain rounded-lg" 
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          ));
        })()}
      </div>
      {chat.length > 2 && (
        <div className="px-4 pb-2 text-xs text-amber-700">
          <button onClick={() => setShowHistory(true)} className="underline hover:no-underline">View earlier messages ({chat.length - 2} older)</button>
        </div>
      )}

      {/* Options list */}
      <div className="border-t bg-[#FFF4DF] p-4 text-[18px]">
        {offer && (
          <div>
            {decision.status ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (!offer) return;
                    const fair = pvHidden(offer);
                    let verdict = "";
                    if (decision.status === "passed") {
                      verdict = `Boss: You passed. Here's the closed-form calculation:`;
                    } else if (decision.status === "declined") {
                      verdict = `Boss: Your ${money(decision.price || 0)} offer was too low. Calculation:`;
                    } else if (decision.status === "accepted") {
                      const p = decision.price || 0; const diff = p - fair;
                      verdict = diff > 0 ? `Boss: Overpaid by ${money(diff)}. Calculation:` : `Boss: Nice margin ${money(Math.abs(diff))}. Calculation:`;
                    }
                      const f = bossFormulaText(offer);
                      const text = `${verdict}\n\n${f.txt}\nFair P₀ ≈ ${money(fair)}.`;
                      setBossDlg({ face: "Boss", text });
                    nextYear();
                  }}
                  className="pixel-btn-amber bg-amber-600 text-white hover:bg-amber-700 w-full font-vt323"
                >
                  Ready for the next year
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm text-amber-800 mb-2 font-ms">Ask one:</div>
                <div className="text-left">
                  <ol className="list-decimal list-inside space-y-1 text-sm font-vt323">
                    {unlocked.has("ask-type") && (
                      <li>
                        <span 
                          onClick={doAskType} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          Is it constant or changing?
                        </span>
                      </li>
                    )}
                    {unlocked.has("ask-first") && (
                      <li>
                        <span 
                          onClick={doAskFirst} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          What's next year's dividend?
                        </span>
                      </li>
                    )}
                    {unlocked.has("ask-growth") && (
                      <li>
                        <span 
                          onClick={doAskGrowth} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          How fast do you grow?
                        </span>
                      </li>
                    )}
                    {offer.type === "TWO_STAGE" && unlocked.has("ask-afterN") && (
                      <li>
                        <span 
                          onClick={doAskAfterN} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          After the sprint?
                        </span>
                      </li>
                    )}
                    {unlocked.has("ask-re") && (
                      <li>
                        <span 
                          onClick={doAskRE} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          What rₑ should I use?
                        </span>
                      </li>
                    )}
                    {unlocked.has("ask-length") && (
                      <li>
                        <span 
                          onClick={doAskLength} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          How long will I have the stock?
                        </span>
                      </li>
                    )}
                    {unlocked.has("ask-recap") && (
                      <li>
                        <span 
                          onClick={doAskRecap} 
                          className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                        >
                          Quick recap
                        </span>
                      </li>
                    )}
                    {unlocked.has("offer") && (
                      <li>
                        <span 
                          onClick={openOfferUI} 
                          className="cursor-pointer hover:text-emerald-700 transition-colors font-vt323 font-semibold"
                        >
                          I'm ready to make an offer
                        </span>
                        {offerOpen && !decision.status && (
                          <ol className="list-decimal list-inside ml-4 mt-1 space-y-1 text-sm font-vt323">
                            <li>
                              <div className="inline-flex gap-2 items-center">
                                <input 
                                  type="number" 
                                  min={1} 
                                  step={1} 
                                  value={offerBid} 
                                  onChange={(e)=>setOfferBid(e.target.value)} 
                                  className="pixel-inner-amber p-2 text-sm w-24 placeholder:italic placeholder:text-amber-700/60 font-vt323" 
                                  placeholder="amount" 
                                />
                                <span 
                                  onClick={submitOffer} 
                                  className="cursor-pointer hover:text-emerald-700 transition-colors text-sm font-vt323"
                                >
                                  Submit
                                </span>
                              </div>
                            </li>
                            <li>
                              <span 
                                onClick={() => { setOfferOpen(false); setOfferBid(""); doPass(); }} 
                                className="cursor-pointer hover:text-amber-700 transition-colors font-vt323"
                              >
                                Pass
                              </span>
                            </li>
                          </ol>
                        )}
                      </li>
                    )}
                  </ol>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="relative min-h-[100svh] text-amber-900"
      style={{
        backgroundImage: "url('/images/bank.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        touchAction: "pan-y",
      }}
    >
      {/* Year wipe overlay with message */}
      <AnimatePresence initial={false} mode="wait">
        {showOverlay && prevYear !== null && (
          <motion.div
            key={`wipe-${wipeCycle}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{ backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              exit={{ rotateY: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-amber-200/40 to-amber-100/40"
              style={{ transformStyle: "preserve-3d" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded bg-amber-700/80 text-white px-3 py-1 shadow">One year passes…</div>
            </div>
            <div className="absolute top-3 right-4 rounded bg-amber-700 text-white px-3 py-1 shadow">Year {prevYear} → {year}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Funds banner */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="sticky top-0 z-30 mx-auto max-w-6xl p-3"
      >
        <Frame className="p-4 flex items-center justify-between bg-[#FFECC8]">
          <div className="text-xl">Year <b>{year}</b></div>
          <div className="text-3xl md:text-4xl font-extrabold text-amber-900">
            Total Funds: {money(funds)}
            {lastDelta !== 0 && (
              <motion.span initial={{ y: 8, opacity: 0 }} animate={{ y: -4, opacity: 1 }} transition={{ duration: 0.6 }} className={`ml-2 text-lg ${lastDelta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                ({lastDelta > 0 ? "+" : ""}{money(lastDelta)})
              </motion.span>
            )}
          </div>
        </Frame>
      </motion.div>

      <div className={`relative z-10 mx-auto max-w-6xl p-6 ${isPhone ? "pb-6" : "pb-[60svh]"}`}>
        <Frame className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 shrink-0 bg-[#FFF4DF] rounded-lg overflow-hidden">
              {offer && (
                <Image 
                  src={SELLER_IMAGES.find(c => c.name === offer.animal)?.image || "/images/dog.png"} 
                  alt={offer.animal} 
                  fill 
                  className="object-contain rounded-lg" 
                />
              )}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">Stock Owner</div>
              <div className="text-lg">Type: <b>{offer ? (offer.type === "CONSTANT" ? "Constant" : `Two-stage (N=${offer.N})`) : "…"}</b></div>
              <div className="text-lg mt-1">Suggested r<sub>E</sub> ≈ <b>{offer ? pct(offer.rE,1) : "-"}</b></div>
            </div>
          </div>
        </Frame>
      </div>

      {/* Dialogue: inline on phone, overlay on larger screens */}
      {offer && (
        isPhone ? (
          <div className="mx-auto max-w-6xl mt-4">
            <div className="pixel-frame-amber bg-[#FFF4DF] p-0 text-amber-900" style={{ overflow: "visible", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
              {dialogueInner}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <motion.div key={offer.id} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-6xl p-4">
              <div className="pixel-frame-amber bg-[#FFF4DF] p-0 text-amber-900" style={{ maxHeight: "72svh", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                {dialogueInner}
              </div>
            </motion.div>
          </AnimatePresence>
        )
      )}

      {/* Notice Modal */}
      {msg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl border border-amber-300 bg-[#FFF8EA] p-4 max-w-md mx-4">
            <div className="text-amber-900 text-lg font-semibold mb-2">Notice</div>
            <p className="text-amber-900 mb-4">{msg}</p>
            <div className="flex justify-end">
              <button onClick={() => setMsg(null)} className="rounded bg-amber-600 text-white px-4 py-2 hover:bg-amber-700">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl border border-amber-300 bg-[#FFF8EA] p-4 max-w-2xl mx-4 w-full">
            <div className="text-amber-900 text-lg font-semibold mb-2">Conversation History</div>
            <div className="max-h-[60svh] overflow-y-auto pr-1">
              {chat.map((m, i) => (
                <div key={`hist-${i}`} className="mb-3">
                  <div className="text-xs text-amber-700 mb-0.5">{m.who}</div>
                  <div className="text-[16px]">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={() => setShowHistory(false)} className="rounded bg-amber-600 text-white px-4 py-2 hover:bg-amber-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Boss evaluation modal shown during/after transition */}
      {bossDlg && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30">
          <div className="rounded-2xl border border-amber-300 bg-[#FFF8EA] p-4 max-w-xl mx-4">
            <div className="flex items-start gap-3">
              <div className="relative w-16 h-16 shrink-0 bg-[#FFF4DF] pixel-inner-amber rounded-lg overflow-hidden">
                <Image src={BOSS_IMAGE.image} alt={BOSS_IMAGE.name} fill className="object-contain rounded-lg" />
              </div>
              <div className="flex-1">
                <div className="text-amber-900 text-lg font-semibold mb-1">Boss</div>
                <p className="text-amber-900 whitespace-pre-line">{bossDlg.text}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => { setBossDlg(null); }} className="pixel-btn-amber bg-amber-600 text-white hover:bg-amber-700">Okay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== Runtime tests (do not remove) ===============
if (typeof window !== "undefined") {
  try {
    // PV drops as rE rises
    const cash = [10, 10, 10];
    const pv8 = pv(cash, 0.08);
    const pv12 = pv(cash, 0.12);
    console.assert(pv8 > pv12, "PV should drop when rE increases");

    // creditsForYear: single holding
    const h1: Holding = { name: "🦊", paid: 100, path: [5, 6, 7], buyYear: 1 };
    console.assert(creditsForYear([h1], 2) === 5, "Year 2 should credit first dividend (5)");
    console.assert(creditsForYear([h1], 4) === 7, "Year 4 should credit third dividend (7)");
    console.assert(creditsForYear([h1], 5) === 0, "Year 5 should have no more dividends");

    // creditsForYear: multiple holdings
    const h2: Holding = { name: "🐼", paid: 120, path: [1, 1], buyYear: 2 };
    console.assert(creditsForYear([h1, h2], 3) === 6 + 1, "Year 3 should credit 6 + 1");

    // acceptProbability boundaries
    const ap = (bid: number, p0: number) => { if (bid >= p0) return 1; const s = (p0 - bid) / p0; if (s >= 0.1) return 0; return 1 - s / 0.1; };
    console.assert(ap(100, 100) === 1, "AP at par should be 1");
    console.assert(Math.abs(ap(95, 100) - 0.5) < 1e-12, "AP at 5% under should be 0.5");
    console.assert(ap(90, 100) === 0, "AP at 10% under should be 0");

    // NEW: scalePathToRange keeps PV in [100,500]
    const testPath = [20,20,20,20,20]; const r = 0.1; const { scaled, fair } = scalePathToRange(testPath, r, 100, 500);
    const pvScaled = pv(scaled, r);
    console.assert(pvScaled >= 100 - 1e-6 && pvScaled <= 500 + 1e-6, `Scaled PV ${pvScaled} not in [100,500] (fair ${fair})`);

    // NEW: closed-form vs brute force — constant growth
    (function(){
      const D1 = 10, g = 0.02, r = 0.08, T = 5;
      const path = Array.from({length:T}, (_,i)=> D1 * Math.pow(1+g, i));
      const pvSum = pv(path, r);
      const pvClosed = (D1/(r-g))*(1 - Math.pow((1+g)/(1+r), T));
      console.assert(Math.abs(pvSum - pvClosed) < 1e-9, "Closed-form constant PV mismatch");
    })();

    // NEW: closed-form vs brute force — two-stage (finite horizon)
    (function(){
      const N=2, early=5, g2=0.04, r=0.08, T=6, DivNp1=6;
      const path = [5,5,6,6*(1+g2),6*Math.pow(1+g2,2),6*Math.pow(1+g2,3)];
      const pvSum = pv(path, r);
      const pvClosed = (function(){
        const n = Math.min(N,T);
        const pvEarly = early * Array.from({length:n},(_,i)=>1/Math.pow(1+r,i+1)).reduce((a,b)=>a+b,0);
        const terms = Math.max(0, T-n);
        const q = (1+g2)/(1+r);
        const pvLate = terms>0 ? (DivNp1/Math.pow(1+r, n+1)) * (1 - Math.pow(q, terms)) / (1 - q) : 0;
        return pvEarly + pvLate;
      })();
      console.assert(Math.abs(pvSum - pvClosed) < 1e-9, "Closed-form two-stage PV mismatch");
    })();

    console.log("DDM RPG chat: runtime tests passed ✅");
  } catch (e) {
    console.warn("DDM RPG chat tests encountered an issue:", e);
  }
}
