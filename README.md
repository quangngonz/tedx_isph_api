## API Endpoints

### 1. Get All Tickets

- **URL:** `/tickets`
- **Method:** `GET`
- **Handler:** `index.js`
- **Description:** Retrieves a list of all records from the `ticket_info` table in Supabase.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** `[{ "id": ..., "attendance": ..., ... }, ...]` (Array of ticket objects)
- **Error Response:**
  - **Code:** 500 Internal Server Error
  - **Content:** `{ "error": "Supabase error message" }`

### 2. Check-In Ticket

- **URL:** `/check-in/:id`
- **Method:** `POST`
- **Handler:** `index.js`
- **URL Parameters:**
  - `id`: The unique identifier of the ticket to check-in (should match the `id` in the `ticket_info` table).
- **Description:** Marks a specific ticket as attended (`attendance = true` in `ticket_info`) and logs the action in the `check_in_log` table. Prevents checking in the same ticket multiple times.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** `{ "message": "Checked in successfully", "ticket": { "id": ..., "attendance": true, ... } }` (Confirmation message and the updated ticket object)
- **Error Responses:**
  - **Code:** 400 Bad Request
    - **Content:** `{ "error": "Ticket already checked in" }` (If the ticket ID already exists in `check_in_log`)
  - **Code:** 500 Internal Server Error
    - **Content:** `{ "error": "Supabase error message" }` (If there's an issue updating `ticket_info` or inserting into `check_in_log`)

### 3. Generate and Upload QR Codes

- **URL:** `/generate-qr-codes`
- **Method:** `GET` (Note: Can be triggered by other methods too, as the handler doesn't check)
- **Handler:** `controllers/generate_qr_codes.js`
- **Description:** Fetches all ticket IDs from `ticket_info`, generates a QR code PNG for each, uploads/overwrites it in the `qr-codes` Supabase Storage bucket (named `{ticket_id}.png`), and returns the public URLs.
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** `{ "message": "QR codes generated successfully", "qr_urls": { "ticket_id_1": "public_url_1", ... } }` (Dictionary mapping ticket IDs to their public Supabase Storage URLs)
- **Error Response:**
  - **Code:** 500 Internal Server Error (or other platform-specific error codes)
  - **Content:** Varies depending on the error (e.g., Supabase connection issue, storage upload failure). Error details might appear in function logs.
