# VentureHub Functional Enrichments (v2.0)

This update introduces significant functional depth to the core feature set of VentureHub, focusing on reputation systems, smart notifications, and complex deal negotiation.

## Core Feature Enhancements

### FR-2: Social Engagement (Reputation System)
- **Technical Logic:** A `reputation` field has been added to the `User` model.
- **How it works:** 
    - When a pitch receives a "Like", the Entrepreneur's reputation increases by **+5**.
    - If a "Like" is removed, the reputation decreases by **-5**.
- **File References:** `backend/models/User.js`, `backend/routes/pitchRoutes.js`.

### FR-4: Advanced Filtering (Saved Search & Smart Alerts)
- **Technical Logic:** Introduced a `SavedSearch` model and `Socket.io` integration for real-time notifications.
- **How it works:**
    - Users can save their specific search criteria (Category, Ask Amount, Tags) via the `/api/explore/save-search` endpoint.
    - When a new pitch is created, the system automatically cross-references all `SavedSearch` records.
    - If a match is found, a real-time event `new_pitch_match` is emitted to the specific matching users.
- **File References:** `backend/models/SavedSearch.js`, `backend/routes/exploreRoutes.js`, `backend/routes/pitchRoutes.js`.

### FR-5: Bidding (Multi-Stage Negotiation)
- **Technical Logic:** The `Bid` model now supports a state-machine workflow (`Pending` -> `Countered` -> `Accepted`/`Rejected`).
- **How it works:**
    - **Counter-Offer:** Entrepreneurs can now counter an investor's bid using `PUT /api/bids/:id/counter`, proposing different equity or amounts.
    - **Response:** Investors can respond to these counter-offers using `PUT /api/bids/:id/respond`.
    - Accepting a counter-offer automatically updates the main bid terms.
- **File References:** `backend/models/Bid.js`, `backend/routes/bidRoutes.js`.

## How to Test
1. **Reputation:** Like/Unlike a pitch and check the `reputation` field in the `users` collection.
2. **Saved Search:** 
    - Use Postman to `POST /api/explore/save-search` with a specific category.
    - Create a new pitch in that category.
    - Observe the console/socket logs for the `new_pitch_match` event.
3. **Negotiation:** 
    - Submit a bid as an investor.
    - Use `PUT /api/bids/:id/counter` as the entrepreneur.
    - Use `PUT /api/bids/:id/respond` as the investor to accept it.
