# 🚀 PharmaElevate v2 – Roadmap & Feature Status

This document outlines the current state of the PharmaElevate v2 platform and the roadmap for future enhancements.

## 1️⃣ Authentication & Account System 🔐
### ✅ Current Features
- **User Registration**: Name, Email, Year/Semester.
- **OTP Verification**: Email OTP (mandatory), hashing + expiry, resend rate limiting.
- **Secure Access**: Login blocked until verified, NextAuth session handling.
- **Session Management**: Secure logout, Middleware-protected routes.

### 🔧 Modification / Upgrade Options
- [ ] Add phone number verification.
- [ ] Add “Forgot Password” flow.
- [ ] Add session timeout warning.
- [ ] Login history (last login time/device).
- [ ] Multi-device logout.

---

## 2️⃣ Role-Based Access Control (RBAC) 🛡️
### ✅ Current Features
- **Roles**: Student, Admin.
- **Enforcement**: Server-side checks, Middleware route protection.
- **Restrictions**: Students blocked from admin APIs/routes.

### 🔧 Modification / Upgrade Options
- [ ] Add Faculty role.
- [ ] Add Senior / Moderator role.
- [ ] Fine-grained permissions matrix.
- [ ] Temporary admin privileges.

---

## 3️⃣ User Profile & Settings 👤
### ✅ Current Features
- **Profile**: Photo upload (Cloudinary), Name, Year, Bio, Social links.
- **Persistence**: Data survives refresh.
- **Settings**: Dedicated settings page for updates.

### 🔧 Modification / Upgrade Options
- [ ] Cover photo / banner.
- [ ] Interests & skills tags.
- [ ] Profile visibility toggle (public/private).
- [ ] Academic performance section.
- [ ] Download profile as PDF (portfolio).

---

## 4️⃣ Navigation & Layout 🧭
### ✅ Current Features
- **Navbar**: Sticky, auth-aware, responsive mobile menu.
- **Profile Dropdown**: Dynamic user avatar.

### 🔧 Modification / Upgrade Options
- [ ] Context-aware navbar.
- [ ] Breadcrumb navigation.
- [ ] Global command palette (⌘K).
- [ ] Quick actions menu.

---

## 5️⃣ Dashboard (Control Panel) 📊
### ✅ Current Features
- **Overview**: Personalized welcome, detailed stats (uploads, saved notes).
- **Actions**: Quick shortcuts to vital features.

### 🔧 Modification / Upgrade Options
- [ ] Activity timeline.
- [ ] Study progress tracker.
- [ ] Upcoming exams / events.
- [ ] Analytics widgets.

---

## 6️⃣ Notes System 📚
### ✅ Current Features
- **Structure**: Semester-wise, Subject-wise categorization.
- **Management**: Admin PDF upload, Preview & Download.
- **Validation**: Strict file type & size checks.

### 🔧 Modification / Upgrade Options
- [ ] Unit-wise notes.
- [ ] Exam tags (Important / GPAT).
- [ ] Notes request & voting system.
- [ ] Reading mode (dark/focus).
- [ ] Bookmarking system.

---

## 7️⃣ Digital Album System 📸
### ✅ Current Features
- **Gallery**: Public gallery of approved images.
- **Upload Flow**: Student upload -> Pending state -> Admin Approval.
- **Storage**: Optimized Cloudinary delivery.

### 🔧 Modification / Upgrade Options
- [ ] Event-based albums.
- [ ] Batch/Year filters.
- [ ] Like & Comment system.
- [ ] Report image option.

---

## 8️⃣ File Upload System 📂
### ✅ Current Features
- **Polymorphic API**: Handles Profile, Album, and Notes uploads.
- **Security**: MIME type validation, Size limits, Folder enforcement.

### 🔧 Modification / Upgrade Options
- [ ] Upload progress bar.
- [ ] File preview before upload.
- [ ] Bulk upload (admin).
- [ ] Storage usage analytics.

---

## 9️⃣ UI / UX System 🎨
### ✅ Current Features
- **Design**: Modern "Deep Indigo" theme, Glassmorphism.
- **Experience**: Motion transitions, Skeleton loaders, Responsive layouts.

### 🔧 Modification / Upgrade Options
- [ ] Theme switcher (Light/Dark).
- [ ] Accessibility options.
- [ ] Reduced motion mode.

---

## 🔟 Deployment & DevOps 🚀
### ✅ Current Features
- **Build**: Clean production build (Locally verified).
- **Security**: Env var protection, No assets in Git.

### 🔧 Modification / Upgrade Options
- [ ] CI/CD Pipeline.
- [ ] Preview environments.
- [ ] Version tagging.
