# Master Design System: PharmaElevate v2 (Ladder1 Era)
**Status:** Living Design Bible  
**Theme:** Ladder1 – Deep Midnight  
**Philosophy:** "The Linear for Pharmacy Education"

---

## 1. Core Design Psychology
Every pixel must serve one of three emotional goals. If it doesn't, **delete it.**

1.  **Confidence:** The UI is stable, fast, and authoritative. Deep blacks and precision borders say "Engineering Grade."
2.  **Curiosity:** Subtle glows, "hinted" interactions, and optimistic empty states invite exploration.
3.  **Ownership:** The dashboard reflects *the user's* status. Personal stats, verified badges, and progress tracking make it *their* workspace.

---

## 2. Visual Identity & Color Physics
**Philosophy:** Darkness is the canvas. Content floats in void space.

### Palette: The Midnight Spectrum
*   **Void (Background):** `#000000` (Pure Black). *Usage: Global background.*
*   **Abyss (Nav/Surface):** `#0A0A0A` (Deep Charcoal). *Usage: Sidebars, Headers.*
*   **Matter (Cards/Inputs):** `#111111` (Graphite). *Usage: Content Containers.*
    *   *Stroke:* `#1E1E1E` (Subtle 1px borders).
*   **Life (Primary Accent):** `#10B981` (Emerald). *Usage: Primary Buttons, Checkmarks, Active States.*
    *   *Glow:* `box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.4)`
*   **Dust (Text):**
    *   *Primary:* `#FFFFFF` (Headers, emphasis).
    *   *Secondary:* `#A1A1AA` (Body text, labels).
    *   *Muted:* `#52525B` (meta-data, timestamps).

### Depth System (No Drop Shadows)
We do not use messy drop shadows to create depth. We use **Luminance & Stroke**.
*   **Layer 0:** Void (Bg)
*   **Layer 1:** Matter (Card) -> Has 1px border `#1E1E1E`
*   **Layer 2:** Float (Hover) -> Border lightens to `#3F3F46`, Scale `1.01`.

---

## 3. Typography & Readability
**Font Family:** `Inter` or `Outfit` (Sans-serif).

| Element | Weight | Size | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero)** | 700 | 36px+ | -0.02em | Page Titles, Confidence. |
| **H2 (Section)** | 600 | 24px | -0.01em | Dashboard Sections. |
| **Body** | 400 | 15px | Normal | Long-form reading (calm). |
| **Label** | 500 | 12px | +0.05em | UI Labels, Table Headers. |
| **Number** | 600 | 18px | -0.01em | Stats (Visually stronger). |

---

## 4. Motion & Interaction Physics
**Golden Rule:** Motion explains; it does not entertain.

*   **Duration:** Fast (`200ms` - `300ms`).
*   **Easing:** `ease-out` (Decelerate). No bounciness.
*   **Interactions:**
    *   **Click:** `scale(0.98)` (Tactile feedback).
    *   **Hover:** `scale(1.005)` + Border Color Shift.
    *   **Page Load:** `opacity: 0 -> 1`, `y: 5px -> 0px`. (Subtle rise).
    *   **Skeleton:** Metallic shimmer (linear gradient), not pulsing opacity.

---

## 5. Component Architecture

### Buttons ("Physical")
*   **Primary:** Solid Emerald. White Text. Internal Glow.
    *   *Feel:* "Execute Code."
*   **Secondary:** Solid Graphite `#111`. Gray Text.
    *   *Feel:* "Option/Tool."
*   **Ghost:** Transparent. Text Only.
    *   *Feel:* "Navigation/Cancel."

### Inputs ("Guided")
*   **State:**
    *   *Default:* `#111` Background. `#333` Border.
    *   *Focus:* Border turns Emerald `#10B981`. No ring blur.
    *   *Error:* Border turns Crimson `#EF4444`. Shake animation (X-axis).

### Cards ("Resource Monoliths")
*   Used for: Files, Stats, Notes.
*   Structure:
    *   **Header:** Icon + Title (White).
    *   **Body:** Meta-data (Gray).
    *   **Footer:** Action/Status (Badge).
*   **Badges:** Small, caps, tracking-wide.
    *   `VERIFIED` (Green/Black).
    *   `PENDING` (Yellow/Black).

### Empty States (Optimistic)
**Forbidden:** "No Data Found."
**Required:**
1.  **Explanation:** "You haven't verified any notes yet."
2.  **Motivation:** "Become a top contributor by uploading today."
3.  **Action:** [Primary Button: Upload Note]

---

## 6. Dashboard — The Control Room
**Goal:** "This dashboard uses Real Data to tell my story."

*   **Welcome:** "Good Morning, [Name]." (Personal).
*   **Stats:**
    *   Do not show "0 Views."
    *   Show "Reputation: Novice." (Gamified).
    *   Show "Contribution Level: 1."
*   **Activity Feed:**
    *   Chronological list of actions.
    *   Icons connect steps (Upload -> Verify -> Publish).

---

## 7. Admin Interface — The Engine Room
**Goal:** "Serious. Dense. Professional."

*   **Layout:** Dense Table Rows (40px height).
*   **Columns:** ID (Mono), User (Avatar+Name), Status (Badge), Actions.
*   **Actions:**
    *   Destructive (Ban/Delete) -> Requires Modal Confirmation.
    *   Constructive (Approve) -> Immediate Toast Success.

---

## 8. Final Consistency Check
*   **Spacing:** Multiples of `4px` (Tailwind Grid). `gap-4`, `p-6`, `m-8`.
*   **Radius:**
    *   Buttons/Inputs: `rounded-lg` (8px).
    *   Cards: `rounded-xl` (12px).
    *   Modals: `rounded-2xl` (16px).

**Validation:** If it looks like a student project, **burn it down and restart.**
