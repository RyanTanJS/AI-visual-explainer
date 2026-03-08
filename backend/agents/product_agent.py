# Product Agent — retrieves and summarises relevant product information
#
# Input:  state["query"], state["alex_context"], state["routing_decision"]
# Output: state["product_results"], state["trace_steps"] (appended)
#
# Steps:
#   1. Extract the product-related intent from routing_decision
#   2. Call rag_search tool directly to retrieve product chunks
#   3. Call Gemini with the Product Agent prompt (SDD §6.5) + retrieved chunks
#   4. Return structured findings
#
# The Product Agent prompt expects the LLM to return:
# {"agent": "product_agent", "findings": "...", "products_mentioned": [...], "confidence": 0.0-1.0}

# TODO: implement product_agent_node(state) -> dict

from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from tools.rag_search import rag_search


load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=API_KEY)




def product_agent_node(state):
    for intent in state['routing_decision']['query_intents']:
        if intent['agent'] == "product_agent":
            agent_context = intent['context']
            break
    chunks = rag_search.invoke({"query": agent_context})
    product_agent_prompt = """You are the Apex Bank Product Specialist Agent. You have deep knowledge of all Apex Bank products.

                            Your retrieved context:
                            {chunks}

                            Answer ONLY the product-related aspects of the query. Be specific about rates, fees, and features. Format your response as structured data that can be combined with other agents' outputs:

                            {{
                            "agent": "product_agent",
                            "findings": "your answer here",
                            "products_mentioned": ["product_id_1", "product_id_2"],
                            "confidence": 0.0-1.0
                            }}"""

    
    repsonse = model.invoke([
        ("system",product_agent_prompt.format(chunks=chunks)),
        ("human",state['query'])
    ])

    return {"product_results":repsonse.content}
