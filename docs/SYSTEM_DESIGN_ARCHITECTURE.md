# System Design & Architecture Document

**Project:** Make My Marriage  
**Architecture Type:** Client-Server Monorepo  
**Budget Strategy:** 100% Free-Tier Dependent (₹0 Cost: Vercel, Render, MongoDB Atlas M0)  
**Version:** 2.0 (Streamlined Dual-Persona Architecture)  

## 1. High-Level Architecture Overview

"Make My Marriage" utilizes a decoupled frontend and backend operating within a **Monorepo** structure. The architecture is designed to handle heavy media workflows efficiently without incurring cloud hosting costs.

The system relies on client-side heavy lifting (compression, vector QR generation, DOM-to-canvas rendering) to eliminate server compute expenses, while the backend acts as a secure, streaming gateway directly into MongoDB Atlas GridFS.

## 2. System Architecture & Dual-Persona Routing Diagram

Below is the structural representation of how users, personas, and requests flow through the entire system:

```
                            [ User Enters Site: Route / ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │   🌸 GUEST EXPERIENCE  │                     │  👑 HOST ADMIN PORTAL  │
     │                        │                     │                        │
     │ • No Password Required │                     │ • Sovereign Email/Pass │
     │ • Instant Name & Email │                     │ • 7-Day JWT Token      │
     │ • Clean "Proceed" Form │                     │ • Dual-Tab Workspace   │
     └───────────┬────────────┘                     └───────────┬────────────┘
                 │                                              │
                 ▼                                              ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │  Celebrations Hub (/)  │                     │ Admin Dashboard (/adm) │
     │  • Filter pills        │                     │ ┌────────────────────┐ │
     │  • Wedding cards       │                     │ │ Tab 1: Dashboard   │ │
     │  • Exit/Switch Role    │                     │ │ Tab 2: Guest Mirror│ │
     └───────────┬────────────┘                     │ └────────────────────┘ │
                 │                                  └────────────────────────┘
                 ▼
     ┌────────────────────────────────────────────────────────┐
     │          Single Wedding Sanctuary (/marriage/:id)      │
     │  • 6-Rite Ceremony Tabs (Engagement -> Holy Pheras)    │
     │  • Banquet Table Standee QR Modal                      │
     │  • Live Broadcast YouTube Stream + Reaction Ribbon     │
     │  • Drop Media Zone with Client-Side Compression        │
     │  • Segregated Candid Gallery & Official 4K Reels       │
     └───────────────────────────┬────────────────────────────┘
                                 │
                   (Network Boundary - REST over HTTPS)
                                 ▼
                     [ Next.js Serverless Edge ]
                                 │
                                 ▼
                 [ Node.js & Express API Gateway ]
                     (Render Free Tier - Port 5000)
                     ├─ Auth Controller & JWT Signer
                     ├─ Multer Memory Stream Pipe
                     ├─ HTTP 206 Range Streamer
                     └─ Cascade Deletion Engine
                                 │
                                 ▼
                [ MongoDB Atlas Free Tier (GridFS M0) ]
                     ├─ collections: users, marriages, events, wishes
                     └─ buckets: uploads.files, uploads.chunks (255KB chunks)
```

## 3. Monorepo Directory Structure

```
make-my-marriage-monorepo/
│
├── frontend/                 # Next.js 15 Application (App Router, Vercel)
│   ├── src/
│   │   ├── app/              # Routes: /, /admin/dashboard, /marriage/[id], /guest/upload
│   │   ├── components/       # Reusable UI: Navbar, Standee QR Modal, Cinema Player
│   │   ├── store/            # Redux Slices: authSlice, marriageSlice
│   │   ├── lib/              # ₹0 Helpers: compression.ts, api.ts, invitation.ts
│   │   └── validations/      # Zod validation schemas
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express Server (Render Web Service)
│   ├── src/
│   │   ├── controllers/      # auth, marriages, events, media, invitations, wishes
│   │   ├── middlewares/      # authMiddleware, uploadMiddleware, errorMiddleware
│   │   ├── models/           # User, Marriage, Event, Wish, Invitation
│   │   ├── routes/           # REST endpoints (/api/v1/...)
│   │   └── utils/            # GridFS stream helpers, QR generator, responses
│   ├── test_all_features.js  # 59-test integration suite
│   ├── package.json
│   └── server.js
│
├── API_DESIGN.md             # Complete REST API specification
├── README.md                 # Project showcase and submission documentation
└── package.json              # Monorepo root workspace manager
```

## 4. Core Sub-Systems & Data Flow

### 4.1. Dual-Persona Authentication System

* **Guest Access:** Zero password required. Guests submit `{ name, email, marriageCode }`. The backend issues a guest JWT with identity payload and rehydrates local storage (`mmm_guest`). The UI displays guest attribution and strips all administrative links.
* **Admin Access:** Sovereign hosts authenticate with email and password, receiving an administrative JWT stored in HTTP-Only cookies and local bearer token (`mmm_token`).

### 4.2. Media Upload Pipeline (The ₹0 Storage Strategy)

* **Challenge:** Server RAM limits on Render and a strict 512MB limit on MongoDB Atlas.
* **Flow:**
  1. Guest selects photos (Max 10 per batch enforced by UI).
  2. The browser aggressively compresses images via `browser-image-compression` (<500KB) *before* transmission.
  3. The Next.js client sends the compressed payload to the Express backend.
  4. The backend intercepts the request with `multer.memoryStorage()`.
  5. Instead of saving to disk, the stream pipes directly into MongoDB GridFS in 255KB chunks (`uploads.files` and `uploads.chunks`).

### 4.3. High-Definition 4K Video Streaming (HTTP 206 Partial Content)

* **Flow:**
  1. Admin curates official video highlights tagged by ceremony.
  2. The Cinema Player sends `Range: bytes=start-end` requests to `/api/v1/media/stream/:fileId`.
  3. The backend calculates buffer offsets and streams slices via `bucket.openDownloadStreamByName` or `openDownloadStream(fileId, { start, end })`.
  4. Enables smooth scrubbing, zero buffering, and seeking across all browser clients.

### 4.4. Banquet Table Standee QR Engine

* **Flow:**
  1. The server or client dynamically generates a vector QR code containing the marriage passcode: `${origin}/guest/upload?code=<marriageCode>`.
  2. Guests at banquet tables scan the QR code to open the mobile-optimized photo dump with their ceremony pre-selected.

## 5. Constraint Mitigations & System Resilience

| System Constraint | Architectural Solution | 
| ----- | ----- | 
| **MongoDB 512MB Total Limit** | Aggressive client-side image compression (<500KB); strict max-batch limits per upload. | 
| **MongoDB 16MB Doc Limit** | Utilizing MongoDB GridFS to chunk files into 255KB chunks across `uploads.chunks`. | 
| **Render RAM Limits (Free)** | Memory buffer piped directly to GridFS without disk caching. | 
| **Render Cold Starts** | `WakingServerBanner.tsx` detects initial wakeups via `/api/v1/health` and informs users. |
| **Navbar Clutter & Role Confusion** | Stripped multi-tabs into a single Celebrations anchor for guests, dual-tab workspace for admins. |
