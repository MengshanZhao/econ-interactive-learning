# Econ Interactive Learning

**Live site:** [https://<your-vercel-url>  ](https://www.mengshanzhao.com/teaching/335)
Learning-by-doing mini games for undergraduate econ/finance courses. Built to make online learning faster, clearer, and more fun.

## Why this exists
I teach online. Some concepts (T-accounts, cash flows, ratios) stick better with short, focused practice. I built these games to help students practice quickly, get instant feedback, and see the “why,” not just the “what.”

## Games
- **T-Accounts Trainer** (`/games/t-accounts-trainer`)  
  Practice debit/credit entries with instant feedback and running balances.
- **Ratio Quiz** (`/games/ratio-quiz`)  
  Timed questions on profitability, liquidity, leverage; randomized each run.
- **Cashflow Sprint** (`/games/cashflow-sprint`) *(coming soon)*  
  Drag-and-drop transactions into Operating/Investing/Financing sections.

## Tech
Vanilla JS + HTML/CSS (fast, minimal bundle). Deployed via Vercel.  
I regularly use AI assistants (ChatGPT, Claude, Gemini, Cursor) to accelerate prototyping and debugging; all code is human-reviewed and documented.

## Local development
```bash
# if using a static server
npm install -g serve
serve .
# then open http://localhost:3000
