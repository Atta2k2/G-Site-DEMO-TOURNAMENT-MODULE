# G-Site Invitational — Tournament Module

Welcome to my functional React-based tournament operational system, designed specifically as a paid recruitment task for the G-Site Developer Program. My primary goal was to focus on robust functional UI, bulletproof state operations, seamless data handling, and an exceptional user experience for Tournament Organizers (TOs).

## How to Experience the Full App 
To experience everything this demo has to offer, **make sure to log in as an Admin**. 

1. Run `npm install`
2. Run `npm run dev`
3. Navigate to `http://localhost:5173/` in your browser.
4. Click **Admin Login** located on the top right.

**Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin`

---

## Standout Features & Administrator Controls

This iteration goes beyond the basics to deliver a complete, highly manageable platform:

### Dynamic Configuration Engine
Through the **Edit Config** button exclusively on the Overview page, Admins can dynamically change the entire identity of the tournament on the fly.
- **Edit Details:** Change the Tournament Name, Game, Format, Date, and Prize Pool.
- **Dynamic Scoring Models:** Instantly toggle between **Traditional Points** (configure individual Placement Points and strict Points Per Kill) or **Placement Multipliers** (multiply kills by custom placement modifiers). All scores and leaderboards update instantly.

### Team Management 
- Admins have full CRUD power under the **Teams** tab. You can register new teams, edit their names and rosters, or completely delete teams to maintain an accurate tournament structure.

### Ironclad Score Review System
Instead of a chaotic data entry process, this system leverages a strict **Pending -> Review -> Approved** verification workflow.
- **Smart Duplicate Prevention:** If multiple teams submit the exact same placement (e.g., two teams claiming 2nd place), the system automatically flags this conflict. The **Approve** and **Bulk Approve** buttons become completely disabled, displaying a hover warning, forcing the Admin to resolve the conflict via Rejection or Editing before proceeding.
- **Strict Player Locks:** Once an Admin approves a score, the corresponding match inputs are completely locked out for players across the frontend UI and the backend state handler. No post-approval tampering is possible.
- **Global Score Reset:** Inside the Match Results section, Admins have access to a **"Reset All Scores"** button. Have a logic bug or just need to start a fresh iteration? Push this to safely wipe all submissions without losing your teams or primary tournament configuration.

### Premium Aesthetics & Integrations
- **Card-Based Leaderboard:** Displays teams beautifully sorted by highest points, kills, and then alphabetical order. 
- **Dynamic Avatars:** Each team in the Leaderboard features a procedurally generated, styled robotic logo using the internal **Dicebear API**, creating immediate visual identity.
- **Rich Match History:** Placements and Kills are great, but results matter. The Match History section dynamically recalculates and displays exactly how many **Points** a team earned based on the active rule set (Multipliers vs. Traditional) directly in their history timeline. 

---

## Recruitment Task Requirements vs. Delivered Features

| Requirement | Status | Delivered Features |
| :--- | :---: | :--- |
| **Tournament Setup** | Completed | **[UPDATED]** Configured globally via an intuitive **Admin UI** (15 matches default). Settings sync to LocalStorage. |
| **Team Registration** | Completed | Implemented a dedicated "Teams" tab with inline admin controls for full CRUD capabilities. |
| **Match Results Entry** | Completed | Built an elegant two-step "Pending -> Review -> Approved" verification workflow. |
| **Imperfect Data** | Completed | Seamlessly handles missing kills (defaults to `0`). Duplicate placements actively disable approvals and generate dynamic Admin Warning Badges. |
| **Scoring Engine** | Completed | **[UPDATED]** Supports both **Placement Multipliers** and **Traditional Points**, dynamically calculating points on Leaderboard and Match History. |
| **Leaderboard** | Completed | Reactive CSS Grid card layout. Auto-sorts by Total Score -> Total Kills -> Alphabetical. |
| **Integrity Feature** | Completed | **[UPDATED]** Native "Match Lock/Unlock" toggle, strict "Approved Score" player locks, and a Global Score Reset button. |
| **Visual Enhancements**| Completed | Clean esports aesthetic with highly engaging UI micro-interactions in the leaderboard section. |
| **Written Task** | Completed | Explicit data structure and scalability rationale documented below. |

### "Wow Factor" Extras (Beyond Requirements)
1. **Local Storage Persistence:** Application state (`teams`, `results`, `lockedMatches`, `tourneyConfig`) is synced to `window.localStorage` via a custom hook. Data survives page refreshes.
2. **Admin God-Mode (Penalties):** Added native support for admins to override data and explicitly apply point penalties that deduct straight from Leaderboard scores.
3. **Dynamic Team Avatars:** Integrated the `Dicebear bottts API` to procedurally generate styled esports robot avatars seeded from the Team's registering name.
4. **Tactile UX (Toasts):** Integrated `react-hot-toast` to provide sleek slide-in success/error notifications for crucial ops tasks.

---

## Scalability Analysis & Prioritization Rationale

### 1. Prioritization Rationale
The primary goal was to fulfill the core operational needs of a Tournament Organizer (TO) without over-engineering a heavy full-stack solution. 

- **Two-Step Submission Workflow:** We prioritized building a "Pending -> Review -> Approved" workflow. In massive custom lobbies, self-reported scores are historically messy. By allowing players to submit their own scores into a "Pending" queue, we save TOs from manual data entry.
- **Imperfect Data Handling:** We prioritized native warning badges over hard-blocking form errors. For example, if a team reports a placement but forgets their kills, we default kills to `0` and flag it. If two teams claim 1st place, we flag the duplicate placement but do not crash the table. This allows the TO to evaluate and override the conflict manually. 
- **Admin Controls & Penalties:** TOs need absolute control. We implemented an admin "God-mode" that bypasses locked matches to manually edit kills/placements or apply generic point **Penalties** to handle rule-breaking dynamically.

### 2. Data Structure
The application relies on a normalized in-memory state architecture managed at the top level (`App.jsx`).

- **Teams:** Array of Objects `[{ id, name, players: [] }]`
- **Results Engine:** Deeply nested map for fast lookup `O(1)`:
  ```json
  {
    "matchId": {
      "teamId": {
        "placement": 1,
        "kills": 5,
        "penalty": 0,
        "status": "pending" | "approved"
      }
    }
  }
  ```
- **Leaderboard Engine:** A decoupled derivation function (`scoring.js`) that recalculates the board based strictly on `status === "approved"`. This separates the raw data from the view representation, making it safe to rebuild the UI without mutating source truth.

### 3. Scalability Analysis
While functional for 15 matches and ~40 teams, the current iteration has clear operational limits:

1. **State Synchronization:** Data is mapped strictly to LocalStorage.
   - *Scale Solution:* Abstract the state behind a global provider (Zustand/Redux) and sync to an external BaaS like Supabase for true real-time multiplayer updates across multiple TO clients.
2. **Untrusted Client Submissions:** Currently, the public submission form does not authenticate the user submitting the score. 
   - *Scale Solution:* Implement SSR (Next.js) with Auth (NextAuth). A user account must be strictly tied to a `Team ID` via foreign keys to prevent malicious score injections.
3. **Database Normalization:** If moving to SQL, the data structure would require distinct tables (`Tournaments`, `Teams`, `Players`, `Matches`, `Scores`) to allow a team to participate in *multiple* tournaments simultaneously without data overlap.

--- 
Thank you for assigning me this recruitment task! I look forward to walking you through my architectural decisions.
*— Built for the G-Site Developer Program.*
