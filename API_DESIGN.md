# Make My Marriage — System Architecture & API Design Specification

> **Version:** 2.0 (Streamlined Flow & Role-Segregated Sovereign Edition)  
> **Infrastructure Cost:** ₹0 / month (Serverless M0 MongoDB Atlas Cluster + GridFS Chunked Storage Engine)  
> **Design Philosophy:** Pure White & Royal Crimson Luxury Aesthetic, High-Utility SaaS, Zero-Friction Guest Experience  

---

## 1. Architectural Philosophy & Dual-Persona Model

Make My Marriage implements a strict dual-persona separation between **Honored Guests** and **Sovereign Host Admins**:

```
                       ┌──────────────────────────────────────┐
                       │     Unified Role-Switch Gateway      │
                       │           (Route: /)                 │
                       └──────────────────┬───────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │   🌸 GUEST EXPERIENCE  │                     │  👑 SOVEREIGN ADMIN    │
     │                        │                     │                        │
     │ • No Password Required │                     │ • Secure Email/Passkey │
     │ • Instant Name & Email │                     │ • JWT Session (7 Days) │
     │ • Zero Admin Clutter   │                     │ • Dual-Tab Workspace   │
     │ • Direct Celebration   │                     │   - Dashboard/Vaults   │
     │   Directory Access     │                     │   - Live Guest Mirror  │
     │ • Exit / Switch Role   │                     │ • Exit to Gateway      │
     └───────────┬────────────┘                     └───────────┬────────────┘
                 │                                              │
                 ▼                                              ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │  Celebrations Hub (/)  │                     │ Admin Dashboard (/adm) │
     │           │            │                     │           │            │
     │           ▼            │                     │           ▼            │
     │ Wedding Vault (/m/:id) │                     │ Live Guest View Mirror │
     └────────────────────────┘                     └────────────────────────┘
```

### Key Experience Invariants:
1. **Zero-Password Guest Access**: Guests are never subjected to registration, passwords, or complex auth forms. They provide their name and email for instant photographic attribution and enter directly.
2. **Strict Admin Invisibility**: When logged in as a guest, all admin links, host buttons, and administrative actions are completely stripped from the UI. A subtle **"Exit / Switch Role"** button allows them to return to the gateway.
3. **Admin Dual-Tab Workspace**: Admins operate with a dedicated two-mode toggle:
   - **Tab 1: Dashboard & Marriages**: Complete portfolio control, metrics, rites manager, standee generator, and invitations studio.
   - **Tab 2: Live Guest View Preview**: Full live mirror of how the wedding appears to guests.

---

## 2. Authentication & Session APIs

