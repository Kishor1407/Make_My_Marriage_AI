# Project Status & Progress Tracker

**Project Name:** Make My Marriage  
**Repository:** [github.com/Kishor1407/Make_My_Marriage_AI](https://github.com/Kishor1407/Make_My_Marriage_AI)  
**Architecture:** Client-Server Monorepo (Next.js + Express.js + MongoDB Atlas GridFS)  
**Budget Strategy:** Strictly ₹0 (Free Tiers: Vercel, Render, Atlas M0)  
**Last Updated:** November 1, 2026  

---

## 1. High-Level Milestone Overview

| Milestone | Scope | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Phase 1: Architecture & Specs** | PRD, System Design, Database Design, API Design | ✅ Completed | All 4 design specs documented & committed. |
| **Phase 2: Monorepo & Scaffold** | Workspaces, Express server, Next.js App Router, Tailwind, Redux, Zod | ✅ Completed | Fully verified and compiling without errors (`5fb7525`). |
| **Phase 2.5: Stitch AI Design** | Google Stitch MCP integration & UI screen generation | ✅ Completed | Screens & design tokens imported into `docs/stitch_designs/` (`2826fd5`). |
| **Phase 3: Database & Auth** | MongoDB Atlas connection, JWT Auth cookies, Guest passcode unlock | 🟡 Ready for Wiring | Schemas & controllers implemented; waiting for Atlas URI. |
| **Phase 4: Admin Portal** | Dual-view dashboard, wedding creation, event itinerary editor | ⏳ In Progress | Stitch UI downloaded; ready to convert to Next.js React components. |
| **Phase 5: Guest QR Upload** | Attribution (Name/Email), image compression, batch GridFS upload | ⏳ Pending | Compression & upload endpoints created; UI page pending. |
| **Phase 6: Timeline & Media Gallery** | 6-event tabs, photo/video segregation, stream pipes, live stream embed | ⏳ Pending | Stitch design ready; React conversion pending. |
| **Phase 7: Invitation Generator** | Client-side `html2canvas` poster export | ⏳ Pending | Lib helper ready; visual canvas template UI pending. |
| **Phase 8: Free Cloud Deployment** | Vercel (Frontend) + Render (Backend) | ⏳ Pending | Configurations & cold-start banner pre-configured. |

---

## 2. Subsystem Status Matrix

### 2.1 Backend (Express.js on Render)
- [x] Monorepo npm workspace integration (`package.json`)
- [x] Database connection with GridFS Bucket initialization (`src/config/db.js`)
- [x] Mongoose Models:
  - [x] `User.js` (Role enum: `ADMIN`, `GUEST`, email unique index)
  - [x] `Marriage.js` (Unique passcode, global denormalized counters, QR URL)
  - [x] `Event.js` (Strict 6-event enum, compound index `{ marriageId: 1, eventType: 1 }`)
- [x] Middlewares:
  - [x] `authMiddleware.js` (HTTP-only cookie + Bearer token JWT verification)
  - [x] `uploadMiddleware.js` (`multer-gridfs-storage`, max 10 files limit)
  - [x] `errorMiddleware.js` (Standardized error JSON responses)
- [x] Controllers & Routes:
  - [x] Auth (`/api/v1/auth`: admin register/login, guest passcode unlock, logout, me)
  - [x] Marriages (`/api/v1/marriages`: create + batch 6 events, list, details, cascade delete)
  - [x] Events (`/api/v1/events`: list events, update details)
  - [x] Media (`/api/v1/media`: GridFS streaming upload, paginated gallery, binary pipe, delete)
- [x] Utilities:
  - [x] `qrcode.js` (Generates printable QR code data URLs)
  - [x] `gridfs.js` (Open download stream and delete helpers)
  - [x] `response.js` (Consistent API payloads)
- [x] Baseline Health Check (`/api/v1/health`)

### 2.2 Frontend (Next.js 15 on Vercel)
- [x] Next.js App Router workspace setup with TypeScript
- [x] Tailwind CSS configured with romantic wedding palettes (`brand` rose & `gold`)
- [x] Redux Toolkit store (`authSlice` and `marriageSlice`) with React-Redux Provider
- [x] Zod validation schemas (`adminRegister`, `adminLogin`, `guestLogin`, `createMarriage`, `guestUpload`, `updateEvent`)
- [x] Client-Side ₹0 Helpers:
  - [x] `lib/api.ts` (Axios configured with `withCredentials: true` for HTTP-only cookies)
  - [x] `lib/compression.ts` (`browser-image-compression` targeting ~500KB to protect 512MB DB)
  - [x] `lib/invitation.ts` (`html2canvas` DOM-to-PNG export without server compute)
- [x] Components & Pages:
  - [x] `Navbar.tsx` (Responsive header with dynamic auth states)
  - [x] `Footer.tsx` (₹0 platform attribution)
  - [x] `WakingServerBanner.tsx` (Gracefully handles Render cold-starts after sleep)
  - [x] `app/page.tsx` (Gated homepage wedding grid with passcode unlock modal)
  - [ ] Admin Login & Register pages (`/admin/login`, `/admin/register`)
  - [ ] Admin Management Dashboard (`/admin/dashboard`)
  - [ ] Wedding Detail Dashboard with 6 Tabs (`/marriage/[id]`)
  - [ ] Guest QR Upload Page (`/guest/upload?code=XYZ`)
  - [ ] Invitation Card Designer Modal

### 2.3 UI & Design System (Google Stitch Integration)
- [x] Stitch MCP Server connected and verified in `~/.gemini/config/mcp_config.json`
- [x] Design System extracted: `Coastal Editorial SaaS` (`docs/stitch_designs/DESIGN_SYSTEM.md`)
- [x] Raw UI designs imported and archived in repository:
  - [x] `admin_portal.html` (Dual-view metrics table & marriages manager)
  - [x] `guest_dashboard.html` (6 timeline tabs, YouTube livestream player, candid photo gallery)
  - [x] `landing_page.html` (Hero section, private wedding cards, passcode modal)
- [ ] Next.js component conversion & Tailwind token synchronization

---

## 3. Constraint & ₹0 Safeguards Checklist

- [x] **Atlas 512MB Limit:** Client-side compression helper configured to compress to ~500KB before transmission.
- [x] **16MB BSON Document Limit:** Binary files streamed into MongoDB GridFS in 255KB chunks (`uploads.files` and `uploads.chunks`).
- [x] **Render RAM Limit:** Zero memory buffers in file uploads; requests are directly piped into GridFS via `multer-gridfs-storage`.
- [x] **Render Cold-Start Delay (30-50s):** `WakingServerBanner.tsx` auto-detects cold starts via `/api/v1/health` and informs the user.
- [x] **Batch Safety:** Strict 10-file maximum batch limit enforced in both UI schemas and Express middleware.

---

## 4. Git Activity Log

| Commit Hash | Description | Date |
| :---: | :--- | :---: |
| `7fd634f` | `docs: add initial project architecture, PRD, database, and API design specifications` | Nov 1, 2026 |
| `5fb7525` | `feat: initialize full monorepo scaffold with backend API gateway and Next.js frontend` | Nov 1, 2026 |
| `8fb7fac` | `docs: create projectStatus tracking directory and baseline STATUS.md` | Nov 1, 2026 |
| `ed4998d` | `docs: sync git activity log and next actions in STATUS.md` | Nov 1, 2026 |
| `2826fd5` | `feat(design): configure Google Stitch MCP server and import Stitch UI design screens` | Nov 1, 2026 |
| `d3c912e` | `docs: sync git log in STATUS.md for commit 2826fd5` | Nov 1, 2026 |

---

## 5. Recommended Next Steps (Implementation Roadmap)

1. **Step 1: MongoDB Connection Setup (`backend/.env`)**
   * Create `backend/.env` with MongoDB Atlas connection string (`MONGO_URI`) and JWT secret.
   * Verify live database connectivity and GridFS bucket readiness.

2. **Step 2: Build Admin Authentication & Dual-View Portal UI**
   * Implement `/admin/login` and `/admin/register` using the Zod validation schemas.
   * Convert `docs/stitch_designs/admin_portal.html` into modular Next.js components (`/admin/dashboard`):
     - Metric cards (Total Weddings, Total Photos, Total Guests).
     - "Create Wedding" modal (auto-generating the 6 timeline events).
     - Marriages table with action links and cascading deletion modal.

3. **Step 3: Build Guest Wedding Dashboard (`/marriage/[id]`)**
   * Convert `docs/stitch_designs/guest_dashboard.html` into interactive Next.js components:
     - 6 timeline event tabs (Engagement, Mehndi, Haldi, Sangeet, Marriage, Others).
     - Live stream YouTube player embed.
     - Photo dump gallery with GridFS image streaming and guest attribution (Name/Email).

4. **Step 4: Build Mobile Venue QR Photo Upload Page (`/guest/upload`)**
   * Mobile-first photo selection screen (Max 10 files batch limit).
   * Aggressive pre-upload compression via `browser-image-compression`.
   * Guest attribution fields (Name and Email).


