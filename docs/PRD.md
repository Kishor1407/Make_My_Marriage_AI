# Product Requirements Document (PRD)
**Project Name:** Make My Marriage  
**Platform Type:** MERN Stack Web Application  
**Budget Constraint:** Strictly ₹0 (Relying exclusively on Free Tiers: Vercel, Render, MongoDB Atlas M0)  
**Version:** 2.0 (Streamlined Flow & Role-Segregated Sovereign Edition)  

---

## 1. Project Overview
"Make My Marriage" is a digital wedding companion and media-sharing platform. It allows families (Admins) to create a beautiful, structured digital sanctuary for their weddings. Guests access celebrations with zero password friction to view event itineraries, watch live broadcasts, and collaboratively build a "photo dump" by scanning QR codes at banquet tables.

**Primary Goals:**
1. Provide a central hub for wedding information (Dates, Venues, Timelines, Live Streams).
2. Allow guests to easily share the candid photos they take at events with zero login friction.
3. Keep the platform completely free to host and operate (₹0 cloud infrastructure cost).

---

## 2. Technology Stack (The ₹0 Architecture)
To ensure the project costs absolutely nothing to run, we utilize the following free-tier technologies:

*   **Frontend (User Interface):** 
    *   **Next.js 15 (App Router):** The core React framework. Hosted for free on **Vercel**.
    *   **Tailwind CSS:** For fast, beautiful, and responsive styling in Pure White & Royal Crimson Luxury aesthetic.
    *   **Redux Toolkit:** To manage platform session state.
    *   **Zod:** To validate inputs and forms.
    *   **html2canvas:** To build the client-side Invitation Generator with zero server compute.
    *   **browser-image-compression:** Crucial for shrinking photo sizes (<500KB) *before* transmission to protect the 512MB database limit.
*   **Backend (Server & Logic):** 
    *   **Node.js & Express.js:** The API Gateway handling requests. Hosted for free on **Render**.
    *   **JWT (JSON Web Tokens):** For secure role-based session state.
*   **Database & File Storage:** 
    *   **MongoDB Atlas (M0 Free Cluster):** Provides 512MB of free cloud database storage.
    *   **GridFS:** Chunks large binaries into 255KB chunks, streaming photos and videos directly into MongoDB with HTTP 206 partial range streaming.

---

## 3. User Roles & Permissions (Dual-Persona Model)
The platform implements strict persona isolation:

1.  **Guest (The Attendee):** Zero-friction, zero-password access.
    *   Enters via the **Unified Role-Switch Gateway** by providing Name and Email (optional passcode).
    *   Has **zero visibility** of admin links, host buttons, or concierge options.
    *   Sees an **"Exit / Switch Role"** button in the corner to return to the gateway.
    *   Can browse unlocked marriages, view 6-part itineraries, watch live streams, and upload attributed candid photos.
2.  **Admin (The Sovereign Host):** Full managerial control.
    *   Authenticates via email (`modi@makemymarriage.com`) and secure password.
    *   Enters a **Dual-Tab Workspace**:
        - **Tab 1: Dashboard & Marriages:** Portfolio metrics, create/edit marriages, GridFS storage monitor, and invitations studio.
        - **Tab 2: Live Guest View:** Full mirror preview of the live guest experience with `← Return to Master Dashboard`.

---

## 4. Core Features & Functional Requirements

### 4.1. Clean Role-Switch Gateway (`/`)
*   **Feature:** The landing page serves as the single entry gateway with a prominent pill toggle between **🌸 Guest Experience** and **👑 Host / Admin Portal** (matching Google Stitch screen `6588f0d3`).
*   **Guest Mode:** Ultra-clean proceed screen where guests enter only their **Full Name** and **Email Address**. Strictly **NO** wedding select dropdown and **NO** passcode prompt at entry. Single primary CTA: **"Enter Celebrations Directory 🌸 →"**.
*   **Admin Mode:** Credentialed login with email, password visibility toggle, and secure JWT generation.

