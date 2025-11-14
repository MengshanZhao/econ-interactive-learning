"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

function randInRange(min: number, max: number, decimals: number) {
  const r = Math.random() * (max - min) + min;
  return parseFloat(r.toFixed(decimals));
}

function calcWACC(costEquity: number, costDebt: number, equitySharePct: number) {
  const e = equitySharePct / 100;
  const d = 1 - e;
  return parseFloat((costEquity * e + costDebt * d).toFixed(2));
}

function opponentContinues(pot: number, oppWacc: number) {
  let quality = (13 - oppWacc) / 10;
  quality = Math.max(0, Math.min(1, quality));
  let base = 0.2 + 0.7 * quality;
  let penalty = pot * 0.005;
  let prob = Math.max(0.1, Math.min(0.95, base - penalty));
  return Math.random() < prob;
}

export default function WACCCardGame() {
  const [showIntro, setShowIntro] = useState(true);
  const [bankroll, setBankroll] = useState(100);
  const [pot, setPot] = useState(0);
  const [state, setState] = useState<"initial" | "afterFirst" | "afterSecond" | "roundOver">("initial");
  const [player, setPlayer] = useState<{
    costEquity: number;
    costDebt: number;
    shareEquity: number;
    wacc: number;
  } | null>(null);
  const [opp, setOpp] = useState<{
    costEquity: number;
    costDebt: number;
    shareEquity: number;
    wacc: number;
  } | null>(null);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [status, setStatus] = useState("New round! Place an initial bet.");

  const dealNewRound = () => {
    const newPlayer = {
      costEquity: randInRange(0, 15, 1),
      costDebt: randInRange(3, 7, 1),
      shareEquity: randInRange(0, 100, 0),
      wacc: 0,
    };
    newPlayer.wacc = calcWACC(newPlayer.costEquity, newPlayer.costDebt, newPlayer.shareEquity);

    const newOpp = {
      costEquity: randInRange(0, 15, 1),
      costDebt: randInRange(3, 7, 1),
      shareEquity: randInRange(0, 100, 0),
      wacc: 0,
    };
    newOpp.wacc = calcWACC(newOpp.costEquity, newOpp.costDebt, newOpp.shareEquity);

    setPlayer(newPlayer);
    setOpp(newOpp);
    setRevealedCards([]);
    setPot(0);
    setState("initial");
    setStatus("New round! Place an initial bet.");
  };

  useEffect(() => {
    if (!showIntro && !player) {
      dealNewRound();
    }
  }, [showIntro]);

  const handlePlaceBet = () => {
    if (state !== "initial" || !player || !opp) return;
    const betInput = document.getElementById("initial-bet") as HTMLInputElement;
    const bet = parseFloat(betInput.value);
    if (bet <= 0 || bet > bankroll) {
      alert("Enter a valid bet.");
      return;
    }
    setBankroll(bankroll - bet);
    setPot(pot + bet);
    setRevealedCards([0]);
    setState("afterFirst");
    setStatus(`Opponent's Cost of Equity is ${opp.costEquity}%. Add more money to reveal another card, or fold now.`);
  };

  const handleExtraBet = () => {
    if (state !== "afterFirst" || !opp) return;
    const extraInput = document.getElementById("extra-bet") as HTMLInputElement;
    const extra = parseFloat(extraInput.value) || 0;
    if (extra < 0 || extra > bankroll) {
      alert("Invalid extra bet.");
      return;
    }
    if (extra > 0) {
      setBankroll(bankroll - extra);
      setPot(pot + extra);
    }
    setRevealedCards([0, 1]);
    setState("afterSecond");
    const stays = opponentContinues(pot + extra, opp.wacc);
    if (stays) {
      setStatus(`Opponent's Cost of Debt is ${opp.costDebt}%. They stay in. You can add more money, fold, or go to the showdown.`);
    } else {
      setBankroll(bankroll + (pot + extra) * 2);
      setPot(0);
      setState("roundOver");
      setStatus("Opponent folds after seeing the pot. You win the round!");
    }
  };

  const handleGiveUp = () => {
    setPot(0);
    setState("roundOver");
    setStatus("You fold. You lose your bet.");
  };

  const handleExtraBet2 = () => {
    if (state !== "afterSecond" || !opp) return;
    const extra2Input = document.getElementById("extra-bet-2") as HTMLInputElement;
    const extra2 = parseFloat(extra2Input.value) || 0;
    if (extra2 < 0 || extra2 > bankroll) {
      alert("Invalid extra bet.");
      return;
    }
    if (extra2 === 0) {
      setStatus("No extra bet added. Proceed or fold.");
      return;
    }
    setBankroll(bankroll - extra2);
    const newPot = pot + extra2;
    setPot(newPot);
    const stays = opponentContinues(newPot, opp.wacc);
    if (stays) {
      setStatus("Opponent evaluates the new pot and decides to stay. You may now fold or go to showdown.");
    } else {
      setBankroll(bankroll + newPot * 2);
      setPot(0);
      setState("roundOver");
      setStatus("Your large bet scares the opponent away! You win the pot.");
    }
  };

  const handleFoldLate = () => {
    setPot(0);
    setState("roundOver");
    setStatus("You fold. You lose everything you put in.");
  };

  const handleShowdown = () => {
    if (state !== "afterSecond" || !player || !opp) return;
    setRevealedCards([0, 1, 2]);
    let msg = "";
    if (player.wacc < opp.wacc) {
      setBankroll(bankroll + pot * 2);
      msg = `Your WACC is ${player.wacc}%, opponent's is ${opp.wacc}%. You win!`;
    } else if (player.wacc > opp.wacc) {
      msg = `Your WACC is ${player.wacc}%, opponent's is ${opp.wacc}%. You lose.`;
    } else {
      setBankroll(bankroll + pot);
      msg = `Both WACCs are ${player.wacc}%. It's a tie. You get your bet back.`;
    }
    setPot(0);
    setStatus(msg);
    setState("roundOver");
  };

  const handleNewRound = () => {
    if (bankroll <= 0) {
      setStatus("You are out of money! Refresh to start over.");
      return;
    }
    dealNewRound();
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/images/table_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Decorative card lot in bottom right */}
      <div className="fixed bottom-0 right-0 z-0 pointer-events-none" style={{ opacity: 0.5 }}>
        <Image
          src="/images/card_lot.png"
          alt="Card decoration"
          width={500}
          height={400}
          className="object-contain"
          style={{ maxWidth: "35vw", maxHeight: "45vh" }}
        />
      </div>

      {/* Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 max-w-2xl w-[90%] shadow-2xl border-4 border-amber-800">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
              Welcome to the WACC Card Game!
            </h1>
            <p className="text-lg mb-4 text-amber-900">
              You are the CFO of a firm. Each round you receive <b>three cards</b>:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 text-amber-900">
              <li><b>Cost of Equity:</b> 0–15%</li>
              <li><b>Cost of Debt:</b> 3–7%</li>
              <li><b>Equity Share:</b> 0–100%</li>
            </ul>
            <p className="text-lg mb-4 text-amber-900">
              Your opponent gets three <b>hidden</b> cards.
            </p>
            <p className="text-lg mb-4 text-amber-900">
              You bet on who will have the <b>lower WACC</b>.
            </p>
            <p className="text-lg mb-4 text-amber-900">You can:</p>
            <ul className="list-disc list-inside mb-6 space-y-2 text-amber-900">
              <li>Place an initial bet to see 1 opponent card</li>
              <li>Add more money to see more information</li>
              <li>Fold at any time before showdown</li>
            </ul>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-lg shadow-lg hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Top Bar - Transparent */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-8 text-white font-bold text-lg" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span>Bankroll: ${bankroll.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span>Pot: ${pot.toFixed(2)}</span>
        </div>
      </div>

      {/* Cards Layout - Opponent on top, Player on bottom */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 py-20">
        {/* Opponent Cards - Top */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-white font-bold text-xl mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
            Opponent
          </div>
          <div className="flex gap-6 items-center justify-center">
            {opp && (
              <>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  {revealedCards.includes(0) ? (
                    <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                      <div className="text-xs opacity-70 mb-2 text-gray-800">Cost of Equity</div>
                      <div className="text-3xl font-bold text-gray-900">{opp.costEquity}%</div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src="/images/card_1.png"
                        alt="Hidden card 1"
                        fill
                        className="rounded-lg shadow-2xl object-cover"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <span className="text-6xl font-bold text-white drop-shadow-2xl">?</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  {revealedCards.includes(1) ? (
                    <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                      <div className="text-xs opacity-70 mb-2 text-gray-800">Cost of Debt</div>
                      <div className="text-3xl font-bold text-gray-900">{opp.costDebt}%</div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src="/images/card_2.png"
                        alt="Hidden card 2"
                        fill
                        className="rounded-lg shadow-2xl object-cover"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <span className="text-6xl font-bold text-white drop-shadow-2xl">?</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  {revealedCards.includes(2) ? (
                    <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                      <div className="text-xs opacity-70 mb-2 text-gray-800">Equity Share</div>
                      <div className="text-3xl font-bold text-gray-900">{opp.shareEquity}%</div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src="/images/card_3.png"
                        alt="Hidden card 3"
                        fill
                        className="rounded-lg shadow-2xl object-cover"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <span className="text-6xl font-bold text-white drop-shadow-2xl">?</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          {opp && (
            <div className="text-white font-semibold text-lg mt-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
              Opponent WACC: <span className="text-2xl">{revealedCards.length === 3 ? `${opp.wacc}%` : "?"}</span>
            </div>
          )}
        </div>

        {/* Player Cards - Bottom, aligned with opponent */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-white font-bold text-xl mb-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
            Your Firm
          </div>
          <div className="flex gap-6 items-center justify-center">
            {player && (
              <>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                    <div className="text-xs opacity-70 mb-2 text-gray-800">Cost of Equity</div>
                    <div className="text-3xl font-bold text-gray-900">{player.costEquity}%</div>
                  </div>
                </div>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                    <div className="text-xs opacity-70 mb-2 text-gray-800">Cost of Debt</div>
                    <div className="text-3xl font-bold text-gray-900">{player.costDebt}%</div>
                  </div>
                </div>
                <div className="relative" style={{ width: "160px", height: "220px" }}>
                  <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center flex flex-col justify-center shadow-2xl border-2 border-white/50">
                    <div className="text-xs opacity-70 mb-2 text-gray-800">Equity Share</div>
                    <div className="text-3xl font-bold text-gray-900">{player.shareEquity}%</div>
                  </div>
                </div>
              </>
            )}
          </div>
          {player && (
            <div className="text-white font-semibold text-lg mt-2" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
              Your WACC: <span className="text-2xl">{player.wacc}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls - Transparent, at bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-4xl px-4">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          {/* Step 1 */}
          {state === "initial" && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-white font-semibold">Initial bet:</span>
              <input
                type="number"
                id="initial-bet"
                defaultValue={10}
                min={1}
                className="px-4 py-2 rounded-lg border-2 border-white/30 bg-white/90 text-gray-900 font-semibold w-32"
              />
              <button
                onClick={handlePlaceBet}
                className="px-6 py-3 rounded-lg bg-white/90 text-gray-900 font-bold shadow-lg hover:bg-white transition-all"
              >
                Place Bet & Reveal 1st Card
              </button>
            </div>
          )}

          {/* Step 2 */}
          {state === "afterFirst" && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-white font-semibold">Extra bet:</span>
              <input
                type="number"
                id="extra-bet"
                defaultValue={5}
                min={0}
                className="px-4 py-2 rounded-lg border-2 border-white/30 bg-white/90 text-gray-900 font-semibold w-32"
              />
              <button
                onClick={handleExtraBet}
                className="px-6 py-3 rounded-lg bg-white/90 text-gray-900 font-bold shadow-lg hover:bg-white transition-all"
              >
                Add & Reveal 2nd Card
              </button>
              <button
                onClick={handleGiveUp}
                className="px-6 py-3 rounded-lg bg-red-500/90 text-white font-bold shadow-lg hover:bg-red-600 transition-all"
              >
                Fold
              </button>
            </div>
          )}

          {/* Step 3 */}
          {state === "afterSecond" && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-white font-semibold">Add more (optional):</span>
              <input
                type="number"
                id="extra-bet-2"
                defaultValue={0}
                min={0}
                className="px-4 py-2 rounded-lg border-2 border-white/30 bg-white/90 text-gray-900 font-semibold w-32"
              />
              <button
                onClick={handleExtraBet2}
                className="px-6 py-3 rounded-lg bg-white/90 text-gray-900 font-bold shadow-lg hover:bg-white transition-all"
              >
                Add
              </button>
              <button
                onClick={handleShowdown}
                className="px-6 py-3 rounded-lg bg-green-500/90 text-white font-bold shadow-lg hover:bg-green-600 transition-all"
              >
                Final Showdown
              </button>
              <button
                onClick={handleFoldLate}
                className="px-6 py-3 rounded-lg bg-red-500/90 text-white font-bold shadow-lg hover:bg-red-600 transition-all"
              >
                Fold
              </button>
            </div>
          )}

          {/* New Round */}
          {state === "roundOver" && (
            <div className="flex justify-center">
              <button
                onClick={handleNewRound}
                className="px-6 py-3 rounded-lg bg-white/90 text-gray-900 font-bold shadow-lg hover:bg-white transition-all"
              >
                New Round
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <div className="text-white font-semibold text-sm" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }} dangerouslySetInnerHTML={{ __html: status }} />
          </div>
        </div>
      </div>
    </div>
  );
}
