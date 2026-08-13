# CHINI Learn — Admin Guide

For the admin & testing team. Everything below is live and saves to the real database.

**Getting in:** log in at `/login` with an admin account → **Admin** appears in the top nav. The left sidebar has every section.

> **Golden rule while testing:** nothing is visible to learners until it is **Published**. Build in draft, publish last.

---

## The content hierarchy

```
Course  →  Module  →  Lesson (the video)
                   →  Quiz  →  Questions → Options
```

Always build in that order. You cannot create a module without a course, or a lesson without a module.

---

## 1. Videos — the most common task

**Videos are not uploaded to CHINI Learn.** They live on YouTube; we only store the link. This keeps the site fast and costs nothing to host.

### Step 1 — put the video on YouTube
Upload to the CHINI Trust YouTube channel. Set visibility to **Unlisted** (playable by anyone with the link, but not listed publicly on YouTube) or **Public**. **Do not use Private** — it will not play on the site.

### Step 2 — add the lesson
**Admin → Lessons & Videos → New lesson**

| Field | What to enter |
|---|---|
| Module | Which module this video belongs to (shows as *Course — Module*) |
| Title | Lesson name learners see |
| Description | 1–2 sentences shown under the video |
| YouTube video ID or URL | Paste the **whole YouTube URL** — `https://youtu.be/abc123` or `https://www.youtube.com/watch?v=abc123`. The ID is extracted for you. |
| Duration (seconds) | Video length in **seconds** (a 6 min 30 s video = `390`) |
| Order | Position in the module — 1, 2, 3… |
| Published | Off while drafting, on when ready |

**Save lesson.**

### The video thumbnail
It is **automatic** — pulled straight from YouTube. If you want a different lesson thumbnail, change it in YouTube Studio, then re-save the lesson in CHINI Learn.

### Checking it worked
Open the lesson from `/learn` as a learner and confirm the video plays. If you see a black box or "Video unavailable": the video is Private, or the URL was mistyped.

---

## 2. Courses

**Admin → Courses → New course**

| Field | Notes |
|---|---|
| Title | Course name |
| Summary | One line — shown on catalogue cards |
| Description | Full paragraph — shown on the course page |
| Category | Autism / ADHD / Dyslexia / Workplace Inclusion |
| Level | Beginner / Intermediate / Advanced |
| Estimated minutes | Total time for the whole course |
| Published | Off = only admins can see it |

**Publish/unpublish quickly:** in the course list, click the **Published / Draft** badge to flip it. Same on the Lessons list.

**Delete:** the bin icon removes the course *and all of its modules, lessons and quizzes*. There is no undo.

> ### ⚠️ Course image / banner — not available yet
> The course thumbnail is **currently fixed** and cannot be changed from the admin panel. Every course shows the same default photo. Please **do not raise this as a bug** — it is a known gap being built. Same for the "What you'll learn" bullet list, which will appear empty on new courses.

---

## 3. Modules

**Admin → Modules → New module.** Pick the Course, give it a Title, Description and an Order number. Modules are just containers that group lessons.

---

## 4. Quizzes

**Admin → Quizzes → New quiz**

| Field | Notes |
|---|---|
| Module | Quiz attaches to a module (and through it, a course) |
| Title / Description | Shown to the learner before they start |
| Pass threshold (%) | e.g. `70` — score needed to pass |
| **Required** | **Leave OFF by default.** See below. |

### Required vs Optional — important
- **Optional (default):** learners can take it as a self-check any time. It never blocks anything, and never interrupts them mid-course.
- **Required (on):** the learner must pass it to complete the course and earn a certificate. It is only shown **after every lesson in the course is finished** — never after each module.

### Adding questions
Save the quiz first. Then in the quiz list, **click the question-count badge** next to the quiz → question editor.

- **Add question** → type the question text → choose the type:
  - *Single choice* — one correct answer
  - *Multiple choice* — several correct answers
  - *True / False* — you must **add two options yourself**, typed `True` and `False`, and flip **Correct** on the right one.
- **Add option** for each answer, then flip the **Correct** switch on the right one(s).
- **Saving:** question and option text saves when you **click outside the box** (press `Tab` or click elsewhere). Don't navigate away immediately after typing — click into empty space first, then leave.
- Bin icons delete an option or the whole question.

---

## 5. Resources (PDFs, guides, worksheets)

**Admin → Resources → New resource.** Title, Summary, Type (PDF / Slides / Worksheet / Guide / Link), Audience (tick as many as apply, or type your own and press **Add**), optional related Course, and **File URL**.

> **File URL takes a link, not a file — there is no upload button yet.** Host the PDF somewhere public (Google Drive share link, the Trust website, Dropbox direct link) and paste the full `https://…` address. A path like `/resources/thing.pdf` will **not** work.

---

## 6. Events

**Admin → Events → New event.** Title, Description, Category (Webinar / Deadline / Live Q&A / Announcement), Start date & time, optional Location and Link. Published events show on learner dashboards. To publish an existing event, open **Edit** and flip the switch (the badge in the list isn't clickable here).

---

## 7. Users

**Admin → Users**

- **Invite user** — enter Full name, Email, Role. They receive an email with a link to set their own password. You never set it for them.
- **Change role** — use the dropdown in the Role column (Learner ↔ Admin). You cannot change your own role.
- **Remove** — bin icon permanently deletes the account and all its data. No undo. You cannot delete yourself.

> **Profiles: nobody can edit their own name, photo or password inside the app yet.** Names are set at invite time; avatars are always coloured initials. Password changes go through **Forgot password** on the login page. Not a bug — not built yet.

---

## 8. Certificates

**Admin → Certificates.** Certificates are issued **automatically** when a learner finishes all lessons and passes any *Required* quizzes.

- **Issue certificate** — manually grant one (pick learner + course), for offline/exceptional cases.
- **Eye icon** — view the certificate as the learner sees it.
- **Refresh icon** — re-check eligibility. Use this if someone finished a course but no certificate appeared.
- **Bin icon** — revoke.

---

## Suggested end-to-end test run

1. Create a course → leave it **Draft**.
2. Add 2 modules to it.
3. Add 2 lessons (real YouTube URLs) to module 1, 1 lesson to module 2. Publish all three.
4. Add an **Optional** quiz to module 1 with 3 questions (one of each type).
5. Add a **Required** quiz to module 2 with 2 questions.
6. Add a resource with a real public PDF link, tied to the course.
7. **Publish the course.**
8. Log out → log in as a test **learner** → find the course under **Learn** → enrol.
9. Watch all lessons. Confirm the optional quiz never blocks you.
10. After the last lesson, confirm the **Required** quiz is prompted. Pass it.
11. Confirm the certificate appears on the dashboard, and in **Admin → Certificates**.

---

## Known gaps — please don't log these as bugs

1. Course thumbnail / banner image cannot be changed.
2. No file upload anywhere — resources and images are links only.
3. "What you'll learn" bullets on a course page can't be entered, so they're empty.
4. No course intro/trailer video field — the course page uses the first lesson's video.
5. No profile/account page (name, photo, password).
6. Lesson "notes" and per-lesson objectives can't be entered.
7. Events have no end-time field.
8. The **About** page team members are placeholder names and stock photos.

Anything **other** than the above — especially a save that fails, a video that won't play, a wrong quiz score, or a certificate that doesn't issue — is a real bug. Please report with: the page URL, what you clicked, what you expected, what happened, and a screenshot.
