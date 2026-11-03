# Database Design & Schema Architecture

**Project:** Make My Marriage  
**Database:** MongoDB Atlas (M0 Free Tier)  
**ORM/ODM:** Mongoose  
**Version:** 2.0 (Streamlined Dual-Persona Architecture)  

## 1. Overview and Relationships

The database is structured to minimize redundancy and optimize read speeds for guest access. The core relationships are:
* **One-to-Many:** One `User` (Admin) can manage multiple `Marriage` documents.
* **One-to-Many:** One `Marriage` strictly contains six canonical `Event` documents.
* **One-to-Many:** One `Marriage` contains digital `Invitation` card templates and `Wish` guestbook entries.
* **One-to-Many:** One `Event` holds multiple `Media` files (handled via GridFS).
* Guests are tracked implicitly via session rehydration tokens (`mmm_guest`) and photographic attribution metadata (`uploaderName`, `uploaderEmail`), maintaining ₹0 cloud database overhead.

---

## 2. Collections & Schemas

### 2.1. `Users` Collection
Manages system access for Sovereign Host Admins and authenticated Guests.

* **Collection Name:** `users`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `name`: `String` (Required - Full name)
  * `email`: `String` (Required, Unique, Lowercase)
  * `passwordHash`: `String` (Required for Admin, Optional for Guests)
  * `role`: `String` (Enum: `['ADMIN', 'GUEST']`, Default: `'GUEST'`)
  * `assignedMarriageId`: `ObjectId` (Foreign Key -> `marriages._id`. Required if role is `GUEST`, Nullable if `ADMIN`)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * `email` (Unique Index)
  * `assignedMarriageId` (Index for quick guest lookups per wedding)

### 2.2. `Marriages` Collection
The core wrapper for a wedding sanctuary.

* **Collection Name:** `marriages`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `partnerOneName`: `String` (Required, e.g., "Raj Malhotra")
  * `partnerTwoName`: `String` (Required, e.g., "Simran Singh")
  * `marriageCode`: `String` (Required, Unique, e.g., "RAJSIM24". Used for guest unlocking)
  * `dates`: `String` (Optional, e.g., "October 18–20, 2026")
  * `venue`: `String` (Optional, e.g., "The Grand Oberoi Amarvilas, Agra")
  * `coverImage`: `String` (High-res photographic banner URL)
  * `status`: `String` (Enum: `['Scheduled', 'LIVE', 'Completed']`, Default: `'Scheduled'`)
  * `adminId`: `ObjectId` (Required, Foreign Key -> `users._id`)
  * `qrCodeUrl`: `String` (Dynamic vector data URL for banquet table standees)
  * `globalStats`: `Object` (Denormalized counters saving DB reads)
    * `totalPhotos`: `Number` (Default: 0)
    * `totalVideos`: `Number` (Default: 0)
    * `totalGuestsEngaged`: `Number` (Default: 0)
  * `blessings`: `Object` (Instant Blessings Bar real-time counters)
    * `magic`: `Number` (Default: 382)
    * `prem`: `Number` (Default: 419)
    * `rose`: `Number` (Default: 294)
    * `cheers`: `Number` (Default: 198)
    * `aashirwaad`: `Number` (Default: 136)
    * `totalSent`: `Number` (Default: 1429)
  * `liveStream`: `Object` (Autonomous broadcast ingest configuration)
    * `rtmpUrl`: `String` (Default: `'rtmp://stream.makemymarriage.com/live'`)
    * `streamKey`: `String` (Encrypted broadcast key for OBS/vMix)
    * `isActive`: `Boolean` (Default: `true`)
    * `viewerCount`: `Number` (Default: 842)
    * `activeCeremony`: `String` (Default: `'Haldi & Sangeet Ceremonies'`)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * `marriageCode` (Unique Index - Critical for fast guest lookup)
  * `adminId` (Index for Admin Dashboard queries)

### 2.3. `Events` Collection
Holds details for the 6 predefined timeline events provisioned automatically upon wedding creation.

