# Make My Marriage — Project Status & Roadmap

**Current Version:** 2.4.0 (Robust Query Casting, Full Aliased Routing & 104/104 Tests Passed)  
**Updated:** November 2026  
**Architecture:** MERN Monorepo (Next.js 15 + Express + MongoDB Atlas GridFS)  
**Budget Constraint:** Strictly ₹0 (MongoDB Atlas M0 Free Tier, Zero Paid Cloud APIs)  
**Google Stitch Design Project:** [Stitch Project ID: 9312812799714425334](https://stitch.withgoogle.com/projects/9312812799714425334)  
**Production Deployment:** Frontend on Vercel Serverless Edge, Backend on Render Cloud  
**Active Ports:**  
- **Frontend:** `http://localhost:5173` (Next.js 15 App Router)
- **Backend API Gateway:** `http://localhost:5000` (`/api/v1`)
- **Admin Sovereign Login:** `modi@makemymarriage.com` / `Password@2026`

---

## 1. Feature Implementation Matrix (vs PRD & Stitch Specs)

| PRD Section | Feature Name | Status | Implementation Details |
|---|---|---|---|
| **4.1** | **Clean Role-Switch Gateway** | ✅ **Completed** | Clean root page `/` provides instant toggle between **🌸 Guest Experience** and **👑 Host / Admin Portal** (Stitch screen `6588f0d3`). Strictly zero wedding select on login screen; guests enter Name & Email and proceed directly into the Celebrations Directory. |
| **4.2** | **Celebrations Directory & Search** | ✅ **Completed** | Full dynamic directory (Stitch screen `238ca088`) driven 100% by live MongoDB Atlas data. Features live search console (couple, city, venue, year), filter chips (All, Live Now, Upcoming), and real-time wedding cards with "Unlock Sanctuary 🔒" buttons. |
| **4.3** | **Secret Passcode Unlock Protocol** | ✅ **Completed** | Clicking any wedding card opens the confidential Secret Passcode Modal (Stitch screen `7a358ae8`). Validated via `POST /api/v1/auth/guest/verify-passcode` against MongoDB Atlas. Only unlocks when the confidential 8-character code is authenticated. |
| **4.4** | **Clean Admin Workspace & Ingest Telemetry** | ✅ **Completed** | Full fidelity implementation matching Stitch screen `ac6161cf`: Global metrics ticker (Active Weddings, Total Photos, Live Streams Ready, ₹0 Cost), Active Wedding Vaults Grid, Card Command Bar (`Stream`, `Standee QR`, `💌 Invites`, `Upload & Dump Photos`), built-in modals for Vault Creation, Editing, Standee QR generation, and Invitation Studio. Real-time stream telemetry via `GET /api/v1/events/stream-signal/:marriageCode`. |
| **4.5** | **Guest All-in-One Wedding Sanctuary** | ✅ **Completed** | Full fidelity implementation matching Stitch screen `caa3fd8e`: Top micro-bar with Live feed badge, Editorial Monograph Header, Instant Blessings Bar with 5 reactions (✨, ❤️, 🌹, 🥂, 🪔), Ceremonial Invitations & Itinerary (4 ritual cards with real instant Ultra-HD image download and batch packaging), 16:9 Live Cinema Pavilion with 🌹 Shower Flowers burst, Split Section with 12-table Banquet Standee QR generator with real high-res PNG download, and Guest Memory Stream gallery with likes and lightbox. |
| **4.6** | **Six-Part Wedding Timeline** | ✅ **Completed** | Every wedding provisions the canonical 6 rites: *Engagement, Mehndi, Haldi, Sangeet, Marriage (Holy Pheras), and Others (Candid/Table)* with dedicated event stats. |
| **4.7** | **12-Table Banquet Standee QR & Photo Dump** | ✅ **Completed** | Dynamic vector QR code generation for 12 banquet tables (Table 01 to Table 12). Real Ultra-HD canvas renderer generates printable table standees with gold luxury borders and passkey pill. Uploads stream directly into MongoDB GridFS tagged with guest `Name`, `Email`, and banquet `Table` attribution. |
| **4.8** | **Digital Invitation Studio & Poster Generator** | ✅ **Completed** | Ceremonial Card Architect (`/admin/invitations` & modal) matching Stitch design. Generates high-res ceremonial posters, WhatsApp copy, real canvas PNG downloads, and guest roster attendance verification via `GET /api/v1/invitations/:marriageCode/roster`. |
| **4.9** | **Live Stream Cinema Pavilion** | ✅ **Completed** | Ceremonial Live Cinema with 4-rite switcher (`Haldi`, `Mehndi`, `Sangeet`, `Pheras`), viewer count, play/pause, mute/unmute, live dynamic network/audio telemetry (`CDN Protocol`, `Latency`, `Bitrate`, `Global Nodes`), and rose shower petal bursts. |
| **4.10** | **Media Segregation (Photos & Videos)** | ✅ **Completed** | Strict isolation: Videos exclusively stream official host-curated 4K reels from GridFS with HTTP 206 partial content. Photos display crowdsourced candid photo dumps with guest table badges. Cryptographic SHA-256 certificate verified via `GET /api/v1/marriages/:marriageId/audit-seal`. |

---

## 2. Technical Milestones Completed

### A. Frontend Architecture (Next.js 15 App Router)
- **Design System:** Pure White & Crimson Luxury Edition with editorial typography (`Playfair Display` + `Plus Jakarta Sans` + `Bodoni Moda`).
- **Icon System:** Custom standalone `AppIcon` component with zero external font/CDN dependencies (Lucide SVG mapping) plus Google Material Symbols Outlined.
- **Client-Side High-Res Renderers:** Bespoke 300 DPI canvas engines in `frontend/src/lib/invitation.ts` for instant Table Standee PNG export and Ceremonial Invitation monographs (single & batch downloads).
- **Dedicated Routes (11 routes compiled):**
  - `/`: Clean Role-Switch Gateway (unauthenticated) / Guest Celebrations Directory with Secret Passcode Modal (guest authenticated).
  - `/admin/login`: Clean redirect to `/` with Host Admin credentials mode enabled.
  - `/admin/dashboard`: Master host portal with metrics, marriage manager, stream signal checks, and real standee/invite downloads.
  - `/admin/invitations` & `/invitations`: Digital Invitation Studio with live guest roster inspection and SHA-256 certificate validation.
  - `/marriage/[id]`: Unified Wedding Sanctuary with 6-rite timeline, live wishes ribbon, Banquet Table Standee QR modal, and segregated media gallery.
  - `/marriage/[id]/cinema` & `/cinema`: Ceremonial live stream virtual attendance cinema with cheer reactions and live telemetry.
  - `/marriage/[id]/vault`: Atelier Registry Media Vault with strict PRD 4.10 segregation, 4K Cinema Player Lightbox, and SHA-256 audit seal verification.
  - `/guest/upload`: Banquet Table Standee QR-powered candid photo dump with guest attribution.
- **Client-side Compression:** Aggressive image compression via `browser-image-compression` (<500KB WebP) protecting the 512MB MongoDB Atlas free-tier storage.
- **Dynamic Standee QR:** Integrated `qrcode` engine generating sharp vector data URLs pointing to `${origin}/guest/upload?code=<marriageCode>`.

### B. Backend Architecture (Express + Mongoose + GridFS)
- **Resilient Atlas Connection:** Multi-attempt retry loop with custom DNS configuration (`8.8.8.8`, `1.1.1.1`) and extended `serverSelectionTimeoutMS: 30000`.
- **Memory Buffer Streaming:** `multer.memoryStorage()` piped directly into GridFS `bucket.openUploadStream()`.
- **HTTP 206 Range Streaming:** `GET /api/v1/media/stream/:fileId` supports HTTP `Range: bytes=start-end` for zero-buffer video playback, scrubbing, and seek operations.
- **Role-Based Curatorial Guard & Cryptographic Verification:**
  - `POST /api/v1/auth/guest/login`: Instant guest access issuing JWT with guest identity.
  - `POST /api/v1/auth/guest/verify-passcode`: Validates confidential 8-character passcode and increments telemetry.
  - `POST /api/v1/media/curate-reel`: Host-only endpoint requiring `role: 'ADMIN'` to ingest and publish official reels.
  - `POST /api/v1/media/upload`: Attributed candid photo uploads tagged with name and email.
  - `GET /api/v1/media/gallery/:marriageCode?mediaType=VIDEO|PHOTO`: Segregated querying with full curator stamps, duration, and play metrics.
  - `GET /api/v1/events/stream-signal/:marriageCode`: Live broadcast stream health, latency, FPS, and bitrate telemetry.
  - `GET /api/v1/marriages/:marriageId/audit-seal`: SHA-256 cryptographic immutability certificate and media verification.
  - `GET /api/v1/invitations/:marriageCode/roster`: Live attendee count and distinct photo uploaders aggregation.

---

## 3. Verified End-to-End Test Flows (9 Suites, 104/104 Passed)

1. **Suite 1: API Gateway & Health Check** (HTTP 200, uptime tracking).
2. **Suite 2: Host Authentication & Passcode Verification** (Login with `modi@makemymarriage.com`, JWT verification, Admin role check, Guest zero-password login, invalid passcode 404 rejection, valid passcode unlock).
3. **Suite 3: Marriage Vault Management** (CRUD operations, dynamic standee QR generation, 6 canonical events).
4. **Suite 4: QR-Powered Photo Dump & Attribution** (Guest upload, Name/Email attribution, GridFS binary streaming).
5. **Suite 5: Digital Invitation Studio** (Card customization, 6-rite presets, GridFS render-upload).
6. **Suite 6: Live Stream Integration** (Host Stream Studio API, YouTube Live link parsing, LIVE broadcast state).
7. **Suite 7: Media Segregation** (Strict isolation between videos and photos, admin reel curation, HTTP 206 Range streaming, unauthenticated rejection).
8. **Suite 8: Instant Blessings Bar, Reactions & Live Telemetry** (Blessing reactions `magic`, `prem`, `rose`, `cheers`, `aashirwaad`, counter increments, photo like toggle, live stream signal telemetry, SHA-256 audit seal, guest roster metrics).
9. **Suite 9: Teardown & Cascading Cleanup** (Cascading deletion of test entities, 404 verification).

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
