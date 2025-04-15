## API Endpoints

### 1. Get All Tickets

- **URL:** `/tickets`
- **Method:** `GET`
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

## Dependencies

- **Express:** Fast, unopinionated, minimalist web framework for Node.js.
- **@supabase/supabase-js:** Official JavaScript client library for Supabase.
- **dotenv:** Loads environment variables from a `.env` file into `process.env`.
- **nodemon (devDependency):** Utility that monitors for changes and automatically restarts the Node.js application, useful during development.

## License

MIT
