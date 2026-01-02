# PharmaElevate v2 🚀

**The Future of Pharmaceutical Education**

PharmaElevate is a comprehensive ecosystem designed for B.Pharm students, combining a learning hub, student community, and professional tools into a single platform. This repository represents the **v2 Full-Stack transition**, moving from a static site to a dynamic Next.js application.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS (Legacy Support)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Media Storage**: Cloudinary
- **Email/OTP**: Resend

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure Sign-up**: Registration requires Name, Email, Phone, and Year.
- **Two-Factor Verification**: Email verification via **OTP** (powered by Resend) is mandatory.
- **Role-Based Access**:
  - **Student**: Access to dashboard, resources, and album upload.
  - **Admin**: Full control to approve/reject uploads and manage content.

### 📚 Knowledge Hub
- **Interactive Content**: "Core Concepts" and "Drug Profiles" with modern accordion UI.
- **Resources**: Dedicated sections for Clinical Pharmacy, Industrial trends, and Artificial Intelligence in Pharma.

### 📸 Digital Album (MVP)
- **Cloud Gallery**: Students can upload college memories.
- **Moderation**: Uploads are "Pending" until approved by an Admin via the Dashboard.
- **Optimized Images**: Served via Cloudinary CDNs for performance.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- MongoDB Atlas account.
- Cloudinary account.
- Resend API key.

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/PharmaElevate.git

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pharma-elevate-v2

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Cloudinary (Media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend (Email/OTP)
RESEND_API_KEY=re_123456789
```

### 4. Run Locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```
PharmaElevate/
├── app/                # Next.js App Router Pages & API
│   ├── api/            # Backend Routes (Auth, Upload, Admin)
│   ├── dashboard/      # Protected Student Dashboard
│   ├── admin/          # Admin Moderation Panel
│   ├── albums/         # Gallery & Upload UI
│   └── pharma/         # Knowledge Hub
├── components/         # Reusable UI Components
├── lib/                # Database & Service Helpers
├── models/             # Mongoose Data Models
└── public/             # Static Assets
```

## 👥 Developers

- **Ayush Gupta** - Lead Developer & Designer
- **Saksham Gupta** - Research & Content Lead

---
*Built with ❤️ for Satyadev College of Pharmacy*
