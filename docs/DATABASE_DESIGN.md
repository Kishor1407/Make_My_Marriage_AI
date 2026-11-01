# Database Design & Schema Architecture

**Project:** Make My Marriage  
**Database:** MongoDB Atlas (M0 Free Tier)  
**ORM/ODM:** Mongoose  

## 1. Overview and Relationships

The database is structured to minimize redundancy and optimize read speeds for guest access. The core relationships are:
* **One-to-Many:** One `User` (Admin) can manage multiple `Marriage` documents.
* **One-to-Many:** One `Marriage` strictly contains six `Event` documents.
* **One-to-Many:** One `Event` holds multiple `Media` files (handled via GridFS).
* Guests are primarily tracked implicitly via the media they upload (metadata attribution), but can also be tracked in the `Users` collection if they register to a specific marriage code.

---

## 2. Collections & Schemas

### 2.1. `Users` Collection
Manages system access for both platform Admins and authenticated Guests.

* **Collection Name:** `users`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `name`: `String` (Required - Full name of the user)
  * `email`: `String` (Required, Unique, Lowercase)
  * `passwordHash`: `String` (Required for Admin, Optional for Guests using passcode-only login)
  * `role`: `String` (Enum: `['ADMIN', 'GUEST']`, Default: `'GUEST'`)
  * `assignedMarriageId`: `ObjectId` (Foreign Key -> `marriages._id`. Required if role is `GUEST`, Nullable if `ADMIN`)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * `email` (Unique Index)
  * `assignedMarriageId` (Index for quick guest lookups per wedding)

### 2.2. `Marriages` Collection
The core wrapper for a wedding dashboard.

* **Collection Name:** `marriages`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `partnerOneName`: `String` (Required, e.g., "Rahul")
  * `partnerTwoName`: `String` (Required, e.g., "Anjali")
  * `marriageCode`: `String` (Required, Unique, e.g., "RAHUL2026". Used for guest unlocking)
  * `adminId`: `ObjectId` (Required, Foreign Key -> `users._id`)
  * `qrCodeUrl`: `String` (Required, stores the base64 or generated URL for the physical venue QR)
  * `globalStats`: `Object` (Denormalized counters to save DB read operations on the dashboard)
    * `totalPhotos`: `Number` (Default: 0)
    * `totalVideos`: `Number` (Default: 0)
    * `totalGuestsEngaged`: `Number` (Default: 0)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * `marriageCode` (Unique Index - Critical for fast guest login)
  * `adminId` (Index for Admin Dashboard queries)

### 2.3. `Events` Collection
Holds the specific details for the 6 predefined timeline events. Exactly 6 of these will be generated automatically when a `Marriage` is created.

* **Collection Name:** `events`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `marriageId`: `ObjectId` (Required, Foreign Key -> `marriages._id`)
  * `eventType`: `String` (Required, Enum: `['ENGAGEMENT', 'MEHNDI', 'HALDI', 'SANGEET', 'MARRIAGE', 'OTHERS']`)
  * `customTitle`: `String` (Optional, allows admin to rename "Others" to "Reception")
  * `eventDate`: `Date` (Optional until Admin sets it)
  * `eventTime`: `String` (Optional)
  * `venueAddress`: `String` (Optional)
  * `liveStreamUrl`: `String` (Optional, URL format)
  * `eventStats`: `Object` (Denormalized to show counts on tabs without querying GridFS)
    * `photoCount`: `Number` (Default: 0)
    * `videoCount`: `Number` (Default: 0)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * Compound Index: `{ marriageId: 1, eventType: 1 }` (Ensures fast retrieval of specific tabs and guarantees one of each event type per marriage)

### 2.4. `Media` Collection (GridFS Implementation)
Because we are bypassing MongoDB's 16MB document limit to store images for free, we use GridFS. GridFS automatically creates two collections (`uploads.files` and `uploads.chunks`). We define the structure of the `metadata` object within `uploads.files`.

* **Collection Name:** `uploads.files` (GridFS Default)
* **Schema Definition (File Document):**
  * `_id`: `ObjectId` (Primary Key)
  * `length`: `Number` (File size in bytes)
  * `chunkSize`: `Number`
  * `uploadDate`: `Date`
  * `filename`: `String`
  * `contentType`: `String` (e.g., `image/jpeg`, `video/mp4`)
  * `metadata`: `Object` (Custom fields for Make My Marriage)
    * `marriageId`: `ObjectId` (Required, Foreign Key -> `marriages._id`)
    * `eventId`: `ObjectId` (Required, Foreign Key -> `events._id`)
    * `mediaType`: `String` (Required, Enum: `['PHOTO', 'VIDEO']`)
    * `uploaderName`: `String` (Required, enables guest attribution)
    * `uploaderEmail`: `String` (Required, enables guest attribution)
    * `uploaderRole`: `String` (Enum: `['ADMIN', 'GUEST']`)
* **Indexes (on `uploads.files`):**
  * `metadata.marriageId` (Index)
  * `metadata.eventId` (Index - Crucial for loading the gallery for a specific tab)
  * Compound Index: `{ "metadata.eventId": 1, "metadata.mediaType": 1, uploadDate: -1 }` (Highly optimized for fetching the most recent photos/videos in a specific event gallery)

---

## 3. Data Integrity & Triggers

To maintain strict data integrity without complex database functions (which cost money), the Express backend will enforce the following application-level constraints:

1. **Denormalized Counter Updates:** Whenever a new image is streamed into GridFS, the backend will use a single atomic operation (`$inc`) to increment `eventStats.photoCount` in the `Events` collection and `globalStats.totalPhotos` in the `Marriages` collection.
2. **Fixed Event Integrity:** Upon insertion of a new `Marriage` document, the backend will immediately batch-insert exactly 6 `Event` documents tied to that `marriageId`. No `Event` can be independently created or deleted.
3. **Cascading Deletes:** If an Admin deletes a `Marriage`, all associated `Events` and GridFS files matching that `metadata.marriageId` will be purged to free up the 512MB storage limit.