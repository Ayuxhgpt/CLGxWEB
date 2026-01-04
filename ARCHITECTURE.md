# PharmaElevate v2 — Architecture & Design Specification
**Status:** Living Document  
**Version:** 2.0 (The "Ladder1" Era)  
**Target Standard:** FAANG-Level Production SaaS

---

## 1. Website Core Identity (Foundation)
**One-Line Value Prop:** "The 'Linear' for Pharmacy Education — A premium, centralized, and verified academic resource hub for the modern pharmacy ecosystem."

*   **Purpose:** To democratize access to high-quality pharmaceutical educational resources (notes, question papers, diagrams) through a verified, community-driven platform.
*   **Problem Solved:** Current solutions are scattered (WhatsApp groups, shady ad-filled sites) or low-quality. PharmaElevate brings structure, verification, and a premium UX to academic file sharing.
*   **Primary Users:** Pharmacy Students (B.Pharm, D.Pharm, Pharm.D).
*   **Secondary Users:** Faculty (Approvers/Contributors) and Admin (System Overseers).
*   **Uniqueness:** 
    *   **Aesthetic:** "Deep Midnight" SaaS design (not a boring college portal).
    *   **Gamification:** Reputation system for uploaders.
    *   **Speed:** Optimistic UI, instant search, fast previews.

## 2. User Types & Roles
RBAC (Role-Based Access Control) enforced via Next.js Middleware & JWT Claims.

| Role | Permissions | Data Access | Restrictions |
| :--- | :--- | :--- | :--- |
| **Guest** | View Landing Page, About. | None. | Cannot view dashboard, notes, or upload. |
| **Student** | **View:** Dashboard, Notes Library, Profile.<br>**Action:** Upload notes, Download resources, Edit own profile. | Own profile, Public notes. | Cannot access Admin Panel or delete others' content. |
| **Faculty** (Planned) | **View:** All Student content.<br>**Action:** "Verify" notes (Gold Checkmark). | Same as Student + Verification tools. | Cannot ban users or change system settings. |
| **Admin** | **View:** EVERYTHING (System Logs, User Tables).<br>**Action:** Ban users, Delete any note, Approve/Reject pending uploads. | Full Database Access. | None (Super Admin). |

**Permission Failure:** Redirects to `/403-forbidden` or generic `/dashboard` with an error toast.

## 3. Authentication & Account System
**Status:** **Implemented & Production Ready**

*   **Methods:**
    *   **Email + Password:** Custom implementation using `bcrypt` (12 rounds).
    *   **Social OAuth:** Google (Primary), GitHub (Dev-centric students).
    *   **Telegram:** Bot-hash verification (Planned V2).
*   **Session Mgmt:** JWT (Stateless). Tokens stored in HTTPOnly cookies.
*   **Security:**
    *   **Enumeration Protection:** Generic "Invalid credentials" messages.
    *   **Account Linking:** Auto-detection of same-email logins across providers.
*   **Flows:**
    *   **Signup:** Name -> Email -> Password -> Auto-Login.
    *   **Social:** One-click -> User Creation (if new) -> Dashboard.

## 4. UI / UX Design System (Future-Industrial)
**Theme:** "Ladder1" Deep Midnight.
*   **Palette:**
    *   `--bg-main`: `#000000` (Pure Black)
    *   `--bg-surface`: `#0A0A0A` (Deep Charcoal)
    *   `--bg-card`: `#111111` (Graphite)
    *   `--primary`: `#10B981` (Emerald Green - Growth/Health)
    *   `--border`: `#303030` (Subtle separations)
*   **Typography:** Sans-serif (Inter/Outfit). High contrast headers (`text-white`), muted body (`text-zinc-400`).
*   **Interactions:**
    *   **Buttons:** Scale 0.98 on click (`framer-motion`).
    *   **Inputs:** Solid charcoal backgrounds (No glass blur), focus rings in Emerald.
    *   **Loaders:** Skeleton blocks (shimmer effect), no spinning circles unless critical.

## 5. Page-by-Page Breakdown (Key Pages)

