# 🚀 Vercel Deployment Guide for PharmaElevate v2

Follow these simple steps to deploy your application to the web for free.

## 1️⃣ Connect Vercel to GitHub
1.  Go to [Vercel.com](https://vercel.com) and Log in / Sign up.
2.  On your Dashboard, click **"Add New..."** -> **"Project"**.
3.  In the "Import Git Repository" list, find **`CLGxWEB`** (or your repo name).
4.  Click **Import**.

## 2️⃣ Configure Project
You will see a "Configure Project" screen.
*   **Framework Preset**: Next.js (should be auto-detected).
*   **Root Directory**: `./` (default).
*   **Build Command**: `npm run build` or `next build` (default is fine).

## 3️⃣ Add Environment Variables (Crucial Step! 🔐)
Expand the **"Environment Variables"** section. You need to copy these exact values from your local `.env.local` file.

| Variable Name | Description |
| :--- | :--- |
| `MONGODB_URI` | Your MongoDB Connection String. |
| `NEXTAUTH_SECRET` | Your random auth secret string. |
| `NEXTAUTH_URL` | **IMPORTANT**: Set this to **`https://your-project-name.vercel.app`** (The URL Vercel gives you). *Initially, you can leave it blank or put a placeholder, but you MUST update it after deployment.* |
| `CLOUDINARY_CLOUD_NAME`| Your Cloudinary Cloud Name. |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key. |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret. |
| `RESEND_API_KEY` | Your Resend API Key for emails. |

> **Tip**: You can copy-paste your entire `.env.local` content into the "Key" field in Vercel, and it will auto-parse them! Just make sure to update `NEXTAUTH_URL`.

## 4️⃣ Deploy
1.  Click **Deploy**.
2.  Wait for 1-2 minutes. Vercel will install dependencies and build your site.
3.  🎉 **Success!** You will see a congratulations screen with your live URL (e.g., `https://pharma-elevate.vercel.app`).

## 5️⃣ Post-Deployment Check
1.  Go to your new live URL.
2.  Try to **Log In**.
3.  If login fails, check your Vercel **Settings > Environment Variables**:
    *   Ensure `NEXTAUTH_URL` matches your actual deployed domain (no trailing slash).
    *   Example: `https://pharma-elevate-v2.vercel.app`

---
**Need to update?**
Just `git push` from VS Code. Vercel detects changes and re-deploys automatically!