### 4.2. Celebrations Directory & Universal Navbar Simplification
*   **Feature:** Once guest mode is active, `/` displays the **Celebrations Directory** (matching Stitch screen `238ca088`) with real-time wedding cards from MongoDB Atlas, live status badges, search console (by couple, city, venue, year), and filter pills (All, Live Now, Upcoming).
*   **Locked Sanctuary Cards:** Each wedding card displays the couple cover photo, ceremonial schedule, venue, archived moments counter, attending guest counter, and a prominent **"Unlock Sanctuary 🔒 →"** CTA.
*   **Navbar Simplification:** All confusing legacy tabs are removed. Guests see only the `Celebrations` anchor, their identity badge (`🌸 Guest: <Name>`), and `Exit / Switch Role`. Admin links are completely invisible.

### 4.3. Secret Passcode Unlock Modal (Stitch Screen `7a358ae8`)
*   **Feature:** Clicking on any locked wedding card triggers the confidential **Secret Passcode Unlock Modal**.
*   **Functionality:**
    *   Displays couple avatar, `॥ शुभं भवतु ॥ • Private Access Protocol`, date, and venue.
    *   Prompts guest for the confidential 8-character secret passcode (e.g. `RAJSIM24`).
    *   Dynamic verification against `POST /api/v1/auth/guest/verify-passcode`.
    *   If correct: green authenticated state, binds wedding to session, and decrypts the sanctuary.
    *   If incorrect: red error banner with guidance to check physical stationery or banquet table standees.
    *   Includes Banquet Standee zero-code scanning advisory and 1-click test demo auto-fill pill.

### 4.4. Clean Admin Workspace (`/admin/dashboard` - Stitch Screen `ac6161cf`)
*   **Feature:** A bespoke command deck for sovereign hosts featuring:
    *   **Global Metrics Ticker:** Active Weddings, Total Photos, Live Streams Ready, and ₹0 Infrastructure Cost.
    *   **Active Wedding Vaults Grid:** Dynamic cards displaying couple monikers, venue, date span, guest passcode with 1-click copy, and photo/reels/guest statistics.
    *   **Direct Action Command Bar on Each Card:**
        - **Stream:** Opens the Autonomous Ingest Studio modal with RTMP Ingest URL and OBS/vMix stream key.
        - **Standee QR:** Opens the Table Standee QR Generator modal with 12-table selector, live vector QR preview, instant print, and PNG/PDF export.
        - **💌 Invites:** Opens the Bespoke Monogram Suite & Invitation Studio modal with ritual tabs (Haldi, Mehndi, Sangeet, Pheras, Reception), live preview, attire monogram, and instant 1-click publishing.
        - **Upload & Dump Photos:** Direct bulk media ingestion modal for raw high-res ceremony photos with client-side compression.
    *   **In-Page Modals:** Provision Wedding Vault (+ Add New Marriage), Edit Vault Details, Standee QR Generator, Invitation Studio, Live Stream Credentials, and Bulk Photo Ingestion.

