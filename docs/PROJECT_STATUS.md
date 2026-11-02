# Make My Marriage — Project Status & Roadmap

**Current Version:** 1.3.0 (All PRD Features Completed)  
**Updated:** November 2026  
**Architecture:** MERN Monorepo (Next.js 15 + Express + MongoDB Atlas GridFS)  
**Budget Constraint:** Strictly ₹0 (MongoDB Atlas M0 Free Tier, Zero Paid Cloud APIs)  
**Active Ports:**  
- **Frontend:** `http://localhost:5173` (Fallback: `http://localhost:5174`)
- **Backend API Gateway:** `http://localhost:5000` (`/api/v1`)
- **Admin Sovereign Login:** `modi@makemymarriage.com` / `Password@2026`

---

## 1. Feature Implementation Matrix (vs PRD)

| PRD Section | Feature Name | Status | Implementation Details |
|---|---|---|---|
| **4.1** | **Gated Access System** | ✅ **Completed** | Homepage `/` renders unlocked/locked marriage cards. Clicking opens passcode prompt validating against MongoDB Atlas with client session lock. |
| **4.2** | **Dual-View Admin Portal** | ✅ **Completed** | Full Admin authentication (`/admin/login`, `/admin/register`, JWT cookies). Full CRUD (Add, Edit, Delete marriage vaults) matching Google Stitch design screen `b990b7f7`. |
| **4.3** | **Six-Part Wedding Timeline** | ✅ **Completed** | Every wedding automatically provisions the canonical 6 rites: *Engagement, Mehndi, Haldi, Sangeet, Marriage (Holy Pheras), and Others (Candid/Table)* with dedicated event stats. |
| **4.4** | **QR-Powered Photo Dump & Attribution** | ✅ **Completed** | Built desktop-first luxury portal `/guest/upload` matching Google Stitch screen `3cf03f76502a4afab50f13d1127ca03f`. Generates dynamic vector Table Standee QR codes. Uploads stream into Atlas GridFS tagged with guest `Name`, `Email`, and `Ceremony`. |
| **4.5** | **Built-in Invitation Generator** | ✅ **Completed** | Full end-to-end Ceremonial Card Architect (`/admin/invitations` & `/invitations`) matching Stitch screen `110d273f`. Complete backend integration (`GET /api/v1/invitations/:code`, `POST /api/v1/invitations`, and `POST /api/v1/invitations/render-upload` to GridFS). Supports 6-rite presets, 3 card silhouettes (Royal Mandap, Ivory Arch, Sunset Vow), live vector Standee QR embedding, 4:5 & 9:16 aspect ratios, WhatsApp text copy, Lightbox inspection, and `html2canvas` 300 DPI PNG exports. |
| **4.6** | **Live Stream Integration** | ✅ **Completed** | Full end-to-end Ceremonial Live Cinema matching Stitch screen `ed30167a` (`/marriage/[id]/cinema` & `/cinema`). Embedded 16:9 responsive YouTube Live player (`getYouTubeEmbedUrl`), 6-canonical-rite channel switcher, interactive Virtual Aashirwaad cheer reaction ribbon (❤️, 🌹, 🪔, 👏, 🎉) with floating particle engine, live viewer counters, live remote guestbook, and Host Admin Stream Studio modal backed by `PUT /api/v1/events/config/stream` and `GET /api/v1/events/marriage/:code`. |
| **4.7** | **Media Segregation (Photos & Videos)** | ✅ **Completed** | Full end-to-end Media Segregation matching Stitch screen `6abe00b4` (`/marriage/[id]/vault` and `/marriage/[id]`). Strict isolation: **Videos Tab** exclusively streams official host-curated 4K reels from GridFS with custom Cinema Player Lightbox (Play/Pause, Scrubber bar, 10s skip/rewind, Volume slider, Fullscreen, and Direct Master Download). **Photos Tab** displays crowdsourced candid photo dumps with author attribution badges. Protected `POST /api/v1/media/curate-reel` endpoint ensures only hosts can publish official video reels, backed by HTTP 206 Partial Content Range streaming. |

---

## 2. Technical Milestones Completed

