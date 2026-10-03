"""
PatternX AI — backend (Phase 0/3 skeleton)

Run it with:
    uvicorn main:app --reload --port 8000

Right now /analyze uses a simple keyword rule, NOT the real model, so the
extension team can build against this immediately. Phase 3's job is to swap
MOCK_PATTERNS for a real fine-tuned RoBERTa/DeBERTa classifier and keep the
request/response shape below exactly the same, so nothing on the extension
side has to change.
"""

from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="PatternX AI Backend", version="0.1.0")

# The extension runs on arbitrary shopping sites, the popup/background worker
# calls us from an extension origin — keep CORS open during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Snippet(BaseModel):
    text: str
    source: Optional[str] = None


class AnalyzeRequest(BaseModel):
    url: str
    snippets: List[Snippet]


class Flag(BaseModel):
    text: str
    pattern: str
    confidence: float
    severity: int  # 1 = low, 2 = medium, 3 = high


class AnalyzeResponse(BaseModel):
    url: str
    safety_score: int
    flags: List[Flag]


# Placeholder rules standing in for the Phase 3 model. Keys are substrings
# (checked lowercase), values are the pattern label from the build plan.
MOCK_PATTERNS = {
    "only 1 left": "false_urgency",
    "only": "false_urgency",
    "left in stock": "false_urgency",
    "hurry": "false_urgency",
    "people are viewing": "false_urgency",
    "added to your cart": "basket_sneaking",
    "unsubscribe": "subscription_trap",
    "cancel anytime": "subscription_trap",
    "no, i don't want to save": "confirmshaming",
    "no thanks, i like paying full price": "confirmshaming",
}


def score_from_flags(flags: List[Flag]) -> int:
    penalty = sum(f.severity * 8 for f in flags)
    return max(0, 100 - penalty)


@app.get("/")
def root():
    return {"status": "ok", "service": "PatternX AI backend"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    flags: List[Flag] = []
    seen_text = set()

    for snippet in req.snippets:
        text = snippet.text.strip()
        if not text or text.lower() in seen_text:
            continue
        lowered = text.lower()
        for keyword, pattern in MOCK_PATTERNS.items():
            if keyword in lowered:
                flags.append(Flag(text=text, pattern=pattern, confidence=0.55, severity=2))
                seen_text.add(lowered)
                break

    return AnalyzeResponse(url=req.url, safety_score=score_from_flags(flags), flags=flags)
