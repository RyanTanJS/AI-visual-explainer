# Orchestrator Node — analyses the query and decides which agents to invoke
#
# Input:  state["query"], state["alex_context"]
# Output: state["routing_decision"] (parsed JSON), state["trace_steps"] (appended)
#
# Uses the Scene 3 Orchestrator Routing Prompt from the SDD (§6.4).
# Calls Gemini to produce a JSON routing decision like:
# {
#   "query_intents": [
#     {"intent": "...", "agent": "product_agent", "priority": "high", "context": "..."},
#     ...
#   ],
#   "routing_strategy": "parallel",
#   "reasoning": "..."
# }

# TODO: implement orchestrator_node(state) -> dict

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
import json

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=API_KEY)


def orchestrator_node(state):
    system_prompt = """You are the Apex Bank Orchestrator Agent. Your job is to analyse incoming user queries and route them to the correct specialist agents.

AVAILABLE AGENTS:
- product_agent: Handles product recommendations, comparisons, rates, and features
- eligibility_agent: Handles affordability checks, income requirements, credit score assessments
- recommendation_agent: Handles "if I like X, what else might I like" type queries

ROUTING RULES:
- A query can be routed to MULTIPLE agents simultaneously if it contains multiple distinct intents
- Identify each distinct intent in the query separately
- Prefer parallel routing over sequential routing where possible
- If a query is ambiguous, route to product_agent as default

You must respond in the following JSON format ONLY — no other text, no markdown, no explanation:
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
}"""
    
    alex = state["alex_context"]
    human_message = f"""User query: {state['query']}
                    User context:
                    - Income: £{alex.get("income")}
                    - Savings: £{alex.get("savings")}
                    - Monthly rent: £{alex.get("monthly_rent")}
                    - Monthly card spend: £{alex.get("monthly_card_spend")}
                    - Existing products: {", ".join(alex.get("existing_products", []))}"""
    
    response = model.invoke([
        ("system",system_prompt),
        ("human",human_message)
    ])
    
    content = response.content.strip()
    # Strip markdown code fences if Gemini wraps the JSON
    if content.startswith("```"):
        content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    routing_decision = json.loads(content)

    return {"routing_decision":routing_decision}
