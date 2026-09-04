"""SQLite persistence for SentinelIQ's local development workspace."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATABASE_PATH = Path(__file__).resolve().parents[2] / "database" / "risk_manager.db"


def connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    return db


def initialize_database() -> None:
    """Create tables and seed a useful first-run workspace only once."""
    with connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                risk_score INTEGER NOT NULL DEFAULT 0 CHECK(risk_score BETWEEN 0 AND 100),
                total_exposure REAL NOT NULL DEFAULT 0 CHECK(total_exposure >= 0),
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS risk_cases (
                id TEXT PRIMARY KEY,
                customer_id TEXT,
                subject TEXT NOT NULL,
                category TEXT NOT NULL,
                score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
                exposure REAL NOT NULL CHECK(exposure >= 0),
                status TEXT NOT NULL,
                reason TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );
            """
        )
        if db.execute("SELECT COUNT(*) FROM customers").fetchone()[0]:
            return

        created_at = datetime.now(timezone.utc).isoformat()
        customers = [
            ("CUS-1021", "Marisa Cole", "marisa.cole@example.com", 92, 4820, created_at),
            ("CUS-1048", "Kline & Co.", "ops@kline.example.com", 84, 12400, created_at),
            ("CUS-1086", "Arun Shah", "arun.shah@example.com", 76, 2160, created_at),
            ("CUS-1102", "Oakline Retail", "risk@oakline.example.com", 68, 7230, created_at),
            ("CUS-1133", "Jules Bennett", "jules.bennett@example.com", 61, 1980, created_at),
        ]
        db.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)", customers)
        now = datetime.now(timezone.utc)
        cases = [
            ("RSK-8241", "CUS-1021", "Marisa Cole", "Return pattern", 92, 4820, "New", "High-value returns across 3 locations", (now - timedelta(minutes=2)).isoformat()),
            ("RSK-8240", "CUS-1048", "Kline & Co.", "Payment anomaly", 84, 12400, "In review", "Card velocity exceeds account baseline", (now - timedelta(minutes=8)).isoformat()),
            ("RSK-8239", "CUS-1086", "Arun Shah", "Account behavior", 76, 2160, "New", "New device and unusual order cadence", (now - timedelta(minutes=14)).isoformat()),
            ("RSK-8238", "CUS-1102", "Oakline Retail", "Return pattern", 68, 7230, "In review", "Repeated no-receipt return activity", (now - timedelta(minutes=21)).isoformat()),
            ("RSK-8237", "CUS-1133", "Jules Bennett", "Payment anomaly", 61, 1980, "Escalated", "Chargeback risk detected", (now - timedelta(minutes=32)).isoformat()),
        ]
        db.executemany("INSERT INTO risk_cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", cases)
