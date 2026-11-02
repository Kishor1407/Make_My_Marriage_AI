# Make My Marriage (AI Wedding Companion & Media Sharing Platform)

An end-to-end digital wedding companion and collaborative media-sharing platform built with a strictly **₹0 Cloud Cost Budget** on the MERN stack.

---

## 🚀 Quick Start

### 1. Installation
Install all dependencies across both workspaces (backend & frontend):
```bash
npm install
```

### 2. Running Locally
Start both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173) (Falls back to `http://localhost:5174` if busy)
- **Backend API Gateway:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## 📦 Features Implemented (PRD Compliant)

- **Gated Access System (PRD 4.1):** Passcode-protected wedding access (`RAHUL24`).
- **Dual-View Admin Portal (PRD 4.2):** Full host dashboard and marriage management (Add, Edit, Delete).
- **Six-Part Wedding Timeline (PRD 4.3):** Canonical 6 rites: Engagement, Mehndi, Haldi, Sangeet, Marriage (Holy Pheras), and Candid/Table.
- **QR-Powered Photo Dump & Attribution (PRD 4.4):**
  - Standee QR Code generator for physical reception tables.
  - Guest photo upload tagged with Name, Email, and Ceremony.
  - Real-time live candid photo feed with binary streaming directly from MongoDB Atlas GridFS.
  - Aggressive client-side WebP compression (<500KB) ensuring zero hosting fees.
- **Pure White & Crimson Luxury UI:** Designed faithfully to Google Stitch desktop & mobile layouts.

---

## 🛠️ Tech Stack & ₹0 Architecture

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Redux Toolkit, Lucide React, `qrcode`, `browser-image-compression`, `html2canvas`.
- **Backend:** Node.js, Express.js, Mongoose, JWT HTTP-Only Cookies, Multer memory storage.
- **Storage:** MongoDB Atlas M0 Free Tier (512MB) with native GridFS chunking.

---

## 📄 Documentation
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Project Status & Roadmap](./docs/PROJECT_STATUS.md)
- [System Architecture](./docs/SYSTEM_DESIGN_ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE_DESIGN.md)
- [API Design](./docs/API_DESIGN.md)

