# Eligibility Agent — assesses whether Alex qualifies for products
#
# Input:  state["query"], state["alex_context"], state["routing_decision"]
# Output: state["eligibility_results"], state["trace_steps"] (appended)
#
# Steps:
#   1. Extract the eligibility-related intent from routing_decision
#   2. Call check_eligibility tool directly with Alex's financial context
#   3. Call Gemini with the Eligibility Agent prompt (SDD §6.5) + tool results
#   4. Return structured assessment
#
# The Eligibility Agent prompt expects the LLM to return:
# {"agent": "eligibility_agent", "eligible": true/false, "findings": "...",
#  "conditions": [...], "confidence": 0.0-1.0}

# TODO: implement eligibility_agent_node(state) -> dict

from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from tools.eligibility_check import check_eligibility




load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=API_KEY)


def eligibility_agent_node(state):
    for intent in state['routing_decision']['query_intents']:
        if intent['agent'] == "eligibility_agent":
            agent_context = intent['context']
            break
    user_context = state['alex_context']
    
    eligible = check_eligibility.invoke({
        'product_name':user_context.get('product_name',"First Home Mortgage"),
        "cus_income":user_context['income'],
        "cus_age":user_context.get('age',30),
        "cus_credit_score":user_context.get('credit_score',700)
    })

    eligibility_agent_system_prompt = """You are the Apex Bank Eligibility Assessment Agent. You assess whether users qualify for products based on their stated financial situation.
        User context provided: {user_context}
        Eligibility check result: {eligible}

        Assess eligibility and respond in this format:
        {{
        "agent": "eligibility_agent",
        "eligible": true or false,
        "findings": "plain English explanation",
        "conditions": ["any conditions or caveats"],
        "confidence": 0.0-1.0
        }}

        Never be harsh about ineligibility. Always suggest alternatives."""
    
    reponse = model.invoke([
        ("system",eligibility_agent_system_prompt.format(user_context=agent_context,eligible=eligible)),
        ("human",state['query'])
    ])

    return {"eligibility_results":reponse.content}