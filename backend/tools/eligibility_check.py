from langchain_core.tools import tool
from pathlib import Path
import json

with open(Path(__file__).parent.parent / "data" / "products.json", encoding="utf-8") as f:
    products = json.load(f)

@tool
def check_eligibility(product_name: str,cus_income: float,cus_age: int,cus_credit_score: int) -> str:
    """Check eligibility of customer for a given product."""
    product = next((p for p in products if p['product_name'] == product_name), None)

    requirement_not_met = []
    if not product:
        return "Product not found."
    if cus_income<product['eligibility_criteria']['min_income']:
        requirement_not_met.append("Does not meet minimum income requirement.")
    if cus_age<product['eligibility_criteria']['min_age']:
        requirement_not_met.append("Does not meet minimum age requirement.")
    if cus_credit_score<product['eligibility_criteria']['min_credit_score']:
        requirement_not_met.append("Does not meet minimum credit score requirement.")
    
    if requirement_not_met:
        return "\n".join(requirement_not_met)
    else:
        return "Eligible"