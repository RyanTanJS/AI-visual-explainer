from langgraph.graph import StateGraph, END
from typing import Annotated
from typing_extensions import TypedDict
import operator
from agents.product_agent import product_agent_node
from agents.eligibility_agent import eligibility_agent_node
from agents.recommendation_agent import recommendation_agent_node
from agents.synthesiser import synthesiser_node
from agents.orchestrator_node import orchestrator_node

class MultiAgentState(TypedDict):
    query: str
    alex_context: dict
    routing_decision: dict
    product_results: str
    eligibility_results: str
    recommendation_results: str
    final_response: str
    trace_steps: Annotated[list,operator.add]


def route_to_agents(state: MultiAgentState):
    routing_decision = state["routing_decision"]
    query_intents = routing_decision["query_intents"]
    return [query_intent["agent"] for query_intent in query_intents]

graph = StateGraph(MultiAgentState)
graph.add_node("orchestrator",orchestrator_node)
graph.add_node("product_agent",product_agent_node)
graph.add_node("eligibility_agent",eligibility_agent_node)
graph.add_node("recommendation_agent",recommendation_agent_node)
graph.add_node("synthesiser",synthesiser_node)
graph.set_entry_point("orchestrator")
graph.add_conditional_edges("orchestrator",route_to_agents)
graph.add_edge("product_agent","synthesiser")
graph.add_edge("eligibility_agent","synthesiser")
graph.add_edge("recommendation_agent","synthesiser")
graph.add_edge("synthesiser",END)
app = graph.compile()

if __name__ == "__main__":
    result = app.invoke({
        "query": "I'm thinking about buying a flat. My rent is £1,200/month and I've saved £25,000. What mortgage options might I qualify for, and would having this credit card affect my application?",
        "alex_context": {
            "income": 42000,
            "savings": 25000,
            "monthly_rent": 1200,
            "existing_products": ["Apex Sapphire Travel Card"],
            "monthly_card_spend": 1800,
        },
        "routing_decision": {},
        "product_results": "",
        "eligibility_results": "",
        "recommendation_results": "",
        "final_response": "",
        "trace_steps": [],
    })
    print(result["final_response"])