# Verification Plan

## 1. Image Path Verification (Fixed)
We have migrated `public/assists` to `public/assets` and updated all references.
- [ ] **Home Page**: Check the Footer (Ayush & Saksham profile pics) and Navbar (Logo).
- [ ] **Faculty Page**: Check if faculty images are loading. (If you have a faculty page).
- [ ] **Albums**: Check the default cover image logic.

## 2. Upload Functionality (Manual Testing)
Please perform the following tests on the `/albums/upload` page (Dashboard -> Upload).

### A. Valid Uploads
1. **Upload an Image (< 4MB)**
   - Expectation: Success toast, redirection to dashboard.
   - Database: Should create a new `Image` document.
   - Cloudinary: Should appear in `pharma_elevate_albums` (or `misc` if generic).

2. **Upload a PDF Note (< 4MB)**
   - Fill in Title, Subject, Semester.
   - Expectation: Success toast, redirection.
   - Database: Should create a new `Note` document.
   - Cloudinary: Should appear in `pharma_elevate_notes`.

### B. Size Limits
1. **Client-Side Limit (4MB)**
   - Drag/Select a file > 4MB (e.g., 4.2MB).
   - Expectation: Toast error "File too large" immediately (rejected by Dropzone).

2. **Server-Side Limit (4.5MB)** (Harder to test if client blocks first)
   - *Note: This is a safety net.* API is configured to reject > 4.5MB.

### C. File Type Validation
1. **Invalid Type**
   - Try to upload a `.txt` or `.exe` file.
   - Expectation: Toast error "File rejected" (Client side) or "Invalid file type" (Server side).

### D. Admin Approval
1. **Login as Admin**
   - Go to Dashboard.
   - Approve a pending upload.
   - Verify it appears in public pages (Resources/Gallery).

## 3. Smoke Check
- [ ] Navigate to `/pharma` (Knowledge).
- [ ] Navigate to `/resources` (Resources).
- [ ] Navigate to `/notes` (Notes).
- [ ] Verify no "Application Error" or 500 pages.