### 2.1 Instant Guest Access
- **Endpoint**: `POST /api/v1/auth/guest/login`
- **Access**: Public
- **Description**: Generates an instantaneous guest access token and session rehydration from Name and Email without password or wedding code friction.
- **Request Body**:
  ```json
  {
    "name": "Kabir Malhotra",
    "email": "kabir@gmail.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "guest_1730592812000",
      "role": "GUEST",
      "name": "Kabir Malhotra",
      "email": "kabir@gmail.com",
      "assignedMarriageId": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2.2 Secret Passcode Verification & Sanctuary Unlock
- **Endpoint**: `POST /api/v1/auth/guest/verify-passcode`
- **Access**: Public
- **Description**: Verifies the confidential 8-character wedding passcode when a guest clicks on a wedding card in the Celebrations Directory. Atomically increments guest engagement telemetry and binds the wedding to the guest session.
- **Request Body**:
  ```json
  {
    "marriageCode": "RAJSIM24",
    "name": "Kabir Malhotra",
    "email": "kabir@gmail.com"
  }
  ```
- **Response (200 OK - Valid Code)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "guest_1730592812000",
      "role": "GUEST",
      "name": "Kabir Malhotra",
      "email": "kabir@gmail.com",
      "assignedMarriageId": "6ae871326b4b9ce81626d95a"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (404 Not Found - Invalid Code)**:
  ```json
  {
    "success": false,
    "error": "The code entered does not match this wedding sanctuary. Verify with the host family or physical stationery."
  }
  ```

### 2.3 Sovereign Admin Login
- **Endpoint**: `POST /api/v1/auth/admin/login`
- **Access**: Public
- **Description**: Verifies sovereign host credentials and issues a secure 7-day administrative JWT.
- **Request Body**:
  ```json
  {
    "email": "modi@makemymarriage.com",
    "password": "Password@2026"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "6724f8101a2b3c4d5e6f7a8b",
      "role": "ADMIN",
      "name": "Narendra Modi (Chief Steward)",
      "email": "modi@makemymarriage.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2.3 Profile Verification
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Private (Bearer Token or Cookie)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "6724f8101a2b3c4d5e6f7a8b",
      "name": "Narendra Modi (Chief Steward)",
      "email": "modi@makemymarriage.com",
      "role": "ADMIN"
    }
  }
  ```

### 2.4 Logout & Gateway Reset
- **Endpoint**: `POST /api/v1/auth/logout`
- **Access**: Private
- **Description**: Clears HTTP-Only authentication cookies.

---

## 3. Marriage Vault Management APIs

### 3.1 List Active Marriages
- **Endpoint**: `GET /api/v1/marriages`
- **Access**: Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "_id": "6724f8101a2b3c4d5e6f7a8b",
        "partnerOneName": "Raj Malhotra",
        "partnerTwoName": "Simran Singh",
        "marriageCode": "RAJSIM24",
        "dates": "October 18–20, 2026",
        "venue": "The Grand Oberoi Amarvilas, Agra",
        "status": "LIVE",
        "coverImage": "https://lh3.googleusercontent.com/...",
        "globalStats": {
          "totalPhotos": 420,
          "totalVideos": 1,
          "totalGuestsEngaged": 240
        }
      }
    ]
  }
  ```

### 3.2 Fetch Single Marriage Vault
- **Endpoint**: `GET /api/v1/marriages/:codeOrId`
- **Access**: Public

### 3.3 Create New Marriage Vault (Admin Only)
- **Endpoint**: `POST /api/v1/marriages`
- **Access**: Admin (Protected)
- **Description**: Seeds marriage record, generates acrylic banquet table standee QR code, and auto-provisions the 6 canonical ceremonial rites.
- **Request Body**:
  ```json
  {
    "partnerOneName": "Aarav",
    "partnerTwoName": "Meera",
    "customCode": "AARMEE25",
    "venue": "The Leela Palace, Udaipur",
    "dates": "November 24, 2026",
    "coverImage": "https://lh3.googleusercontent.com/...",
    "status": "Scheduled"
  }
  ```

### 3.4 Instant Blessings Bar APIs
- **Endpoint**: `POST /api/v1/marriages/:codeOrId/blessing`
- **Access**: Public / Guest
- **Description**: Increments real-time ceremonial blessing counter (`magic`, `prem`, `rose`, `cheers`, `aashirwaad`).
- **Request Body**:
  ```json
  {
    "type": "prem"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "type": "prem",
    "blessings": {
      "magic": 383,
      "prem": 420,
      "rose": 294,
      "cheers": 198,
      "aashirwaad": 136,
      "totalSent": 1431
    }
  }
  ```

- **Endpoint**: `GET /api/v1/marriages/:codeOrId/blessings`
- **Access**: Public
- **Description**: Retrieves live blessing counters for real-time tickers and projection displays.

### 3.5 Update Marriage Vault
- **Endpoint**: `PUT /api/v1/marriages/:id`
- **Access**: Admin (Protected)

### 3.6 Decommission Marriage Vault
- **Endpoint**: `DELETE /api/v1/marriages/:id`
- **Access**: Admin (Protected)

---

## 4. Ceremonies & Ceremonial Timeline APIs

### 4.1 Fetch Events for Marriage
- **Endpoint**: `GET /api/v1/events/marriage/:marriageCode`
- **Access**: Public
- **Description**: Returns the 6 canonical ceremonial rites (`ENGAGEMENT`, `MEHNDI`, `HALDI`, `SANGEET`, `MARRIAGE`, `OTHERS`) along with real-time live stream statuses.

