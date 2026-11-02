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

### 4.1. Unified Role-Switch Gateway (`/`)
*   **Feature:** The landing page serves as the single entry gateway with a prominent pill toggle between **🌸 Guest Experience** and **👑 Host / Admin Portal**.
*   **Guest Mode:** Simple proceed screen where guests enter their Name and Email (with quick wedding passcode selector) and click **"Enter Celebrations 🌸"**. No password required.
*   **Admin Mode:** Credentialed login with email, password visibility toggle, and secure JWT generation.

### 4.2. Guest Celebrations Directory & Universal Navbar Simplification
*   **Feature:** Once guest mode is active, `/` displays the clean **Celebrations Directory** with real-time wedding cards, live status badges, search console, and filter pills.
*   **Navbar Simplification:** All confusing legacy tabs (`Explore Marriages`, `Guest Experience`, `QR Photo Dump`, `Media Vault`, `Admin Portal`) are completely removed.
*   **Guest View:** Only displays the `Celebrations` anchor, guest identity badge (`🌸 Guest: <Name>`), and `Exit / Switch Role` button.
*   **Strict Invisibility:** Admin portal links are completely hidden from guests.

### 4.3. Admin Dual-Tab Workspace (`/admin/dashboard`)
*   **Feature:** A dedicated workspace for sovereign hosts with two top-level switch tabs:
    *   **Tab 1: Dashboard & Marriages:** Global metrics (Guests, Photos, Videos, GridFS Storage), wedding portfolio table, action shortcuts, and wedding creation modal.
    *   **Tab 2: Live Guest View:** Embedded live iframe mirror displaying the exact guest experience, accompanied by a banner and `← Return to Master Dashboard` shortcut.

### 4.4. Single Wedding Sanctuary (`/marriage/[id]`)
*   **Feature:** Clicking any wedding card leads to a single, unified sanctuary containing all wedding features:
    *   **Six-Part Timeline:** 6 canonical rites (Engagement, Mehndi, Haldi, Sangeet, Marriage, Others) with date, time, and venue details.
    *   **Table Standee QR Modal:** Instant modal displaying the high-resolution banquet table standee QR code, unique passcode, and copyable upload link.
    *   **Drop Media Zone:** In-page upload tray with client-side image compression.
    *   **Segregated Gallery:** Clear separation between crowdsourced candid photos and official host 4K reels.
    *   **Live Stream & Wishes:** Responsive YouTube Live player with floating emoji cheer reactions.

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