### A. Frontend Architecture (Next.js 15 App Router)
- **Design System:** Pure White & Crimson Luxury Edition with editorial typography (`Playfair Display` + `Plus Jakarta Sans` + `Bodoni Moda`).
- **Icon System:** Custom standalone `AppIcon` component with zero external font/CDN dependencies (Lucide SVG mapping) plus Google Material Symbols Outlined.
- **Dedicated Routes (12 routes):**
  - `/`: Global wedding landing page with passcode unlock modal.
  - `/admin/dashboard`: Dual-view host portal with metrics, marriage manager, and curate shortcuts.
  - `/admin/invitations` & `/invitations`: Digital Invitation Studio with 3 card styles and PNG export.
  - `/marriage/[id]`: Interactive wedding dashboard with 6-rite timeline, live wishes ribbon, and segregated media gallery.
  - `/marriage/[id]/cinema` & `/cinema`: Ceremonial live stream virtual attendance cinema with cheer reactions.
  - `/marriage/[id]/vault`: Dedicated Atelier Registry Media Vault with strict PRD 4.7 segregation and 4K Cinema Player Lightbox.
  - `/guest/upload`: QR-powered candid photo dump with guest attribution.
- **Client-side Compression:** Aggressive image compression via `browser-image-compression` (<500KB WebP) protecting the 512MB MongoDB Atlas free-tier storage.
- **Dynamic Standee QR:** Integrated `qrcode` engine generating sharp vector data URLs pointing to `${origin}/guest/upload?code=<marriageCode>`.

### B. Backend Architecture (Express + Mongoose + GridFS)
- **Resilient Atlas Connection:** Multi-attempt retry loop with custom DNS configuration (`8.8.8.8`, `1.1.1.1`) and extended `serverSelectionTimeoutMS: 30000`.
- **Memory Buffer Streaming:** `multer.memoryStorage()` piped directly into GridFS `bucket.openUploadStream()`.
- **HTTP 206 Range Streaming:** `GET /api/v1/media/stream/:fileId` supports HTTP `Range: bytes=start-end` for zero-buffer video playback, scrubbing, and seek operations.
- **Role-Based Curatorial Guard (PRD 4.7):**
  - `POST /api/v1/media/curate-reel`: Host-only endpoint requiring `role: 'ADMIN'` to ingest and publish official reels.
  - `POST /api/v1/media/guest-upload`: Guests restricted to candid photos tagged with name and email.
  - `GET /api/v1/media/gallery/:marriageCode?mediaType=VIDEO|PHOTO`: Segregated querying with full curator stamps, duration, and play metrics.

---

## 3. Verified End-to-End Test Flows (8 Suites, 59/59 Passed)

1. **Suite 1: API Gateway & Health Check** (HTTP 200, uptime tracking).
2. **Suite 2: Host Authentication** (Login with `modi@makemymarriage.com`, JWT verification, Admin role check).
3. **Suite 3: Marriage Vault Management** (CRUD operations, dynamic standee QR generation, 6 canonical events).
4. **Suite 4: QR-Powered Photo Dump & Attribution** (Guest upload, Name/Email attribution, GridFS binary streaming).
5. **Suite 5: Digital Invitation Studio** (Card customization, 6-rite presets, GridFS render-upload).
6. **Suite 6: Live Stream Integration** (Host Stream Studio API, YouTube Live link parsing, LIVE broadcast state).
7. **Suite 7: Media Segregation** (Strict isolation between videos and photos, admin reel curation, HTTP 206 Range streaming, unauthenticated rejection).
8. **Suite 8: Teardown & Cascading Cleanup** (Cascading deletion of test entities, 404 verification).

---

## 4. Seeded Bollywood Weddings

- **1. [PAST] Raj Malhotra & Simran Singh (DDLJ)** — Code: `RAJSIM24` (Oct 18–20, 2024, Agra)
  - 4 Official 4K Reels (*Zara Sa Jhoom Loon*, *The Golden Haldi Glow*, *Chenab Flute*, *Saat Phere & Sindoor Daan*).
- **2. [PAST] Qais (Majnu) & Laila Sharma (Laila Majnu)** — Code: `LAILAM25` (Nov 14–16, 2025, Gulmarg, Kashmir)
  - 3 Official Reels (*Hafiz Hafiz*, *O Meri Laila*, *Snowcrest Nikaah*).
- **3. [LIVE] Dido Ranjha & Heer Sial (Heer Ranjha)** — Code: `HEERRAN26` (Dec 18–20, 2026, Jodhpur)
  - 3 Official Reels (*Chenab Flute*, *Royal Marwar Turmeric*, *Anand Karaj Under Imperial Mandap*).
- **4. [FUTURE] Kabir (Bunny) & Naina Talwar (YJHD)** — Code: `BUNNYNA27` (Mar 24–26, 2027, Udaipur)
  - 3 Official Reels (*Dilliwaali Girlfriend*, *Sunshine Pichola Marigold Splash*, *Kabira Royal Pheras*).