### 4.2 Update Ceremonial Live Stream & Schedule
- **Endpoint**: `PUT /api/v1/events/:eventId`
- **Access**: Admin (Protected)
- **Request Body**:
  ```json
  {
    "customTitle": "The Grand Sangeet & DJ Night",
    "eventDate": "Sat, Dec 14, 2026",
    "eventTime": "7:30 PM Onwards",
    "venueAddress": "Grand Marquee, Goa",
    "streamStatus": "LIVE",
    "liveStreamUrl": "https://www.youtube.com/embed/LIVE_FEED_ID"
  }
  ```

---

## 5. Media Engine & GridFS Cloud Storage (₹0 Cloud Tier)

### 5.1 Guest Media Upload
- **Endpoint**: `POST /api/v1/media/upload`
- **Access**: Public (Attributed by Guest Name, Email, and Banquet Table)
- **Form Data**:
  - `files`: Binary file buffer (auto-compressed client-side to < 500KB)
  - `marriageCode`: `RAJSIM24`
  - `ceremony`: `HALDI`
  - `table`: `Table 4 (Groom's College Cohort)`
  - `uploaderName`: `Kabir Mehta`
  - `uploaderEmail`: `kabir@gmail.com`
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "count": 1,
    "files": [
      {
        "id": "6724fc1234567890abcdef12",
        "filename": "memory-1730592812.jpg",
        "uploaderName": "Kabir Mehta",
        "table": "Table 4 (Groom's College Cohort)",
        "ceremony": "HALDI",
        "streamUrl": "/api/v1/media/stream/6724fc1234567890abcdef12"
      }
    ]
  }
  ```

### 5.2 Photo Like Reaction
- **Endpoint**: `POST /api/v1/media/:fileId/like`
- **Access**: Public / Guest
- **Description**: Atomically increments the heart like count on a candid memory photo.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "fileId": "6724fc1234567890abcdef12",
    "likes": 49
  }
  ```

### 5.2 Segregated Gallery Feed (PRD 4.7)
- **Endpoint**: `GET /api/v1/media/gallery/:marriageCode?mediaType=PHOTO|VIDEO`
- **Access**: Public
- **Description**: Strictly isolates candid guest photos from official admin-curated 4K reels.

### 5.3 Curate Official 4K Video Reel (Admin Only)
- **Endpoint**: `POST /api/v1/media/curate-reel`
- **Access**: Admin (Protected)
- **Request Body**:
  ```json
  {
    "marriageCode": "RAJSIM24",
    "title": "Sangeet Royal Highlights Reel",
    "ceremony": "SANGEET",
    "duration": "02:45",
    "curatorName": "Simran & Raj",
    "posterUrl": "https://lh3.googleusercontent.com/...",
    "streamUrl": "/api/v1/media/stream/VIDEO_FILE_ID"
  }
  ```

### 5.4 Binary GridFS Stream with Range Requests
- **Endpoint**: `GET /api/v1/media/stream/:fileId`
- **Access**: Public
- **Headers Supported**: `Range: bytes=0-` (HTTP 206 Partial Content for smooth 4K video scrubbing)

---

## 6. Digital Invitation Studio APIs

### 6.1 Get Marriage Stationery Suite
- **Endpoint**: `GET /api/v1/invitations/:marriageCode?ceremony=HALDI`
- **Access**: Public

### 6.2 Save Custom Stationery Card
- **Endpoint**: `PUT /api/v1/invitations/:marriageCode`
- **Access**: Admin (Protected)

---

## 7. Frontend State & Route Map

| Route | Role Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | **Unified Gateway** when unauthenticated; **Celebrations Directory** when Guest session is active. |
| `/admin/login` | Public | Redirects directly to `/` with Host Admin credentials mode enabled. |
| `/admin/dashboard` | Admin Only | Master workspace featuring **Dual-Tab Switcher** (`Dashboard & Marriages` vs `Live Guest View`). |
| `/admin/invitations` | Admin Only | Digital Stationery Studio & Poster Designer. |
| `/marriage/[id]` | Guest & Admin | Unified Wedding Vault: Standee QR, 6 Rites Switcher, Live Broadcast, Photo Dump, 4K Reels. |
| `/guest/upload` | Guest & Admin | Dedicated Banquet Table Standee QR Photo Dump. |

