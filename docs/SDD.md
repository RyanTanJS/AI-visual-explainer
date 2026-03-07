# Software Design Document
## Visual Agentic AI Explainer — "Ask Apex"
### Version 2.0 | Narrative-Driven MVP

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [The Narrative: Meet Alex](#2-the-narrative-meet-alex)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Dataset Schema](#5-dataset-schema)
6. [LLM System Instructions](#6-llm-system-instructions)
7. [Scene Flows & Q&A Scripts](#7-scene-flows--qa-scripts)
8. [Core Modules](#8-core-modules)
9. [UI Layout & Component Structure](#9-ui-layout--component-structure)
10. [Caching Strategy](#10-caching-strategy)
11. [Implementation Milestones](#11-implementation-milestones)
12. [Folder Structure](#12-folder-structure)
13. [Dependencies](#13-dependencies)

---

## 1. Project Overview

### Purpose
An interactive, narrative-driven web application that visually explains Agentic AI concepts to non-technical stakeholders. The experience follows a fictional user ("Alex") having a conversation with an AI banking assistant, while a live "under the hood" panel reveals exactly what the AI is doing at each step.

### Target Audience
- Non-technical business clients and internal teams
- UBS Group Internal Consulting stakeholders
- Anyone curious about AI buzzwords but intimidated by technical explanations

### Core Goal
Bridge the communication gap between Data/AI engineering and business units. Every technical concept — RAG, embeddings, ReAct, multi-agent orchestration, context windows — is explained through something the viewer is already experiencing: a chatbot conversation.

### The Central Insight
> "You've used a chatbot before. This is what was actually happening."

### Key Concepts Taught
| Concept | Plain English | Scene |
|---|---|---|
| RAG | How AI reads your documents | Scene 1 |
| Vector embeddings | How AI understands meaning, not just words | Scene 1 |
| ReAct loop | How AI reasons before it acts | Scene 2 |
| Tool calling | How AI uses external tools for things it shouldn't guess | Scene 2 |
| Multi-agent orchestration | How specialist AIs cooperate on complex tasks | Scene 3 |
| Agent routing | How the manager AI delegates to the right specialist | Scene 3 |
| Memory types | What agents remember, and for how long | Scene 3 |
| Context window | AI's working memory limit | Throughout + Finale |
| Context compression | How AI summarises when it runs out of space | Finale |

---

## 2. The Narrative: Meet Alex

Alex is a young professional looking for his first proper bank account. He opens the Apex Bank AI assistant and asks a few questions. We follow his entire conversation — and see the machine room behind it the whole time.

### Story Arc

```
[Scene 1] Alex asks a simple product question
          → AI uses RAG to find relevant products
          → Viewer learns: vectors, embeddings, semantic search

[Scene 2] Alex asks if he can afford it
          → AI uses ReAct + Calculator tool
          → Viewer learns: reasoning loops, tool calling, why AI shouldn't do maths alone

[Scene 3] Alex asks a complex multi-part lifestyle question
          → Orchestrator routes to 3 specialist agents simultaneously
          → Viewer learns: multi-agent systems, routing, memory, state passing

[Finale]  Alex tries to ask one more question
          → Context window hits its limit — visual "overflow" moment
          → System compresses conversation into a summary
          → Viewer learns: context windows, why chatbots forget, compression
```

### Why This Works
- Alex is a proxy for the viewer — relatable, non-technical, just wants answers
- Every technical concept is motivated by something Alex *needs*
- The finale is a "failure" that becomes the best explanation — viewers have experienced chatbots forgetting things; now they understand why

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│                                                                 │
│   React + Tailwind CSS                                          │
│                                                                 │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│  │   Alex's Chat    │  │     "Under the Hood" Panel          │  │
│  │   (left panel)   │  │                                     │  │
│  │                  │  │  Scene 1: react-three-fiber          │  │
│  │  Chat bubbles    │  │           3D Vector Space           │  │
│  │  Typing anims    │  │                                     │  │
│  │  Scene labels    │  │  Scene 2: Framer Motion             │  │
│  │                  │  │           ReAct Loop Panel          │  │
│  │                  │  │                                     │  │
│  │                  │  │  Scene 3: @xyflow/react             │  │
│  │                  │  │           Agent Graph Canvas        │  │
│  └──────────────────┘  └─────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Context Window Bar (always visible, fills across scenes) │   │
│  │  [Scene 1 ████] [Scene 2 ██████] [Scene 3 ████░░░░░░░]   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP REST / JSON trace
┌─────────────────────────────▼───────────────────────────────────┐
│                          BACKEND                                │
│                                                                 │
│   FastAPI (Python)                                              │
│                                                                 │
│   /api/query        ← main query endpoint                       │
│   /api/scene/{id}   ← fetch cached trace for a scene           │
│   /api/products     ← product data endpoint                     │
│   /api/compress     ← trigger context compression              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LangGraph Orchestrator                                  │   │
│  │    ├── RAG Agent        (LlamaIndex + ChromaDB)          │   │
│  │    ├── Calculator Agent (deterministic Python tool)      │   │
│  │    ├── Product Agent    (structured metadata query)      │   │
│  │    ├── Eligibility Agent(rule-based + LLM reasoning)     │   │
│  │    └── Synthesiser Node (combines agent outputs)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Cache Layer: SQLite (LLM responses) + ChromaDB (vectors)      │
└──────────┬───────────────────────┬──────────────────────────────┘
           │                       │
    ┌──────▼──────┐        ┌───────▼───────┐
    │  OpenAI API │        │  ChromaDB     │
    │  gpt-4o-mini│        │  (local)      │
    │  text-emb-3 │        │               │
    └─────────────┘        └───────────────┘
```

---

## 4. Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| Tailwind CSS | 3+ | Styling |
| @xyflow/react | Latest | Agent graph canvas (Scene 3) |
| react-three-fiber | Latest | 3D vector space (Scene 1) |
| three.js | r128 | 3D rendering engine |
| Framer Motion | Latest | Transitions, ReAct panel animations |
| Zustand | Latest | Global state management |
| Lucide React | Latest | Agent node icons |
| dagre | Latest | Auto-layout for React Flow graph |

### Backend
| Library | Version | Purpose |
|---|---|---|
| FastAPI | Latest | API server |
| uvicorn | Latest | ASGI server |
| LlamaIndex | Latest | RAG pipeline |
| LangGraph | Latest | Multi-agent orchestration |
| langchain | Latest | Agent tooling |
| ChromaDB | Latest | Local vector database |
| openai | Latest | LLM + embedding API |
| pandas | Latest | Data manipulation |
| numpy | Latest | PCA dimensionality reduction |
| scikit-learn | Latest | PCA for 3D projection |
| python-dotenv | Latest | Environment variables |
| sqlite3 | stdlib | LLM response caching |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Railway / Render | Backend hosting |
| GitHub | Version control + CI/CD |

---

## 5. Dataset Schema

### Overview
The dataset is a synthetic financial product catalog for **Apex Bank** — a fictional bank designed to feel credible and universally relatable without using any real institution's branding or data.

### Product Schema

```json
{
  "product_id": "CC-001",
  "product_name": "Apex Sapphire Travel Card",
  "category": "Credit Card",
  "subcategory": "Travel",
  "annual_fee": 250.00,
  "interest_rate": 19.99,
  "min_credit_score": 700,
  "min_annual_income": 35000,
  "risk_level": "Low",
  "target_customer": ["frequent traveller", "business professional", "high spender"],
  "benefits": [
    "Airport lounge access worldwide",
    "2x points on travel and dining",
    "No foreign transaction fees",
    "$200 annual travel credit",
    "Comprehensive travel insurance"
  ],
  "cashback_rate": 0.02,
  "welcome_bonus_points": 50000,
  "related_products": ["CC-002", "SA-001"],
  "description": "The Apex Sapphire Travel Card is designed for the modern frequent traveller. With access to over 1,000 airport lounges globally, zero foreign transaction fees, and a generous 2x points multiplier on all travel and dining purchases, this card transforms every journey into a rewarding experience. The $200 annual travel credit effectively offsets most of the annual fee for regular travellers.",
  "eligibility_criteria": {
    "min_age": 18,
    "min_annual_income": 35000,
    "min_credit_score": 700,
    "employment_status": ["employed", "self-employed"]
  },
  "customer_sentiment_summary": "Customers consistently praise the lounge access and travel insurance. Common complaints relate to the annual fee being high for infrequent travellers.",
  "last_updated": "2025-01-15",
  "faqs": [
    {
      "q": "How do I access airport lounges?",
      "a": "Simply present your Apex Sapphire card at any participating lounge. You and one guest receive complimentary access per visit."
    },
    {
      "q": "When does the $200 travel credit reset?",
      "a": "The travel credit resets on your card anniversary date each year."
    },
    {
      "q": "Is travel insurance automatic?",
      "a": "Yes, travel insurance activates automatically when you purchase travel with your Apex Sapphire card."
    }
  ]
}
```

### Full Product Catalog

The dataset should include **20 products across 5 categories** to create visually distinct clusters in the 3D vector space:

| Category | Products | Cluster Colour |
|---|---|---|
| Credit Cards (Travel) | Sapphire Travel Card, Explorer Card | Blue |
| Credit Cards (Cashback) | Everyday Rewards Card, Student Cashback Card | Cyan |
| Mortgages | First Home Mortgage, Buy-to-Let Mortgage, Remortgage Product | Green |
| Personal Loans | Personal Loan (Standard), Debt Consolidation Loan, Green Home Improvement Loan | Amber |
| Savings & Investments | Easy Access ISA, Fixed Rate Bond, Stocks & Shares ISA, Wealth Management Account | Purple |

### Additional Data Points for Visual Impact

These fields are specifically designed to power the visualisation modules:

| Field | Type | Used In |
|---|---|---|
| `target_customer` | `List[String]` | Scene 1 — semantic clustering by lifestyle |
| `risk_level` | `Enum[Low, Medium, High]` | Scene 1 — metadata filter demo |
| `min_annual_income` | `Float` | Scene 2 — affordability calculator |
| `cashback_rate` | `Float` | Scene 2 — net benefit calculation |
| `eligibility_criteria` | `Object` | Scene 2 — eligibility check tool |
| `related_products` | `List[String]` | Scene 3 — recommendation agent |
| `customer_sentiment_summary` | `String` | Scene 3 — support agent context |
| `last_updated` | `Date` | Scene 1 — freshness filter |
| `description` | `String` | Primary vector embedding source |
| `faqs` | `List[Object]` | RAG retrieval — FAQ queries |

### FAQ Documents (Separate Collection)

In addition to product embeddings, a second ChromaDB collection stores standalone FAQ documents covering:

```
- "How does Apex Bank protect my data?"
- "What is the process for disputing a transaction?"
- "How do I reset my online banking password?"
- "What happens if I miss a loan repayment?"
- "How does Apex Bank calculate my credit limit?"
- "What is open banking and does Apex support it?"
```

These are intentionally unrelated to products so that Scene 3 can demonstrate routing — product questions go to the Product Agent, support questions go to the Support Agent.

---

## 6. LLM System Instructions

### 6.1 Master Banking Assistant System Prompt

This is the top-level system prompt used for all scenes. Scene-specific instructions are appended below this.

```
You are the Apex Bank AI Assistant — a helpful, professional, and friendly financial services assistant. 

Your personality:
- Warm but precise. You are helpful without being sycophantic.
- Confident about products you know, honest when you need to retrieve information.
- You never guess at financial figures — you always use available tools for calculations.
- You explain complex financial concepts in plain English without being condescending.

Your constraints:
- You only discuss Apex Bank products and general financial guidance.
- You NEVER provide specific investment advice or guarantee returns.
- You always recommend the user speak to a human advisor for major financial decisions.
- You NEVER fabricate product details — only state what is in your knowledge base.
- Keep responses concise: 2-4 sentences for simple queries, structured bullet points for comparisons.

Response format:
- Use plain conversational English.
- For product recommendations, always explain WHY the product suits the user.
- For calculations, show your working briefly so the user can verify.
- End complex responses with a clear next step or follow-up question.

Current user context:
- Name: Alex
- This is Alex's first interaction with Apex Bank's AI assistant.
```

### 6.2 Scene 1 — RAG Agent System Prompt

Appended to master prompt when Scene 1 RAG agent is active:

```
You are operating in RAG (Retrieval-Augmented Generation) mode.

You have been provided with the following retrieved document chunks from the Apex Bank product database. These chunks were retrieved using semantic similarity search against Alex's query. Use ONLY this information to answer. Do not use prior knowledge about financial products.

Retrieved chunks:
{retrieved_chunks}

Similarity scores:
{similarity_scores}

Instructions:
- Base your answer strictly on the retrieved chunks above.
- If the retrieved chunks do not contain enough information, say so clearly.
- Reference specific product names and benefits from the chunks.
- Do not mention that you are using retrieved documents — respond naturally.
- Keep your response to 3-4 sentences maximum.
```

### 6.3 Scene 2 — ReAct Agent System Prompt

```
You are operating in ReAct (Reasoning + Acting) mode.

You must solve the user's query by explicitly reasoning through the problem before acting. You have access to the following tools:

AVAILABLE TOOLS:
1. rag_search(query: str) → retrieves relevant product information from the Apex Bank database
2. calculate(expression: str) → evaluates a mathematical expression and returns the result. Use this for ALL numerical calculations. Never calculate in your head.
3. check_eligibility(product_id: str, annual_income: float, credit_score: int) → returns True/False with explanation

You MUST follow this exact format for every reasoning step:

Thought: [Your reasoning about what to do next]
Action: [Tool name and parameters, e.g. calculate("250 * 12")]
Observation: [The result returned by the tool]
... (repeat as needed)
Thought: [Final reasoning before answering]
Answer: [Your response to the user]

Rules:
- NEVER perform arithmetic yourself — always use the calculate tool
- Use rag_search before answering any product-specific question
- Show all intermediate calculations
- If eligibility is in question, always run check_eligibility before confirming a product
- Maximum 4 Thought/Action/Observation cycles before giving an Answer
```

### 6.4 Scene 3 — Orchestrator Routing Prompt

```
You are the Apex Bank Orchestrator Agent. Your job is to analyse incoming user queries and route them to the correct specialist agents.

AVAILABLE AGENTS:
- product_agent: Handles product recommendations, comparisons, rates, and features
- eligibility_agent: Handles affordability checks, income requirements, credit score assessments
- support_agent: Handles account management, FAQs, troubleshooting, security questions
- recommendation_agent: Handles "if I like X, what else might I like" type queries

ROUTING RULES:
- A query can be routed to MULTIPLE agents simultaneously if it contains multiple distinct intents
- Identify each distinct intent in the query separately
- Prefer parallel routing (simultaneous) over sequential routing where possible
- If a query is ambiguous, route to product_agent as default

You must respond in the following JSON format ONLY:
{
  "query_intents": [
    {
      "intent": "brief description of this part of the query",
      "agent": "agent_name",
      "priority": "high|medium|low",
      "context": "relevant information to pass to this agent"
    }
  ],
  "routing_strategy": "parallel|sequential",
  "reasoning": "one sentence explaining your routing decision"
}
```

### 6.5 Scene 3 — Individual Agent Prompts

**Product Agent:**
```
You are the Apex Bank Product Specialist Agent. You have deep knowledge of all Apex Bank products.

Your retrieved context:
{retrieved_product_chunks}

Answer ONLY the product-related aspects of the query. Be specific about rates, fees, and features. Format your response as structured data that can be combined with other agents' outputs:

{
  "agent": "product_agent",
  "findings": "your answer here",
  "products_mentioned": ["product_id_1", "product_id_2"],
  "confidence": 0.0-1.0
}
```

**Eligibility Agent:**
```
You are the Apex Bank Eligibility Assessment Agent. You assess whether users qualify for products based on their stated financial situation.

User context provided: {user_financial_context}
Product eligibility criteria: {eligibility_data}

Assess eligibility and respond in this format:
{
  "agent": "eligibility_agent", 
  "eligible": true|false,
  "findings": "plain English explanation",
  "conditions": ["any conditions or caveats"],
  "confidence": 0.0-1.0
}

Never be harsh about ineligibility. Always suggest alternatives.
```

### 6.6 Context Compression Prompt

Triggered when context window reaches 85% capacity:

```
The conversation context window is approaching its limit. You must create a concise summary that preserves all essential information while reducing token count by at least 60%.

Conversation to summarise:
{full_conversation_history}

Create a structured summary in this format:

CONVERSATION SUMMARY
User: Alex
Session started: {timestamp}

Key facts established:
- [bullet point facts about Alex's situation, preferences, financial details mentioned]

Products discussed:
- [product name]: [key points, Alex's reaction]

Decisions/conclusions reached:
- [any decisions made or recommendations accepted]

Outstanding questions:
- [anything Alex was still considering]

Tone note: Alex has been [brief characterisation] throughout the conversation.

---
[Continue conversation from this summary]
```

---

## 7. Scene Flows & Q&A Scripts

### Scene 1: "What card is best for travel?" — RAG

**Trigger:** Page loads, Alex's first message appears automatically after a 2-second delay.

**Alex's message:**
> "Hi! I travel quite a bit for work — usually 2-3 flights a month. What card would suit me best?"

**Backend flow:**
```
1. Query received by FastAPI /api/query
2. LlamaIndex embeds query → vector [0.23, -0.41, 0.87, ...]
3. ChromaDB cosine similarity search → top 3 chunks retrieved:
   - Chunk 1 (score: 0.94): Apex Sapphire Travel Card description
   - Chunk 2 (score: 0.87): Apex Explorer Card benefits
   - Chunk 3 (score: 0.71): Travel Insurance FAQ
4. Chunks + query passed to gpt-4o-mini with Scene 1 system prompt
5. Response streamed back
6. PCA-reduced vector coordinates returned for 3D visualisation
```

**Frontend animation sequence:**
```
t=0ms    Alex's message appears with typing animation
t=800ms  "Under the hood" panel activates
         Query text breaks into tokens visually
t=1200ms Tokens compress into single vector point (pink octahedron)
t=1600ms Vector flies into 3D space
t=2000ms Cosine similarity lines appear to 3 nearest products
         Top 3 products glow (Sapphire: green, Explorer: amber, FAQ: dim)
t=2800ms AI response types out in chat panel
         Similarity scores shown: 0.94 | 0.87 | 0.71
```

**AI Response:**
> "Great question, Alex! Based on your travel frequency, the **Apex Sapphire Travel Card** looks like a strong fit. You'd get access to over 1,000 airport lounges globally, zero foreign transaction fees, and a $200 annual travel credit — at 2-3 flights a month, that credit alone covers most of the £250 annual fee. The 2x points on travel and dining would also add up quickly on your work trips."

**Teaching callout shown to viewer:**
> 💡 *The AI didn't search for "travel card" — it understood that "2-3 flights a month for work" meant the same thing as "frequent business traveller." That's semantic search.*

---

### Scene 2: "Can I actually afford this?" — ReAct + Tool Calling

**Trigger:** Automatically after Scene 1 response, 1.5 second pause.

**Alex's message:**
> "That sounds good! I earn about £42,000 a year and spend roughly £1,800 a month on my card. Would the annual fee actually be worth it for me?"

**Backend flow:**
```
1. ReAct agent activated
2. Thought 1: "Need to calculate Alex's annual spend and potential cashback"
3. Action 1: rag_search("Sapphire card cashback rate and benefits value")
   Observation: "2x points = ~2% cashback equivalent on travel/dining. 
                 $200 travel credit. £250 annual fee."
4. Thought 2: "Need to calculate net benefit. 
               Assuming 30% of spend is travel/dining."
5. Action 2: calculate("1800 * 12 * 0.30 * 0.02")
   Observation: 129.6
6. Thought 3: "That's £129.60 in cashback. Plus £200 travel credit = £329.60 total value. 
               Minus £250 fee = £79.60 net positive. Also need eligibility check."
7. Action 3: check_eligibility("CC-001", 42000, null)
   Observation: "Eligible. Income of £42,000 meets £35,000 minimum. 
                 Credit score not provided but income suggests likely approval."
8. Thought 4: "Alex is eligible and net positive. Good recommendation to proceed."
9. Answer: [response below]
```

**Frontend animation sequence:**
```
t=0ms    Alex's message appears
t=600ms  3D vector space fades out
         ReAct panel slides in from right
t=1000ms "Thought 1" appears with typewriter effect
t=1800ms "Action: rag_search(...)" fires — tool icon pulses
t=2400ms "Observation:" result appears
t=3000ms "Thought 2" — calculation reasoning
t=3600ms "Action: calculate(1800 * 12 * 0.30 * 0.02)" fires
         Calculator tool icon lights up, equation visible
t=4000ms "Observation: 129.6" — result snaps in
t=4600ms "Thought 3" — synthesis
t=5200ms "Action: check_eligibility(...)" fires
t=5800ms "Observation: Eligible" — green checkmark
t=6200ms "Answer" section activates
         Response types in chat panel
Context bar visibly grows throughout
```

**AI Response:**
> "Good news on the numbers, Alex! Based on your £1,800 monthly spend — assuming about 30% goes on travel and dining — you'd earn roughly **£130 in cashback equivalent** per year. Add the **£200 annual travel credit** and your total benefit is around £330, against a £250 fee. That's a net positive of about **£80 per year**, before counting the lounge access and travel insurance. On your income, you'd also comfortably meet the eligibility criteria."

**Teaching callout shown to viewer:**
> 💡 *Notice the AI used a calculator tool for the maths — it didn't compute that in its head. That's intentional: LLMs are unreliable at arithmetic, so well-designed agents delegate numbers to deterministic tools.*

---

### Scene 3: "What about a mortgage too?" — Multi-Agent Orchestration

**Trigger:** Automatically after Scene 2, 1.5 second pause.

**Alex's message:**
> "Actually, I'm also thinking about buying a flat in the next year or so. My rent is £1,200/month and I've saved about £25,000. Can you tell me what mortgage options I might qualify for, and would having this credit card affect my mortgage application?"

**Backend flow:**
```
1. LangGraph Orchestrator receives query
2. Routing analysis:
   {
     "query_intents": [
       {
         "intent": "mortgage product options for first-time buyer",
         "agent": "product_agent",
         "priority": "high",
         "context": "income £42k, savings £25k, first-time buyer"
       },
       {
         "intent": "credit card impact on mortgage eligibility",
         "agent": "eligibility_agent", 
         "priority": "high",
         "context": "has Apex Sapphire card, £250 annual fee, £1800/month spend"
       },
       {
         "intent": "related product recommendations",
         "agent": "recommendation_agent",
         "priority": "medium",
         "context": "credit card customer moving to mortgage"
       }
     ],
     "routing_strategy": "parallel",
     "reasoning": "Three distinct intents detected — product lookup, eligibility assessment, and cross-sell recommendation can all run simultaneously"
   }
3. All three agents fire in parallel
4. State envelope carries: {alex_income, alex_savings, alex_credit_card, query_context}
5. Agents return results
6. Synthesiser node combines outputs
7. Single coherent response returned
```

**Frontend animation sequence:**
```
t=0ms    Alex's message appears
t=600ms  ReAct panel fades out
         React Flow graph blooms from centre
         Orchestrator node appears first
t=1200ms Orchestrator node pulses — "Analysing query..."
         Routing decision panel appears briefly
t=2000ms State envelope appears at orchestrator
         Splits into 3 copies simultaneously
t=2400ms Three edges animate simultaneously:
         → Product Agent (blue edge)
         → Eligibility Agent (amber edge)  
         → Recommendation Agent (purple edge)
t=2600ms All three agent nodes pulse "Working..."
         Memory panels appear on each:
         - Product Agent short-term: "first-time buyer, £42k income, £25k savings"
         - Eligibility Agent short-term: "credit card £250 fee, debt-to-income ratio"
         - Recommendation Agent episodic: "recall: Alex liked travel benefits"
t=4000ms Agents complete in sequence (staggered for visual clarity)
t=4800ms Results flow into Synthesiser node
         Three edges converge
t=5400ms Synthesiser pulses — "Combining outputs..."
t=6000ms Final response in chat panel
Context bar grows significantly — this was a complex query
```

**AI Response:**
> "Happy to help with both! Based on your £42,000 income and £25,000 in savings, you'd likely qualify for our **First Home Mortgage** — with a 5% deposit you could look at properties up to around £500,000 depending on affordability assessment.
>
> On your credit card question: having the Sapphire card itself won't negatively affect your mortgage application — what lenders look at is your overall debt-to-income ratio. Your £1,800/month card spend is well within a healthy range on your income, and you've been managing it responsibly.
>
> One thing worth knowing: as an existing Apex Bank customer, you may qualify for our **Loyalty Mortgage Rate**, which offers a 0.15% discount on standard rates. Would you like me to run through a rough monthly payment estimate?"

**Teaching callout shown to viewer:**
> 💡 *That question had three separate problems inside it: product lookup, eligibility check, and a recommendation. The orchestrator sent them to three specialist agents at the same time — like a manager briefing a team — then combined the answers. That's multi-agent orchestration.*

---

### Finale: Context Window Overflow

**Trigger:** After Scene 3 response, Alex types one more message.

**Alex's message:**
> "This is really helpful! One more thing — can you also explain what the difference is between the Fixed Rate Bond and the Stocks & Shares ISA? And also, what documents would I need to actually apply for the mortgage?"

**What happens:**

```
t=0ms    Alex types message
         Context bar has been filling throughout all scenes
t=500ms  As Alex hits send...
         Context bar: [██████████████████████░] 94%
t=800ms  Bar turns amber — "Context limit approaching"
t=1200ms Bar turns red and pulses — [████████████████████████] 100%
         
⚠️  CONTEXT LIMIT REACHED

t=1600ms Dramatic pause — all panels dim slightly
         A visual "compression" animation begins:
         The three coloured scene blocks in the context bar
         compress together like an accordion
         
t=2400ms Compressed block labelled "Summary" appears (small, dense)
         
t=3000ms Context bar resets: [█░░░░░░░░░░░░░░░░░░░░░░░░] 8%
         Summary block sits at the left
         
t=3400ms System message appears in chat:
         "— Conversation summarised to continue —"
         
t=4000ms AI responds to Alex's question normally
```

**System message shown to viewer (not in chat):**
```
CONTEXT COMPRESSED

Previous conversation reduced from ~3,200 tokens to ~280 tokens.

Summary generated:
"User Alex (income £42k, savings £25k, frequent traveller) has explored 
the Apex Sapphire Travel Card (net positive £80/yr, eligible) and First 
Home Mortgage options. Positive sentiment throughout. Outstanding: 
ISA/bond comparison and mortgage document requirements."
```

**Teaching callout shown to viewer:**
> 💡 *AI has a fixed "working memory" — called a context window. Once it's full, the AI can't see earlier parts of the conversation. The solution: automatically summarise what happened so far and keep going. This is why long conversations with chatbots can sometimes feel like they've "forgotten" something.*

---

## 8. Core Modules

### Module 1: Visual RAG Pipeline (Scene 1)

**Ingestion Phase (runs at startup/demo reset):**
- Documents loaded from `data/products.json`
- Descriptions + FAQs chunked by LlamaIndex `SentenceSplitter` (chunk_size=256, overlap=32)
- Each chunk embedded via `text-embedding-3-small` → 1536-dimensional vector
- All vectors stored in ChromaDB with metadata: `{product_id, category, risk_level, annual_fee}`
- PCA applied to reduce 1536-dim → 3-dim for frontend visualisation

**Retrieval Phase:**
- Query embedded in real-time
- ChromaDB cosine similarity search → top 3 chunks returned with scores
- 3D coordinates of query vector and matched chunks sent to frontend

### Module 2: ReAct Loop + Tool Calling (Scene 2)

**Tools implemented:**

```python
# Tool 1: RAG Search
@tool
def rag_search(query: str) -> str:
    """Search the Apex Bank product database for relevant information."""
    results = chroma_collection.query(query_texts=[query], n_results=2)
    return format_chunks(results)

# Tool 2: Calculator
@tool  
def calculate(expression: str) -> float:
    """Evaluate a mathematical expression. Use for all numerical calculations."""
    return eval(expression, {"__builtins__": {}}, {})  # sandboxed

# Tool 3: Eligibility Check
@tool
def check_eligibility(product_id: str, annual_income: float, credit_score: int = None) -> dict:
    """Check if a user meets eligibility criteria for a product."""
    product = get_product(product_id)
    criteria = product["eligibility_criteria"]
    return {
        "eligible": annual_income >= criteria["min_annual_income"],
        "income_check": f"£{annual_income:,.0f} vs minimum £{criteria['min_annual_income']:,.0f}",
        "note": "Credit check required at application stage"
    }
```

**Trace format returned to frontend:**
```json
{
  "scene": 2,
  "steps": [
    {"type": "thought", "content": "Need to calculate net benefit...", "t": 0},
    {"type": "action", "tool": "rag_search", "params": {"query": "Sapphire cashback rate"}, "t": 800},
    {"type": "observation", "result": "2x points = ~2% on travel/dining...", "t": 1400},
    {"type": "action", "tool": "calculate", "params": {"expression": "1800*12*0.30*0.02"}, "t": 2200},
    {"type": "observation", "result": 129.6, "t": 2600},
    {"type": "answer", "content": "Final response text...", "t": 4000}
  ]
}
```

### Module 3: Multi-Agent Orchestration (Scene 3)

**LangGraph graph definition:**
```python
from langgraph.graph import StateGraph

class AgentState(TypedDict):
    query: str
    alex_context: dict          # income, savings, existing products
    routing_decision: dict      # orchestrator's routing JSON
    product_results: str        # product agent output
    eligibility_results: str    # eligibility agent output  
    recommendation_results: str # recommendation agent output
    final_response: str         # synthesiser output
    token_count: int            # running context window total

graph = StateGraph(AgentState)
graph.add_node("orchestrator", orchestrator_node)
graph.add_node("product_agent", product_agent_node)
graph.add_node("eligibility_agent", eligibility_agent_node)
graph.add_node("recommendation_agent", recommendation_agent_node)
graph.add_node("synthesiser", synthesiser_node)
```

**Memory types visualised per agent:**

| Agent | Short-term | Long-term | Episodic |
|---|---|---|---|
| Orchestrator | Current query intent | Routing rules | Past routing decisions |
| Product Agent | Query context | Full product catalog | Similar past queries |
| Eligibility Agent | Alex's financial data | Eligibility criteria rules | Alex's profile from Scene 2 |
| Recommendation Agent | Alex's confirmed products | Product similarity map | Alex's stated preferences |

### Module 4: Context Window Visualiser (Throughout)

- Token count estimated at ~4 chars/token
- Bar divided into coloured segments per scene
- Each agent message, tool call, and response adds to the count
- Threshold warnings at 70% (amber), 90% (red pulse), 100% (compression trigger)
- Compression reduces to ~8-10% via summarisation

---

## 9. UI Layout & Component Structure

### Overall Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: "Ask Apex" logo | "Under the Hood" label | scene pill  │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                      │
│   CHAT PANEL (40%)       │   VISUALISATION PANEL (60%)          │
│                          │                                      │
│   Alex avatar            │   Scene 1: Three.js 3D space         │
│   Chat bubbles           │   Scene 2: ReAct step panel          │
│   Typing indicator       │   Scene 3: React Flow graph          │
│   Teaching callouts      │                                      │
│   (appear below each     │   Smooth Framer Motion transitions   │
│    AI response)          │   between scenes                     │
│                          │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│   CONTEXT WINDOW BAR                                            │
│   [S1: RAG ████][S2: ReAct ██████][S3: Agents ████░░░░] 67%    │
│   Token count: 2,847 / 4,096                                    │
└─────────────────────────────────────────────────────────────────┘
```

### React Component Tree

```
App
├── Header
│   ├── Logo
│   ├── ScenePill (current scene indicator)
│   └── InfoButton (concept glossary)
├── MainLayout
│   ├── ChatPanel
│   │   ├── MessageList
│   │   │   ├── UserMessage (Alex)
│   │   │   ├── AssistantMessage
│   │   │   └── TeachingCallout
│   │   └── TypingIndicator
│   └── VisualisationPanel
│       ├── Scene1_VectorSpace (react-three-fiber)
│       │   ├── VectorCloud (document nodes)
│       │   ├── QueryVector (pink octahedron)
│       │   ├── SimilarityLines
│       │   └── ProductLabels
│       ├── Scene2_ReActPanel (Framer Motion)
│       │   ├── ThoughtBubble
│       │   ├── ActionBlock
│       │   │   └── ToolIcon (Lucide)
│       │   └── ObservationBlock
│       └── Scene3_AgentGraph (@xyflow/react)
│           ├── OrchestratorNode (custom)
│           ├── AgentNode x3 (custom)
│           │   ├── AgentIcon (Lucide hexagon)
│           │   ├── StatusIndicator
│           │   └── MemoryPanel
│           ├── SynthesiserNode (custom)
│           └── AnimatedEdges
└── ContextWindowBar
    ├── SegmentBlock x3 (one per scene)
    ├── ProgressFill
    ├── TokenCounter
    └── CompressionAnimation
```

### Agent Node Design (React Flow Custom Node)

```
┌─────────────────────────┐
│  ⬡  [Lucide icon]       │  ← hexagon shape, icon changes per agent type
│     Agent Name          │
│  ● Status text          │  ← idle / thinking / active / done
│  ─────────────────────  │
│  MEMORY                 │
│  ┌─────────────────┐    │
│  │ 🟡 ST: "query   │    │  ST = short-term (yellow)
│  │    context"     │    │
│  │ 🟠 LT: "product │    │  LT = long-term (amber)
│  │    catalog"     │    │
│  │ 🟣 EP: "scene 2 │    │  EP = episodic (purple)
│  │    recall"      │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## 10. Caching Strategy

### Two-Layer Cache

**Layer 1: Vector Cache (ChromaDB — persistent)**
- Embeddings generated once during data ingestion
- Stored to disk at `./chroma_db/`
- Never regenerated unless dataset changes
- Cost: one-time embedding API call for ~60 chunks ≈ $0.001

**Layer 2: LLM Response Cache (SQLite)**
```python
# Cache schema
CREATE TABLE response_cache (
    query_hash TEXT PRIMARY KEY,  -- SHA256 of normalised query
    scene_id INTEGER,
    response_json TEXT,           -- full trace JSON
    created_at TIMESTAMP,
    hit_count INTEGER DEFAULT 0
);
```

- All 3 scene queries pre-computed and cached on first run
- Subsequent requests return cached trace instantly
- Cache key = SHA256(normalised_query + scene_id)
- Cache invalidation: manual only (run `python scripts/regenerate_cache.py`)

### Pre-computed Cache Entries

The following queries are pre-cached for the demo:

```python
CACHED_QUERIES = [
    {
        "scene": 1,
        "query": "I travel quite a bit for work, usually 2-3 flights a month. What card would suit me best?",
        "trace_file": "cache/scene1_travel_card.json"
    },
    {
        "scene": 2, 
        "query": "I earn about £42,000 a year and spend roughly £1,800 a month on my card. Would the annual fee actually be worth it?",
        "trace_file": "cache/scene2_affordability.json"
    },
    {
        "scene": 3,
        "query": "I'm also thinking about buying a flat. What mortgage options might I qualify for, and would having this credit card affect my application?",
        "trace_file": "cache/scene3_mortgage_orchestration.json"
    },
    {
        "scene": "finale",
        "query": "Can you explain the Fixed Rate Bond vs ISA, and what documents do I need for the mortgage?",
        "trace_file": "cache/finale_compression.json"
    }
]
```

---

## 11. Implementation Milestones

### Phase 1 — Data & Backend Foundation (Week 1)
- [ ] Generate complete `products.json` dataset (20 products, full schema)
- [ ] Set up FastAPI project structure
- [ ] Define Pydantic models for all data types
- [ ] Initialise ChromaDB client and collections
- [ ] Write LlamaIndex ingestion pipeline
- [ ] Apply PCA to reduce embeddings to 3D
- [ ] Implement SQLite cache layer
- [ ] Expose `/api/products` and `/api/scene/{id}` endpoints

### Phase 2 — Scene 1: RAG Visualisation (Week 2)
- [ ] Build React project with Tailwind
- [ ] Implement chat panel with bubble components
- [ ] Build Three.js 3D vector space (reuse RAGLens code)
- [ ] Connect to `/api/scene/1` endpoint
- [ ] Implement trace replay engine with setTimeout buffers
- [ ] Add teaching callout component
- [ ] Test Scene 1 end-to-end

### Phase 3 — Scene 2: ReAct Panel (Week 2-3)
- [ ] Build LangGraph ReAct agent with 3 tools
- [ ] Implement tool call event capture and trace serialisation
- [ ] Build ReAct step-by-step panel component
- [ ] Framer Motion transitions (vector space → ReAct panel)
- [ ] Test affordability calculation accuracy
- [ ] Add Scene 2 to trace replay engine

### Phase 4 — Scene 3: Agent Graph (Week 3)
- [ ] Build LangGraph multi-agent graph (orchestrator + 3 agents + synthesiser)
- [ ] Implement parallel routing logic
- [ ] Build React Flow graph with custom hexagon nodes
- [ ] Implement memory panel component
- [ ] Animate state envelope travelling between nodes
- [ ] Framer Motion transition (ReAct → React Flow)

### Phase 5 — Context Window & Finale (Week 4)
- [ ] Build context window bar component
- [ ] Implement token counting across all scenes
- [ ] Build compression animation
- [ ] Implement context summarisation prompt + API call
- [ ] Test full narrative flow end-to-end

### Phase 6 — Polish & Deploy (Week 4)
- [ ] Landing screen ("Meet Alex" intro)
- [ ] Mobile responsive layout (stretch goal)
- [ ] Error states and loading indicators
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway
- [ ] Write README with architecture explanation

---

## 12. Folder Structure

```
ask-apex/
├── frontend/
│   ├── public/
│   │   └── alex-avatar.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   └── VisualisationPanel.jsx
│   │   │   ├── chat/
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   ├── TypingIndicator.jsx
│   │   │   │   └── TeachingCallout.jsx
│   │   │   ├── scenes/
│   │   │   │   ├── Scene1_VectorSpace.jsx
│   │   │   │   ├── Scene2_ReActPanel.jsx
│   │   │   │   └── Scene3_AgentGraph.jsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentNode.jsx        ← React Flow custom node
│   │   │   │   ├── OrchestratorNode.jsx
│   │   │   │   ├── MemoryPanel.jsx
│   │   │   │   └── StateEnvelope.jsx
│   │   │   └── context/
│   │   │       ├── ContextWindowBar.jsx
│   │   │       └── CompressionAnimation.jsx
│   │   ├── stores/
│   │   │   ├── sceneStore.js       ← Zustand: current scene, active agents
│   │   │   ├── traceStore.js       ← Zustand: replay trace state
│   │   │   └── contextStore.js     ← Zustand: token count, compression state
│   │   ├── utils/
│   │   │   ├── traceReplayer.js    ← setTimeout-based trace replay engine
│   │   │   └── tokenCounter.js     ← approximate token count utility
│   │   ├── data/
│   │   │   └── traces/             ← cached trace JSONs (bundled at build time)
│   │   │       ├── scene1.json
│   │   │       ├── scene2.json
│   │   │       ├── scene3.json
│   │   │       └── finale.json
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py                     ← FastAPI app + routes
│   ├── agents/
│   │   ├── orchestrator.py         ← LangGraph graph definition
│   │   ├── rag_agent.py            ← LlamaIndex RAG + ChromaDB
│   │   ├── react_agent.py          ← ReAct loop + tools
│   │   ├── product_agent.py
│   │   ├── eligibility_agent.py
│   │   └── recommendation_agent.py
│   ├── tools/
│   │   ├── calculator.py
│   │   ├── rag_search.py
│   │   └── eligibility_check.py
│   ├── data/
│   │   ├── products.json           ← full 20-product dataset
│   │   └── faqs.json               ← standalone FAQ documents
│   ├── cache/
│   │   ├── responses.db            ← SQLite LLM response cache
│   │   └── traces/                 ← pre-computed trace JSONs
│   ├── chroma_db/                  ← ChromaDB persistent storage
│   ├── scripts/
│   │   ├── ingest.py               ← run once to embed + store all products
│   │   ├── generate_traces.py      ← run once to pre-compute all scene traces
│   │   └── reduce_dimensions.py    ← PCA 1536→3 for visualisation
│   ├── models.py                   ← Pydantic data models
│   ├── config.py                   ← settings, API keys, thresholds
│   └── requirements.txt
│
├── .env                            ← OPENAI_API_KEY (never committed)
├── .gitignore
└── README.md
```

---

## 13. Dependencies

### Frontend `package.json`

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@xyflow/react": "latest",
    "three": "^0.128.0",
    "@react-three/fiber": "latest",
    "@react-three/drei": "latest",
    "framer-motion": "latest",
    "zustand": "latest",
    "lucide-react": "latest",
    "dagre": "latest",
    "tailwindcss": "^3.0.0"
  }
}
```

### Backend `requirements.txt`

```
fastapi
uvicorn[standard]
llama-index
llama-index-vector-stores-chroma
llama-index-embeddings-openai
langchain
langgraph
langchain-openai
chromadb
openai
pandas
numpy
scikit-learn
pydantic
python-dotenv
aiohttp
```

---

*Document version 2.0 — reflects narrative-driven "Meet Alex" architecture*
*Next review: after Phase 2 implementation*
