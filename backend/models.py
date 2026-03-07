from pydantic import BaseModel
from typing import Optional
from enum import Enum


# --- Enums ---

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class StepType(str, Enum):
    THOUGHT = "thought"
    ACTION = "action"
    OBSERVATION = "observation"
    ANSWER = "answer"
    EDGE_ACTIVATED = "edge_activated"
    AGENT_THINKING = "agent_thinking"
    AGENT_OUTPUT = "agent_output"


# --- Product Models ---

class EligibilityCriteria(BaseModel):
    min_age: int
    min_annual_income: float
    min_credit_score: int
    employment_status: list[str]


class Product(BaseModel):
    product_id: str
    product_name: str
    category: str
    subcategory: str
    annual_fee: float
    interest_rate: float
    min_credit_score: int
    min_annual_income: float
    risk_level: RiskLevel
    target_customer: list[str]
    benefits: list[str]
    cashback_rate: float
    welcome_bonus_points: int
    related_products: list[str]
    description: str
    eligibility_criteria: EligibilityCriteria
    customer_sentiment_summary: str
    last_updated: str


# --- FAQ Model ---

class FAQ(BaseModel):
    faq_id: str
    category: str
    question: str
    answer: str
    tags: list[str]


# --- Trace Models ---

class TraceStep(BaseModel):
    type: StepType
    content: Optional[str] = None
    tool: Optional[str] = None
    params: Optional[dict] = None
    result: Optional[str | float | dict] = None
    t: int  # milliseconds offset for replay timing


class SceneTrace(BaseModel):
    scene: int | str  # int for 1-3, str for "finale"
    steps: list[TraceStep]


# --- API Request/Response Models ---

class QueryRequest(BaseModel):
    query: str
    scene: int
    alex_context: Optional[dict] = None


class QueryResponse(BaseModel):
    scene: int | str
    trace: SceneTrace
    response: str
    token_count: int


class VectorPoint(BaseModel):
    id: str
    label: str
    category: str
    x: float
    y: float
    z: float
    score: Optional[float] = None  # similarity score, only for matched chunks


class Scene1Response(BaseModel):
    trace: SceneTrace
    query_vector: VectorPoint
    matched_vectors: list[VectorPoint]
    all_vectors: list[VectorPoint]


class CompressionRequest(BaseModel):
    conversation_history: list[dict]
    token_count: int


class CompressionResponse(BaseModel):
    summary: str
    original_tokens: int
    compressed_tokens: int
