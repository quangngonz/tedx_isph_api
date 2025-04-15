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
- **Method:** `GET`
- **Handler:** `controllers/generate_qr_codes.js`
- **Description:** Fetches all ticket information from the `ticket_info` table in Supabase, generates a QR code PNG for each ticket, uploads or overwrites the QR code in the `qr-codes` Supabase Storage bucket (using the format `{ticket_id}.png`), and returns the public URLs of the uploaded QR codes.

- **Success Response:**

  - **Code:** `200 OK`
  - **Content:**
    ```json
    {
      "ticket_id_1": "public_url_1",
      "ticket_id_2": "public_url_2",
      ...
    }
    ```
    A dictionary mapping each ticket's ID to its public URL in Supabase Storage.

- **Error Responses:**
  - **Code:** `500 Internal Server Error`
  - **Content:**
    ```json
    {
      "error": "An error occurred while generating QR codes."
    }
    ```
    This may occur due to issues like Supabase connection errors, storage upload failures, or QR code generation errors.
