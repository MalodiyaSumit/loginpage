# Auth Template

A complete, production-ready authentication system with React + Node.js + MongoDB.

## Features

- JWT Authentication (Access + Refresh Tokens)
- Bcrypt Password Hashing
- HTTP-Only Cookies (XSS Protection)
- Rate Limiting (Brute Force Protection)
- Account Lockout (5 failed attempts = 15 min lock)
- Input Validation (Joi)
- Security Headers (Helmet)
- Change Password
- Update Profile
- Delete Account

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/MalodiyaSumit/loginpage.git
cd loginpage
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Setup Environment Variables

**Create `/.env`:**
```
VITE_API_URL=http://localhost:5000
```

**Create `/backend/.env`:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### 4. Run Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## Dependencies

### Frontend (`npm install`)
```
react@^19.2.0 react-dom@^19.2.0 react-router-dom@^7.10.1
```

### Frontend Dev (`npm install -D`)
```
vite@^7.2.4 @vitejs/plugin-react@^5.1.1 eslint@^9.39.1 @eslint/js@^9.39.1 eslint-plugin-react-hooks@^7.0.1 eslint-plugin-react-refresh@^0.4.24 globals@^16.5.0 @types/react@^19.2.5 @types/react-dom@^19.2.3
```

### Backend (`cd backend && npm install`)
```
express@^4.18.2 mongoose@^8.0.3 jsonwebtoken@^9.0.2 bcryptjs@^2.4.3 cors@^2.8.5 helmet@^8.1.0 express-rate-limit@^8.2.1 joi@^18.0.2 cookie-parser@^1.4.7 dotenv@^16.3.1
```

### Backend Dev (`cd backend && npm install -D`)
```
nodemon@^3.0.2
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/signup` | POST | No | Create account |
| `/api/auth/login` | POST | No | Login |
| `/api/auth/refresh` | POST | No | Refresh tokens |
| `/api/auth/verify` | GET | Yes | Verify user |
| `/api/auth/logout` | POST | Yes | Logout |
| `/api/auth/change-password` | PUT | Yes | Change password |
| `/api/auth/update-profile` | PUT | Yes | Update name/email |
| `/api/auth/delete-account` | DELETE | Yes | Delete account |

---

## Project Structure

```
├── backend/
│   ├── middleware/auth.js
│   ├── models/User.js
│   ├── routes/auth.js
│   ├── validators/auth.validator.js
│   ├── server.js
│   └── .env.example
│
├── src/
│   ├── components/Toast.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Home.jsx
│   ├── styles/
│   ├── utils/api.js
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── vercel.json
└── package.json
```

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

**Example:** `Test@123`

---

## License

MIT
