# Synthesiser Node — combines all agent outputs into one coherent response
#
# Input:  state["product_results"], state["eligibility_results"],
#         state["recommendation_results"], state["alex_context"]
# Output: state["final_response"], state["trace_steps"] (appended)
#
# Calls Gemini once with all three agent outputs and asks it to produce
# a single, natural-sounding response for Alex — no JSON, just conversational text.
#
# The synthesiser should:
#   - Lead with the most important information (mortgage options)
#   - Address the credit card impact question directly
#   - Weave in the recommendation naturally
#   - End with a follow-up question (per the master system prompt)

# TODO: implement synthesiser_node(state) -> dict

from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=API_KEY)

def synthesiser_node(state):
    synthesiser_prompt = """You are the Apex Bank response synthesiser. Combine the following specialist agent outputs into a single, natural conversational response for the customer Alex.

    Product Agent findings: {product_results}
    Eligibility Assessment: {eligibility_results}
    Recommendations: {recommendation_results}

    Rules:
    - Write as one coherent response, not three separate answers
    - Lead with the most important information first
    - Be warm and professional
    - End with a follow-up question
    - Do not mention that multiple agents were involved"""

    response = model.invoke([
        ("system", synthesiser_prompt.format(
            product_results=state["product_results"],
            eligibility_results=state["eligibility_results"],
            recommendation_results=state["recommendation_results"]
        )),
        ("human", state["query"])
    ])

    return {"final_response": response.content}

