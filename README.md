# PharmaElevate v2.5 🚀

**The Future of Pharmaceutical Education & Ecosystem**

PharmaElevate is a high-performance, full-stack pharmaceutical ecosystem designed to digitize student learning, academic collaboration, and memory preservation for professional students. 

This repository represents the transition from a static presence to a **FAANG-standard dynamic application** built with the Next.js App Router.

---

## 🏗️ Technical Architecture

### Core Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (Turbopack Enabled)
- **Language**: TypeScript (Strict Type Safety)
- **Styling**: Vanilla CSS + Tailwind CSS (Custom "Ladder" Design System)
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: NextAuth.js (JWT Strategy, RBAC)
- **File Management**: Cloudinary (Image/Note Streaming)
- **Communications**: Resend (OTP Verification)

### Performance & Security
- **Atomic Rollbacks**: Cloudinary assets are automatically destroyed if database persistence fails.
- **Middleware Shielding**: Admin routes (`/admin`, `/api/admin`) are protected at the edge via Next.js Middleware.
- **Dynamic Permissioning**: User roles and block status are checked on every session refresh to ensure immediate access revocation.

---

## ✨ Key Features

### 🔐 Enterprise-Grade Auth
- **Tri-Provider Support**: Google, GitHub, and Credentials-based login.
- **OTP Verification**: Mandatory enrollment with security-first rate limiting and expiration.
- **Security Checkpoints**: Real-time checking for blocked users and verified status.

### 📚 Professional Knowledge Hub
- **Semantic Structure**: Course material organized by Semester and Subject.
- **Dynamic Content**: Interactive "Drug Profiles" and "Core Concepts" using a custom deep-midnight design system.
- **AI Readiness**: Structured data ready for the v3 recommendations engine.

### 📸 Dynamic Album & Notes
- **Student Pipeline**: Upload memories and study notes with real-time status tracking (Pending/Approved).
- **Admin Governance**: Centralized moderation panel for content vetting.
- **Optimized Delivery**: Automatic WebP conversion and CDN delivery via Cloudinary.

---

## 🚀 Development & Setup

### 1. Requirements
- Node.js 20+
- MongoDB Instance
- Cloudinary Keys
- Resend API Key

### 2. Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 3. Environment Config (`.env.local`)
```env
MONGODB_URI=
NEXTAUTH_SECRET=
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
```

---

## 📂 System Map
```text
├── app/                # App Router (Pages & API Handlers)
├── components/         # Atomic UI Components
├── lib/                # Core Logic (Connectors, Auth, Schema)
├── models/             # Mongoose Data Definitions
├── public/             # Static Assets & Identity
├── scripts/            # Management & Maintenance Scripts
└── types/              # Global Type Definitions
```

---

## 👥 Engineering Team
- **Ayush Gupta** (@Ayuxhgpt) — Lead Product Engineer
- **Saksham Gupta** — Content & Research Architecture

---
*Built with precision for Satyadev College of Pharmacy.*
