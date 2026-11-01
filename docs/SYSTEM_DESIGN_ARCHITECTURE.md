# System Design & Architecture Document

**Project:** Make My Marriage
**Architecture Type:** Client-Server Monorepo
**Budget Strategy:** 100% Free-Tier Dependent (₹0 Cost)

## 1. High-Level Architecture Overview

"Make My Marriage" utilizes a decoupled frontend and backend operating within a **Monorepo** structure. The architecture is designed to handle heavy media workflows efficiently without incurring cloud hosting costs.

The system relies on client-side heavy lifting (compression, image generation) to reduce server load, while the backend acts strictly as a secure gateway for streaming data directly into the database.

## 2. System Architecture Diagram

Below is the tree-like structural representation of how data and requests flow through the entire system:

```
[ Client (Mobile/Desktop Browser) ]
   │
   ├─ 1. [ UI & Interaction Layer ] (React / Tailwind)
   ├─ 2. [ Client-Side Processing ]
   │      ├─ browser-image-compression (Reduces photo size)
   │      └─ html2canvas (Generates Invitation locally)
   │
   ├─ 3. [ State Management ] (Redux Toolkit)
   │
   │   (Network Boundary) 
   │   (REST over HTTPS + HTTP-Only JWT Cookie)
   ▼
[ Frontend Serverless Edge ] (Next.js hosted on Vercel)
   │
   │   (API Forwarding & Static Serving)
   ▼
[ Backend API Gateway ] (Node.js & Express hosted on Render)
   │
   ├─ 1. [ Request Interception ]
   │      ├─ JWT Verification Middleware
   │      └─ Rate & Batch Limiting (Max 10 files)
   │
   ├─ 2. [ Stream Processing ]
   │      └─ Multer (Handles multipart/form-data)
   │
   │   (TCP/IP Connection to Database)
   ▼
[ Database & Storage Engine ] (MongoDB Atlas Free Tier)
   │
   ├─ [ Core Collections ] (App logic, Users, Marriages)
   └─ [ GridFS Storage ] (Direct binary chunk streaming for photos/videos)

```

## 3. Monorepo Directory Structure

The project will use a monorepo setup (e.g., managed via standard npm workspaces) to keep frontend and backend code synced in one GitHub repository while allowing independent deployments.

```
make-my-marriage-monorepo/
│
├── frontend/                 # Next.js Application (Deployed to Vercel)
│   ├── src/
│   │   ├── app/              # Routing (Landing, Dashboard, Admin)
│   │   ├── components/       # Reusable UI (Cards, Modals, Forms)
│   │   ├── store/            # Redux Slices (Auth, ActiveMarriage)
│   │   ├── lib/              # Utility functions (html2canvas, compression)
│   │   └── validations/      # Zod schemas (UI validation)
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express Server (Deployed to Render)
│   ├── src/
│   │   ├── controllers/      # Business logic handlers
│   │   ├── middlewares/      # JWT auth, Multer upload limits
│   │   ├── models/           # Data models
│   │   ├── routes/           # Route definitions
│   │   └── utils/            # GridFS stream helpers & utilities
│   ├── package.json
│   └── server.js
│
└── package.json              # Root workspace manager

```

## 4. Core Sub-Systems & Data Flow

### 4.1. Authentication System

* **Mechanism:** JWT (JSON Web Tokens) delivered via **HTTP-Only, Secure, SameSite Cookies**.

* **Flow:**

  1. The user logs in via the Next.js frontend.

  2. The Express backend validates and signs the JWT, attaching it to an HTTP-Only cookie in the response.

  3. The browser automatically attaches this cookie to all subsequent API requests.

  4. The backend middleware verifies the token before allowing access to protected routes.

* **Security:** Prevents client-side scripts from accessing the token, neutralizing XSS risks.

### 4.2. Media Upload Pipeline (The ₹0 Storage Strategy)

* **Challenge:** Server RAM limits on Render and a strict 512MB limit on MongoDB Atlas.

* **Flow:**

  1. Guest selects photos (Max 10 per batch enforced by UI).

  2. The browser compresses the images via `browser-image-compression` *before* transmission.

  3. The Next.js client sends the compressed payload to the Express backend.

  4. The backend intercepts the request with `multer`.

  5. Instead of saving to the disk or holding in memory, `multer-gridfs-storage` immediately pipes the incoming data stream directly into MongoDB GridFS in 255KB chunks.

### 4.3. Client-Side Asset Generation (Invitations)

* **Flow:**

  1. The Admin inputs event details into the Next.js UI.

  2. The UI renders a hidden, fully styled DOM element representing the invitation.

  3. The `html2canvas` library captures this DOM node and converts it into a Base64 image.

  4. The browser triggers a local download.

* **Advantage:** Zero backend processing power or third-party APIs are required for image generation.

## 5. Constraint Mitigations & System Resilience

| System Constraint | Architectural Solution | 
| ----- | ----- | 
| **MongoDB 512MB Total Limit** | Aggressive client-side image compression; strict max-batch limits per upload. | 
| **MongoDB 16MB Doc Limit** | Utilizing MongoDB GridFS to chunk files across the database rather than storing Base64 strings. | 
| **Render RAM Limits (Free)** | Using Node.js streams instead of memory buffers for file handling. | 
| **Render Cold Starts** | The free backend sleeps after inactivity. The Next.js frontend will implement a "Waking Server..." UI skeleton during initial loads to handle the 30-50 second delay gracefully. | 