### A. Auth Pages (`/login`, `/register`)
*   **Layout:** Centered Card on animated background.
*   **Components:** `SocialLoginButtons`, `Input` (Floating label style), `Button`.
*   **Data:** None (Static forms).
*   **Edge Cases:** Email collision (Show "Link Account" toast).

### B. User Dashboard (`/dashboard`)
*   **Layout:** Header (Welcome), 4x1 Stats Grid, 2-Col Main Area (Recent Activity + Quick Actions).
*   **Data (REAL):**
    *   *Contributions:* `await Image.countDocuments({ uploadedBy: user.id })`
    *   *Reputation:* Calculated from uploads.
    *   *Streak:* (Planned: Login tracking).
*   **States:**
    *   *Empty:* "No uploads yet? Start here." (Call to Action).
    *   *Loading:* Skeleton cards.

### C. Admin Panel (`/admin`)
*   **Layout:** Sidebar Nav, Dense Data Tables.
*   **Components:** `DataTable` (Sort/Filter), `StatusBadge` (Pending/Approved/Rejected).
*   **Actions:** "Approve", "Reject" (with reason modal), "Ban User".
*   **Security:** `middleware.ts` protects `/admin/*` routes strictly.

## 6. Dashboard Logic (The "Real Data" Promise)
*   **Metrics:**
    1.  **Contributions:** Total accepted files.
    2.  **Reputation:** Gamified score (1 upload = 10 pts).
    3.  **Global Trends:** "Top 10%" badge relative to total user base.
*   **Update Frequency:** On page load (SSR/CSR hybrid).
*   **Optimization:** `Promise.all` for parallel database queries.

## 7. Backend Architecture
*   **Framework:** Next.js 15 (App Router).
*   **API Pattern:** REST-like Route Handlers (`app/api/...`).
*   **Database:** MongoDB via Mongoose (Schema enforced).
*   **Structure:**
    *   `models/`: Mongoose Schemas.
    *   `lib/`: Utilities, DB connection, Auth config.
    *   `app/api/`: Endpoints.
*   **Validation:** Zod schemas for all write operations (to be implemented).

## 8. Database Design (Scalable NoSQL)
**Collections:**
1.  **Users:**
    *   `_id`, `name`, `email`, `password` (hashed), `provider`, `role`, `reputation`.
    *   *Index:* `email` (Unique).
2.  **Images (Notes/Resources):**
    *   `_id`, `url`, `title`, `subject`, `uploadedBy` (Ref: User), `status` (pending/approved).
    *   *Index:* `status`, `uploadedBy`.
3.  **VerificationTokens:** For password resets.

## 9. Security (Non-Negotiable)
*   **Headers:** `X-Content-Type-Options`, `X-Frame-Options`.
*   **Input Sanitization:** React escapes HTML by default. Zod validates API inputs.
*   **Rate Limiting:** `upstash/ratelimit` (recommended for Vercel).
*   **Environment:** secrets in `.env`, never commited.

## 10. Performance & Scalability
*   **Images:** `next/image` for automatic compilation to WebP.
*   **Code Splitting:** Automatic via Next.js App Router (Server Components default).
*   **CDN:** Vercel Edge Network for static assets.

## 11. Deployment (DevOps)
*   **Platform:** Vercel (Frontend + Serverless Functions).
*   **Database:** MongoDB Atlas (Cloud).
*   **CI/CD:** GitHub Actions (Automated lint/build tests on push).

## 12. User Flow (Story Mode)
1.  **Entry:** New student lands on `/login`. Sees "Google" button. Clicks.
2.  **Onboarding:** Account created instantly. Redirected to `/dashboard`.
3.  **Action:** Sees "Empty State". Clicks "Upload Material".
4.  **Contribution:** Drag-n-drops PDF. Fills metadata. Submits.
5.  **Feedback:** Toast "Upload Pending Approval". Dashboard updates "Pending: 1".
6.  **Admin:** Admin gets notification. Reviews PDF. Clicks "Approve".
7.  **Reward:** User dashboard updates: "Contributions: 1", "Reputation: 10".

---
**Signed off by:** Senior System Architect (AI Agent)
