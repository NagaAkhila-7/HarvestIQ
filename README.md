# HarvestIQ - AI-Powered Agriculture Demand, Inventory & Procurement Optimiser

HarvestIQ is an enterprise AI decision-support platform engineered specifically for Farmer Producer Organisations (FPO) in the agriculture industry.

Static reorder rules cause severe stockouts of critical seeds and fertilizers, excess stock of slow-moving items, and acute cash-flow pressure. HarvestIQ solves this core problem by linking farmer field commitments, crop growth stages, and seasonal yield telemetry directly into AI-driven inventory replenishment and purchase planning.

---

## 🚀 Key Features & Capabilities

- **FPO Demand Telemetry & Field Drivers**: Connects active field acreage, crop growth stages, expected yield forecasts, and member farmer SLA ratings to supply chain needs.
- **Inventory & Batch/Lot Expiry Management**: Multi-location warehouse tracking, bin assignments, safety stock calculations, and lot shelf-life tracking.
- **AI Decision Support (Gemini API Proxy)**: Generates reorder recommendations, supplier allocations, substitute suggestions, and PO anomaly detection. Human planners retain authorization control.
- **Approval & Override Audit Trail**: Mandatory justification logging for any decision override or rejection with append-only audit events.
- **Gemini-Powered AI Copilot**: Natural language operational assistant trained on real-time MongoDB supply chain telemetry.
- **Procurement & Goods Receiving (GRN)**: Full cycle from Purchase Requisitions (PR) to binding Purchase Orders (PO) and warehouse goods receiving notes.
- **Multi-Role RBAC & Tenant Isolation**: Roles for Procurement Manager, Inventory Planner, Warehouse User, Supplier, Finance Reviewer, and Administrator.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ORM, JWT, bcryptjs, Zod
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` model, server-side key security)

---

## 🔑 Demo User Accounts

The database seed script automatically creates standard demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@harvestiq.org` | `Password123!` |
| **Procurement Manager** | `procurement@harvestiq.org` | `Password123!` |
| **Inventory Planner** | `planner@harvestiq.org` | `Password123!` |
| **Warehouse User** | `warehouse@harvestiq.org` | `Password123!` |
| **Supplier** | `supplier@harvestiq.org` | `Password123!` |
| **Finance Reviewer** | `finance@harvestiq.org` | `Password123!` |

---

## ⚙️ Quick Start Setup Instructions

### 1. Prerequisites
- Node.js v18+ installed
- MongoDB installed and running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration

Backend configuration (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
MONGO_URI=mongodb://127.0.0.1:27017/harvestiq
JWT_ACCESS_SECRET=harvestiq_super_secret_access_key_2026_safe
JWT_REFRESH_SECRET=harvestiq_super_secret_refresh_key_2026_safe
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=http://localhost:5173
COOKIE_SECRET=harvestiq_cookie_secret_key_2026
```

Frontend configuration (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=HarvestIQ
```

### 3. Seed MongoDB Data
```bash
cd backend
npm run seed
```

### 4. Run Development Servers

Start Backend:
```bash
cd backend
npm run dev
```

Start Frontend:
```bash
cd frontend
npm run dev
```

Open browser at `http://localhost:5173` to access HarvestIQ.
