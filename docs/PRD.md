# Product Requirements Document (PRD)
**Project Name:** Make My Marriage  
**Platform Type:** MERN Stack Web Application  
**Budget Constraint:** Strictly ₹0 (Relying exclusively on Free Tiers)  

---

## 1. Project Overview
"Make My Marriage" is a digital wedding companion and media-sharing platform. It allows families (Admins) to create a beautiful, structured digital dashboard for their weddings. Guests can access these dashboards using secure passcodes to view event itineraries, watch live streams, and most importantly, collaboratively build a "photo dump" by scanning QR codes at the venue.

**Primary Goals:**
1. Provide a central hub for wedding information (Dates, Venues, Timelines).
2. Allow guests to easily share the candid photos they take at the events without needing third-party apps.
3. Keep the platform completely free to host and operate.

---

## 2. Technology Stack (The ₹0 Architecture)
To ensure the project costs absolutely nothing to run, we are utilizing the following free-tier technologies:

*   **Frontend (User Interface):** 
    *   **Next.js (App Router):** The core React framework. Hosted for free on **Vercel**.
    *   **Tailwind CSS:** For fast, beautiful, and responsive styling.
    *   **Redux Toolkit:** To manage data across the app (like updating photo counts).
    *   **Zod:** To ensure users fill out forms correctly.
    *   **html2canvas:** To build the free Invitation Generator.
    *   **browser-image-compression:** Crucial for shrinking photo sizes *before* they are uploaded to save database space.
*   **Backend (Server & Logic):** 
    *   **Node.js & Express.js:** The server handling requests. Hosted for free on **Render**.
    *   **JWT (JSON Web Tokens):** For secure logins.
*   **Database & File Storage:** 
    *   **MongoDB Atlas (M0 Free Cluster):** Provides 512MB of free storage.
    *   **GridFS:** A MongoDB feature that splits large files (like photos) into tiny chunks so they can be stored directly inside the database without crashing it.

---

## 3. User Roles & Permissions
The system has two distinct types of users:

1.  **Admin (The Host):** Has full control. Can create marriage profiles, edit event details, generate QR codes, create digital invites, upload curated videos, and monitor all guest activity.
2.  **Guest (The Attendee):** Has restricted access. Cannot view a marriage unless they possess the specific unique passcode (e.g., `RAHUL2026`). Once inside, they can view event details, download invites, and upload their own photos.

---

## 4. Core Features & Functional Requirements

### 4.1. Gated Access System
*   **Feature:** The homepage displays a grid of all marriages hosted on the platform, but they are locked.
*   **Functionality:** When a guest clicks a marriage, a prompt asks for a "Marriage Code". If correct, the app unlocks the dashboard. If incorrect, access is denied. 

### 4.2. Dual-View Admin Portal
*   **Dashboard View:** A summary table showing all hosted weddings. Displays total metrics (e.g., Total Guests logged in, Total Photos Uploaded, Total Videos).
*   **Marriages View:** A management grid where the admin can click into a specific wedding to edit its details or create a new wedding profile from scratch.

### 4.3. The Six-Part Wedding Timeline
*   **Feature:** Every unlocked marriage dashboard is strictly organized into six tabs: **Engagement, Mehndi, Haldi, Sangeet, Marriage, and Others.**
*   **Functionality:** Clicking a tab reveals:
    *   **Event Summary:** Date, time, and text details about the venue.
    *   **Media Counters:** Clear numbers showing exactly how many photos and videos exist in this specific section.

### 4.4. QR-Powered Photo Dump & Attribution
*   **Feature:** The core collaborative tool for guests.
*   **Functionality:** 
    *   The system generates a unique QR code for the wedding. 
    *   When guests scan it at the physical venue, they are taken to an upload page. 
    *   **Attribution:** The guest must enter their Name and Email before uploading. Every photo uploaded is tagged with this data so the Admin knows who took the shot.
    *   **Compression:** The frontend aggressively shrinks the photos before sending them to the backend to conserve the 512MB free database limit.

### 4.5. Built-in Invitation Generator
*   **Feature:** A simple tool for Admins to create digital posters.
*   **Functionality:** The admin types the Couple's Name, Event Date, and Venue into a form. The frontend takes this text, overlays it on a pretty background design, and uses `html2canvas` to instantly convert the screen into a downloadable image. No external APIs are needed.

### 4.6. Live Stream Integration
*   **Feature:** Real-time viewing for remote relatives.
*   **Functionality:** The admin pastes a standard YouTube Live link into the event settings. The frontend renders this inside an embedded video player (`<iframe>`).

### 4.7. Media Segregation
*   **Videos Tab:** Strictly for limited, official, admin-curated video clips.
*   **Photos Tab:** A large gallery displaying all the candid shots dumped by guests and admins.

---

## 5. End-to-End User Journeys

### The Admin Journey
1.  **Sign In:** Admin logs into the portal and views the **Dashboard** metrics.
2.  **Create Wedding:** Navigates to **Marriages** and clicks "Add New". Fills in the Couple's names and generates a unique passcode (e.g., `ANJALI24`).
3.  **Setup Itinerary:** Fills out the Dates and Venues for the Engagement, Mehndi, Haldi, Sangeet, and Marriage.
4.  **Generate Assets:** Uses the Invitation Generator to make posters for the Haldi and generates the printable QR code.
5.  **Post-Event Review:** Logs back in to view the uploaded photos. Because of the attribution feature, the admin sees that "Uncle John (john@email.com)" uploaded 40 photos to the Haldi section.

### The Guest Journey
1.  **Arrive & Unlock:** The guest visits the website, sees the beautiful grid of weddings, clicks on Rahul & Anjali's card, and types in `ANJALI24` to unlock it.
2.  **Explore Details:** They click the **Mehndi** tab to check what time the event starts and download the digital invite.
3.  **Upload Memories:** While sitting at the Mehndi venue, the guest scans the physical QR code on their table. They type their name/email on their phone screen, select 15 photos from their camera roll, and hit upload.
4.  **Real-Time Updates:** The photos compress automatically, upload instantly, and the event's "Photo Count" updates in real-time for everyone viewing the site.

---

## 6. High-Level Database Structure (MongoDB)

*   **Users Collection:** `_id`, `name`, `email`, `role (admin/guest)`, `linkedMarriageCode`.
*   **Marriages Collection:** `_id`, `coupleNames`, `accessCode`, `qrCodeUrl`, `totalPhotoCount`, `totalVideoCount`.
*   **Events Collection:** `_id`, `marriageId`, `eventType (Haldi, etc.)`, `date`, `venue`, `liveStreamLink`.
*   **GridFS Collections (`uploads.files` & `uploads.chunks`):** Stores the actual image binaries, tagged with `guestName`, `guestEmail`, and `eventId`.