### 4.5. Guest All-in-One Wedding Sanctuary (`/marriage/[id]` - Stitch Screen `caa3fd8e`)
*   **Feature:** Complete matrimonial sanctuary providing an ultra-high-fidelity guest experience:
    *   **Header & Mode Switcher:** Brand identity with rotating square diamond, quick toggle between Guest Mode and Admin Workspace.
    *   **Top Micro-Bar:** Live Ceremonial Feed Active badge (pulsing red dot), Oberoi Amarvilas Vault badge, and Guest Passcode badge.
    *   **Editorial Header & Welcome Monograph:** Matrimonial Monograph Volume IX, large couple typography, date span, and venue.
    *   **Instant Blessings Bar:** Real-time counter ticker (e.g. 1,429 Sent) with 5 interactive reaction buttons (✨ Magic, ❤️ Prem, 🌹 Rose, 🥂 Cheers, 🪔 Aashirwaad) rendering upward-floating particle burst animations and atomically updating backend stats (`POST /api/v1/marriages/:id/blessing`).
    *   **Ceremonial Invitations & Itinerary:** 4 canonical ritual cards (Haldi Rasam, Sangeet Soirée, Royal Pheras & Varmala, Grand Reception) with venue etiquette, dress code monograms, status tags (Completed, Live Now, Tomorrow, Upcoming), and instant card/poster download.
    *   **Live Stream Cinema Pavilion:** 16:9 cinema stage with 4-rite switcher (`Haldi`, `Mehndi`, `Sangeet`, `Pheras`), live viewer count (e.g. 842 Family & Friends Watching Live), play/pause, mute/unmute, 0.8s latency ticker, fullscreen, and "🌹 Shower Flowers" rose petal particle burst button.
    *   **Split Section (Drop Candid Photos & Dining Table Standee):**
        - **Left (Cols 8):** Drop Candid Photos & Clips zone with drag & drop, high-res photo/video upload, progress indicator, and Name & Banquet Table attribution fields.
        - **Right (Cols 4):** Dining Table Standee QR Acrylic Card with 12-table selector dropdown (Table 01 to Table 12), live vector QR code generated dynamically per table, and "Download Table Card (PDF/PNG)".
    *   **The Guest Memory Stream:** Live photo gallery with "All Guest Photos" vs "Official Studio Highlights" segregation, table badges (Table 2, Table 4, Studio Archival, etc.), uploader names, time ago, interactive heart like buttons with live counts (`POST /api/v1/media/:id/like`), and an Immersive Photo Lightbox Modal.
    *   **Live Sync Footnote & Footer:** Projector auto-sync footnote and Haute Couture footer.

### 4.5. Digital Invitation Studio
*   **Feature:** Built-in ceremonial card architect (`/admin/invitations` & `/invitations`).
*   **Functionality:** Generates high-resolution wedding stationery in 3 card silhouettes (Royal Mandap, Ivory Arch, Sunset Vow) with 4:5 and 9:16 aspect ratios, live Standee QR embedding, and client-side `html2canvas` 300 DPI exports.

### 4.6. Media Segregation & 4K Cinema Streaming
*   **Videos Tab:** Exclusively streams host-curated 4K reels with HTTP 206 range request support for smooth scrubbing.
*   **Photos Tab:** Crowdsourced candid photo dumps attributed to guest Name and Email.

---

## 5. End-to-End User Journeys

### The Sovereign Admin Journey
1.  **Arrive & Authenticate:** Host visits `/`, toggles to **Host / Admin Portal**, enters credentials (`modi@makemymarriage.com`), and enters `/admin/dashboard`.
2.  **Manage & Monitor:** In **Dashboard & Marriages** tab, views overall guest engagement, storage utilization, and clicks "Create New Marriage".
3.  **Setup Sanctuary:** Configures couple names, date, venue, and automatically provisions all 6 ceremonial events.
4.  **Preview as Guest:** Switches to **Live Guest View** tab to test the experience through the eyes of an attendee.
5.  **Print Table Standees:** Opens the wedding, generates the Banquet Table Standee QR code, and distributes it to the venue tables.

### The Honored Guest Journey
1.  **Instant Gateway Entry:** Guest visits `/`, remains on **Guest Experience** tab, types their Name (`Kabir Malhotra`) and Email, selects the wedding, and clicks **"Enter Celebrations 🌸"**.
2.  **Celebrations Hub:** Lands immediately in the directory, sees their identity badge (`🌸 Guest: Kabir Malhotra`), and clicks **"Enter Wedding Vault →"**.
3.  **Sanctuary Immersion:** Explores the 6 rites (Haldi, Sangeet, etc.), watches the ceremonial live broadcast, and reads the schedule.
4.  **Table Standee QR Upload:** Scans the table standee QR or clicks "Table Standee QR", drops memories into the upload zone (auto-compressed to <500KB), and sees them appear in the candid gallery with their name attributed.
5.  **Clean Exit:** Whenever done or switching roles, clicks **"Exit / Switch Role"** to return cleanly to the gateway.
