# API Design Document

**Project:** Make My Marriage
**Base URL:** `/api/v1`
**Backend Tech:** Node.js, Express.js
**Authentication:** JWT via HTTP-Only Cookies

## Overview
This document outlines the RESTful API endpoints required to power the frontend. All protected routes require a valid JWT stored in a secure, HTTP-only cookie.

---

## 1. Authentication APIs

### 1.1 Admin Register
*   **Method:** `POST`
*   **Endpoint:** `/auth/admin/register`
*   **Access:** Public
*   **Description:** Registers a new Admin user.
*   **Request Body:**
    ```json
    {
      "name": "Admin Name",
      "email": "admin@example.com",
      "password": "securepassword123"
    }
    ```
*   **Response (201 Created):** Returns user object and sets HTTP-only cookie containing JWT.

### 1.2 Admin Login
*   **Method:** `POST`
*   **Endpoint:** `/auth/admin/login`
*   **Access:** Public
*   **Description:** Authenticates an Admin.
*   **Request Body:** `{ "email": "...", "password": "..." }`
*   **Response (200 OK):** Sets HTTP-only cookie.

### 1.3 Guest Unlock (Login)
*   **Method:** `POST`
*   **Endpoint:** `/auth/guest/login`
*   **Access:** Public
*   **Description:** Authenticates a guest using a marriage code.
*   **Request Body:** `{ "marriageCode": "RAHUL2026" }`
*   **Response (200 OK):** Sets HTTP-only cookie with guest role and `assignedMarriageId`.

### 1.4 Logout
*   **Method:** `POST`
*   **Endpoint:** `/auth/logout`
*   **Access:** Authenticated (Admin/Guest)
*   **Description:** Clears the HTTP-only JWT cookie.

---

## 2. Marriage Management APIs

### 2.1 Create Marriage
*   **Method:** `POST`
*   **Endpoint:** `/marriages`
*   **Access:** Admin Only
*   **Description:** Creates a new marriage, generates the `marriageCode`, and automatically creates the 6 associated `Events`.
*   **Request Body:**
    ```json
    {
      "partnerOneName": "Rahul",
      "partnerTwoName": "Anjali",
      "qrCodeUrl": "base64_string_or_url"
    }
    ```
*   **Response (201 Created):** Returns the complete Marriage object.

### 2.2 Get All Marriages (Public/Grid)
*   **Method:** `GET`
*   **Endpoint:** `/marriages`
*   **Access:** Public
*   **Description:** Fetches a list of all marriages for the homepage grid. Excludes sensitive data (no codes or IDs).
*   **Response (200 OK):** Array of basic marriage details (names, generated thumbnail).

### 2.3 Get Marriage Details
*   **Method:** `GET`
*   **Endpoint:** `/marriages/:marriageId`
*   **Access:** Admin or Authorized Guest (must match `assignedMarriageId`)
*   **Description:** Fetches the full dashboard data, including global stats.

### 2.4 Delete Marriage
*   **Method:** `DELETE`
*   **Endpoint:** `/marriages/:marriageId`
*   **Access:** Admin Only (must be the creator)
*   **Description:** Deletes the marriage, cascades deletion to all 6 events and all associated GridFS media to free up DB space.

---

## 3. Event APIs

### 3.1 Get Events for Marriage
*   **Method:** `GET`
*   **Endpoint:** `/marriages/:marriageId/events`
*   **Access:** Admin or Authorized Guest
*   **Description:** Fetches the 6 timeline events (Engagement, Mehndi, etc.) with their individual media stats.

### 3.2 Update Event Details
*   **Method:** `PUT`
*   **Endpoint:** `/events/:eventId`
*   **Access:** Admin Only
*   **Description:** Updates venue, date, time, or live stream URL.
*   **Request Body:**
    ```json
    {
      "eventDate": "2026-11-15T00:00:00.000Z",
      "eventTime": "6:00 PM",
      "venueAddress": "Grand Palace, City",
      "liveStreamUrl": "https://youtube.com/live/..."
    }
    ```

---

## 4. Media & GridFS APIs (The ₹0 Storage Strategy)

### 4.1 Batch Upload Media (QR Photo Dump)
*   **Method:** `POST`
*   **Endpoint:** `/media/upload/:eventId`
*   **Access:** Admin or Authorized Guest
*   **Description:** Accepts `multipart/form-data`. Handled by `multer-gridfs-storage` to stream directly into the DB. **Strict limit of 10 files per request to prevent server timeout.** Also increments event/global photo counters.
*   **Request Form-Data:**
    *   `files`: [Array of compressed images/videos]
    *   `mediaType`: 'PHOTO' or 'VIDEO'
    *   `uploaderName`: "Uncle John"
    *   `uploaderEmail`: "john@email.com"

### 4.2 Get Event Media Gallery
*   **Method:** `GET`
*   **Endpoint:** `/media/event/:eventId`
*   **Access:** Admin or Authorized Guest
*   **Query Params:** `?type=PHOTO&page=1&limit=20`
*   **Description:** Fetches paginated metadata from `uploads.files` to populate the gallery grid (includes uploader details for attribution).
*   **Response (200 OK):** Array of file metadata containing `_id` to be used for streaming.

### 4.3 Stream Media File
*   **Method:** `GET`
*   **Endpoint:** `/media/stream/:fileId`
*   **Access:** Admin or Authorized Guest
*   **Description:** Express reads the GridFS stream and pipes it directly to the response as `image/jpeg` or `video/mp4`. Used in the frontend `<img src="...">` tags.

### 4.4 Delete Media File (Admin Moderation)
*   **Method:** `DELETE`
*   **Endpoint:** `/media/:fileId`
*   **Access:** Admin Only
*   **Description:** Removes the file chunks and metadata from GridFS. Decrements the event and global media counters.

---

## 5. Standard Error Responses

To maintain consistency in the UI, the backend will return uniform error structures:

*   **400 Bad Request:** `{ "error": "Validation failed", "details": [...] }`
*   **401 Unauthorized:** `{ "error": "Authentication required. Invalid or missing token." }`
*   **403 Forbidden:** `{ "error": "You do not have permission to access this marriage dashboard." }`
*   **413 Payload Too Large:** `{ "error": "Upload limit exceeded. Maximum 10 files allowed per batch." }`
*   **500 Internal Server Error:** `{ "error": "An unexpected error occurred on the server." }`