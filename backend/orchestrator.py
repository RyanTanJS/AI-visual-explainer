from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
import os
from dotenv import load_dotenv
from tools.calculator import calculator
from tools.rag_search import rag_search
from tools.eligibility_check import check_eligibility



load_dotenv()
key = os.getenv("GOOGLE_API_KEY")


class AgentStates(TypedDict):
    messages: Annotated[list,add_messages]

tools = [calculator,rag_search,check_eligibility]
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash",api_key=key)
model_with_tools = model.bind_tools(tools)

def agent_node(state):
    response = model_with_tools.invoke(state["messages"])
    return {"messages":[response]}

def should_continue(state):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

graph = StateGraph(AgentStates)
graph.add_node("agent",agent_node)
graph.add_node("tools",ToolNode(tools=tools))
graph.add_edge("tools","agent")
graph.add_conditional_edges("agent",should_continue)
graph.set_entry_point("agent")
app = graph.compile()

if __name__ == "__main__":
    result = app.invoke({"messages": [("human", "What travel credit cards do you offer?")]})
    print(result["messages"][-1].content)