* **Collection Name:** `events`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `marriageId`: `ObjectId` (Required, Foreign Key -> `marriages._id`)
  * `eventType`: `String` (Required, Enum: `['ENGAGEMENT', 'MEHNDI', 'HALDI', 'SANGEET', 'MARRIAGE', 'OTHERS']`)
  * `customTitle`: `String` (e.g., "The Grand Sangeet & Musical Night")
  * `eventDate`: `Date` / `String`
  * `eventTime`: `String`
  * `venueAddress`: `String`
  * `liveStreamUrl`: `String` (YouTube Live embed URL)
  * `streamStatus`: `String` (Enum: `['OFFLINE', 'STANDBY', 'LIVE', 'RECORDED']`)
  * `eventStats`: `Object`
    * `photoCount`: `Number` (Default: 0)
    * `videoCount`: `Number` (Default: 0)
  * `createdAt`: `Timestamp`
  * `updatedAt`: `Timestamp`
* **Indexes:**
  * Compound Index: `{ marriageId: 1, eventType: 1 }` (Ensures fast retrieval of specific rites)

### 2.4. `Invitations` Collection
Stores ceremonial stationery templates configured by the host admin.

* **Collection Name:** `invitations`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `marriageId`: `ObjectId` (Required, Foreign Key -> `marriages._id`)
  * `ceremony`: `String` (Enum: canonical 6 rites)
  * `cardSilhouette`: `String` (Enum: `['royal-mandap', 'ivory-arch', 'sunset-vow']`)
  * `customTitle`: `String`
  * `customBlessing`: `String`
  * `dressCode`: `String`
  * `renderedCardUrl`: `String` (GridFS stream URL of 300 DPI exported card)
* **Indexes:**
  * Compound Index: `{ marriageId: 1, ceremony: 1 }`

### 2.5. `Wishes` Collection
Live guestbook entries and cheer reactions.

* **Collection Name:** `wishes`
* **Schema Definition:**
  * `_id`: `ObjectId` (Primary Key)
  * `marriageId`: `ObjectId` (Required, Foreign Key -> `marriages._id`)
  * `guestName`: `String` (Attributed)
  * `reaction`: `String` (Emoji: ❤️, 🌹, 🪔, 👏, 🎉)
  * `message`: `String` (Congratulatory message)
  * `createdAt`: `Timestamp`

### 2.6. `Media` Collection (GridFS Implementation)
Stores candid photos and host-curated 4K reels directly in MongoDB chunks without hitting the 16MB document boundary.

* **Collection Name:** `uploads.files` & `uploads.chunks` (GridFS)
* **Schema Definition (`uploads.files`):**
  * `_id`: `ObjectId` (Primary Key)
  * `length`: `Number` (File size in bytes)
  * `chunkSize`: `Number` (255KB)
  * `uploadDate`: `Date`
  * `filename`: `String`
  * `contentType`: `String` (`image/jpeg`, `image/webp`, `video/mp4`)
  * `metadata`: `Object`
    * `marriageId`: `ObjectId` (Foreign Key -> `marriages._id`)
    * `eventId`: `ObjectId` (Foreign Key -> `events._id`)
    * `mediaType`: `String` (`PHOTO` or `VIDEO`)
    * `uploaderName`: `String` (Attribution name)
    * `uploaderEmail`: `String` (Attribution email)
    * `uploaderRole`: `String` (`ADMIN` or `GUEST`)
    * `table`: `String` (Banquet table attribution, e.g. "Table 4 (Groom's College Cohort)")
    * `likes`: `Number` (Heart reaction counter, default: 0)
    * `ceremony`: `String` (Ceremony tag)
* **Indexes (on `uploads.files`):**
  * `metadata.marriageId`
  * `metadata.eventId`
  * Compound Index: `{ "metadata.eventId": 1, "metadata.mediaType": 1, uploadDate: -1 }`

---

## 3. Data Integrity & ₹0 Cloud Constraints

1. **Denormalized Atomic Increments:** Uploading images increments `eventStats.photoCount` and `globalStats.totalPhotos` using atomic `$inc` queries to prevent costly aggregations.
2. **Fixed Event Integrity:** Creating a `Marriage` automatically batch-provisions all 6 canonical `Event` documents.
3. **Cascading Purges:** Deleting a `Marriage` automatically purges all 6 associated `Events`, all `Invitations`, all `Wishes`, and all binary chunks from GridFS (`bucket.delete(fileId)`) to keep storage strictly within the 512MB free tier.
