from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_google_genai import ChatGoogleGenerativeAI
import os

def get_sql_agent():
    # Fetch database URL from environment
    db_uri = os.getenv("DATABASE_URL")
    
    if not db_uri:
        raise ValueError("DATABASE_URL environment variable is not set. Please add it to your .env file.")

    # Initialize Database Connection
    db = SQLDatabase.from_uri(db_uri, sample_rows_in_table_info=3)

    # Initialize LLM with Gemini
    # Ensure GOOGLE_API_KEY is set in environment
    if not os.getenv("GOOGLE_API_KEY"):
         raise ValueError("GOOGLE_API_KEY environment variable is not set. Please add it to your .env file.")

    llm = ChatGoogleGenerativeAI(model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"), temperature=0)

    # Create the Agent
    # Note: agent_type might need adjustment depending on Gemini's tool calling support in the installed version
    # "zero-shot-react-description" is a safe generic default if specific tool-calling features vary
    # Create the Agent
    # We add the vector_search_tool as an "extra tool" so the agent can use it when SQL fails or for general knowledge.
    from tools.vector_search import vector_search_tool
    
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="zero-shot-react-description",
        verbose=True,
        extra_tools=[vector_search_tool]
    )

    return agent_executor
