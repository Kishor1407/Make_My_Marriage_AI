# Make My Marriage — Project Status & Roadmap

**Current Version:** 1.2.0  
**Updated:** November 2026  
**Architecture:** MERN Monorepo (Next.js 15 + Express + MongoDB Atlas GridFS)  
**Budget Constraint:** Strictly ₹0 (MongoDB Atlas M0 Free Tier, Zero Paid Cloud APIs)  
**Active Ports:**  
- **Frontend:** `http://localhost:5173` (Fallback: `http://localhost:5174`)
- **Backend API Gateway:** `http://localhost:5000` (`/api/v1`)

---

## 1. Feature Implementation Matrix (vs PRD)

| PRD Section | Feature Name | Status | Implementation Details |
|---|---|---|---|
| **4.1** | **Gated Access System** | ✅ **Completed** | Homepage `/` renders unlocked/locked marriage cards. Clicking opens passcode prompt validating against MongoDB Atlas. |
| **4.2** | **Dual-View Admin Portal** | ✅ **Completed** | Full Admin authentication (`/admin/login`, `/admin/register`, JWT cookies). Full CRUD (Add, Edit, Delete marriage vaults) matching Google Stitch design screen `b990b7f7`. |
| **4.3** | **Six-Part Wedding Timeline** | ✅ **Completed** | Every wedding automatically provisions the canonical 6 rites: *Engagement, Mehndi, Haldi, Sangeet, Marriage (Holy Pheras), and Others (Candid/Table)* with dedicated event stats. |
| **4.4** | **QR-Powered Photo Dump & Attribution** | ✅ **Completed** | Built desktop-first luxury portal `/guest/upload` matching Google Stitch screen `3cf03f76502a4afab50f13d1127ca03f`. Generates dynamic vector Table Standee QR codes. Uploads stream into Atlas GridFS tagged with guest `Name`, `Email`, and `Ceremony`. |
| **4.5** | **Built-in Invitation Generator** | 🟢 **UI Completed (API Next)** | Ceremonial Card Architect (`/admin/invitations` & `/invitations`) matching Stitch screen `110d273f`. Features 6-rite presets, 3 card silhouettes (Royal Mandap, Ivory Arch, Sunset Vow), live vector Standee QR embedding, 4:5 & 9:16 aspect ratios, WhatsApp text copy, Lightbox inspection, and `html2canvas` 300 DPI PNG exports. |
| **4.6** | **Live Stream Integration** | 🟡 **Next Up** | YouTube Live embedded video player modal for remote family attendance. |
| **4.7** | **Media Segregation (Photos & Videos)** | ✅ **Completed** | Segregated GridFS storage and API endpoints for Photo galleries vs curated official Videos. |

---

## 2. Technical Milestones Completed

### A. Frontend Architecture (Next.js 15 App Router)
- **Design System:** Pure White & Crimson Luxury Edition with editorial typography (`Playfair Display` + `Plus Jakarta Sans`).
- **Icon System:** Custom standalone `AppIcon` component with zero external font/CDN dependencies (Lucide SVG mapping).
- **Port Mapping:** Updated `frontend/package.json` to default to `next dev -p 5173` (with automatic fallback to `5174`).
- **Client-side Compression:** Aggressive image compression via `browser-image-compression` (<500KB WebP) protecting the 512MB MongoDB Atlas free-tier storage.
- **Dynamic Standee QR:** Integrated `qrcode` engine generating sharp vector data URLs pointing to `${origin}/guest/upload?code=<marriageCode>`.

### B. Backend Architecture (Express + Mongoose + GridFS)
- **Resilient Atlas Connection:** Multi-attempt retry loop with custom DNS configuration (`8.8.8.8`, `1.1.1.1`) and extended `serverSelectionTimeoutMS: 30000`.
- **Memory Buffer Streaming:** Replaced legacy detached storage with `multer.memoryStorage()` piped into `bucket.openUploadStream()`.
- **Public & Authenticated Endpoints:**
  - `POST /api/v1/media/guest-upload`: Guest photo upload with `uploaderName`, `uploaderEmail`, `passcode`, `ceremony`.
  - `GET /api/v1/media/gallery/:marriageCode`: Fetch all photos for a marriage gallery with author attribution stamps.
  - `GET /api/v1/media/stream/:fileId`: Binary streaming directly from MongoDB Atlas GridFS chunks.
  - `POST /api/v1/marriages`: Create new marriage with automatic provisioning of 6 ceremony timeline events.
  - `PUT /api/v1/marriages/:marriageId` & `DELETE /api/v1/marriages/:marriageId`: Update details, regenerate QR codes, or cascade-delete marriage records.

---

## 3. Verified End-to-End Test Flows

1. **Admin Authentication Flow:** Registration, login, secure HTTP-only cookie issuance, and dashboard redirection verified.
2. **Marriage CRUD Flow:** Creation of new marriage, editing partner names and dates, dynamic QR code regeneration, and deletion tested.
3. **Guest Standee Upload Flow:**
   - Standee QR code scanned or opened via `http://localhost:5173/guest/upload?code=RAHUL24`.
   - Sample images compressed and uploaded via `POST /api/v1/media/guest-upload`.
   - Photo retrieved via `GET /api/v1/media/gallery/RAHUL24` with attribution badge ("Uncle John", "john@luxemail.com").
   - Image binary streamed via `GET /api/v1/media/stream/:fileId` (HTTP 200).

---

## 4. Immediate Next Steps

1. **PRD 4.5 Built-in Invitation Generator:**
   - Interactive invite canvas modal for Admins and Guests.
   - Live text input (Couple names, Date, Time, Venue) overlaid onto curated wedding card templates.
   - Client-side download using `html2canvas` (PNG download with zero server processing).
2. **PRD 4.6 YouTube Live Stream Integration:**
   - Host pastes YouTube Live / RTMP link in event settings.
   - Interactive modal on guest timeline rendering live broadcast with real-time cheer reactions (❤️, 🌹).

