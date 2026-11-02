# Make My Marriage — Project Status & Roadmap

**Current Version:** 2.0.0 (Unified Role-Switch Gateway & Streamlined Dual-Persona Architecture)  
**Updated:** November 2026  
**Architecture:** MERN Monorepo (Next.js 15 + Express + MongoDB Atlas GridFS)  
**Budget Constraint:** Strictly ₹0 (MongoDB Atlas M0 Free Tier, Zero Paid Cloud APIs)  
**Active Ports:**  
- **Frontend:** `http://localhost:5173` (Fallback: `http://localhost:5174` or Next.js standard `3000`)
- **Backend API Gateway:** `http://localhost:5000` (`/api/v1`)
- **Admin Sovereign Login:** `modi@makemymarriage.com` / `Password@2026`

---

## 1. Feature Implementation Matrix (vs PRD & Stitch Specs)

| PRD Section | Feature Name | Status | Implementation Details |
|---|---|---|---|
| **4.1** | **Unified Role-Switch Gateway** | ✅ **Completed** | Clean root page `/` provides instant toggle between **🌸 Guest Experience** and **👑 Host / Admin Portal**. Zero password for guests (Name & Email proceed screen); credentialed sign-in for Host Admins. |
| **4.2** | **Admin Dual-Tab Workspace** | ✅ **Completed** | Admin logged into `/admin/dashboard` has a master dual-tab switcher: **Tab 1: Dashboard & Marriages** (metrics, catalog, create modal) and **Tab 2: Live Guest View** (embedded iframe preview with Return button). Full CRUD and GridFS monitoring. |
| **4.3** | **Universal Navbar Simplification** | ✅ **Completed** | Cluttered multi-tabs (`Explore Marriages`, `Guest Experience`, `QR Photo Dump`, `Media Vault`, `Admin Portal`) completely replaced. Guests see only `Celebrations` anchor, guest identity badge (`🌸 Guest: Kabir Malhotra`), and `Exit / Switch Role`. Host admin links are strictly invisible to guests. |
| **4.4** | **Six-Part Wedding Timeline** | ✅ **Completed** | Every wedding provisions the canonical 6 rites: *Engagement, Mehndi, Haldi, Sangeet, Marriage (Holy Pheras), and Others (Candid/Table)* with dedicated event stats. |
| **4.5** | **Banquet Table Standee QR & Attributed Photo Dump** | ✅ **Completed** | Built desktop-first luxury portal `/guest/upload` and in-page Table Standee QR Modal inside `/marriage/[id]`. Generates dynamic vector QR codes. Uploads stream into Atlas GridFS tagged with guest `Name`, `Email`, and `Ceremony`. |
| **4.6** | **Digital Invitation Studio** | ✅ **Completed** | Ceremonial Card Architect (`/admin/invitations` & `/invitations`) matching Stitch design. Supports 6-rite presets, 3 card silhouettes (Royal Mandap, Ivory Arch, Sunset Vow), live vector Standee QR embedding, 4:5 & 9:16 aspect ratios, WhatsApp copy, and `html2canvas` 300 DPI exports. |
| **4.7** | **Live Stream Integration** | ✅ **Completed** | Ceremonial Live Cinema (`/marriage/[id]/cinema` & `/cinema`) with embedded 16:9 responsive YouTube Live player (`getYouTubeEmbedUrl`), 6-rite switcher, Virtual Aashirwaad reactions (❤️, 🌹, 🪔, 👏, 🎉), live counters, and Host Admin Stream Studio modal (`PUT /api/v1/events/config/stream`). |
| **4.8** | **Media Segregation (Photos & Videos)** | ✅ **Completed** | Strict isolation: **Videos Tab** exclusively streams official host-curated 4K reels from GridFS with custom Cinema Player Lightbox. **Photos Tab** displays crowdsourced candid photo dumps with author attribution. Protected `POST /api/v1/media/curate-reel` endpoint ensures only hosts can publish official video reels. |

---

## 2. Technical Milestones Completed

### A. Frontend Architecture (Next.js 15 App Router)
- **Design System:** Pure White & Crimson Luxury Edition with editorial typography (`Playfair Display` + `Plus Jakarta Sans` + `Bodoni Moda`).
- **Icon System:** Custom standalone `AppIcon` component with zero external font/CDN dependencies (Lucide SVG mapping) plus Google Material Symbols Outlined.
- **Dedicated Routes (11 routes compiled):**
  - `/`: Unified Role-Switch Gateway (unauthenticated) / Guest Celebrations Directory (guest authenticated).
  - `/admin/login`: Clean redirect to `/` with Host Admin credentials mode enabled.
  - `/admin/dashboard`: Master dual-view host portal with metrics, marriage manager, and embedded Live Guest View mirror.
  - `/admin/invitations` & `/invitations`: Digital Invitation Studio with 3 card styles and PNG export.
  - `/marriage/[id]`: Unified Wedding Sanctuary with 6-rite timeline, live wishes ribbon, Banquet Table Standee QR modal, and segregated media gallery.
  - `/marriage/[id]/cinema` & `/cinema`: Ceremonial live stream virtual attendance cinema with cheer reactions.
  - `/marriage/[id]/vault`: Atelier Registry Media Vault with strict PRD 4.8 segregation and 4K Cinema Player Lightbox.
  - `/guest/upload`: Banquet Table Standee QR-powered candid photo dump with guest attribution.
- **Client-side Compression:** Aggressive image compression via `browser-image-compression` (<500KB WebP) protecting the 512MB MongoDB Atlas free-tier storage.
- **Dynamic Standee QR:** Integrated `qrcode` engine generating sharp vector data URLs pointing to `${origin}/guest/upload?code=<marriageCode>`.

### B. Backend Architecture (Express + Mongoose + GridFS)
- **Resilient Atlas Connection:** Multi-attempt retry loop with custom DNS configuration (`8.8.8.8`, `1.1.1.1`) and extended `serverSelectionTimeoutMS: 30000`.
- **Memory Buffer Streaming:** `multer.memoryStorage()` piped directly into GridFS `bucket.openUploadStream()`.
- **HTTP 206 Range Streaming:** `GET /api/v1/media/stream/:fileId` supports HTTP `Range: bytes=start-end` for zero-buffer video playback, scrubbing, and seek operations.
- **Role-Based Curatorial Guard:**
  - `POST /api/v1/auth/guest/login`: Instant guest access issuing JWT with guest identity and vault binding.
  - `POST /api/v1/media/curate-reel`: Host-only endpoint requiring `role: 'ADMIN'` to ingest and publish official reels.
  - `POST /api/v1/media/upload`: Attributed candid photo uploads tagged with name and email.
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
