from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, status

from .database import connection
from .schemas import (
    ActivityItem, AgentQuestion, AgentResponse, CaseDecision, CaseStatus,
    CustomerCreate, CustomerRisk, CustomerUpdate, DashboardSummary, Insight, RiskCase,
    RiskRule, WorkspaceSettings,
)

router = APIRouter(prefix="/api", tags=["risk operations"])


def case_from_row(row: object) -> RiskCase:
    return RiskCase(**dict(row))


@router.get("/cases", response_model=list[RiskCase])
def list_cases(status: Optional[CaseStatus] = Query(default=None)) -> list[RiskCase]:
    query = "SELECT id, subject, category, score, exposure, status, reason, created_at FROM risk_cases"
    values: list[str] = []
    if status is None:
        query += " WHERE status != 'Resolved'"
    else:
        query += " WHERE status = ?"
        values.append(status.value)
    query += " ORDER BY score DESC, created_at DESC"
    with connection() as db:
        return [case_from_row(row) for row in db.execute(query, values).fetchall()]


@router.get("/cases/{case_id}", response_model=RiskCase)
def get_case(case_id: str) -> RiskCase:
    with connection() as db:
        row = db.execute("SELECT id, subject, category, score, exposure, status, reason, created_at FROM risk_cases WHERE id = ?", (case_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Risk case not found")
    return case_from_row(row)


@router.post("/cases/{case_id}/decision", response_model=RiskCase)
def record_decision(case_id: str, decision: CaseDecision) -> RiskCase:
    next_status = {"review": "In review", "escalate": "Escalated", "resolve": "Resolved"}[decision.action]
    with connection() as db:
        cursor = db.execute("UPDATE risk_cases SET status = ? WHERE id = ?", (next_status, case_id))
        if not cursor.rowcount:
            raise HTTPException(status_code=404, detail="Risk case not found")
        row = db.execute("SELECT id, subject, category, score, exposure, status, reason, created_at FROM risk_cases WHERE id = ?", (case_id,)).fetchone()
    return case_from_row(row)


@router.get("/dashboard", response_model=DashboardSummary)
def dashboard_summary() -> DashboardSummary:
    with connection() as db:
        row = db.execute("SELECT COALESCE(SUM(exposure), 0) AS exposure, COUNT(*) AS cases FROM risk_cases WHERE status != 'Resolved'").fetchone()
        category_rows = db.execute("SELECT category, SUM(exposure) AS exposure FROM risk_cases WHERE status != 'Resolved' GROUP BY category ORDER BY exposure DESC").fetchall()
    exposure = float(row["exposure"])
    categories = {item["category"].replace(" pattern", "s").replace(" anomaly", "s"): round(item["exposure"] / exposure * 100, 1) for item in category_rows} if exposure else {}
    return DashboardSummary(total_exposure=exposure, exposure_change_pct=-12.4, open_cases=row["cases"], new_cases=3, model_precision=94.2, precision_change_pct=1.8, category_exposure=categories)


@router.get("/customers", response_model=list[CustomerRisk])
def list_customers() -> list[CustomerRisk]:
    with connection() as db:
        rows = db.execute("""
            SELECT c.id, c.name, c.email, c.risk_score, c.total_exposure,
            COALESCE(SUM(CASE WHEN rc.status != 'Resolved' THEN 1 ELSE 0 END), 0) AS open_cases
            FROM customers c LEFT JOIN risk_cases rc ON rc.customer_id = c.id
            GROUP BY c.id ORDER BY c.total_exposure DESC, c.risk_score DESC
        """).fetchall()
    return [CustomerRisk(**dict(row)) for row in rows]


@router.post("/customers", response_model=CustomerRisk, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate) -> CustomerRisk:
    """Add a customer and create a linked onboarding case for risk monitoring."""
    customer_id = f"CUS-{uuid4().hex[:6].upper()}"
    case_id = f"RSK-{uuid4().hex[:6].upper()}"
    name = customer.name.strip()
    created_at = datetime.now(timezone.utc).isoformat()
    with connection() as db:
        db.execute("INSERT INTO customers (id, name, email, risk_score, total_exposure, created_at) VALUES (?, ?, ?, ?, ?, ?)", (customer_id, name, customer.email.strip(), customer.risk_score, customer.total_exposure, created_at))
        db.execute("INSERT INTO risk_cases (id, customer_id, subject, category, score, exposure, status, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (case_id, customer_id, name, "Onboarding review", customer.risk_score, customer.total_exposure, "New", "New customer added — complete the initial risk profile review", created_at))
    return CustomerRisk(id=customer_id, name=name, email=customer.email.strip(), risk_score=customer.risk_score, total_exposure=customer.total_exposure, open_cases=1)


@router.patch("/customers/{customer_id}", response_model=CustomerRisk)
def update_customer(customer_id: str, customer: CustomerUpdate) -> CustomerRisk:
    """Persist customer profile edits and keep linked active cases in sync."""
    updates = customer.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No customer changes supplied")
    if "name" in updates:
        updates["name"] = updates["name"].strip()
    if "email" in updates:
        updates["email"] = updates["email"].strip()
    columns = ", ".join(f"{column} = ?" for column in updates)
    with connection() as db:
        current = db.execute("SELECT * FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not current:
            raise HTTPException(status_code=404, detail="Customer not found")
        db.execute(f"UPDATE customers SET {columns} WHERE id = ?", [*updates.values(), customer_id])
        merged = {**dict(current), **updates}
        db.execute("UPDATE risk_cases SET subject = ?, score = ?, exposure = ? WHERE customer_id = ? AND status != 'Resolved'", (merged["name"], merged["risk_score"], merged["total_exposure"], customer_id))
        open_cases = db.execute("SELECT COUNT(*) FROM risk_cases WHERE customer_id = ? AND status != 'Resolved'", (customer_id,)).fetchone()[0]
    return CustomerRisk(id=customer_id, name=merged["name"], email=merged["email"], risk_score=merged["risk_score"], total_exposure=merged["total_exposure"], open_cases=open_cases)


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: str) -> None:
    """Delete a customer and every linked case from the local workspace."""
    with connection() as db:
        exists = db.execute("SELECT 1 FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail="Customer not found")
        db.execute("DELETE FROM risk_cases WHERE customer_id = ?", (customer_id,))
        db.execute("DELETE FROM customers WHERE id = ?", (customer_id,))


@router.get("/insights", response_model=list[Insight])
def list_insights() -> list[Insight]:
    with connection() as db:
        onboarding_count = db.execute("SELECT COUNT(*) FROM risk_cases WHERE category = 'Onboarding review' AND status != 'Resolved'").fetchone()[0]
    insights = [Insight(id="INS-301", title="Return risk is rising", description="West-region return activity is producing more high-risk flags than the previous week.", impact="38% more high-risk flags", severity="High"), Insight(id="INS-302", title="Payment velocity stabilised", description="Card velocity alerts have returned to their expected range.", impact="14% fewer alerts", severity="Low")]
    if onboarding_count:
        insights.insert(0, Insight(id="INS-NEW", title="New customers awaiting review", description="Recently added customers are visible in the risk queue until their onboarding review is completed.", impact=f"{onboarding_count} active onboarding reviews", severity="Medium"))
    return insights


@router.get("/rules", response_model=list[RiskRule])
def list_rules() -> list[RiskRule]:
    return [RiskRule(id="MOD-001", name="Return risk classifier", rule_type="Model", status="Active", precision=94.2), RiskRule(id="RUL-014", name="High velocity returns", rule_type="Rule", status="Active", precision=91.4), RiskRule(id="RUL-028", name="New-device payment review", rule_type="Rule", status="Monitoring", precision=88.6)]


@router.get("/activity", response_model=list[ActivityItem])
def list_activity() -> list[ActivityItem]:
    now = datetime.now(timezone.utc)
    return [ActivityItem(id="ACT-1", title="Case RSK-8228 was resolved", detail="False positive", occurred_at=now - timedelta(minutes=18)), ActivityItem(id="ACT-2", title="Model performance report is ready", detail="September 2026", occurred_at=now - timedelta(hours=1)), ActivityItem(id="ACT-3", title="Rule “High velocity returns” was updated", detail="By Mayur Patil", occurred_at=now - timedelta(hours=3))]


@router.get("/settings", response_model=WorkspaceSettings)
def get_settings() -> WorkspaceSettings:
    return WorkspaceSettings(workspace_name="Northstar Retail", currency="INR", risk_threshold=70, analyst_name="Mayur Patil")


@router.post("/agent/ask", response_model=AgentResponse)
def ask_risk_agent(prompt: AgentQuestion) -> AgentResponse:
    """Local data-aware triage assistant; replace with an approved LLM service in production."""
    with connection() as db:
        cases = db.execute("SELECT id, subject, score, exposure, reason FROM risk_cases WHERE status != 'Resolved' ORDER BY score DESC LIMIT 3").fetchall()
        exposure = db.execute("SELECT COALESCE(SUM(exposure), 0) FROM risk_cases WHERE status != 'Resolved'").fetchone()[0]
    if not cases:
        return AgentResponse(answer="There are no active cases. Your queue is clear.", suggested_cases=[])
    priority = cases[0]
    answer = (f"I reviewed the live queue. Prioritise {priority['id']} for {priority['subject']} (risk score {priority['score']}); the alert is driven by {priority['reason'].lower()}. Active exposure is ₹{exposure:,.0f}. Verify linked transactions, then escalate if the pattern is confirmed.")
    return AgentResponse(answer=answer, suggested_cases=[case["id"] for case in cases])
