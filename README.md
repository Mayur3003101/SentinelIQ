# SentinelIQ — AI Risk Manager

An operations dashboard for prioritising customer and transaction risk. The first release focuses on a calm, analyst-friendly command centre: exposure, model performance, case triage, and decision signals are visible in one place.

## Run the dashboard

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. The dashboard is responsive and includes working queue filters and case/insight interactions.

## API scaffold

```bash
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

The API exposes development-safe sample data for `GET /health`, `GET /api/dashboard`, and `GET /api/cases`. Individual cases can be read at `GET /api/cases/{case_id}` and moved through triage with `POST /api/cases/{case_id}/decision`.

Start the API before the UI to enable live data and analyst decisions. On first start, SentinelIQ creates `database/risk_manager.db`, seeds five demo customers and cases, and subsequently persists customer additions and case decisions there.

The **Ask Sentinel** assistant is a local, data-aware triage helper: it analyses the active persistent case queue and explains its priority recommendation. It does not send customer data to an external AI service.
