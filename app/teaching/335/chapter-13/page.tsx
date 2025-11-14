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
      className="min-h-screen w-full relative"
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

      <div className="relative z-10 min-h-screen py-8 px-4 md:px-8">
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

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 text-white font-bold text-lg shadow-xl border-2 border-amber-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span>Bankroll: ${bankroll.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span>Pot: ${pot.toFixed(2)}</span>
          </div>
        </div>

        {/* Cards Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player Cards */}
          <div className="bg-gradient-to-br from-amber-50/95 to-amber-100/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-4 border-amber-700">
            <h2 className="text-2xl font-bold mb-4 text-amber-900">Your Firm</h2>
            <div className="flex gap-4 flex-wrap mb-4">
              {player && (
                <>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border-3 border-blue-500 shadow-lg text-center flex flex-col justify-center" style={{ width: "140px", height: "200px" }}>
                    <div className="text-sm opacity-80 text-blue-900 mb-2">Cost of Equity</div>
                    <div className="text-2xl font-bold text-blue-900">{player.costEquity}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border-3 border-green-500 shadow-lg text-center flex flex-col justify-center" style={{ width: "140px", height: "200px" }}>
                    <div className="text-sm opacity-80 text-green-900 mb-2">Cost of Debt</div>
                    <div className="text-2xl font-bold text-green-900">{player.costDebt}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 border-3 border-purple-500 shadow-lg text-center flex flex-col justify-center" style={{ width: "140px", height: "200px" }}>
                    <div className="text-sm opacity-80 text-purple-900 mb-2">Equity Share</div>
                    <div className="text-2xl font-bold text-purple-900">{player.shareEquity}%</div>
                  </div>
                </>
              )}
            </div>
            <div className="text-lg font-semibold text-amber-900">
              Your WACC: <span className="text-2xl">{player ? `${player.wacc}%` : "?"}</span>
            </div>
          </div>

          {/* Opponent Cards */}
          <div className="bg-gradient-to-br from-amber-50/95 to-amber-100/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-4 border-amber-700">
            <h2 className="text-2xl font-bold mb-4 text-amber-900">Opponent</h2>
            <div className="flex gap-4 flex-wrap mb-4">
              {opp && (
                <>
                  <div className="relative" style={{ width: "140px", height: "200px" }}>
                    {revealedCards.includes(0) ? (
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border-3 border-blue-500 shadow-lg w-full h-full text-center flex flex-col justify-center">
                        <div className="text-sm opacity-80 text-blue-900 mb-2">Cost of Equity</div>
                        <div className="text-2xl font-bold text-blue-900">{opp.costEquity}%</div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/card_1.png"
                          alt="Hidden card 1"
                          fill
                          className="rounded-xl shadow-lg border-4 border-amber-800 object-cover"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                          <span className="text-5xl font-bold text-white drop-shadow-lg">?</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" style={{ width: "140px", height: "200px" }}>
                    {revealedCards.includes(1) ? (
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 border-3 border-green-500 shadow-lg w-full h-full text-center flex flex-col justify-center">
                        <div className="text-sm opacity-80 text-green-900 mb-2">Cost of Debt</div>
                        <div className="text-2xl font-bold text-green-900">{opp.costDebt}%</div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/card_2.png"
                          alt="Hidden card 2"
                          fill
                          className="rounded-xl shadow-lg border-4 border-amber-800 object-cover"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                          <span className="text-5xl font-bold text-white drop-shadow-lg">?</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" style={{ width: "140px", height: "200px" }}>
                    {revealedCards.includes(2) ? (
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 border-3 border-purple-500 shadow-lg w-full h-full text-center flex flex-col justify-center">
                        <div className="text-sm opacity-80 text-purple-900 mb-2">Equity Share</div>
                        <div className="text-2xl font-bold text-purple-900">{opp.shareEquity}%</div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src="/images/card_3.png"
                          alt="Hidden card 3"
                          fill
                          className="rounded-xl shadow-lg border-4 border-amber-800 object-cover"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                          <span className="text-5xl font-bold text-white drop-shadow-lg">?</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="text-lg font-semibold text-amber-900">
              Opponent WACC: <span className="text-2xl">{opp && revealedCards.length === 3 ? `${opp.wacc}%` : "?"}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-br from-amber-50/95 to-amber-100/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-4 border-amber-700">
          <h3 className="text-xl font-bold mb-4 text-amber-900">Round Controls</h3>

          {/* Step 1 */}
          {state === "initial" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-amber-900 font-semibold">Initial bet:</span>
                <input
                  type="number"
                  id="initial-bet"
                  defaultValue={10}
                  min={1}
                  className="px-4 py-2 rounded-xl border-2 border-amber-600 bg-white text-amber-900 font-semibold w-32"
                />
                <button
                  onClick={handlePlaceBet}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                >
                  Place Bet & Reveal 1st Card
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {state === "afterFirst" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-amber-900 font-semibold">Extra bet:</span>
                <input
                  type="number"
                  id="extra-bet"
                  defaultValue={5}
                  min={0}
                  className="px-4 py-2 rounded-xl border-2 border-amber-600 bg-white text-amber-900 font-semibold w-32"
                />
                <button
                  onClick={handleExtraBet}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                >
                  Add & Reveal 2nd Card
                </button>
                <button
                  onClick={handleGiveUp}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
                >
                  Fold
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {state === "afterSecond" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-amber-900 font-semibold">Add more before showdown (optional):</span>
                <input
                  type="number"
                  id="extra-bet-2"
                  defaultValue={0}
                  min={0}
                  className="px-4 py-2 rounded-xl border-2 border-amber-600 bg-white text-amber-900 font-semibold w-32"
                />
                <button
                  onClick={handleExtraBet2}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                >
                  Add
                </button>
                <button
                  onClick={handleShowdown}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
                >
                  Final Showdown
                </button>
                <button
                  onClick={handleFoldLate}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
                >
                  Fold
                </button>
              </div>
            </div>
          )}

          {/* New Round */}
          {state === "roundOver" && (
            <div>
              <button
                onClick={handleNewRound}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold shadow-lg hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105"
              >
                New Round
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-white/80 rounded-xl border-2 border-amber-600 min-h-[60px]">
            <div className="text-amber-900 font-semibold" dangerouslySetInnerHTML={{ __html: status }} />
          </div>
        </div>
      </div>
    </div>
  );
}

