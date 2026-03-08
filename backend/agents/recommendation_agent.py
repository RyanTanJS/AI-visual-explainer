# Recommendation Agent — suggests related products based on Alex's profile
#
# Input:  state["query"], state["alex_context"], state["routing_decision"]
# Output: state["recommendation_results"], state["trace_steps"] (appended)
#
# Steps:
#   1. Extract the recommendation intent from routing_decision
#   2. Use rag_search to find products related to Alex's existing/discussed products
#   3. Call Gemini to produce cross-sell recommendations
#   4. Return findings
#
# This agent uses "episodic memory" — it references what Alex liked in earlier scenes
# (travel benefits, Sapphire card) to make relevant suggestions.

# TODO: implement recommendation_agent_node(state) -> dict
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from tools.rag_search import rag_search

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=API_KEY)



def recommendation_agent_node(state):
    for intent in state['routing_decision']['query_intents']:
        if intent['agent'] == "recommendation_agent":
            agent_context = intent['context']
            break
    chunks = rag_search.invoke({"query": agent_context})
    recommendation_agent_system_prompt = """You are the Apex Bank Recommendation Agent. You suggest related products based on the customer's existing products and stated preferences.

        Customer's existing products: {existing_products}
        Related products from database: {chunks}

        Based on the customer's profile, suggest products that complement what they already have. Think about cross-sell opportunities — e.g. a credit card customer buying a mortgage may qualify for loyalty discounts.

        Focus on WHY each recommendation makes sense for this specific customer. Do not repeat products they already have."""

    existing_products =", ".join(state['alex_context'].get('existing_products',[]))
    response = model.invoke([
        ("system",recommendation_agent_system_prompt.format(existing_products=existing_products,chunks=chunks)),
        ("human",state['query'])
    ])

    return {"recommendation_results":response.content}