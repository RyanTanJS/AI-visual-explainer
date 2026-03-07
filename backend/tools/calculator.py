from langchain_core.tools import tool
import ast

@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression and return the result."""
    tree = ast.parse(expression, mode="eval")
    body = tree.body
    result = safe_eval(body)

    return str(result)


def safe_eval(root):
    if isinstance(root, ast.Constant):
        return root.value
    elif isinstance(root, ast.BinOp):
        left = safe_eval(root.left)
        right = safe_eval(root.right)
        if isinstance(root.op,ast.Add):
            return left+right
        elif isinstance(root.op,ast.Sub):
            return left-right
        elif isinstance(root.op,ast.Mult):
            return left*right
        elif isinstance(root.op,ast.Div):
            return left/right
        elif isinstance(root.op,ast.Mod):
            return left%right
        elif isinstance(root.op,ast.FloorDiv):
            return left//right
        elif isinstance(root.op,ast.Pow):
            return left**right
    elif isinstance(root,ast.UnaryOp):
        value = safe_eval(root.operand)
        if isinstance(root.op,ast.UAdd):
            return +value
        elif isinstance(root.op,ast.USub):
            return -value
    
    
    else:
        raise ValueError("Unsupported operation")