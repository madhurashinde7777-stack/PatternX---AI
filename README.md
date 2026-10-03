# PatternX AI

Browser extension + backend AI service that flags dark patterns (manipulative UI) on Indian e-commerce sites. SIH 2026, Problem Statement 1 — Dark Pattern & Deceptive UI Detection for E-Commerce.

Team: Nirmal Patil, Saie Jadhav, Madhura Shinde. Guide: Dr. B. S. Yelure.

## Repo layout

```
extension/   Manifest V3 browser extension (Nirmal)
backend/     FastAPI + AI model (Saie)
data/        Princeton dark-patterns dataset + the labeled dataset you'll build in Phase 1
docs/        Team roles and reference notes
```

## Phase 0 checklist — do this first, this week

- [ ] All three members install **Node.js 20+**, **Python 3.11+**, and **Git**
- [ ] Install Chrome (or Edge) in developer mode, ready to load an unpacked extension
- [ ] Create free accounts: **Hugging Face** (for RoBERTa/DeBERTa), **Supabase** (Postgres), **Redis Cloud**
- [ ] Install Playwright: `pip install playwright && playwright install`
- [ ] Set up a shared task board (GitHub Projects or Trello) mirroring the phases in the build plan
- [ ] Book the weekly guide check-in slot with Prof. B. S. Yelure

This repo (folders, starter extension, starter backend) is already done — see below.

## Run the backend (mock, works today)

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000` — you should see `{"status": "ok", ...}`. The `/analyze` endpoint
already flags a handful of obvious urgency/confirmshaming phrases using simple keyword rules, just
so the extension has something real to talk to while Phase 3 trains the actual model.

## Load the extension (works today)

1. Open `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**, select the `extension/` folder
4. Open any shopping site, click the PatternX AI icon in the toolbar, then **Rescan this page**

With the backend running, flagged snippets show up with a pattern label and confidence. Without
it, the extension still works — it just falls back to a score of 100 with no flags.

## What's a stub vs. what's real

| Piece | Status |
|---|---|
| Extension loads, captures page text, shows a popup | Real, works now |
| Backend `/analyze` endpoint, request/response shape | Real, works now |
| Pattern detection | **Mock** — simple keyword matching, not the real model yet |
| RoBERTa/DeBERTa classifier | Not started — Phase 3 |
| Playwright dynamic checks (countdown reset, basket sneaking, subscription trap) | Not started — Phase 4 |
| Overlay highlight boxes on the page itself | Not started — Phase 5 |
| Safety Score formula tuning | Placeholder formula in `backend/main.py`, refine in Phase 5 |

## Next step: Phase 1 (data collection)

See `data/princeton-dark-patterns/` for the public Mathur et al. (2019) dataset (1,818 labeled
instances) — already downloaded for you. Use `data/labeled-examples-template.csv` as the starting
columns for your own hand-labeled set from Flipkart, Amazon.in, Myntra, Ajio, and Meesho.

Full plan with all 7 phases, team roles, risks table, and the milestone timeline lives in the
shared "PatternX AI — Phase-Wise Build Plan" doc.
