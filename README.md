# Econ Interactive Learning

**Live site:** [https://www.mengshan.com/teaching/335  ](https://www.mengshanzhao.com/teaching/335)
Learning-by-doing mini games for undergraduate econ/finance courses. Built to make online learning faster, clearer, and more fun.

## Why this exists
I teach online. Some concepts (T-accounts, cash flows, ratios) stick better with short, focused practice. I built these games to help students practice quickly, get instant feedback, and see the “why,” not just the “what.”

## Games
- **Tax Quiz** (`[/games/tax-quiz](https://www.mengshanzhao.com/teaching/335/chapter-1)`)  
  Timed questions on profitability, liquidity, leverage; randomized each run.
- **Cashflow Sprint** (`/games/cashflow-sprint`) *(coming soon)*  
  Drag-and-drop transactions into Operating/Investing/Financing sections.

## Tech
Vanilla JS + HTML/CSS (fast, minimal bundle). Deployed via Vercel.  

## Local development
```bash
# if using a static server
npm install -g serve
serve .
# then open http://localhost:3000
