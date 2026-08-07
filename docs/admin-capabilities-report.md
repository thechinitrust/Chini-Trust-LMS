# Admin capabilities — status report (internal)

**Date:** 2026-08-07 · **Audited against:** `master` @ `23d0438`
**Method:** read every file under `src/app/admin/**`, `src/lib/data/**`, nav/footer link sweep, `tsc --noEmit` (passes clean).

---

## 1. What works today

All of the following are wired end-to-end to Supabase (real writes, RLS-enforced, no mocks):

| Area | Admin can do | Page |
|---|---|---|
| **Courses** | Create, edit, delete, publish/unpublish (click the status badge) | `/admin/courses` |
| **Modules** | Full CRUD, assign to course, set order | `/admin/modules` |
| **Lessons / Videos** | Full CRUD, paste YouTube ID **or** full URL, duration, order, publish toggle | `/admin/lessons` |
| **Quizzes** | Full CRUD, pass threshold %, **Required/Optional toggle**, per-quiz question editor (single-choice / multiple-choice / true-false, options, correct answers) | `/admin/quizzes` |
| **Resources** | Full CRUD, type, audience, link to a course, file URL | `/admin/resources` |
| **Events** | Full CRUD, category, start time, location, link, published flag | `/admin/events` |
| **Users** | Invite by email (real invite mail via service role), change role learner↔admin, permanently delete | `/admin/users` |
| **Certificates** | Auto-issued on course completion; manual issue, re-check eligibility, revoke, view | `/admin/certificates` |

Link sweep: every `href` in nav, sidebar, and footer resolves to a real route. **No dead or `#` placeholder links.** The only "coming soon" string is a legitimate empty-state on the course page when no intro video exists.

---

## 2. Gaps — needs building

Ordered by your stated priority (thumbnails/banners first).

### P0 — Course thumbnail is not editable at all
- `CourseInput.thumbnailUrl` exists in the type and is written to `courses.thumbnail_url` ([courses.ts:106](../src/lib/data/courses.ts#L106)), but **there is no field for it in the admin form**.
- Every new course is silently hard-coded to a stock Unsplash photo — [courses-table.tsx:42](../src/app/admin/courses/courses-table.tsx#L42).
- Effect: all courses in the catalogue and on the dashboard show the same generic image, and nobody can change it from the UI.
- **Build:** add a "Thumbnail" field to the course form. Minimum = URL input + live preview. Proper = upload.

### P0 — No file upload anywhere in the product
- `grep` for `storage.from` / `.upload(` across `src/` returns **zero hits**.
- The only Supabase Storage bucket declared is `certificates` ([50_certificates.sql:47](../supabase/schemas/50_certificates.sql#L47)). There is no bucket for course images or resource files.
- Resources take a raw **File URL** text field; the placeholder suggests `/resources/example.pdf`, but `public/resources/` **does not exist**, so that pattern 404s. Files must currently be hosted elsewhere and pasted in as a full URL.
- **Build:** a `media` (public) bucket + RLS policies, plus a reusable `<ImageUpload>` / `<FileUpload>` control used by course thumbnail and resource file. Add the bucket host to `next.config.mjs` — currently only `i.ytimg.com`, `img.youtube.com`, `images.unsplash.com`, `*.supabase.co` are allowed, and **any other image host throws a Next/Image error**.

### P1 — "Course banner" doesn't exist as a concept
The course detail page has no hero image — it renders breadcrumb → badges → title → intro video. `thumbnailUrl` only appears on catalogue cards and the dashboard. A distinct banner needs a new column (`banner_url`), a form field, and a hero block on `/courses/[courseId]`.

### P1 — Course form is missing 5 fields that already exist in the DB
Not editable, so they're either stuck at defaults or invisible:
- `objectives` → the **"What you'll learn"** section on the course page renders an **empty list** for every course created via the admin UI.
- `previewVideoId` → intro video always falls back to the first lesson's video; a dedicated trailer can't be set.
- `slug` (auto-generated from title only), `audience` (locked to `["teachers"]`), `requiresCertificate` (locked to `true`).

### P1 — No profile / account page
There is no `/profile` or `/settings` route. Neither admins nor learners can change their own name, password, or avatar from the app. `profiles.avatar_url` exists in the DB and is never read or written — avatars are always initials. Name is set once, at invite/registration time.

### P2 — Smaller gaps
- **Lessons:** `notes` and per-lesson `objectives` exist in the DB and *render on the lesson page*, but there's no form field for either.
- **Events:** no end-time (`endsAt`) field; the published badge in the table is not clickable (unlike Courses/Lessons) — you must open Edit.
- **Resources:** `featured` flag isn't in the form (always `false`); can't attach to a specific module/lesson from the UI.
- **Quiz question editor:** True/False questions don't auto-create their two options (admin must type "True"/"False" by hand); single-choice doesn't auto-uncheck the previous correct option; question/option text saves **on blur**, so clicking away without tabbing out can lose an edit; no drag-to-reorder.
- **About page team** is still `mockTeam` with four fictional names and Unsplash portraits ([mock-data.ts](../src/lib/mock-data.ts)) — not admin-editable, needs real content before launch.

---

## 3. Suggested build order

1. `media` storage bucket + `<ImageUpload>` control → wire into course thumbnail. *(unblocks the #1 complaint)*
2. Add `objectives`, `previewVideoId`, `audience`, `requiresCertificate`, `slug` to the course form.
3. File upload for resources (same control) + fix the `/resources/*.pdf` dead-path expectation.
4. `/profile` page — name, avatar, password change.
5. Course banner column + hero.
6. P2 polish list.
