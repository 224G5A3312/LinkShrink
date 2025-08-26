# LinkShrink — Bootstrap Theme (HTML/CSS/JS + Firebase)
**Modern UI** with Bootstrap 5 + custom theme. Firebase handles Auth + Firestore.

## Features
- Login/Signup (Email & Password)
- Shorten links → `/r/{code}` redirects
- Click analytics + chart
- QR generator

## Setup
1) Create Firebase project and enable **Auth (Email/Password)** + **Firestore** + **Hosting**.
2) Put your config in `js/firebase.js` (replace placeholders).
3) Local preview with any server:
```
npx serve .
# or
python -m http.server 8000
```
4) Deploy to Firebase Hosting. `firebase.json`:
```json
{ "hosting": { "public": ".", "ignore": ["firebase.json","**/.*","**/node_modules/**"], "rewrites": [{ "source": "/r/**", "destination": "/redirect.html" }] } }
```

## Collections
- `links/{code}`: { code, longUrl, uid, createdAt, clickCount }
- `links/{code}/clicks/{event}`: { ts, ua }
