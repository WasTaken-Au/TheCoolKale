# Kale (AnotherKale)
Guide to IB MYP rubrics. Personal Project.

Open `index.html` (or serve the folder; `python3 -m http.server`). Sign-in needs https or localhost.

- `js/content.js` holds all subjects and lessons. Add a lesson by adding a topic to a subject's `groups` and a matching entry in `lessons`.
- `js/app.js` holds auth, onboarding, and every page's logic.
- Accounts are client-side only (salted PBKDF2 hashes in localStorage). Fine for a school project; for real security, replace `signUp`/`signIn`/`save` with a backend such as Supabase or Firebase.