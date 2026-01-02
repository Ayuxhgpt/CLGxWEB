# 📘 PharmaElevate – Internal Developer README

**(Not for users / observers / promotion)**

**Project Codename**: PharmaElevate v2 (Full-Stack Transition)  
**Maintainer**: Ayush Gupta  
**Role**: Product Owner + Developer

---

## 1️⃣ PROJECT INTENT (VERY IMPORTANT)
### ❓ Why this project exists
PharmaElevate is not a “portfolio website”. It is a college-level pharmaceutical ecosystem designed to:
- Digitize student learning & collaboration
- Preserve academic + cultural memories (albums)
- Enable student contributions (projects, content)
- Gradually evolve into a production-grade platform

### ❗ Core principle
**Every feature must be tied to a real student problem.**  
No demo-only features.

---

## 2️⃣ TECH STACK (DECIDED – NO DEBATE)
- **Frontend**: Next.js (App Router preferred), React, Tailwind CSS (or existing CSS adapted).
- **Backend**: Next.js API Routes (serverless).
- **Database**: MongoDB Atlas with Mongoose ORM.
- **Auth**: Auth.js / NextAuth (Email + Password).
- **Media Storage**: Cloudinary.
- **Hosting**: Vercel.

---

## 3️⃣ USER ROLES (STRICT)
- **admin**: Can moderate content, approve uploads, manage users.
- **student**: Can log in, access dashboard, upload images/projects.
- **faculty** (future): Verification roles.

---

## 4️⃣ FOLDER STRUCTURE (TARGET)
```
src/
├── app/
│   ├── page.tsx                # Landing
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── albums/
│   ├── admin/
│   └── api/
│       ├── auth/
│       ├── albums/
│       ├── images/
│       └── users/
├── components/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── cloudinary.ts
├── models/
│   ├── User.ts
│   ├── Album.ts
│   └── Image.ts
├── styles/
└── middleware.ts
```

---

## 5️⃣ DEVELOPMENT PHASE BREAKDOWN

### Phase 1 – Setup
- Initialize Next.js
- Connect MongoDB
- Setup env variables
- Deploy base app on Vercel

### Phase 2 – Auth
- Signup
- Login
- Session handling
- Protected routes

### Phase 3 – Album (MVP)
- Album listing
- Image upload
- Admin approval
- Gallery display

### Phase 4 – Hardening
- Validation
- Error handling
- Rate limits
- UI polish
